import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Building2, Clock, Bell, Shield, Save, Upload, X, Check, MapPin, Phone, Mail, Globe, Camera, RotateCcw, Eye, EyeOff, UserCog, User } from 'lucide-react';
import SEO from '../../components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// ==================== Helper: safe image URL ====================
const safeImage = (img) => {
  if (!img || img.startsWith('blob:')) return null;
  return img.startsWith('http') ? img : `${window.location.origin}/${img}`;
};

// ==================== Mail Settings (inside Business tab) ====================
const MailSettings = () => {
  const [mailUser, setMailUser] = useState('');
  const [mailPass, setMailPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    fetchCurrent();
  }, []);

  const fetchCurrent = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/settings/mail-settings`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setMailUser(data.mailUser || '');
        setHasPassword(data.hasPassword);
        setMailPass('');
      }
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    setError(''); setMessage('');
    if (!mailUser) { setError('Email user is required'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/settings/mail-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ mailUser, mailPass: mailPass || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Email credentials updated');
        if (mailPass) setHasPassword(true);
        setMailPass('');
        setTimeout(() => setMessage(''), 3000);
      } else { setError(data.message || 'Failed'); }
    } catch (err) { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="border-t pt-6 mt-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sending Email Credentials (SMTP)</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Update the Gmail address and app password used for outgoing emails. Leave password empty if you don't want to change it.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email User (Gmail address)</label>
          <input type="email" value={mailUser} onChange={(e) => setMailUser(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="youremail@gmail.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            App Password {hasPassword && <span className="text-green-600 text-xs">(set)</span>}
          </label>
          <input type="password" value={mailPass} onChange={(e) => setMailPass(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Leave empty to keep current" />
        </div>
      </div>
      {error && <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}
      {message && <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">{message}</div>}
      <div className="mt-4">
        <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
          {loading ? 'Saving...' : 'Update Email Credentials'}
        </button>
      </div>
    </div>
  );
};

// ==================== Business Settings ====================
const BusinessSettings = ({ settings, onChange }) => {
  const [logoPreview, setLogoPreview] = useState(settings.logo ? safeImage(settings.logo) : null);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('File size should be less than 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      onChange(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    onChange(prev => ({ ...prev, logo: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden">
          {logoPreview ? (
            <img src={logoPreview} alt="Business logo" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          )}
        </div>
        <div className="text-center sm:text-left">
          <h4 className="font-medium text-gray-900 dark:text-white">Business Logo</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Upload your company logo (max 2MB)</p>
          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" id="logo-upload" />
            <label htmlFor="logo-upload" className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 cursor-pointer transition-colors">Upload New</label>
            {logoPreview && (
              <button onClick={handleRemoveLogo} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">Remove</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Name <span className="text-red-500">*</span></label>
          <input type="text" value={settings.businessName || ''} onChange={(e) => onChange(prev => ({ ...prev, businessName: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tagline / Slogan</label>
          <input type="text" value={settings.tagline || ''} onChange={(e) => onChange(prev => ({ ...prev, tagline: e.target.value }))} placeholder="e.g., Deep Gleam On Wheels" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address <span className="text-red-500">*</span></label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input type="email" value={settings.email || ''} onChange={(e) => onChange(prev => ({ ...prev, email: e.target.value }))} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input type="tel" value={settings.phone || ''} onChange={(e) => onChange(prev => ({ ...prev, phone: e.target.value }))} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input type="tel" value={settings.whatsapp || ''} onChange={(e) => onChange(prev => ({ ...prev, whatsapp: e.target.value }))} placeholder="Leave blank to use Phone Number above" className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Used by the floating WhatsApp button. Include country code, e.g. +2347025887213.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input type="url" value={settings.website || ''} onChange={(e) => onChange(prev => ({ ...prev, website: e.target.value }))} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <textarea value={settings.address || ''} onChange={(e) => onChange(prev => ({ ...prev, address: e.target.value }))} rows={3} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Description</label>
          <textarea value={settings.description || ''} onChange={(e) => onChange(prev => ({ ...prev, description: e.target.value }))} rows={4} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instagram</label><input type="url" value={settings.instagram || ''} onChange={(e) => onChange(prev => ({ ...prev, instagram: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Facebook</label><input type="url" value={settings.facebook || ''} onChange={(e) => onChange(prev => ({ ...prev, facebook: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">TikTok</label><input type="url" value={settings.tiktok || ''} onChange={(e) => onChange(prev => ({ ...prev, tiktok: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
      </div>

      {/* MAIL SETTINGS SECTION */}
      <MailSettings />
    </div>
  );
};

// ==================== Hours Settings ====================
const HoursSettings = ({ hours, onChange }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const handleToggle = (day) => { onChange(prev => ({ ...prev, [day]: { ...prev[day], isOpen: !prev[day].isOpen } })); };
  const handleTimeChange = (day, field, value) => { onChange(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } })); };
  return (
    <div className="space-y-4">
      {days.map(day => (
        <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="w-28"><span className="font-medium text-gray-900 dark:text-white">{day}</span></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`relative w-10 h-5 rounded-full transition-colors ${hours[day]?.isOpen ? 'bg-gray-700 dark:bg-gray-600' : 'bg-gray-400 dark:bg-gray-600'}`}>
              <input type="checkbox" checked={hours[day]?.isOpen} onChange={() => handleToggle(day)} className="sr-only" />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${hours[day]?.isOpen ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">{hours[day]?.isOpen ? 'Open' : 'Closed'}</span>
          </label>
          {hours[day]?.isOpen && (
            <div className="flex items-center gap-3">
              <input type="time" value={hours[day]?.open || '09:00'} onChange={(e) => handleTimeChange(day, 'open', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              <span className="text-gray-500 dark:text-gray-400">to</span>
              <input type="time" value={hours[day]?.close || '18:00'} onChange={(e) => handleTimeChange(day, 'close', e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ==================== Notifications Settings ====================
const NotificationsSettings = ({ notifications, onChange }) => {
  const handleToggle = (key) => { onChange(prev => ({ ...prev, [key]: !prev[key] })); };
  const items = [
    { key: 'newBookings', label: 'New Bookings', description: 'Receive notifications when a new booking is made' },
    { key: 'bookingReminders', label: 'Booking Reminders', description: 'Send reminders before scheduled appointments' },
    { key: 'newReviews', label: 'New Reviews', description: 'Get notified when customers leave reviews' },
    { key: 'customerMessages', label: 'Customer Messages', description: 'Get notified of new customer inquiries' },
    { key: 'systemUpdates', label: 'System Updates', description: 'Receive updates about system maintenance' }
  ];
  return (
    <div className="space-y-4">
      {items.map(item => (
        <div key={item.key} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div><h4 className="font-medium text-gray-900 dark:text-white">{item.label}</h4><p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p></div>
          <label className="flex items-center cursor-pointer">
            <div className={`relative w-10 h-5 rounded-full transition-colors ${notifications[item.key] ? 'bg-gray-700 dark:bg-gray-600' : 'bg-gray-400 dark:bg-gray-600'}`}>
              <input type="checkbox" checked={notifications[item.key]} onChange={() => handleToggle(item.key)} className="sr-only" />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </label>
        </div>
      ))}
    </div>
  );
};

// ==================== Security Settings (password change) ====================
const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    setError(''); setMessage('');
    if (!currentPassword || !newPassword || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const response = await fetch(`${API_BASE_URL}/api/settings/change-password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await response.json();
      if (data.success) {
        setMessage('Password updated successfully!');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setTimeout(() => setMessage(''), 3000);
      } else { setError(data.message || 'Failed to update password'); }
    } catch (error) { console.error('Error updating password:', error); setError('Server error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
        <div className="relative">
          <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10" />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600" aria-label={showCurrent ? 'Hide password' : 'Show password'}>
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
        <div className="relative">
          <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10" />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600" aria-label={showNew ? 'Hide password' : 'Show password'}>
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
        <div className="relative">
          <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10" />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600" aria-label={showConfirm ? 'Hide password' : 'Show password'}>
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}
      {message && <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">{message}</div>}
      <button onClick={handleUpdatePassword} disabled={loading} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">{loading ? 'Updating...' : 'Update Password'}</button>
    </div>
  );
};

// ==================== Profile Settings (name & phone) ====================
const ProfileSettings = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      try { const parsed = JSON.parse(adminData); setName(parsed.name || ''); setPhone(parsed.phone || ''); setEmail(parsed.email || ''); } catch (e) {}
    }
  }, []);

  const handleUpdateProfile = async () => {
    setError(''); setMessage('');
    if (!name.trim()) { setError('Name cannot be empty'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/settings/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, phone })
      });
      const data = await res.json();
      if (data.success) {
        const stored = JSON.parse(localStorage.getItem('adminData'));
        stored.name = data.data.name;
        stored.phone = data.data.phone;
        localStorage.setItem('adminData', JSON.stringify(stored));
        window.dispatchEvent(new Event('adminProfileUpdated'));
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>
      </div>
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">Email: <span className="font-medium text-gray-900 dark:text-white">{email}</span></p>
        <p className="text-xs text-gray-500 mt-1">To change your email, use the Email tab.</p>
      </div>
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}
      {message && <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">{message}</div>}
      <button onClick={handleUpdateProfile} disabled={loading} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">{loading ? 'Saving...' : 'Update Profile'}</button>
    </div>
  );
};

// ==================== Email Change Settings ====================
const EmailChangeSettings = () => {
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) { try { setCurrentEmail(JSON.parse(adminData).email || ''); } catch (e) {} }
  }, []);

  const handleRequestOTP = async () => {
    setError(''); setMessage('');
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setError('Please enter a valid new email'); return; }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) { setError('New email is the same as current email'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/auth/change-email-request`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newEmail })
      });
      const data = await res.json();
      if (data.success) { setMessage('OTP sent to new email. Check your inbox.'); setStep(2); }
      else { setError(data.message || 'Failed to send OTP'); }
    } catch (err) { setError('Network error'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    setError(''); setMessage('');
    if (!otp) { setError('Please enter the OTP'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/auth/change-email-confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Email changed successfully!');
        const adminData = JSON.parse(localStorage.getItem('adminData'));
        adminData.email = newEmail;
        localStorage.setItem('adminData', JSON.stringify(adminData));
        window.dispatchEvent(new Event('adminProfileUpdated'));
        setCurrentEmail(newEmail);
        setNewEmail(''); setOtp(''); setStep(1);
        setTimeout(() => setMessage(''), 4000);
      } else { setError(data.message || 'Invalid or expired OTP'); }
    } catch (err) { setError('Network error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">Change the email address associated with your admin account. You'll need to verify the new address with a one‑time password (OTP).</p>
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current email:</p>
        <p className="font-semibold text-gray-900 dark:text-white">{currentEmail || 'Not available'}</p>
      </div>
      {step === 1 ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Email Address</label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" /><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter new email" className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" /></div>
          </div>
          <button onClick={handleRequestOTP} disabled={loading} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">{loading ? 'Sending...' : 'Send OTP'}</button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OTP Code</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleVerifyOTP} disabled={loading} className="flex-1 px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">{loading ? 'Verifying...' : 'Verify & Change Email'}</button>
            <button onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
          </div>
        </>
      )}
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}
      {message && <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">{message}</div>}
    </div>
  );
};

// ==================== Admin Email Settings (Super Admin only) ====================
const AdminEmailSettings = () => {
  const [superAdminEmail, setSuperAdminEmail] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchCurrentEmail(); }, []);
  const fetchCurrentEmail = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/settings/super-admin-email`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setCurrentEmail(data.email); setSuperAdminEmail(data.email); }
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async () => {
    setError(''); setMessage('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!superAdminEmail || !emailRegex.test(superAdminEmail)) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const res = await fetch(`${API_BASE_URL}/api/settings/super-admin-email`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ superAdminEmail }) });
      const data = await res.json();
      if (data.success) { setMessage('Notification email updated successfully!'); setCurrentEmail(superAdminEmail); setTimeout(() => setMessage(''), 3000); }
      else { setError(data.message || 'Failed to update email'); }
    } catch (err) { setError('Server error. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">This email receives all Super Admin notifications: password reset links, Manager/Staff reset alerts, and system notifications.</p>
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"><p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current notification email:</p><p className="font-semibold text-gray-900 dark:text-white">{currentEmail || 'Not set'}</p></div>
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}
      {message && <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">{message}</div>}
      <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Notification Email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" /><input type="email" value={superAdminEmail} onChange={(e) => setSuperAdminEmail(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Enter notification email" /></div></div>
      <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">{loading ? 'Saving...' : 'Update Notification Email'}</button>
    </div>
  );
};

// ==================== Main Settings Page ====================
function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  // Current editable settings
  const [businessSettings, setBusinessSettings] = useState({
    businessName: '', tagline: '', email: '', phone: '', whatsapp: '', website: '', address: '', description: '', logo: null,
    instagram: '', facebook: '', tiktok: ''
  });
  const [hoursSettings, setHoursSettings] = useState({});
  const [notificationsSettings, setNotificationsSettings] = useState({});

  // Original values from server (for comparison)
  const original = useRef({ business: {}, hours: {}, notifications: {} });

  const abortRef = useRef(null);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const response = await fetch(`${API_BASE_URL}/api/settings`, { headers: { 'Authorization': `Bearer ${token}` }, signal: controller.signal });
      const data = await response.json();
      if (data.success && data.data) {
        const s = data.data;
        const b = s.business || {};
        const h = s.hours || {};
        const n = s.notifications || {};
        setBusinessSettings(b);
        setHoursSettings(h);
        setNotificationsSettings(n);
        original.current = {
          business: JSON.parse(JSON.stringify(b)),
          hours: JSON.parse(JSON.stringify(h)),
          notifications: JSON.parse(JSON.stringify(n))
        };
      }
    } catch (error) { if (error.name !== 'AbortError') console.error('Error fetching settings:', error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) { try { const data = JSON.parse(storedAdmin); setUserRole(data.role || ''); } catch (e) { console.error(e); } }
    fetchSettings();
    return () => abortRef.current?.abort();
  }, [fetchSettings]);

  // Determine if there are unsaved changes
  const hasChanges = useMemo(() => {
    const curr = {
      business: businessSettings,
      hours: hoursSettings,
      notifications: notificationsSettings
    };
    const orig = original.current;
    return JSON.stringify(curr) !== JSON.stringify(orig);
  }, [businessSettings, hoursSettings, notificationsSettings]);

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ business: businessSettings, hours: hoursSettings, notifications: notificationsSettings })
      });
      const data = await response.json();
      if (data.success) {
        original.current = {
          business: JSON.parse(JSON.stringify(businessSettings)),
          hours: JSON.parse(JSON.stringify(hoursSettings)),
          notifications: JSON.parse(JSON.stringify(notificationsSettings))
        };
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // 🔁 Notify public pages that settings have changed
        window.dispatchEvent(new Event('settingsUpdated'));
      } else {
        alert('Failed to save settings');
      }
    } catch (error) { console.error('Error saving settings:', error); alert('Failed to save settings'); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'hours', label: 'Hours', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(userRole === 'Super Admin' ? [{ id: 'adminEmail', label: 'Admin Email', icon: UserCog }] : [])
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400 mx-auto"></div><p className="text-gray-500 dark:text-gray-400 mt-4">Loading settings...</p></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="System Settings" description="Configure DGW Autospa system settings" noIndex={true} />
      <div className="p-6 pb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your DGW Autospa system</p>
          </div>
          <button onClick={fetchSettings} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Refresh"><RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'email' && <EmailChangeSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'business' && <BusinessSettings settings={businessSettings} onChange={setBusinessSettings} />}
          {activeTab === 'hours' && <HoursSettings hours={hoursSettings} onChange={setHoursSettings} />}
          {activeTab === 'notifications' && <NotificationsSettings notifications={notificationsSettings} onChange={setNotificationsSettings} />}
          {activeTab === 'adminEmail' && <AdminEmailSettings />}
        </div>
        {showSuccess && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg z-50"><Check className="w-5 h-5" /> Settings saved!</div>
        )}
        {hasChanges && (activeTab === 'business' || activeTab === 'hours' || activeTab === 'notifications') && (
          <div className="fixed bottom-4 right-4 z-40">
            <button onClick={handleSaveSettings} className="flex items-center gap-2 px-6 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors shadow-lg"><Save className="w-4 h-4" /> Save Changes</button>
          </div>
        )}
      </div>
    </>
  );
}

export default Settings;