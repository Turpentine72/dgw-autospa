import React from 'react';

// General Business Hours editor. Deliberately separate from Free Wheel
// Promotion Hours (that lives in PromotionSettings.jsx) — never conflate
// the two.
//
// Day keys are capitalized ('Monday', 'Tuesday', ...) to match what
// src/utils/formatHours.js expects when reading these back on the public
// site. Keep this in sync if you ever change one side.

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_DAY = { isOpen: true, open: '09:00', close: '18:00' };

// Ensures every day always has a fully-formed object, so the UI is never
// blank/broken on first load and toggle/time handlers never crash on an
// undefined day.
export function withDefaultHours(hours) {
  const result = {};
  for (const day of DAYS) {
    result[day] = { ...DEFAULT_DAY, ...(hours?.[day] || {}) };
  }
  return result;
}

const HoursSettings = ({ hours, onChange }) => {
  // Belt-and-suspenders: even if the parent passed a partial/empty object,
  // reads below always fall back safely.
  const safeHours = hours || {};

  const handleToggle = (day) => {
    onChange(prev => {
      const current = (prev && prev[day]) || DEFAULT_DAY;
      return { ...prev, [day]: { ...current, isOpen: !current.isOpen } };
    });
  };

  const handleTimeChange = (day, field, value) => {
    onChange(prev => {
      const current = (prev && prev[day]) || DEFAULT_DAY;
      return { ...prev, [day]: { ...current, [field]: value } };
    });
  };

  return (
    <div className="space-y-4">
      {DAYS.map(day => {
        const dayData = safeHours[day] || DEFAULT_DAY;
        return (
          <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="w-28"><span className="font-medium text-gray-900 dark:text-white">{day}</span></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${dayData.isOpen ? 'bg-gray-700 dark:bg-gray-600' : 'bg-gray-400 dark:bg-gray-600'}`}>
                <input type="checkbox" checked={dayData.isOpen} onChange={() => handleToggle(day)} className="sr-only" />
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${dayData.isOpen ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{dayData.isOpen ? 'Open' : 'Closed'}</span>
            </label>
            {dayData.isOpen && (
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={dayData.open || '09:00'}
                  onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <input
                  type="time"
                  value={dayData.close || '18:00'}
                  onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HoursSettings;
