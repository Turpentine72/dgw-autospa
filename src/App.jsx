import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import PublicLayout from './components/PublicLayout';

// Public Pages (with layout)
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import GalleryPage from './pages/GalleryPage';
import Testimonials from './pages/Testimonials';
import TeamPage from './pages/TeamPage';
import Contact from './pages/Contact';
import BookService from './pages/BookService';
import PromotionBooking from './pages/PromotionBooking';

// Standalone Pages (no layout)
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Admin Auth Pages
import Login from './admin/pages/Login';
import ForgotPassword from './admin/pages/ForgotPassword';

// Admin Pages
import AdminLayout from './admin/components/AdminLayout';
import AdminContacts from './admin/pages/AdminContacts';
import Dashboard from './admin/pages/Dashboard';
import Bookings from './admin/pages/Bookings';
import Services from './admin/pages/Services';
import MyProfile from './admin/pages/MyProfile';
import Customers from './admin/pages/Customers';
import Gallery from './admin/pages/Gallery';
import Reviews from './admin/pages/Reviews';
import AdminTeam from './admin/pages/AdminTeam';
import PromotionBookingsAdmin from './admin/pages/PromotionBookings';
import Reports from './admin/pages/Reports';
import AdminUsers from './admin/pages/AdminUsers';
import Settings from './admin/pages/Settings';
import PromotionSettings from './admin/pages/PromotionSettings';
import LegalAdmin from './admin/pages/Legal';  // 👈 NEW

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <HelmetProvider>
      <ScrollToTop />
      <Routes>
        {/* Public Routes WITH navbar & footer */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/teams" element={<TeamPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/bookservice" element={<BookService />} />
          <Route path="/free-wheel-service" element={<PromotionBooking />} />
        </Route>

        {/* Standalone pages – NO layout */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Admin Auth */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />

        {/* Admin Protected */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="services" element={<Services />} />
          <Route path="customers" element={<Customers />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="promotion-bookings" element={<PromotionBookingsAdmin />} />
          <Route path="promotion-settings" element={<PromotionSettings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="admin-users" element={<AdminUsers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="legal" element={<LegalAdmin />} />  
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HelmetProvider>
  );
}

export default App;