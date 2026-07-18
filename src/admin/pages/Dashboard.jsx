import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, DollarSign, Clock, CheckCircle, AlertCircle,
  Inbox, BarChart3, Settings, Wrench, RotateCcw, Phone, Gift
} from 'lucide-react';
import SEO from '../../components/SEO';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const StatCard = memo(function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const hasData = value !== 0 && value !== '0' && value !== '₦0';
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{hasData ? value : '0'}</h3>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color}`}><Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" /></div>
      </div>
    </div>
  );
});

const BookingList = memo(function BookingList({ bookings }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'contacted': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      case 'confirmed': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Inbox className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.slice(0, 5).map(booking => (
        <div key={booking._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{booking.customerName?.charAt(0) || '?'}</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">{booking.customerName}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{booking.serviceName}</p>
            </div>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="text-left">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{new Date(booking.date).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{booking.time}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>{booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}</span>
          </div>
        </div>
      ))}
    </div>
  );
});

const RevenueChart = memo(function RevenueChart({ data }) {
  const hasRevenue = data && data.some(d => d.revenue > 0);
  if (!data || data.length === 0 || !hasRevenue) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No revenue data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4B5563" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#4B5563" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₦${value}`} tick={{ fontSize: 10, fill: '#6B7280' }} />
        <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']} contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }} itemStyle={{ color: '#F9FAFB' }} />
        <Area type="monotone" dataKey="revenue" stroke="#6B7280" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
});

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0, totalCustomers: 0, totalRevenue: 0,
    pendingBookings: 0, contactedBookings: 0, confirmedBookings: 0, completedBookings: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const abortRef = useRef(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      try { const parsedAdmin = JSON.parse(storedAdmin); setUserRole(parsedAdmin.role); } catch (error) { console.error('Error parsing admin data:', error); }
    }
  }, []);

  const loadBookings = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const response = await fetch(`${API_BASE_URL}/api/bookings`, { headers: { 'Authorization': `Bearer ${token}` }, signal: controller.signal });
      const data = await response.json();
      if (data.success && data.data) {
        setBookings(data.data);
        calculateStats(data.data);
        generateChartData(data.data);
      }
    } catch (error) { if (error.name !== 'AbortError') console.error('Error fetching bookings:', error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBookings(); return () => abortRef.current?.abort(); }, [loadBookings]);

  const calculateStats = (bookingsData) => {
    const confirmedOrCompleted = bookingsData.filter(b => b.status === 'confirmed' || b.status === 'completed');
    const uniqueCustomers = new Set(confirmedOrCompleted.map(b => b.customerEmail));
    const totalRev = confirmedOrCompleted.reduce((sum, b) => sum + (b.quotedPrice || b.servicePrice || 0), 0);
    setStats({
      totalBookings: bookingsData.length,
      totalCustomers: uniqueCustomers.size,
      totalRevenue: totalRev,
      pendingBookings: bookingsData.filter(b => b.status === 'pending').length,
      contactedBookings: bookingsData.filter(b => b.status === 'contacted').length,
      confirmedBookings: bookingsData.filter(b => b.status === 'confirmed').length,
      completedBookings: bookingsData.filter(b => b.status === 'completed').length
    });
  };

  const generateChartData = (bookingsData) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(); date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push({ date: dateStr, display: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    const revenue = last7Days.map(day => {
      const dayBookings = bookingsData.filter(b => {
        const bookingDate = new Date(b.date).toISOString().split('T')[0];
        return bookingDate === day.date && (b.status === 'confirmed' || b.status === 'completed');
      });
      const total = dayBookings.reduce((sum, b) => sum + (b.quotedPrice || b.servicePrice || 0), 0);
      return { day: day.display, revenue: total };
    });
    setRevenueData(revenue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeBookings = stats.confirmedBookings + stats.contactedBookings;

  return (
    <>
      <SEO title="Dashboard Overview" description="DGW Autospa Admin Dashboard - Overview of bookings, revenue, and customer statistics" noIndex={true} />
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back! You have {stats.totalBookings} total booking{stats.totalBookings !== 1 ? 's' : ''}.</p>
          </div>
          <button onClick={loadBookings} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Refresh">
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <StatCard title="Total Bookings" value={stats.totalBookings} icon={Calendar} color="bg-gray-100 dark:bg-gray-800" subtitle={`${stats.pendingBookings} pending`} />
          <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="bg-gray-100 dark:bg-gray-800" />
          <StatCard title="Total Revenue" value={stats.totalRevenue > 0 ? `₦${stats.totalRevenue.toLocaleString()}` : '₦0'} icon={DollarSign} color="bg-gray-100 dark:bg-gray-800" />
          <StatCard title="Active Bookings" value={activeBookings} icon={Phone} color="bg-gray-100 dark:bg-gray-800" subtitle={`${stats.confirmedBookings} confirmed`} />
        </div>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview (Last 7 Days)</h3>
            <RevenueChart data={revenueData} />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">View All →</Link>
          </div>
          <BookingList bookings={bookings} />
        </div>
      </div>
    </>
  );
}

export default Dashboard;