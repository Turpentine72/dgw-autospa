import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, Plus, Search, Trash2, Edit3, X, Check, ShieldCheck, Mail, Phone, Save, User, RotateCcw, Eye, EyeOff } from 'lucide-react';
import SEO from '../../components/SEO';
import { getDisplayPermissions } from '../utils/permissions';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const AddEditAdminModal = ({ isOpen, onClose, onAdd, onUpdate, editingUser, hasSuperAdmin }) => {
  const [formData, setFormData] = useState({
    name: editingUser?.name || '',
    email: editingUser?.email || '',
    phone: editingUser?.phone || '',
    password: '',
    role: editingUser?.role || 'Staff'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  let availableRoles = ['Manager', 'Staff'];
  if (!hasSuperAdmin || (editingUser && editingUser.role === 'Super Admin')) {
    availableRoles = ['Super Admin', 'Manager', 'Staff'];
  }

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || '',
        email: editingUser.email || '',
        phone: editingUser.phone || '',
        password: '',
        role: editingUser.role || 'Staff'
      });
    } else {
      setFormData({ name: '', email: '', phone: '', password: '', role: 'Staff' });
    }
  }, [editingUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!formData.name || !formData.email) { setError('Please fill in Name and Email'); setLoading(false); return; }
    if (!editingUser && !formData.password) { setError('Please enter a password'); setLoading(false); return; }
    if (formData.password && formData.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) { setError('Please enter a valid email'); setLoading(false); return; }
    if (!editingUser && formData.role === 'Super Admin' && hasSuperAdmin) { setError('A Super Admin already exists.'); setLoading(false); return; }

    const token = localStorage.getItem('adminToken');
    const dataToSend = { name: formData.name, email: formData.email, phone: formData.phone || '', role: formData.role };
    if (formData.password) dataToSend.password = formData.password;

    try {
      let url = `${API_BASE_URL}/api/admins`;
      let method = 'POST';
      if (editingUser) {
        url = `${API_BASE_URL}/api/admins/${editingUser._id}`;
        method = 'PUT';
      }
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(dataToSend) });
      const data = await response.json();
      if (data.success) {
        if (editingUser) onUpdate(editingUser._id, data.data);
        else onAdd(data.data);
        onClose();
      } else { setError(data.message || 'Failed to save user'); }
    } catch (err) { console.error('Error:', err); setError('Server error. Please try again.'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{editingUser ? 'Edit User' : 'Add Admin User'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{editingUser ? 'Update user information.' : 'Create a new admin account.'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Close"><X className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
        </div>
        {error && <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Enter full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address <span className="text-red-500">*</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="admin@yourbusiness.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Enter your phone number" />
            </div>
          </div>
          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10" placeholder="Your password here" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 6 characters</p>
            </div>
          )}
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{availableRoles.map(role => <option key={role} value={role}>{role}</option>)}</select></div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">{loading ? 'Saving...' : (editingUser ? 'Save Changes' : 'Add Admin')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PermissionsModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;
  const userPermissions = getDisplayPermissions(user.role);
  const allPermissions = [
    'View Bookings', 'Manage Bookings', 'Manage Services', 'Manage Customers', 'Manage Admins',
    'View Reports', 'Manage Settings', 'Manage Gallery', 'Manage Reviews', 'Manage Team', 'Manage Promotion Bookings'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Permissions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access permissions for {user.name} ({user.role})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Close"><X className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-sm font-medium text-gray-700 dark:text-gray-300 py-3 px-4">Permission</th>
                  <th className="text-right text-sm font-medium text-gray-700 dark:text-gray-300 py-3 px-4">Access</th>
                </tr>
              </thead>
              <tbody>
                {allPermissions.map((permission, index) => {
                  const hasAccess = userPermissions[permission] || false;
                  return (
                    <tr key={permission} className={`${index !== allPermissions.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-300">{permission}</td>
                      <td className="py-3 px-4 text-right">
                        {hasAccess ? (
                          <span className="text-green-600 dark:text-green-400 inline-flex items-center gap-1"><Check className="w-4 h-4" /> Yes</span>
                        ) : (
                          <span className="text-red-500 dark:text-red-400 inline-flex items-center gap-1"><X className="w-4 h-4" /> No</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-800">
          <button onClick={onClose} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

function AdminUsers() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const abortRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admins`, { headers: { 'Authorization': `Bearer ${token}` }, signal: controller.signal });
      const data = await response.json();
      if (data.success) setUsers(data.data);
    } catch (err) { if (err.name !== 'AbortError') console.error('Error fetching users:', err); }
    finally { setLoading(false); }
  }, []);

  const fetchCurrentAdmin = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setCurrentAdmin(data.data);
    } catch (err) { console.error('Error fetching current admin:', err); }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) window.location.href = '/admin/login';
    fetchUsers();
    fetchCurrentAdmin();
    return () => abortRef.current?.abort();
  }, [fetchUsers, fetchCurrentAdmin]);

  const handleAddUser = () => fetchUsers();
  const handleUpdateUser = () => fetchUsers();

  const handleDeleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/api/admins/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        const data = await response.json();
        if (data.success) fetchUsers();
        else alert(data.message || 'Failed to delete user');
      } catch (err) { console.error('Error deleting user:', err); alert('Failed to delete user'); }
    }
  };

  const handleLoginAs = async (userId) => {
    if (!confirm('You will be logged in as this user. Continue?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/admins/login-as/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.user));
        window.location.href = '/admin/dashboard';
      } else {
        alert(data.message || 'Failed to login as user');
      }
    } catch (err) {
      console.error('Login as failed:', err);
      alert('Network error');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSuperAdmin = currentAdmin?.role === 'Super Admin';
  const hasSuperAdmin = users.some(u => u.role === 'Super Admin');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Admin Users Management" description="Manage DGW Autospa admin users and their permissions" noIndex={true} />
      <div className="p-6">
        <AddEditAdminModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddUser} editingUser={null} hasSuperAdmin={hasSuperAdmin} />
        <AddEditAdminModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedUser(null); }} onUpdate={handleUpdateUser} editingUser={selectedUser} hasSuperAdmin={hasSuperAdmin} />
        <PermissionsModal isOpen={isPermissionsModalOpen} onClose={() => { setIsPermissionsModalOpen(false); setSelectedUser(null); }} user={selectedUser} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Users</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{users.length} admin user{users.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchUsers} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Refresh"><RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
            {isSuperAdmin && (
              <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" /> Add Admin</button>
            )}
          </div>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search by name, email, or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Shield className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No admin users yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Add administrators to help manage the system.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400">No users matching "{searchQuery}" were found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => {
              const roleColors = {
                'Super Admin': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                'Manager': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                'Staff': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              };
              const isCurrentUser = currentAdmin?._id === user._id;
              const canDelete = isSuperAdmin && !isCurrentUser && user.role !== 'Super Admin';
              const canLoginAs = isSuperAdmin && !isCurrentUser && user.role !== 'Super Admin';

              return (
                <div key={user._id} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{user.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>{user.role}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {(isSuperAdmin || isCurrentUser) && (
                        <>
                          <button onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label={`Edit ${user.name}`}><Edit3 className="w-4 h-4 text-gray-600 dark:text-gray-400" /></button>
                          {canDelete && (
                            <button onClick={() => handleDeleteUser(user._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" aria-label={`Delete ${user.name}`}><Trash2 className="w-4 h-4 text-red-500" /></button>
                          )}
                        </>
                      )}
                      {canLoginAs && (
                        <button onClick={() => handleLoginAs(user._id)} className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">Login As</button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Mail className="w-4 h-4" /><span className="truncate">{user.email}</span></div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Phone className="w-4 h-4" /><span>{user.phone}</span></div>
                    )}
                  </div>
                  <button onClick={() => { setSelectedUser(user); setIsPermissionsModalOpen(true); }} className="w-full py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" /> View Permissions</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminUsers;