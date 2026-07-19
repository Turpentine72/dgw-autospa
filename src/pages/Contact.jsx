import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import useSettings from '../hooks/useSettings';
import { formatPromotionHours } from '../admin/utils/formatHours';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, User, AtSign, ChevronRight, CheckCircle, AlertCircle, Wrench, ArrowRight, Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function Contact() {
  const location = useLocation();
  const [formData, setFormData] = useState({ name: '', email: '', service: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState({ submitted: false, success: false, message: '' });
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);   // ← new
  const { business, hours } = useSettings();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const serviceParam = params.get('service');
    if (serviceParam) setFormData(prev => ({ ...prev, service: serviceParam, subject: `Inquiry about: ${serviceParam}` }));
  }, [location.search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check required fields
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({ submitted: true, success: false, message: 'Please fill in all required fields (Name, Email, and Message).' });
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
      return;
    }

    // 👇 Check terms acceptance
    if (!acceptedTerms) {
      setFormStatus({ submitted: true, success: false, message: 'You must accept the Terms & Conditions and Privacy Policy to proceed.' });
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setFormStatus({ submitted: true, success: true, message: '✓ Message sent successfully! We\'ll get back to you within 24 hours with pricing information.' });
        setFormData({ name: '', email: '', service: '', subject: '', message: '' });
        setAcceptedTerms(false);   // reset checkbox
      } else {
        throw new Error(data.message || 'Failed to send');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setFormStatus({ submitted: true, success: false, message: `⚠️ Failed to send message. Please call us directly at ${business.phone || '+234 702 588 7213'}.` });
    } finally {
      setLoading(false);
      setTimeout(() => setFormStatus({ submitted: false, success: false, message: '' }), 5000);
    }
  };

  const contactInfo = [
    { icon: MapPin, title: "Visit Us", details: business.address, link: "https://maps.google.com/?q=4+Ibrahim+Odofin+Street+Idado+Estate+Lekki+Lagos", linkText: "Get Directions" },
    { icon: Phone, title: "Call Us", details: business.phone || '+234 702 588 7213', link: `tel:${(business.phone || '+2347025887213').replace(/\s/g, '')}`, linkText: "Call Now" },
    { icon: Mail, title: "Email Us", details: business.email || 'deepgleamonwheels@gmail.com', link: `https://mail.google.com/mail/?view=cm&fs=1&to=${business.email || 'deepgleamonwheels@gmail.com'}`, linkText: "Send Email" },
    { icon: Clock, title: "Working Hours", details: formatBusinessHours(hours), link: null, linkText: null }
  ];

  const serviceOptions = [
    "General Inspection & Diagnostic",
    "Wheel Balancing",
    "Wheel Alignment",
    "Tyre Acquisition",
    "Quick Service",
    "Brake Disc Maintenance",
    "Other - Please specify"
  ];

  return (
    <>
      <SEO
        title="Contact Us | DGW Autospa - Premium Auto Care in Lagos"
        description="Get in touch with DGW Autospa for premium automotive services in Lagos. Call, email, or visit our workshop at Lekki Peninsula II for expert auto care."
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        <section className="pt-32 pb-12 md:pt-40 md:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-500/50">
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>
              GET IN TOUCH
            </div>
            <h1 id='hero-head' className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              VISIT THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">AUTOSPA</span>
            </h1>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Have questions? Need assistance? Reach out to us and we'll respond promptly.
            </p>
          </div>
        </section>

        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form Column */}
              <div className="bg-blue-800/30 rounded-2xl p-6 md:p-8 border border-blue-500/30 backdrop-blur-sm">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Send Us a Message</h2>
                <p className="text-blue-200 mb-6">Fill out the form and we'll get back to you with pricing and availability.</p>

                {formStatus.submitted && (
                  <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                    formStatus.success
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                      : 'bg-red-500/20 border border-red-500/50 text-red-400'
                  }`}>
                    {formStatus.success ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                    <span className="text-sm">{formStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-blue-200 font-semibold mb-2">Your Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all" placeholder="Your full name" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-blue-200 font-semibold mb-2">Email Address *</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all" placeholder="Enter your email" />
                    </div>
                  </div>

                  {/* Service */}
                  <div>
                    <label className="block text-blue-200 font-semibold mb-2">Service Interested In *</label>
                    <div className="relative">
                      <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                      <select name="service" value={formData.service} onChange={handleInputChange} required className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all appearance-none cursor-pointer">
                        <option value="" className="bg-blue-800">Select a service...</option>
                        {serviceOptions.map(service => (<option key={service} value={service} className="bg-blue-800">{service}</option>))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronRight className="w-4 h-4 text-blue-300 rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-blue-200 font-semibold mb-2">Subject</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
                      <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all" placeholder="How can we help you?" />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-blue-200 font-semibold mb-2">Message *</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-blue-300" />
                      <textarea name="message" value={formData.message} onChange={handleInputChange} rows="5" required className="w-full pl-10 pr-4 py-3 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all resize-none" placeholder="Tell us about your vehicle, service needs, or any specific questions..." />
                    </div>
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

                  {/* Submit button */}
                  <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-0.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>) : (<><Send className="w-4 h-4" /> Send Message</>)}
                  </button>
                </form>
              </div>

              {/* Info Column – unchanged */}
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-blue-800/30 rounded-2xl p-6 border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/60 transition-all duration-300 group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <info.icon className="w-6 h-6 text-blue-300" />
                      </div>
                      <div className="flex-1">
                        <h3 id='hero-head' className="text-xl font-bold text-white mb-2">{info.title}</h3>
                        <p className="text-blue-200 text-sm leading-relaxed whitespace-pre-line">{info.details}</p>
                        {info.link && (
                          <a href={info.link} target={info.link.startsWith('http') ? "_blank" : undefined} rel={info.link.startsWith('http') ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1 text-blue-300 hover:text-white text-sm font-medium mt-3 transition-colors group/link">
                            {info.linkText} <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-800/30 rounded-2xl p-1 border border-blue-500/30 overflow-hidden hover:border-blue-400/60 transition-all">
                  <iframe title="DGW Autospa Location" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.385647628971!2d3.452378!3d6.473421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf4e7e4c7b8f9%3A0x7c95b6a2d3248a5f!2sLekki%20Peninsula%20II%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2s!4v1699999999999!5m2!1sen!2s" className="w-full h-64 rounded-xl" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
                </div>

                <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-200">
                      <strong className="font-semibold">Quick Response:</strong> We typically respond to all inquiries within 24 hours. For urgent matters, please call us directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-blue-800/40 to-blue-700/40 rounded-2xl p-8 border border-blue-500/30 text-center">
              <h3 id='hero-head' className="text-2xl font-bold text-white mb-3">Prefer to Book Directly?</h3>
              <p className="text-blue-200 mb-6">Schedule your service appointment online in just a few clicks.</p>
              <Link to="/bookservice">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
                  Book a Service <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Contact;