import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import useSettings from '../hooks/useSettings';
import { formatPromotionHours } from '../admin/utils/formatHours';
import {
  Calendar, Clock, User, Mail, Phone, Gift, Send, CheckCircle,
  AlertCircle, ArrowRight, MapPin, Car, Sparkles, Check, Star,
  Navigation, LocateFixed, Building, Shield, Award, Target
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function PromotionBooking() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', time: '', notes: ''
  });
  const [formStatus, setFormStatus] = useState({ submitted: false, success: false, message: '' });
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);   // ← new

  const { business, promotion } = useSettings();

  // ---------- Saturday guard ----------
  const today = new Date();
  const isSaturday = today.getDay() === 6;
  const nextSaturday = new Date();
  nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7) || 7);
  const minDate = nextSaturday.toISOString().split('T')[0];

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Required fields check
    if (!formData.name || !formData.email || !formData.date || !formData.time) {
      setFormStatus({ submitted: true, success: false, message: 'Please fill in all required fields.' });
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
      return;
    }

    // 👇 Terms & Conditions acceptance check
    if (!acceptedTerms) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'You must accept the Terms & Conditions and Privacy Policy to proceed.'
      });
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/promotion-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone || '',
          date: formData.date,
          time: formData.time,
          notes: formData.notes
        })
      });
      const data = await response.json();
      if (data.success) {
        setFormStatus({
          submitted: true,
          success: true,
          message: '✓ Booking confirmed! We\'ll see you on Saturday for your FREE Wheel Service.'
        });
        // Reset form and checkbox after successful submission
        setFormData({ name: '', email: '', phone: '', date: '', time: '', notes: '' });
        setAcceptedTerms(false);
      } else {
        throw new Error(data.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setFormStatus({
        submitted: true,
        success: false,
        message: `⚠️ Unable to process booking. Please call us directly at ${business.phone}.`
      });
    } finally {
      setLoading(false);
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
    }
  };

  const includedServices = [
    "Wheel Balancing (Up to 4 wheels)",
    "Wheel Alignment Check",
    "Tyre Pressure Optimization",
    "Visual Tyre Inspection",
    "Rotation Assessment"
  ];

  const trustBadges = [
    { icon: Shield, text: "Certified Technicians" },
    { icon: Award, text: "Quality Guaranteed" },
    { icon: Target, text: "Precision Service" }
  ];

  return (
    <>
      <SEO
        title="FREE Wheel Service Booking | DGW Autospa Saturday Promotion"
        description="Book your FREE Wheel Service every Saturday at DGW Autospa. Use a valid promo code for complimentary wheel balancing and alignment check in Lagos."
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        <section className="pt-32 pb-12 md:pt-40 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-500/50">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              LIMITED TIME OFFER
            </div>
            <h1 id='hero-head' className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              FREE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">WHEEL SERVICE</span>
            </h1>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              {formatPromotionHours(promotion)}
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* ---- FORM SIDE ---- */}
              {isSaturday ? (
                <div className="bg-blue-800/30 rounded-2xl p-6 md:p-8 border border-blue-500/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 id='hero-head' className="text-2xl md:text-3xl font-bold text-white">Book Your Free Service</h2>
                      <p className="text-blue-200 text-sm">Limited slots available every Saturday</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <h3 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" /> What's Included:
                    </h3>
                    <ul className="text-blue-200 text-sm space-y-2">
                      {includedServices.map((service, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-blue-400" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {formStatus.submitted && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${formStatus.success ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'}`}>
                      {formStatus.success ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                      <span className="text-sm">{formStatus.message}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-blue-200 font-semibold mb-2">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all" placeholder="Your full name" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-blue-200 font-semibold mb-2">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all" placeholder="Your email address" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-blue-200 font-semibold mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all" placeholder="Your phone number (optional)" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 px-4 py-3 bg-blue-700/40 border border-blue-500/30 rounded-lg">
                        <Gift className="w-5 h-5 text-blue-300 shrink-0" />
                        <p className="text-blue-100 text-sm">
                          The Free Wheel promotion is applied automatically to this booking — no code needed.
                        </p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-blue-200 font-semibold mb-2">Select Saturday *</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                          <input type="date" name="date" value={formData.date} onChange={handleInputChange} min={minDate} required className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all" />
                        </div>
                        <p className="text-xs text-blue-300 mt-1">Next available: {nextSaturday.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-blue-200 font-semibold mb-2">Preferred Time *</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                          <select name="time" value={formData.time} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all appearance-none cursor-pointer">
                            <option value="" className="bg-blue-800">Select time</option>
                            {timeSlots.map((time) => (<option key={time} value={time} className="bg-blue-800">{time}</option>))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-blue-200 font-semibold mb-2">Additional Notes</label>
                      <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all resize-none" placeholder="Vehicle model, year, or any special requests..." />
                    </div>

                    {/* 👇 Terms & Conditions checkbox */}
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 bg-blue-700 border-blue-500 rounded focus:ring-blue-400 focus:ring-2 cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-sm text-blue-200 leading-relaxed cursor-pointer">
                        I accept the{' '}
                        <Link to="/terms" target="_blank" className="text-blue-300 underline hover:text-white">Terms &amp; Conditions</Link>{' '}
                        and{' '}
                        <Link to="/privacy" target="_blank" className="text-blue-300 underline hover:text-white">Privacy Policy</Link>.
                      </label>
                    </div>

                    <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'Processing...' : <>Claim Your Free Service <Send className="w-4 h-4" /></>}
                    </button>
                  </form>
                </div>
              ) : (
                /* ---- NOT SATURDAY ---- */
                <div className="bg-blue-800/30 rounded-2xl p-6 md:p-8 border border-blue-500/30 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                  <Calendar className="w-12 h-12 text-blue-300 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Booking Opens on Saturday</h2>
                  <p className="text-blue-200 text-sm max-w-md">
                    The free wheel service promotion is only available {formatPromotionHours(promotion)}.
                    Please come back then to book your slot.
                  </p>
                  <p className="text-blue-300 text-xs mt-4">
                    Next Saturday: {nextSaturday.toLocaleDateString()}
                  </p>
                  <Link to="/contact" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all">
                    Contact Us for Other Services <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* Info Column */}
              <div className="space-y-6">
                {/* ... unchanged ... */}
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-2xl p-6 border border-blue-500/30 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 id='hero-head' className="text-xl font-bold text-white mb-2">Limited Offer!</h3>
                  <p className="text-blue-200 text-sm">{formatPromotionHours(promotion)}</p>
                </div>

                <div className="bg-blue-800/30 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/60 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-blue-300" /></div>
                    <h3 id='hero-head' className="text-xl font-bold text-white">Visit Us</h3>
                  </div>
                  <div className="mb-4 rounded-lg overflow-hidden border border-blue-500/30">
                    <iframe title="DGW Autospa Location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.385647628971!2d3.452378!3d6.473421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf4e7e4c7b8f9%3A0x7c95b6a2d3248a5f!2sLekki%20Peninsula%20II%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2s!4v1699999999999!5m2!1sen!2s" width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" className="rounded-lg"></iframe>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-blue-200 text-sm"><Building className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" /><span>{business.address}</span></div>
                    <div className="flex items-start gap-2 text-blue-200 text-sm"><Navigation className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" /><span>Lekki Peninsula II, Lagos, Nigeria</span></div>
                    <a href="https://maps.google.com/?q=4+Ibrahim+Odofin+Street+Idado+Estate+Lekki+Peninsula+II+Lagos+Nigeria" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 text-sm mt-2 transition-colors"><LocateFixed className="w-3 h-3" />Get Directions <ArrowRight className="w-3 h-3" /></a>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {trustBadges.map((badge, idx) => { const Icon = badge.icon; return (<div key={idx} className="bg-blue-800/30 rounded-xl p-3 text-center border border-blue-500/30"><Icon className="w-6 h-6 text-blue-300 mx-auto mb-1" /><p className="text-xs text-blue-200">{badge.text}</p></div>); })}
                </div>
                <div className="bg-blue-800/30 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/60 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-xl flex items-center justify-center flex-shrink-0"><Phone className="w-6 h-6 text-blue-300" /></div>
                    <div><h3 id='hero-head' className="text-xl font-bold text-white mb-2">Need Help?</h3><p className="text-blue-200 text-sm mb-2">Call us for assistance:</p><a href={`tel:${(business.phone || '+2347025887213').replace(/\s/g, '')}`} className="text-blue-300 font-semibold hover:text-blue-200 transition-colors">{business.phone || '+234 702 588 7213'}</a></div>
                  </div>
                </div>
                <div className="bg-blue-800/30 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/60 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-xl flex items-center justify-center flex-shrink-0"><Car className="w-6 h-6 text-blue-300" /></div>
                    <div><h3 id='hero-head' className="text-xl font-bold text-white mb-2">Regular Services?</h3><p className="text-blue-200 text-sm mb-3">Need other auto services? Check out our full range.</p><Link to="/services" className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 text-sm transition-colors">View All Services <ArrowRight className="w-4 h-4" /></Link></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default PromotionBooking;