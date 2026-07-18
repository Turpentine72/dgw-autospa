import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { FileText, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

function formatContent(raw) {
  if (!raw) return '';
  return raw.replace(/\n/g, '<br />');
}

const fallbackContent = `1. Acceptance of Terms
By using this website, you agree to these Terms of Service.

2. Website Purpose
This site is for informational and booking enquiry purposes. Descriptions, prices, and availability may change without notice.

3. No Liability for Misunderstandings
Information on this website is for general guidance only. We are not liable for any misunderstandings or errors. All bookings must be confirmed via direct contact (phone or email).

4. Changes to Services & Prices
We reserve the right to modify or discontinue services and alter pricing at any time without prior notice.

5. Contact Before Booking
All service slots are subject to availability and must be confirmed directly with our team.

6. Intellectual Property
All content (logos, images, text) is owned by DGW Autospa. Unauthorized use is prohibited.

7. Changes to These Terms
We may update these terms at any time. Continued use of the site constitutes acceptance of any changes.`;

const TermsOfService = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/legal/terms`)
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
      <SEO title="Terms of Service | DGW Autospa" description="Review the terms of service for using DGW Autospa's website and services." />
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        <div className="pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <section className="pt-8 pb-12 md:pt-12 md:pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-blue-500/50">
            <FileText className="w-4 h-4" /> TERMS OF SERVICE
          </div>
          <h1 id='hero-head' className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            TERMS OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">SERVICE</span>
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

export default TermsOfService;