/**
 * Centralised role‑based permission definitions for the DGW Autospa admin panel.
 * Each role:
 *   - Super Admin: full access
 *   - Manager: manages day‑to‑day operations but can’t alter admin users or system settings
 *   - Staff: can view and manage bookings only
 */

const permissionsMap = {
  'Super Admin': {
    canViewBookings: true,
    canManageBookings: true,
    canManageServices: true,
    canManageCustomers: true,
    canManageAdmins: true,
    canViewReports: true,
    canManageSettings: true,
    canManageGallery: true,
    canManageReviews: true,
    canManageTeam: true,
    canManagePromotionBookings: true,
  },
  Manager: {
    canViewBookings: true,
    canManageBookings: true,
    canManageServices: true,
    canManageCustomers: true,
    canManageAdmins: false,
    canViewReports: true,
    canManageSettings: false,
    canManageGallery: true,
    canManageReviews: true,
    canManageTeam: false,
    canManagePromotionBookings: true,
  },
  Staff: {
    canViewBookings: true,
    canManageBookings: true,
    canManageServices: false,
    canManageCustomers: false,
    canManageAdmins: false,
    canViewReports: false,
    canManageSettings: false,
    canManageGallery: false,
    canManageReviews: false,
    canManageTeam: false,
    canManagePromotionBookings: false,
  },
};

/**
 * Normalises a role string (case‑insensitive, trimmed) to a valid role key.
 * Returns null if no match is found.
 */
const normalizeRole = (role) => {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  if (normalized === 'super admin') return 'Super Admin';
  if (normalized === 'manager') return 'Manager';
  if (normalized === 'staff') return 'Staff';
  return null;
};

/**
 * Returns a display‑oriented permissions object for UI rendering.
 * Always returns an object even for unknown roles (defaults to Staff‑like).
 */
export const getDisplayPermissions = (role) => {
  const normalized = normalizeRole(role);
  // Fallback for unknown roles: behaves like Staff (can still view bookings)
  if (!normalized) {
    return {
      'View Bookings': true,
      'Manage Bookings': true,
      'Manage Services': false,
      'Manage Customers': false,
      'Manage Admins': false,
      'View Reports': false,
      'Manage Settings': false,
      'Manage Gallery': false,
      'Manage Reviews': false,
      'Manage Team': false,
      'Manage Promotion Bookings': false,
    };
  }

  const perms = permissionsMap[normalized];
  return {
    'View Bookings': perms.canViewBookings,
    'Manage Bookings': perms.canManageBookings,
    'Manage Services': perms.canManageServices,
    'Manage Customers': perms.canManageCustomers,
    'Manage Admins': perms.canManageAdmins,
    'View Reports': perms.canViewReports,
    'Manage Settings': perms.canManageSettings,
    'Manage Gallery': perms.canManageGallery,
    'Manage Reviews': perms.canManageReviews,
    'Manage Team': perms.canManageTeam,
    'Manage Promotion Bookings': perms.canManagePromotionBookings,
  };
};

/**
 * Quick check: does the user have a specific permission?
 */
export const hasPermission = (userRole, permission) => {
  const perms = getDisplayPermissions(userRole);
  return perms[permission] || false;
};

/**
 * Maps admin routes to the minimum required permission.
 * Used by AdminLayout to guard access.
 */
export const canAccessRoute = (userRole, route) => {
  const routePermissions = {
    '/admin/dashboard': 'View Bookings',
    '/admin/bookings': 'View Bookings',
    '/admin/services': 'Manage Services',
    '/admin/customers': 'Manage Customers',
    '/admin/admin-users': 'Manage Admins',
    '/admin/reports': 'View Reports',
    '/admin/settings': 'Manage Settings',
    '/admin/gallery': 'Manage Gallery',
    '/admin/reviews': 'Manage Reviews',
    '/admin/team': 'Manage Team',
    '/admin/promotion-bookings': 'Manage Promotion Bookings',
  };

  const permission = routePermissions[route];
  // If a route isn't explicitly mapped, allow access (e.g., login, profile)
  if (!permission) return true;

  return hasPermission(userRole, permission);
};