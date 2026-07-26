import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Plus, Search, X, Loader2, Trash2, Pencil, Phone, Mail,
  Clock, User, CheckCircle, XCircle, AlertCircle, ChevronDown, Tag
} from 'lucide-react';
import SEO from '../../components/SEO';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
};

const EMPTY_FORM = {
  customerName: '', customerEmail: '', customerPhone: '',
  service: '', date: '', time: '', notes: '', quotedPrice: '',
  status: 'confirmed',
};

const token = () => localStorage.getItem('adminToken');

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // ---------- Fetch ----------
  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || []);
      } else {
        setError(data.message || 'Failed to load bookings.');
      }
    } catch (err) {
      setError('Failed to load bookings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  // ---------- Filtering ----------
  const filteredBookings = useMemo(() => {
    return bookings
      .filter(b => statusFilter === 'all' || b.status === statusFilter)
      .filter(b => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          b.customerName?.toLowerCase().includes(q) ||
          b.customerEmail?.toLowerCase().includes(q) ||
          b.customerPhone?.toLowerCase().includes(q) ||
          b.service?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [bookings, search, statusFilter]);

  // ---------- Create / Edit modal ----------
  const openCreateModal = () => {
    setEditingBooking(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowCreateModal(true);
  };

  const openEditModal = (booking) => {
    setEditingBooking(booking);
    setForm({
      customerName: booking.customerName || '',
      customerEmail: booking.customerEmail || '',
      customerPhone: booking.customerPhone || '',
      service: booking.service || '',
      date: booking.date ? String(booking.date).slice(0, 10) : '',
      time: booking.time || '',
      notes: booking.notes || '',
      quotedPrice: booking.quotedPrice ?? '',
      status: booking.status || 'pending',
    });
    setFormError('');
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingBooking(null);
  };

  const handleSubmit = async () => {
    if (!form.customerName.trim() || !form.date || !form.time) {
      setFormError('Customer name, date, and time are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const isEdit = Boolean(editingBooking);
      const url = isEdit
        ? `${API_BASE_URL}/api/bookings/${editingBooking._id}`
        : `${API_BASE_URL}/api/bookings/admin`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          ...form,
          quotedPrice: form.quotedPrice === '' ? undefined : Number(form.quotedPrice),
        }),
      });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchBookings();
      } else {
        setFormError(data.message || 'Failed to save booking.');
      }
    } catch (err) {
      setFormError('Failed to save booking. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Status update (inline, from the list) ----------
  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdatingStatusId(bookingId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.map(b => (b._id === bookingId ? { ...b, status: newStatus } : b)));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ---------- Delete ----------
  const handleDelete = async (bookingId) => {
    if (!window.confirm('Delete this booking? This cannot be undone.')) return;
    setDeletingId(bookingId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
      }
    } catch (err) {
      console.error('Failed to delete booking:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <SEO title="Bookings" noIndex={true} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" /> Bookings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all bookings — submitted online or taken manually.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Booking
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or service..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : error ? (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your search/filter.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map(booking => (
            <div key={booking._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{booking.customerName}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>
                      {booking.status}
                    </span>
                    {booking.source === 'manual' && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
                        <Tag className="w-3 h-3" /> Manual
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    {booking.customerPhone && <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {booking.customerPhone}</span>}
                    {booking.customerEmail && <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {booking.customerEmail}</span>}
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {booking.date ? String(booking.date).slice(0, 10) : '—'}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {booking.time || '—'}</span>
                  </div>

                  {booking.service && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">Service: <span className="font-medium">{booking.service}</span></p>}
                  {booking.quotedPrice != null && booking.quotedPrice !== '' && <p className="text-sm text-gray-700 dark:text-gray-300">Quote: <span className="font-medium">₦{Number(booking.quotedPrice).toLocaleString()}</span></p>}
                  {booking.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Notes: {booking.notes}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      disabled={updatingStatusId === booking._id}
                      className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                  <button onClick={() => openEditModal(booking)} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(booking._id)}
                    disabled={deletingId === booking._id}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === booking._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> {editingBooking ? 'Edit Booking' : 'Create Booking Manually'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-4">
              {!editingBooking && (
                <p className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/30 px-3 py-2 rounded-lg">
                  For walk-ins, phone calls, or WhatsApp bookings you're taking down yourself.
                </p>
              )}

              {formError && <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 text-sm rounded-lg">{formError}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Customer Name *</label>
                <input type="text" value={form.customerName} onChange={(e) => setForm(f => ({ ...f, customerName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                  <input type="tel" value={form.customerPhone} onChange={(e) => setForm(f => ({ ...f, customerPhone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input type="email" value={form.customerEmail} onChange={(e) => setForm(f => ({ ...f, customerEmail: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Service</label>
                <input type="text" value={form.service} onChange={(e) => setForm(f => ({ ...f, service: e.target.value }))} placeholder="e.g. Full Detailing" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
                  <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Time *</label>
                  <input type="time" value={form.time} onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quoted Price</label>
                  <input type="number" value={form.quotedPrice} onChange={(e) => setForm(f => ({ ...f, quotedPrice: e.target.value }))} placeholder="₦" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-800">
              <button onClick={closeModal} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {editingBooking ? 'Save Changes' : 'Create Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
