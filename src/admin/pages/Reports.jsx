import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart3, Calendar, Download, TrendingUp, TrendingDown, Users, Star, DollarSign, Clock, ArrowUpRight, ArrowDownRight, Car, Search, Wrench, RotateCcw, Phone } from 'lucide-react';
import SEO from '../../components/SEO';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function Reports() {
  const [dateRange, setDateRange] = useState('30days');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadData = useCallback(async () => {
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
        const transformed = data.data.map(booking => ({
          id: booking._id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          service: booking.serviceName,
          rawPrice: booking.quotedPrice || booking.servicePrice || 0,
          date: booking.date,
          time: booking.time,
          status: booking.status,
          createdAt: booking.createdAt,
          quotedPrice: booking.quotedPrice
        }));
        setBookings(transformed);
      }
    } catch (error) { if (error.name !== 'AbortError') console.error('Error fetching bookings:', error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); return () => abortRef.current?.abort(); }, [loadData]);

  const getFilteredBookings = () => {
    const now = new Date();
    let startDate = new Date();
    switch(dateRange) {
      case '7days': startDate.setDate(now.getDate() - 7); break;
      case '30days': startDate.setDate(now.getDate() - 30); break;
      case '90days': startDate.setDate(now.getDate() - 90); break;
      case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
      default: startDate.setDate(now.getDate() - 30);
    }
    return bookings.filter(b => new Date(b.date) >= startDate && (b.status === 'confirmed' || b.status === 'completed'));
  };

  const getAllBookingsForTrends = () => {
    const now = new Date();
    let startDate = new Date();
    switch(dateRange) {
      case '7days': startDate.setDate(now.getDate() - 7); break;
      case '30days': startDate.setDate(now.getDate() - 30); break;
      case '90days': startDate.setDate(now.getDate() - 90); break;
      case 'year': startDate = new Date(now.getFullYear(), 0, 1); break;
      default: startDate.setDate(now.getDate() - 30);
    }
    return bookings.filter(b => new Date(b.date) >= startDate);
  };

  const filteredBookings = getFilteredBookings();
  const allTrendsBookings = getAllBookingsForTrends();
  const hasData = filteredBookings.length > 0;
  const totalBookings = filteredBookings.length;
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.rawPrice || 0), 0);
  const uniqueCustomers = new Set(filteredBookings.map(b => b.customerEmail)).size;
  const pendingCount = allTrendsBookings.filter(b => b.status === 'pending').length;
  const contactedCount = allTrendsBookings.filter(b => b.status === 'contacted').length;
  const confirmedCount = allTrendsBookings.filter(b => b.status === 'confirmed').length;
  const completedCount = allTrendsBookings.filter(b => b.status === 'completed').length;
  const cancelledCount = allTrendsBookings.filter(b => b.status === 'cancelled').length;

  const getPreviousPeriodBookings = () => {
    const now = new Date();
    let currentStart = new Date(), previousStart = new Date(), previousEnd = new Date();
    switch(dateRange) {
      case '7days': currentStart.setDate(now.getDate() - 7); previousStart.setDate(now.getDate() - 14); previousEnd.setDate(now.getDate() - 7); break;
      case '30days': currentStart.setDate(now.getDate() - 30); previousStart.setDate(now.getDate() - 60); previousEnd.setDate(now.getDate() - 30); break;
      case '90days': currentStart.setDate(now.getDate() - 90); previousStart.setDate(now.getDate() - 180); previousEnd.setDate(now.getDate() - 90); break;
      default: currentStart.setDate(now.getDate() - 30); previousStart.setDate(now.getDate() - 60); previousEnd.setDate(now.getDate() - 30);
    }
    const previousBookings = bookings.filter(b => {
      const bDate = new Date(b.date);
      return bDate >= previousStart && bDate < previousEnd && (b.status === 'confirmed' || b.status === 'completed');
    });
    return { count: previousBookings.length, revenue: previousBookings.reduce((sum, b) => sum + (b.rawPrice || 0), 0) };
  };

  const previousPeriod = getPreviousPeriodBookings();
  const bookingChange = previousPeriod.count === 0 ? 0 : ((totalBookings - previousPeriod.count) / previousPeriod.count) * 100;
  const revenueChange = previousPeriod.revenue === 0 ? 0 : ((totalRevenue - previousPeriod.revenue) / previousPeriod.revenue) * 100;

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(); date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];
      const dayAllBookings = allTrendsBookings.filter(b => b.date === dateStr).length;
      const dayRevenueBookings = filteredBookings.filter(b => b.date === dateStr);
      const dayRevenue = dayRevenueBookings.reduce((sum, b) => sum + (b.rawPrice || 0), 0);
      days.push({ day: dayName, bookings: dayAllBookings, revenue: dayRevenue });
    }
    return days;
  };

  const bookingTrendsData = getLast7Days();
  const revenueData = getLast7Days();

  const getPopularServices = () => {
    const serviceCounts = {};
    filteredBookings.forEach(booking => {
      const serviceName = booking.service;
      if (!serviceCounts[serviceName]) serviceCounts[serviceName] = { count: 0, revenue: 0 };
      serviceCounts[serviceName].count++;
      serviceCounts[serviceName].revenue += booking.rawPrice || 0;
    });
    return Object.entries(serviceCounts).map(([name, data]) => ({ name, bookings: data.count, revenue: data.revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  };

  const popularServicesData = getPopularServices();
  const serviceColors = ['#4B5563', '#6B7280', '#9CA3AF', '#D1D5DB', '#374151'];
  const pieChartData = popularServicesData.map((service, idx) => ({ name: service.name, value: service.revenue, color: serviceColors[idx % serviceColors.length] }));

  const exportToCSV = () => {
    const headers = ['Metric', 'Value'];
    const data = [
      ['Total Bookings (Confirmed/Completed)', totalBookings],
      ['Total Revenue', `₦${totalRevenue.toLocaleString()}`],
      ['New Customers', uniqueCustomers],
      ['Date Range', dateRange],
      ['', ''],
      ['Status Breakdown', ''],
      ['Pending', pendingCount],
      ['Contacted', contactedCount],
      ['Confirmed', confirmedCount],
      ['Completed', completedCount],
      ['Cancelled', cancelledCount],
      ['', ''],
      ['Top Services', 'Bookings', 'Revenue'],
      ...popularServicesData.map(s => [s.name, s.bookings, `₦${s.revenue.toLocaleString()}`])
    ];
    const csvContent = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400 mx-auto"></div><p className="text-gray-500 dark:text-gray-400 mt-4">Loading reports...</p></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Reports & Analytics" description="DGW Autospa business reports and analytics dashboard" noIndex={true} />
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{!hasData ? "No data available yet." : `Showing data for ${totalBookings} confirmed/completed bookings`}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <option value="7days">7 Days</option>
              <option value="30days">30 Days</option>
              <option value="90days">90 Days</option>
              <option value="year">This Year</option>
            </select>
            <button onClick={loadData} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Refresh"><RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
            {hasData && <button onClick={exportToCSV} className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"><Download className="w-4 h-4" /> Export</button>}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800"><p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Pending</p><p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{pendingCount}</p></div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800"><p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Contacted</p><p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{contactedCount}</p></div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"><p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Confirmed</p><p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{confirmedCount}</p></div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800"><p className="text-xs text-green-600 dark:text-green-400 mb-1">Completed</p><p className="text-2xl font-bold text-green-700 dark:text-green-400">{completedCount}</p></div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800"><p className="text-xs text-red-600 dark:text-red-400 mb-1">Cancelled</p><p className="text-2xl font-bold text-red-700 dark:text-red-400">{cancelledCount}</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Trends (Last 7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrendsData}>
                  <defs><linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4B5563" stopOpacity={0.3}/><stop offset="95%" stopColor="#4B5563" stopOpacity={0}/></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="day" stroke="#6B7280" /><YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }} itemStyle={{ color: '#F9FAFB' }} />
                  <Area type="monotone" dataKey="bookings" stroke="#6B7280" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Overview (Last 7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                  <XAxis dataKey="day" stroke="#6B7280" /><YAxis tickFormatter={(value) => `₦${value}`} stroke="#6B7280" />
                  <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']} contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }} itemStyle={{ color: '#F9FAFB' }} />
                  <Bar dataKey="revenue" fill="#6B7280" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Services</h3>
          {!hasData || popularServicesData.length === 0 ? (
            <div className="text-center py-8"><BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" /><p className="text-gray-500 dark:text-gray-400">No performance data yet</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="text-left border-b border-gray-200 dark:border-gray-800"><th className="pb-3 text-gray-600 dark:text-gray-400 text-sm font-medium">Rank</th><th className="pb-3 text-gray-600 dark:text-gray-400 text-sm font-medium">Service</th><th className="pb-3 text-right text-gray-600 dark:text-gray-400 text-sm font-medium">Bookings</th><th className="pb-3 text-right text-gray-600 dark:text-gray-400 text-sm font-medium">Revenue</th></tr></thead>
                <tbody>
                  {popularServicesData.map((service, index) => (
                    <tr key={service.name} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${index === 0 ? 'bg-gray-700 dark:bg-gray-600' : index === 1 ? 'bg-gray-600 dark:bg-gray-500' : index === 2 ? 'bg-gray-500 dark:bg-gray-400' : 'bg-gray-400 dark:bg-gray-500'}`}>{index + 1}</div></td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{service.name}</td>
                      <td className="py-3 text-right text-gray-700 dark:text-gray-300">{service.bookings}</td>
                      <td className="py-3 text-right text-green-600 dark:text-green-400 font-medium">₦{service.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Reports;