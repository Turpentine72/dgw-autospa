import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, ShieldCheck } from 'lucide-react';
import SEO from '/src/components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const MyProfile = () => {
  // ----- profile data -----
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // ----- email change steps -----
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = enter new email, 2 = enter OTP
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');

  // Pre‑fill from localStorage (only the current user's data)
  useEffect(() => {
    const admin = localStorage.getItem('adminData');
    if (admin) {
      try {
        const parsed = JSON.parse(admin);
        setName(parsed.name || '');
        setPhone(parsed.phone || '');
        setCurrentEmail(parsed.email || '');
      } catch (e) { /* ignore */ }
    }
  }, []);

  // ----- Update profile (name/phone) -----
  const handleUpdateProfile = async () => {
    setProfileErr('');
    setProfileMsg('');
    if (!name.trim()) {
      setProfileErr('Name cannot be empty');
      return;
    }
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/settings/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (data.success) {
        // update localStorage so header reflects changes immediately
        const adminData = JSON.parse(localStorage.getItem('adminData'));
        adminData.name = data.data.name;
        adminData.phone = data.data.phone;
        localStorage.setItem('adminData', JSON.stringify(adminData));
        setProfileMsg('Profile updated successfully!');
        setTimeout(() => setProfileMsg(''), 3000);
      } else {
        setProfileErr(data.message || 'Update failed');
      }
    } catch (err) {
      setProfileErr('Network error');
    } finally {
      setProfileLoading(false);
    }
  };

  // ----- Email change step 1: send OTP -----
  const handleSendOTP = async () => {
    setEmailErr('');
    setEmailMsg('');
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailErr('Please enter a valid new email address');
      return;
    }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setEmailErr('New email is same as current email');
      return;
    }
    setEmailLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/auth/change-email-request`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailMsg('OTP sent to your new email. Check your inbox.');
        setStep(2);
      } else {
        setEmailErr(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setEmailErr('Network error');
    } finally {
      setEmailLoading(false);
    }
  };

  // ----- Email change step 2: verify OTP -----
  const handleVerifyOTP = async () => {
    setEmailErr('');
    setEmailMsg('');
    if (!otp) {
      setEmailErr('Please enter the OTP');
      return;
    }
    setEmailLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/auth/change-email-confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailMsg('Email changed successfully!');
        // update localStorage
        const adminData = JSON.parse(localStorage.getItem('adminData'));
        adminData.email = newEmail;
        localStorage.setItem('adminData', JSON.stringify(adminData));
        setCurrentEmail(newEmail);
        setNewEmail('');
        setOtp('');
        setStep(1);
        setTimeout(() => setEmailMsg(''), 4000);
      } else {
        setEmailErr(data.message || 'Invalid or expired OTP');
      }
    } catch (err) {
      setEmailErr('Network error');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <>
      <SEO title="My Profile | DGW Autospa Admin" noIndex={true} />
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h2>

        {/* Profile info section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Email: <span className="font-medium text-gray-900 dark:text-white">{currentEmail}</span></p>
          </div>
          {profileErr && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{profileErr}</div>}
          {profileMsg && <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">{profileMsg}</div>}
          <button onClick={handleUpdateProfile} disabled={profileLoading}
            className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
            {profileLoading ? 'Saving...' : 'Update Profile'}
          </button>
        </div>

        {/* Email change section */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Email</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">We'll send a one‑time password to the new email address.</p>
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter new email"
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                </div>
              </div>
              {emailErr && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{emailErr}</div>}
              {emailMsg && <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">{emailMsg}</div>}
              <button onClick={handleSendOTP} disabled={emailLoading}
                className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
                {emailLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OTP Code</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              {emailErr && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{emailErr}</div>}
              {emailMsg && <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">{emailMsg}</div>}
              <div className="flex gap-3">
                <button onClick={handleVerifyOTP} disabled={emailLoading}
                  className="flex-1 px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
                  {emailLoading ? 'Verifying...' : 'Verify & Change Email'}
                </button>
                <button onClick={() => { setStep(1); setOtp(''); setEmailErr(''); setEmailMsg(''); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyProfile;