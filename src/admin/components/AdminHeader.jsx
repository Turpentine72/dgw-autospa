import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import useSettings from '../../hooks/useSettings';
import {
  Search, Bell, LogOut, Settings, ChevronDown, Moon, Sun, X, User
} from 'lucide-react';

// ---------- Safe JSON parser ----------
const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (e) {
    console.error('Invalid JSON response:', e);
    return { success: false, data: [] };
  }
};

const AdminHeader = () => {
  const navigate = useNavigate();
  const { business } = useSettings();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminData, setAdminData] = useState(null);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Initialize admin data and theme
  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        setAdminData(parsedAdmin);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }

    const savedTheme = localStorage.getItem('admin_theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Abortable notifications fetching – now using safeJson
  const loadNotifications = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const [bookingsRes, reviewsRes] = await Promise.all([
        fetch('/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }),
        fetch('/api/reviews/admin', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }),
      ]);

      const bookingsData = await safeJson(bookingsRes);
      const reviewsData = await safeJson(reviewsRes);

      const bookings = bookingsData?.success ? bookingsData.data : [];
      const reviews = reviewsData?.success ? reviewsData.data : [];

      const storedNotifications = localStorage.getItem('admin_notifications');
      let existingNotifications = storedNotifications ? JSON.parse(storedNotifications) : [];

      const newNotifications = [];
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentBookings = bookings.filter(
        (b) => b.status === 'pending' && new Date(b.createdAt) >= oneDayAgo
      );

      recentBookings.forEach((booking) => {
        const alreadyNotified = existingNotifications.some(
          (n) => n.type === 'booking' && n.bookingId === booking._id
        );
        if (!alreadyNotified) {
          newNotifications.push({
            id: `booking_${booking._id}`,
            type: 'booking',
            title: 'New Booking Received',
            message: `${booking.customerName} booked ${booking.serviceName}`,
            time: booking.createdAt || new Date().toISOString(),
            read: false,
            bookingId: booking._id,
            iconColor: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
          });
        }
      });

      const pendingReviews = reviews.filter((r) => r.status === 'pending');
      pendingReviews.forEach((review) => {
        const alreadyNotified = existingNotifications.some(
          (n) => n.type === 'review' && n.reviewId === review._id
        );
        if (!alreadyNotified) {
          newNotifications.push({
            id: `review_${review._id}`,
            type: 'review',
            title: 'New Review Awaiting Approval',
            message: `${review.customerName} left a ${review.rating}★ review`,
            time: review.createdAt || new Date().toISOString(),
            read: false,
            reviewId: review._id,
            iconColor: 'text-gray-600 dark:text-gray-400',
            bgColor: 'bg-gray-100 dark:bg-gray-800',
          });
        }
      });

      const allNotifications = [...newNotifications, ...existingNotifications];
      allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));
      const trimmedNotifications = allNotifications.slice(0, 50);

      localStorage.setItem('admin_notifications', JSON.stringify(trimmedNotifications));
      setNotifications(trimmedNotifications);
      setUnreadCount(trimmedNotifications.filter((n) => !n.read).length);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error loading notifications:', error);
      }
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => {
      clearInterval(interval);
      abortControllerRef.current?.abort();
    };
  }, [loadNotifications]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('admin_notifications', JSON.stringify([]));
    setUnreadCount(0);
    setIsNotificationsOpen(false);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    navigate(notification.type === 'booking' ? '/admin/bookings' : '/admin/reviews');
    setIsNotificationsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('admin_notifications');
    navigate('/admin/login');
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('admin_theme', newDarkMode ? 'dark' : 'light');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Read admin data from localStorage so header updates immediately after profile changes
  const currentAdmin = adminData || (() => {
    try {
      const stored = localStorage.getItem('adminData');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const displayName = currentAdmin?.name || 'Admin';
  const displayRole = currentAdmin?.role || '';
  const displayEmail = currentAdmin?.email || '';

  return (
    <>
      <SEO
        title="Admin Dashboard"
        description={`${business.businessName || 'DGW Autospa'} Admin Dashboard - Manage bookings, reviews, services, and customer data securely`}
        noIndex={true}
      />
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30 transition-colors duration-200">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block">
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {business.businessName || 'DGW Autospa'} <span className="text-gray-700 dark:text-gray-400">Admin</span>
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-500 hidden md:block">Secure Management Portal</p>
              </div>

              <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 w-64 lg:w-96 border border-gray-200 dark:border-gray-700">
                <Search size={18} className="text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search bookings, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 ml-2 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400"
                />
              </form>

              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Open search"
              >
                <Search size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-gray-600 dark:text-gray-400" />}
              </button>

              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} unread</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <>
                            <button onClick={markAllAsRead} className="text-xs text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                              Mark all read
                            </button>
                            <button onClick={clearAllNotifications} className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                              Clear all
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell size={40} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-gray-50 dark:bg-gray-800/30' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div
                                className={`w-10 h-10 ${notification.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
                              >
                                <Bell size={18} className={notification.iconColor} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium ${
                                    !notification.read
                                      ? 'text-gray-900 dark:text-white'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                                  {getTimeAgo(notification.time)}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-gray-600 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(displayName)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{displayRole}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {displayEmail || 'Not available'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{business.businessName || 'DGW Autospa'}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => navigate('/admin/profile')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <User size={16} /> My Profile
                      </button>
                      <button
                        onClick={() => navigate('/admin/settings')}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <Settings size={16} /> Settings
                      </button>
                      <hr className="my-1 border-gray-100 dark:border-gray-800" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isMobileSearchOpen && (
            <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                  <Search size={20} className="text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search bookings, customers, services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none ml-3 text-gray-700 dark:text-gray-300"
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default AdminHeader;