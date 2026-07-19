import { useState, useEffect, useCallback } from 'react';

// ✅ Use environment variable (matches every other API call in the app).
// This was previously hardcoded to the old production Render URL, which is
// why Settings changes never showed up on the local/public site — every
// public page was silently reading from the live production backend
// instead of whichever backend this app is actually running against.
const API_BASE = import.meta.env.VITE_API_URL || '';

const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings/public`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching public settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    const handler = () => {
      console.log('🔄 Settings updated, refetching…');
      fetchSettings();
    };
    window.addEventListener('settingsUpdated', handler);
    return () => window.removeEventListener('settingsUpdated', handler);
  }, [fetchSettings]);

  const business = settings?.business || {
    businessName: 'DGW Autospa',
    tagline: 'Deep Gleam On Wheels',
    email: 'deepgleamonwheels@gmail.com',
    phone: '+234 702 588 7213',
    whatsapp: '',
    address: '4, Ibrahim Odofin Street, Idado Estate, Lekki Peninsula II, Lagos, Nigeria',
    website: '',
    instagram: 'https://instagram.com/deepgleamonwheels',
    facebook: 'https://facebook.com/DeepGleamOnWheelsAutospa',
    tiktok: '',
    logo: null,
    description: '',
  };

  // General Business Hours — when the shop is normally open. Completely
  // separate from `promotion` below; never derive one from the other.
  const hours = settings?.hours || {};

  // Free Wheel Promotion settings — only for the promo campaign, managed
  // independently on the admin Promotion Settings page.
  const promotion = settings?.promotion || {
    enabled: true,
    days: 'Monday - Friday',
    startTime: '10:00',
    endTime: '16:00',
    text: 'FREE WHEEL ALIGNMENT AVAILABLE',
    promoCode: 'MYFREEWHEEL',
  };

  return { business, hours, promotion, loading };
};

export default useSettings;