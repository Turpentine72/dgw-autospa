import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import useSettings from '../hooks/useSettings';
import { formatBusinessHours } from '../admin/utils/formatHours';
import { CheckCircle, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';

const AboutPage = () => {
  const { business, hours } = useSettings();

  return (
    <div className="bg-gradient-to-b from-blue-950 to-blue-900 min-h-screen">
      <SEO
        title={`About Us | ${business.businessName || 'DGW Autospa'}`}
        description={business.description || `Learn more about ${business.businessName || 'DGW Autospa'}, premium automotive care in Lagos.`}
      />

      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-white">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-800/60 text-blue-200 text-sm font-semibold tracking-wide uppercase mb-6">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-8">
            About {business.businessName || 'DGW Autospa'}
          </h1>

          {business.description ? (
            <p className="text-blue-100 text-lg leading-relaxed whitespace-pre-line mb-8">
              {business.description}
            </p>
          ) : (
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              At {business.businessName || 'DGW Autospa'}, we understand the importance of a well-maintained
              vehicle. Our team of skilled technicians uses state-of-the-art equipment and premium products
              to deliver exceptional results — from routine maintenance to specialized detailing, we treat
              every vehicle with the care it deserves.
            </p>
          )}

          {business.tagline && (
            <p className="text-blue-300 font-semibold uppercase tracking-wide mb-12">{business.tagline}</p>
          )}

          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <div className="flex gap-4 bg-blue-900/40 border border-blue-800/60 rounded-xl p-5">
              <Clock className="w-6 h-6 text-blue-300 shrink-0" />
              <div>
                <p className="font-semibold text-white mb-1">Business Hours</p>
                <p className="text-blue-200 text-sm">{formatBusinessHours(hours)}</p>
              </div>
            </div>
            <div className="flex gap-4 bg-blue-900/40 border border-blue-800/60 rounded-xl p-5">
              <MapPin className="w-6 h-6 text-blue-300 shrink-0" />
              <div>
                <p className="font-semibold text-white mb-1">Address</p>
                <p className="text-blue-200 text-sm">{business.address}</p>
              </div>
            </div>
            <div className="flex gap-4 bg-blue-900/40 border border-blue-800/60 rounded-xl p-5">
              <Phone className="w-6 h-6 text-blue-300 shrink-0" />
              <div>
                <p className="font-semibold text-white mb-1">Phone</p>
                <p className="text-blue-200 text-sm">{business.phone}</p>
              </div>
            </div>
            <div className="flex gap-4 bg-blue-900/40 border border-blue-800/60 rounded-xl p-5">
              <Mail className="w-6 h-6 text-blue-300 shrink-0" />
              <div>
                <p className="font-semibold text-white mb-1">Email</p>
                <p className="text-blue-200 text-sm break-all">{business.email}</p>
              </div>
            </div>
          </div>

          <ul className="flex flex-wrap gap-6 mb-12">
            <li className="flex items-center gap-2 text-blue-200"><CheckCircle className="w-5 h-5 text-blue-300" /><span>Premium Products</span></li>
            <li className="flex items-center gap-2 text-blue-200"><CheckCircle className="w-5 h-5 text-blue-300" /><span>Expert Technicians</span></li>
            <li className="flex items-center gap-2 text-blue-200"><CheckCircle className="w-5 h-5 text-blue-300" /><span>Modern Equipment</span></li>
          </ul>

          <Link
            to="/bookservice"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Book a Service <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
