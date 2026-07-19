import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import TopBanner from './TopBanner';
import FloatingWhatsApp from './FloatingWhatsApp';

const PublicLayout = () => {
  return (
    <div>
      <TopBanner />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default PublicLayout;