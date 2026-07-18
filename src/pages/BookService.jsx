import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import useSettings from '../hooks/useSettings';
import { Calendar, Clock, User, Mail, Phone, Car, MessageSquare, CheckCircle, MapPin, Send, Info, ArrowRight, Award, Shield } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function BookService() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', serviceId: '', preferredDate: '', preferredTime: '', additionalNotes: ''
  });
  const [formStatus, setFormStatus] = useState({ submitted: false, success: false, message: '' });
  const [servicesList, setServicesList] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const abortRef = useRef(null);
  const { business } = useSettings();

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

  const fetchServices = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(`${API_BASE_URL}/api/services`, { signal: controller.signal });
      const data = await response.json();
      if (data.success && data.data) setServicesList(data.data);
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching services:', error);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    return () => abortRef.current?.abort();
  }, [fetchServices]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.serviceId || !formData.preferredDate || !formData.preferredTime) {
      setFormStatus({ submitted: true, success: false, message: 'Please fill in all required fields.' });
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
      return;
    }

    if (!acceptedTerms) {
      setFormStatus({ submitted: true, success: false, message: 'You must accept the Terms & Conditions and Privacy Policy to proceed.' });
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
      return;
    }

    const selectedService = servicesList.find(s => s._id === formData.serviceId);
    if (!selectedService) {
      setFormStatus({ submitted: true, success: false, message: 'Invalid service selected.' });
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
      return;
    }

    const bookingData = {
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone || 'Not provided',
      serviceName: selectedService.name,
      servicePrice: 0,
      date: formData.preferredDate,
      time: formData.preferredTime,
      notes: formData.additionalNotes || '',
    };

    try {
      setFormLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      const result = await response.json();

      if (result.success) {
        setFormStatus({
          submitted: true,
          success: true,
          message: `✓ Booking request sent successfully! We'll contact you within 24 hours to confirm your ${selectedService.name} appointment on ${formData.preferredDate} at ${formData.preferredTime}.`
        });
        setFormData({ name: '', email: '', phone: '', serviceId: '', preferredDate: '', preferredTime: '', additionalNotes: '' });
        setAcceptedTerms(false);
      } else {
        throw new Error(result.message || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setFormStatus({ submitted: true, success: false, message: 'Unable to process booking. Please try again or call us directly.' });
    } finally {
      setFormLoading(false);
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <SEO title="Book Service | Schedule Your Auto Care Appointment" description="Book your premium automotive service appointment online at DGW Autospa. Choose from wheel alignment, brake maintenance, tyre acquisition, and more." />
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        {/* Hero */}
        <section className="pt-24 pb-10 md:pt-32 md:pb-14 lg:pt-40 lg:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-blue-500/50">
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>
              BOOK YOUR SERVICE
            </div>
            <h1 id='hero-head' className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
              SCHEDULE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">APPOINTMENT</span>
            </h1>
            <p className="text-base sm:text-lg text-blue-200 max-w-2xl mx-auto px-2 sm:px-0">
              Premium auto care at your convenience. Choose your service and preferred time.
            </p>
          </div>
        </section>

        {/* Form + Info */}
        <section className="pb-12 sm:pb-16 md:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">

              {/* Form Column */}
              <div className="bg-blue-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-blue-500/30 backdrop-blur-sm">
                <h2 id='hero-head' className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Request a Booking</h2>
                <p className="text-blue-200 text-sm sm:text-base mb-4 sm:mb-6">Fill out the form below and we'll get back to you with pricing and confirmation.</p>

                <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 bg-blue-900/50 rounded-lg border border-blue-500/30 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-200 leading-relaxed">Pricing varies based on vehicle condition and specific requirements. We'll provide a custom quote after reviewing your request.</p>
                </div>

                {formStatus.submitted && (
                  <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 ${formStatus.success ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'}`}>
                    {formStatus.success && <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                    <span className="text-sm">{formStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Name */}
                  <div>
                    <label id='hero-head' className="block text-blue-200 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all text-sm sm:text-base" placeholder="Enter your full name" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label id='hero-head' className="block text-blue-200 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all text-sm sm:text-base" placeholder="Enter your email" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label id='hero-head' className="block text-blue-200 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all text-sm sm:text-base" placeholder="Enter your phone number" />
                    </div>
                  </div>

                  {/* Service Select */}
                  <div>
                    <label id='hero-head' className="block text-blue-200 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Select Service *</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      <select name="serviceId" value={formData.serviceId} onChange={handleInputChange} required className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all appearance-none cursor-pointer text-sm sm:text-base">
                        <option value="" className="bg-blue-800">Select a service</option>
                        {servicesList.map((service) => (
                          <option key={service._id} value={service._id} className="bg-blue-800">{service.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                    <div className="w-full">
                      <label id='hero-head' htmlFor="preferredDate" className="block text-blue-200 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Preferred Date *</label>
                      <div className="relative w-full">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300 pointer-events-none" />
                        <input id="preferredDate" type="date" name="preferredDate" value={formData.preferredDate} onChange={handleInputChange} min={today} required className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all text-sm sm:text-base appearance-none" style={{ colorScheme: 'dark', WebkitAppearance: 'none', MozAppearance: 'none' }} />
                      </div>
                    </div>
                    <div className="w-full">
                      <label id='hero-head' htmlFor="preferredTime" className="block text-blue-200 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Preferred Time *</label>
                      <div className="relative w-full">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-300 pointer-events-none" />
                        <select id="preferredTime" name="preferredTime" value={formData.preferredTime} onChange={handleInputChange} required className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all appearance-none cursor-pointer text-sm sm:text-base">
                          <option value="" className="bg-blue-800">Select time</option>
                          {timeSlots.map((time) => (<option key={time} value={time} className="bg-blue-800">{time}</option>))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label id='hero-head' className="block text-blue-200 font-semibold mb-1.5 sm:mb-2 text-sm sm:text-base">Additional Notes</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                      <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="3" className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all resize-none text-sm sm:text-base" placeholder="Vehicle model, year, or any special requests..." />
                    </div>
                  </div>

                  {/* Terms & Conditions checkbox */}
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {formLoading ? 'Processing...' : <>Request Booking <Send className="w-4 h-4" /></>}
                  </button>
                </form>
              </div>

              {/* Info Column – updated email link */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-blue-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 id='hero-head' className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Visit Our Workshop</h3>
                      <p className="text-blue-200 text-xs sm:text-sm break-words">{business.address}</p>
                      <a href="https://maps.google.com/?q=4+Ibrahim+Odofin+Street+Idado+Estate+Lekki+Lagos" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-300 hover:text-white text-xs sm:text-sm mt-1 sm:mt-2 transition-colors">
                        Get Directions <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email – fixed to Gmail compose */}
                <div className="bg-blue-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 id='hero-head' className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Email Us</h3>
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${business.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-200 hover:text-white text-xs sm:text-sm transition-colors break-all block"
                      >
                        {business.email}
                      </a>
                      <p className="text-blue-300 text-xs mt-1">We typically respond within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-800/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/50 transition-all">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 id='hero-head' className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Opening Hours</h3>
                      <p className="text-blue-200 text-xs sm:text-sm">Monday - Saturday: 9:00 AM - 7:00 PM<br />Sunday: Closed</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-800/40 to-blue-700/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/30 text-center">
                  <h3 id='hero-head' className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">Need Immediate Assistance?</h3>
                  <p className="text-blue-200 text-xs sm:text-sm mb-3 sm:mb-4">Call us for urgent bookings or inquiries.</p>
                  <a href={`tel:${business.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-sm sm:text-base">
                    <Phone className="w-4 h-4" />{business.phone}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-blue-800/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center border border-blue-500/20">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 mx-auto mb-1" />
                    <p className="text-xs text-blue-200">Certified<br />Technicians</p>
                  </div>
                  <div className="bg-blue-800/20 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-center border border-blue-500/20">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300 mx-auto mb-1" />
                    <p className="text-xs text-blue-200">Quality<br />Guaranteed</p>
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

export default BookService;