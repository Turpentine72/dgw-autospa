import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useSettings from '../../hooks/useSettings';
import {
  LayoutDashboard, Calendar, Wrench, Users, Image, Star, Settings, Shield,
  BarChart3, Menu, X, LogOut, Gift, MessageSquare, ExternalLink, Tag, FileText
} from 'lucide-react';
import { hasPermission } from '../utils/permissions';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const { business } = useSettings();

  useEffect(() => {
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        setUserRole(parsed.role);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard, permission: 'View Bookings' },
    { path: '/admin/bookings', name: 'Bookings', icon: Calendar, permission: 'View Bookings' },
    { path: '/admin/services', name: 'Services', icon: Wrench, permission: 'Manage Services' },
    { path: '/admin/customers', name: 'Customers', icon: Users, permission: 'Manage Customers' },
    { path: '/admin/contacts', name: 'Contacts', icon: MessageSquare, permission: 'Manage Customers' },
    { path: '/admin/gallery', name: 'Gallery', icon: Image, permission: 'Manage Gallery' },
    { path: '/admin/reviews', name: 'Reviews', icon: Star, permission: 'Manage Reviews' },
    { path: '/admin/team', name: 'Team', icon: Users, permission: 'Manage Team' },
    { path: '/admin/promotion-bookings', name: 'Promotions', icon: Gift, permission: 'Manage Promotion Bookings' },
    { path: '/admin/promotion-settings', name: 'Promotion Settings', icon: Tag, permission: 'Manage Promotion Bookings' },
    { path: '/admin/reports', name: 'Reports', icon: BarChart3, permission: 'View Reports' },
    { path: '/admin/admin-users', name: 'Admin Users', icon: Shield, permission: 'Manage Admins' },
    // 👇 NEW – Legal Pages
    { path: '/admin/legal', name: 'Legal Pages', icon: FileText, permission: 'Manage Settings' },
    { path: '/admin/settings', name: 'Settings', icon: Settings, permission: 'Manage Settings' },
  ];

  const filteredMenuItems = menuItems.filter(item => userRole && hasPermission(userRole, item.permission));

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className={`h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            {business.logo && (
              <img src={business.logo} alt={business.businessName || 'Business logo'} className="h-8 w-8 object-contain rounded shrink-0" />
            )}
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">{business.businessName || 'DGW Autospa'}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu size={20} className="text-gray-600 dark:text-gray-400" /> : <X size={20} className="text-gray-600 dark:text-gray-400" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {filteredMenuItems.map(item => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section: Logout + Visit Website */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title="Visit Public Website"
        >
          <ExternalLink size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Visit Public Website</span>}
        </a>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title="Logout"
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-40 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      <div className="hidden md:block sticky top-0 h-screen">
        {sidebarContent}
      </div>

      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed left-0 top-0 h-full z-50 md:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;