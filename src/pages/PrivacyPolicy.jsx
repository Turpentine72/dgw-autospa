import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Shield, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper: turns plain‑text line breaks into HTML <br />
function formatContent(raw) {
  if (!raw) return '';
  return raw.replace(/\n/g, '<br />');
}

// Static fallback – plain text with natural line breaks
const fallbackContent = `We collect personal information you voluntarily provide when you fill out a contact form, email us, or call:
• Name
• Email address
• Phone number
• Any other details you include in your message

We also automatically collect technical data (IP address, browser type) via cookies and analytics.

Your data is used solely to respond to your enquiries, provide accurate service information, and improve our website experience. We do not use your information for marketing without your explicit consent.

We implement security measures including encrypted transmission (SSL), restricted access, and secure storage.

We do not sell, trade, or otherwise transfer your personally identifiable information to third parties.

We may update this Privacy Policy periodically. Changes will be posted on this page.`;

const PrivacyPolicy = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/legal/privacy`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.content) {
          setContent(data.data.content);
        } else {
          setContent(fallbackContent);
        }
      })
      .catch(() => setContent(fallbackContent));
  }, []);

  return (
    <>
      <SEO title="Privacy Policy | DGW Autospa" description="Learn how DGW Autospa collects, uses, and protects your personal information." />
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <section className="pt-8 pb-12 md:pt-12 md:pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-blue-500/50">
            <Shield className="w-4 h-4" /> PRIVACY POLICY
          </div>
          <h1 id='hero-head' className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            YOUR PRIVACY <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">MATTERS</span>
          </h1>
        </section>

        <section className="pb-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="prose prose-invert max-w-none bg-blue-800/30 rounded-2xl p-6 md:p-8 border border-blue-500/30 text-blue-100 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatContent(content) }}
            />
          </div>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicy;