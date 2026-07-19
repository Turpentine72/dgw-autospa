import React, { useState, useEffect, useRef } from 'react';
import { Gift, Save, Loader2, CheckCircle } from 'lucide-react';
import SEO from '../../components/SEO';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// This page is the SINGLE place the Free Wheel promotion is configured.
// It intentionally has nothing to do with General Business Hours (that's
// Settings > Hours) — these are two independent settings by design.
const PromotionSettings = () => {
  const [promotion, setPromotion] = useState({
    enabled: true,
    days: 'Monday - Friday',
    startTime: '10:00',
    endTime: '16:00',
    text: 'FREE WHEEL ALIGNMENT AVAILABLE',
    promoCode: 'MYFREEWHEEL',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const original = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.data?.promotion) {
          const p = { ...promotion, ...data.data.promotion, promoCode: 'MYFREEWHEEL' };
          setPromotion(p);
          original.current = JSON.parse(JSON.stringify(p));
        } else {
          original.current = JSON.parse(JSON.stringify(promotion));
        }
      } catch (err) {
        console.error('Failed to load promotion settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasChanges = original.current && JSON.stringify(original.current) !== JSON.stringify(promotion);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ promotion }),
      });
      const data = await res.json();
      if (data.success) {
        original.current = JSON.parse(JSON.stringify(promotion));
        setSaved(true);
        // Tell every public page (banner, promo page, floating elements) to refetch
        window.dispatchEvent(new Event('settingsUpdated'));
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save promotion settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <SEO title="Promotion Settings" noIndex={true} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Gift className="w-6 h-6 text-blue-600" /> Promotion Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage the Free Wheel promotion. This is completely separate from your General Business Hours.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6">

        {/* Enable/disable */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Free Wheel Promotion</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Turn the promotion on or off sitewide</p>
          </div>
          <button
            type="button"
            onClick={() => setPromotion(p => ({ ...p, enabled: !p.enabled }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${promotion.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${promotion.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>

        <hr className="border-gray-200 dark:border-gray-800" />

        {/* Promotion hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Promotion Days</label>
          <input
            type="text"
            value={promotion.days}
            onChange={(e) => setPromotion(p => ({ ...p, days: e.target.value }))}
            placeholder="e.g. Monday - Friday"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-400 mt-1">Free text, e.g. "Every Saturday" or "Monday - Friday" — independent of your general opening days.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
            <input
              type="time"
              value={promotion.startTime}
              onChange={(e) => setPromotion(p => ({ ...p, startTime: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
            <input
              type="time"
              value={promotion.endTime}
              onChange={(e) => setPromotion(p => ({ ...p, endTime: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-800" />

        {/* Promotional text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Promotional Text</label>
          <input
            type="text"
            value={promotion.text}
            onChange={(e) => setPromotion(p => ({ ...p, text: e.target.value }))}
            placeholder="e.g. FREE WHEEL ALIGNMENT AVAILABLE"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-400 mt-1">Shown in the scrolling banner at the top of the site.</p>
        </div>

        {/* Promo code — fixed, read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Promo Code</label>
          <input
            type="text"
            value="MYFREEWHEEL"
            disabled
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">This is the only promo code in the system. It's applied automatically — customers no longer need to enter it.</p>
        </div>

        {/* Live preview */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase mb-1">Banner Preview</p>
          <p className="text-blue-900 dark:text-blue-200 font-semibold">
            {promotion.enabled
              ? `${promotion.text} • ${promotion.days} • ${promotion.startTime} - ${promotion.endTime}`
              : 'Promotion is currently disabled — banner is hidden sitewide'}
          </p>
        </div>
      </div>

      {/* Save bar */}
      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
            <CheckCircle className="w-4 h-4" /> Saved
          </span>
        )}
      </div>
    </div>
  );
};

export default PromotionSettings;
