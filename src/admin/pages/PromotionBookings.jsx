import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Search, Phone, Mail, RotateCcw, Trash2, Eye, User, Gift } from 'lucide-react';
import SEO from '../../components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

function PromotionBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [userRole, setUserRole] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) { try { const parsed = JSON.parse(storedAdmin); setUserRole(parsed.role); } catch (error) { console.error('Error parsing admin data:', error); } }
  }, []);

  const canManage = userRole === 'Super Admin' || userRole === 'Manager';

  const fetchBookings = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      let url = `${API_BASE_URL}/api/promotion-bookings`;
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` }, signal: controller.signal });
      const data = await response.json();
      if (data.success) setBookings(data.data);
    } catch (error) { if (error.name !== 'AbortError') console.error('Error fetching bookings:', error); }
    finally { setLoading(false); }
  }, [filter, search]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // ✅ Use environment variable
      const response = await fetch(`${API_BASE_URL}/api/promotion-bookings/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) { console.error('Error fetching stats:', error); }
  }, []);

  useEffect(() => { fetchBookings(); fetchStats(); return () => abortRef.current?.abort(); }, [fetchBookings, fetchStats]);

  const updateStatus = async (id, status) => {
    if (!confirm(`Mark this booking as ${status}?`)) return;
    const token = localStorage.getItem('adminToken');
    try {
      // ✅ Use environment variable
      const response = await fetch(`${API_BASE_URL}/api/promotion-bookings/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) { fetchBookings(); fetchStats(); }
    } catch (error) { console.error('Error updating status:', error); alert('Failed to update status'); }
  };

  const deleteBooking = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      // ✅ Use environment variable
      const response = await fetch(`${API_BASE_URL}/api/promotion-bookings/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) { fetchBookings(); fetchStats(); }
    } catch (error) { console.error('Error deleting:', error); alert('Failed to delete booking'); }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', bg: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
      confirmed: { text: 'Confirmed', bg: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
      completed: { text: 'Completed', bg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
      cancelled: { text: 'Cancelled', bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
    };
    const config = badges[status] || badges.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg}`}>{config.text}</span>;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = search === '' || booking.customerName?.toLowerCase().includes(search.toLowerCase()) || booking.customerEmail?.toLowerCase().includes(search.toLowerCase()) || booking.customerPhone?.includes(search);
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400 mx-auto"></div><p className="text-gray-500 dark:text-gray-400 mt-4">Loading promotion bookings...</p></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Promotion Bookings Management" description="Manage Saturday Free Wheel Service promotion bookings" noIndex={true} />
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white"><Gift className="w-6 h-6 text-gray-700 dark:text-gray-400" /> Promotion Bookings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage Saturday Free Wheel Service bookings</p>
          </div>
          <button onClick={() => { fetchBookings(); fetchStats(); }} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Refresh">
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => {
            const colors = { all: 'border-gray-700 dark:border-gray-500', pending: 'border-yellow-500', confirmed: 'border-green-500', completed: 'border-gray-700 dark:border-gray-500', cancelled: 'border-red-500' };
            return (
              <div key={status} onClick={() => setFilter(status)} className={`bg-white dark:bg-gray-900 rounded-xl p-4 border-2 cursor-pointer transition-all ${filter === status ? colors[status] + ' shadow-md' : 'border-gray-200 dark:border-gray-800'}`}>
                <div className={`text-2xl font-bold ${status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : status === 'confirmed' ? 'text-green-600 dark:text-green-400' : status === 'cancelled' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {stats[status]}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status}</p>
              </div>
            );
          })}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No promotion bookings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-gray-600 dark:text-gray-400" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{booking.customerName}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{booking.customerEmail}</span>
                        {booking.customerPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{booking.customerPhone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(booking.status)}</div>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-gray-500 dark:text-gray-400 text-xs">Date</p><p className="font-medium text-gray-900 dark:text-white">{new Date(booking.date).toLocaleDateString()}</p></div>
                  <div><p className="text-gray-500 dark:text-gray-400 text-xs">Time</p><p className="font-medium text-gray-900 dark:text-white">{booking.time}</p></div>
                  <div><p className="text-gray-500 dark:text-gray-400 text-xs">Service</p><p className="text-xs text-gray-700 dark:text-gray-300">{booking.serviceName}</p></div>
                  <div><p className="text-gray-500 dark:text-gray-400 text-xs">Booked On</p><p className="text-xs text-gray-700 dark:text-gray-300">{new Date(booking.createdAt).toLocaleDateString()}</p></div>
                </div>
                {booking.notes && <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded"><span className="text-xs text-gray-400 dark:text-gray-500">Notes:</span> {booking.notes}</div>}
                <div className="mt-3 flex flex-wrap justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => { setSelectedBooking(booking); setShowDetails(true); }} className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Eye className="w-3 h-3 inline mr-1" />Details</button>
                  {canManage && booking.status === 'pending' && <button onClick={() => updateStatus(booking._id, 'confirmed')} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"><CheckCircle className="w-3 h-3 inline mr-1" />Confirm</button>}
                  {canManage && (booking.status === 'pending' || booking.status === 'confirmed') && <button onClick={() => updateStatus(booking._id, 'completed')} className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"><CheckCircle className="w-3 h-3 inline mr-1" />Complete</button>}
                  {canManage && booking.status === 'pending' && <button onClick={() => updateStatus(booking._id, 'cancelled')} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><XCircle className="w-3 h-3 inline mr-1" />Cancel</button>}
                  {canManage && <button onClick={() => deleteBooking(booking._id)} className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"><Trash2 className="w-3 h-3 inline mr-1" />Delete</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Booking Details</h3>
              <button onClick={() => setShowDetails(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Close"><XCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div><label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</label><p className="font-medium text-gray-900 dark:text-white mt-1">{selectedBooking.customerName}</p></div>
              <div><label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label><p className="text-gray-700 dark:text-gray-300 mt-1">{selectedBooking.customerEmail}</p></div>
              <div><label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</label><p className="text-gray-700 dark:text-gray-300 mt-1">{selectedBooking.customerPhone || 'N/A'}</p></div>
              <div><label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</label><p className="text-gray-700 dark:text-gray-300 mt-1">{selectedBooking.serviceName}</p></div>
              <div><label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</label><p className="text-gray-700 dark:text-gray-300 mt-1">{new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}</p></div>
              <div><label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Promo Code</label><p className="font-mono text-gray-700 dark:text-gray-300 mt-1">{selectedBooking.promoCode}</p></div>
              <div><label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label><div className="mt-1">{getStatusBadge(selectedBooking.status)}</div></div>
              <div><label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer Notes</label><p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{selectedBooking.notes || 'No notes'}</p></div>
              <div><label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Notes</label><p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded mt-1">{selectedBooking.adminNotes || 'No admin notes'}</p></div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
              <button onClick={() => setShowDetails(false)} className="w-full px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PromotionBookings;