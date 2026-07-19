import React from 'react';
import useSettings from '../hooks/useSettings';

// WhatsApp SVG icon (keeps the bundle free of an extra icon dependency)
const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
    <path d="M16.001 2.667C8.65 2.667 2.667 8.65 2.667 16c0 2.583.716 4.998 1.958 7.06L2.667 29.333l6.45-1.916A13.28 13.28 0 0016.001 29.333c7.35 0 13.333-5.983 13.333-13.333S23.35 2.667 16.001 2.667zm0 24.333a11 11 0 01-5.6-1.533l-.4-.234-3.834 1.14 1.15-3.734-.26-.4A10.94 10.94 0 015.001 16c0-6.066 4.934-11 11-11s11 4.934 11 11-4.934 11-11 11z"/>
    <path d="M22.14 18.72c-.336-.168-1.986-.98-2.294-1.092-.308-.112-.532-.168-.756.168-.224.336-.868 1.092-1.064 1.316-.196.224-.392.252-.728.084-.336-.168-1.418-.522-2.702-1.666-.998-.89-1.672-1.988-1.868-2.324-.196-.336-.02-.518.148-.686.152-.15.336-.392.504-.588.168-.196.224-.336.336-.56.112-.224.056-.42-.028-.588-.084-.168-.756-1.82-1.036-2.492-.272-.654-.548-.566-.756-.576-.196-.008-.42-.01-.644-.01s-.588.084-.896.42c-.308.336-1.176 1.15-1.176 2.802s1.204 3.25 1.372 3.474c.168.224 2.368 3.616 5.738 5.07.802.346 1.428.552 1.916.706.804.256 1.536.22 2.114.134.645-.096 1.986-.812 2.266-1.596.28-.784.28-1.456.196-1.596-.084-.14-.308-.224-.644-.392z"/>
  </svg>
);

const FloatingWhatsApp = () => {
  const { business } = useSettings();

  // WhatsApp number falls back to the general Phone Number if a dedicated
  // WhatsApp number hasn't been set in Settings — never hardcoded either way.
  const rawNumber = business.whatsapp || business.phone;
  if (!rawNumber) return null;

  const digitsOnly = rawNumber.replace(/[^\d]/g, '');
  const message = encodeURIComponent(`Hi ${business.businessName || 'DGW Autospa'}, I'd like to book a service.`);
  const href = `https://wa.me/${digitsOnly}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75 group-hover:opacity-0" />
      <span className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-transform">
        <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
      </span>
    </a>
  );
};

export default FloatingWhatsApp;
