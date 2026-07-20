// Shared formatting helpers so every component that displays hours renders
// them identically, sourced from the same Settings data. Two completely
// separate concepts:
//   - General Business Hours  (Settings > Business Settings > Hours tab)
//   - Free Wheel Promotion Hours (Settings > Promotion Settings)
// These must never be derived from one another.
//
// IMPORTANT: day keys here are capitalized ('Monday', 'Tuesday', ...) to
// exactly match what the admin HoursSettings component in Settings.jsx
// actually saves to the database. A previous version of this file used
// lowercase keys, which silently never matched — hours always displayed as
// "Closed" no matter what was saved. Keep these in sync.

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBR = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' };

/** "14:00" -> "2:00 PM" */
export function to12Hour(time24) {
  if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (Number.isNaN(h)) return '';
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${mStr} ${suffix}`;
}

/**
 * Turns the per-day { Monday: { isOpen, open, close }, ... } object from
 * Settings > Hours into a compact human-readable summary, grouping
 * consecutive days that share the same open/close time.
 * e.g. "Mon - Sat: 8:00 AM - 7:00 PM" or "Mon - Fri: 9AM-6PM, Sat: 10AM-2PM, Sun: Closed"
 */
export function formatBusinessHours(hours, { short = false } = {}) {
  if (!hours || Object.keys(hours).length === 0) return 'Hours not set';

  const days = DAY_ORDER.map(d => ({ key: d, ...(hours[d] || { isOpen: false }) }));

  // If literally nothing is marked open anywhere, treat it the same as "not set"
  // rather than confidently showing "Closed" for a business that just hasn't
  // configured hours yet.
  if (!days.some(d => d.isOpen)) return 'Hours not set';

  // Group consecutive days with identical open/close/isOpen state
  const groups = [];
  for (const day of days) {
    const signature = day.isOpen ? `${day.open}-${day.close}` : 'closed';
    const last = groups[groups.length - 1];
    if (last && last.signature === signature) {
      last.days.push(day.key);
    } else {
      groups.push({ signature, isOpen: day.isOpen, open: day.open, close: day.close, days: [day.key] });
    }
  }

  const parts = groups.map(g => {
    const label = g.days.length > 1
      ? `${DAY_ABBR[g.days[0]]} - ${DAY_ABBR[g.days[g.days.length - 1]]}`
      : DAY_ABBR[g.days[0]];
    if (!g.isOpen) return `${label}: Closed`;
    return short
      ? `${label}: ${to12Hour(g.open)}-${to12Hour(g.close)}`
      : `${label}: ${to12Hour(g.open)} - ${to12Hour(g.close)}`;
  });

  return parts.join(', ');
}

/** Just today's hours, e.g. for a "we're open now" style badge */
export function getTodayHours(hours) {
  if (!hours) return null;
  const dayKey = DAY_ORDER[(new Date().getDay() + 6) % 7]; // JS getDay(): 0=Sun -> map to our order
  const today = hours[dayKey];
  if (!today) return null;
  return today.isOpen
    ? { isOpen: true, label: `${to12Hour(today.open)} - ${to12Hour(today.close)}` }
    : { isOpen: false, label: 'Closed today' };
}

/**
 * Formats the Free Wheel Promotion hours, e.g. "Monday - Friday • 10:00 AM - 4:00 PM"
 */
export function formatPromotionHours(promotion) {
  if (!promotion) return '';
  const days = promotion.days || 'Monday - Friday';
  const start = to12Hour(promotion.startTime) || '10:00 AM';
  const end = to12Hour(promotion.endTime) || '4:00 PM';
  return `${days} • ${start} - ${end}`;
}
