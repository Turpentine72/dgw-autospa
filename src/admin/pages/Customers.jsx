import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Search, Mail, Phone, Car, X, RotateCcw, Inbox, Calendar, DollarSign } from 'lucide-react';
import SEO from '../../components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const CustomerDetailsModal = ({ customer, onClose }) => {
  if (!customer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customer Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-xl font-bold">{customer.name?.charAt(0) || '?'}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{customer.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer since {new Date(customer.firstBooking).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Email</p><p className="text-sm font-medium text-gray-900 dark:text-white break-all">{customer.email}</p></div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              <div><p className="text-xs text-gray-500 dark:text-gray-400">Phone</p><p className="text-sm font-medium text-gray-900 dark:text-white">{customer.phone || 'Not provided'}</p></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Car className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{customer.totalBookings}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
            </div>
            <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">₦{customer.totalSpent?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
            </div>
          </div>
          {customer.bookings && customer.bookings.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Booking History</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {customer.bookings.map((booking, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{booking.serviceName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      booking.status === 'confirmed' ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>{booking.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

function Customers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef(null);

  const loadCustomers = useCallback(async () => {
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
        const customerMap = new Map();
        // Only confirmed or completed bookings for meaningful customer data
        const confirmedOrCompleted = data.data.filter(booking => booking.status === 'confirmed' || booking.status === 'completed');
        confirmedOrCompleted.forEach(booking => {
          const email = booking.customerEmail;
          if (!customerMap.has(email)) {
            customerMap.set(email, {
              id: email,
              name: booking.customerName,
              email: booking.customerEmail,
              phone: booking.customerPhone || 'Not provided',
              firstBooking: booking.createdAt || booking.date,
              totalBookings: 1,
              totalSpent: booking.quotedPrice || booking.servicePrice || 0,
              bookings: [{ serviceName: booking.serviceName, date: booking.date, time: booking.time, status: booking.status, price: booking.quotedPrice || booking.servicePrice }]
            });
          } else {
            const existing = customerMap.get(email);
            existing.totalBookings++;
            existing.totalSpent += booking.quotedPrice || booking.servicePrice || 0;
            existing.bookings.push({ serviceName: booking.serviceName, date: booking.date, time: booking.time, status: booking.status, price: booking.quotedPrice || booking.servicePrice });
            if (new Date(booking.date) < new Date(existing.firstBooking)) existing.firstBooking = booking.date;
          }
        });
        const customersArray = Array.from(customerMap.values()).sort((a, b) => new Date(b.firstBooking) - new Date(a.firstBooking));
        setCustomers(customersArray);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching customers:', error);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCustomers(); return () => abortRef.current?.abort(); }, [loadCustomers]);

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Customer Management" description="Manage DGW Autospa customers and view their booking history" noIndex={true} />
      <div className="p-6">
        {selectedCustomer && <CustomerDetailsModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{customers.length} customer{customers.length !== 1 ? 's' : ''} with confirmed/completed bookings</p>
          </div>
          <button onClick={loadCustomers} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Refresh">
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search by name, email, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>
        {customers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Inbox className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No customers yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Customers will appear when bookings are confirmed or completed.</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400">No customers matching "{searchQuery}" were found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map(customer => (
              <div key={customer.id} onClick={() => setSelectedCustomer(customer)} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all cursor-pointer group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">{customer.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Since {new Date(customer.firstBooking).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" /><span className="truncate">{customer.email}</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" /><span>{customer.phone}</span></div>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"><Car className="w-4 h-4" /><span>{customer.totalBookings} booking{customer.totalBookings !== 1 ? 's' : ''}</span></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">₦{customer.totalSpent?.toLocaleString() || 0} spent</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Customers;