import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar, Search, Clock, CheckCircle, XCircle, RotateCcw,
  Inbox, Eye, Trash2, Phone, Mail, DollarSign, MessageSquare
} from 'lucide-react';
import SEO from '../../components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const StatusBadge = memo(function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    contacted: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    confirmed: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
    </span>
  );
});

const UpdateStatusModal = memo(function UpdateStatusModal({ booking, onClose, onUpdate }) {
  const [status, setStatus] = useState(booking?.status || 'pending');
  const [quotedPrice, setQuotedPrice] = useState(booking?.quotedPrice || '');
  const [adminNotes, setAdminNotes] = useState(booking?.adminNotes || '');
  const [loading, setLoading] = useState(false);

  if (!booking) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onUpdate(booking._id, status, quotedPrice, adminNotes);
      onClose();
    } catch (error) {
      console.error('Error updating:', error);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md m-4">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 id="update-booking-title" className="text-lg font-semibold text-gray-900 dark:text-white">Update Booking</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{booking.customerName} - {booking.serviceName}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select id="status-select" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <option value="pending">Pending - Awaiting action</option>
              <option value="contacted">Contacted - Reached out with pricing</option>
              <option value="confirmed">Confirmed - Customer agreed</option>
              <option value="completed">Completed - Service done</option>
              <option value="cancelled">Cancelled - Booking cancelled</option>
            </select>
          </div>
          <div>
            <label htmlFor="quoted-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quoted Price (₦)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input id="quoted-price" type="number" value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} placeholder="Enter agreed price" className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Notes (Internal)</label>
            <textarea id="admin-notes" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} placeholder="Internal notes about this booking..." className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50" aria-label="Update booking">
            {loading ? 'Updating...' : 'Update Booking'}
          </button>
        </div>
      </div>
    </div>
  );
});

const BookingDetailsModal = memo(function BookingDetailsModal({ booking, onClose, onUpdateStatus, onDeleteBooking, canDelete }) {
  if (!booking) return null;
  const getPrice = () => {
    if (booking.quotedPrice) return `₦${booking.quotedPrice.toLocaleString()}`;
    if (booking.servicePrice && booking.servicePrice > 0) return `₦${booking.servicePrice.toLocaleString()}`;
    return 'Not quoted yet';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Booking Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Close details">
              <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer Name</label>
              <p className="text-gray-900 dark:text-white font-medium mt-1">{booking.customerName}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</label>
              <div className="mt-1"><StatusBadge status={booking.status} /></div>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label>
            <div className="flex items-center gap-2 mt-1"><Mail className="w-4 h-4 text-gray-400 dark:text-gray-500" /><p className="text-gray-900 dark:text-white">{booking.customerEmail}</p></div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</label>
            <div className="flex items-center gap-2 mt-1"><Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" /><p className="text-gray-900 dark:text-white">{booking.customerPhone || 'Not provided'}</p></div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</label>
            <p className="text-gray-900 dark:text-white font-medium mt-1">{booking.serviceName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</label>
              <p className="text-gray-900 dark:text-white mt-1">{new Date(booking.date).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</label>
              <p className="text-gray-900 dark:text-white mt-1">{booking.time}</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</label>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{getPrice()}</p>
          </div>
          {booking.notes && (
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer Notes</label>
              <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mt-1">{booking.notes}</p>
            </div>
          )}
          {booking.adminNotes && (
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Notes</label>
              <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mt-1">{booking.adminNotes}</p>
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-3">
            <button onClick={() => onUpdateStatus(booking)} className="flex-1 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors">
              <MessageSquare className="w-4 h-4 inline mr-2" />Update Status
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Close</button>
            {canDelete && (
              <button onClick={() => { if (confirm('Delete this booking?')) { onDeleteBooking(booking._id); onClose(); } }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" aria-label="Delete booking">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function Bookings() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingBooking, setUpdatingBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const abortRef = useRef(null);

  // New state for service category filter
  const [serviceFilter, setServiceFilter] = useState('all');
  const [serviceCategories, setServiceCategories] = useState([]);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      try { const parsedAdmin = JSON.parse(storedAdmin); setUserRole(parsedAdmin.role); } catch (error) { console.error('Error parsing admin data:', error); }
    }
  }, []);

  const canDelete = userRole === 'Super Admin';

  const loadBookings = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/bookings`, { headers: { 'Authorization': `Bearer ${token}` }, signal: controller.signal });
      const data = await response.json();
      if (data.success) {
        const bookingsData = data.data;
        setBookings(bookingsData);
        // Extract unique service names for filter buttons
        const uniqueServices = [...new Set(bookingsData.map(b => b.serviceName))];
        setServiceCategories(['all', ...uniqueServices.sort()]);
      }
    } catch (error) { if (error.name !== 'AbortError') console.error('Error fetching bookings:', error); }
    finally { setLoading(false); }
  }, []);

  const updateBookingStatus = async (id, status, quotedPrice, adminNotes) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status, quotedPrice, adminNotes })
      });
      const data = await response.json();
      if (data.success) loadBookings();
      else alert('Failed to update status: ' + data.message);
    } catch (error) { console.error('Error updating booking:', error); alert('Failed to update booking status'); }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) { loadBookings(); if (selectedBooking?._id === bookingId) setSelectedBooking(null); }
      else alert('Failed to delete booking: ' + data.message);
    } catch (error) { console.error('Error deleting booking:', error); alert('Failed to delete booking'); }
  };

  useEffect(() => { loadBookings(); return () => abortRef.current?.abort(); }, [loadBookings]);

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    contacted: bookings.filter(b => b.status === 'contacted').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = activeFilter === 'all' || booking.status === activeFilter;
    const matchesSearch = searchQuery === '' || 
      booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      booking.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      booking.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesService = serviceFilter === 'all' || booking.serviceName === serviceFilter;
    return matchesFilter && matchesSearch && matchesService;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Bookings Management" description="Manage customer service appointments and bookings" noIndex={true} />
      <div className="p-6">
        {updatingBooking && <UpdateStatusModal booking={updatingBooking} onClose={() => setUpdatingBooking(null)} onUpdate={updateBookingStatus} />}
        {selectedBooking && <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onUpdateStatus={setUpdatingBooking} onDeleteBooking={handleDeleteBooking} canDelete={canDelete} />}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage customer service appointments</p>
        </div>

        {/* Status filter buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['all', 'pending', 'contacted', 'confirmed', 'completed', 'cancelled'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-gray-800 dark:bg-gray-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)} ({counts[filter]})
            </button>
          ))}
        </div>

        {/* Service category filter buttons (NEW round stuff) */}
        {serviceCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {serviceCategories.map(service => (
              <button
                key={service}
                onClick={() => setServiceFilter(service)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  serviceFilter === service
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                }`}
              >
                {service === 'all' ? 'All Services' : service}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={loadBookings}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Inbox className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No bookings yet</h3>
            <p className="text-gray-500 dark:text-gray-400">When customers request services, they'll appear here.</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400">No bookings matching your criteria were found.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredBookings.map(booking => (
                    <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                        <p className="font-medium text-gray-900 dark:text-white">{booking.customerName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{booking.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{booking.serviceName}</span>
                      </td>
                      <td className="px-4 py-3 cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(booking.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{booking.time}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={booking.status} /></td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {booking.quotedPrice ? `₦${booking.quotedPrice.toLocaleString()}` : 'Not quoted'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="View"
                            aria-label="View booking"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setUpdatingBooking(booking)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Update"
                            aria-label="Update booking"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteBooking(booking._id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                              aria-label="Delete booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Bookings;