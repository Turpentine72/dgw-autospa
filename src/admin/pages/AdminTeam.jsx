import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Plus, Search, Edit3, Trash2, X, Mail, Phone, User, Camera, RotateCcw } from 'lucide-react';
import SEO from '../../components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const TeamMemberModal = ({ isOpen, onClose, onSave, editingMember }) => {
  const [formData, setFormData] = useState({
    name: '', role: '', description: '', email: '', phone: '', image: null, order: 1
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  const roles = [
    "Lead Mechanic", "Service Manager", "Wheel Specialist", "Diagnostic Expert",
    "Customer Care", "Detailer", "Body Repair Specialist", "Electrical Specialist"
  ];

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (editingMember) {
      setFormData({
        name: editingMember.name || '',
        role: editingMember.role || '',
        description: editingMember.description || '',
        email: editingMember.email || '',
        phone: editingMember.phone || '',
        image: null,
        order: editingMember.order || 1
      });
      setPreviewUrl(editingMember.image || null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    } else {
      setFormData({ name: '', role: '', description: '', email: '', phone: '', image: null, order: 1 });
      setPreviewUrl(null);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }
  }, [editingMember]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!formData.name || !formData.role) {
      setError('Please fill in Name and Role');
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('adminToken');
    try {
      let url = `${API_BASE_URL}/api/team`;
      let method = 'POST';
      if (editingMember) {
        url = `${API_BASE_URL}/api/team/${editingMember._id}`;
        method = 'PUT';
      }
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('email', formData.email || '');
      formDataToSend.append('phone', formData.phone || '');
      formDataToSend.append('order', formData.order || 1);
      if (formData.image) formDataToSend.append('image', formData.image);

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend,
      });
      const data = await response.json();
      if (data.success) {
        onSave(data.data);
        onClose();
      } else {
        setError(data.message || `Failed to ${editingMember ? 'update' : 'create'} team member`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {editingMember ? 'Update team member information.' : 'Add a new team member to your staff.'}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                {previewUrl ? (
                  <img src={previewUrl} alt="Team member preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1.5 bg-gray-700 dark:bg-gray-600 rounded-full cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors" aria-label="Upload photo">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Enter full name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <option value="">Select a role</option>
              {roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" placeholder="Brief description of the team member's expertise..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Enter your email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Order</label>
            <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })} min="1" max="20" className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lower numbers appear first</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : (editingMember ? 'Update' : 'Add Team Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function AdminTeam() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      try { const parsedAdmin = JSON.parse(storedAdmin); setUserRole(parsedAdmin.role); } catch (error) { console.error('Error parsing admin data:', error); }
    }
  }, []);

  const canEdit = userRole === 'Super Admin';

  const fetchTeamMembers = useCallback(async () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/team/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal
      });
      const data = await response.json();
      if (data.success) {
        const sorted = (data.data || []).sort((a, b) => (a.order || 999) - (b.order || 999));
        setTeamMembers(sorted);
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Error fetching team members:', err);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
    return () => { abortControllerRef.current?.abort(); };
  }, [fetchTeamMembers]);

  const handleSave = () => { fetchTeamMembers(); setIsModalOpen(false); setEditingMember(null); };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchTeamMembers();
      } else {
        alert(data.message || 'Failed to delete team member');
      }
    } catch (err) { console.error('Error deleting team member:', err); alert('Failed to delete team member'); }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Team Management" description="Manage your DGW Autospa team members" noIndex={true} />
      <div className="p-6">
        <TeamMemberModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingMember(null); }} onSave={handleSave} editingMember={editingMember} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {teamMembers.length} team member{teamMembers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchTeamMembers} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Refresh">
              <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {canEdit && (
              <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Team Member
              </button>
            )}
          </div>
        </div>

        {teamMembers.length > 0 && (
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input type="text" placeholder="Search by name or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
        )}

        {teamMembers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Users className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No team members yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Add team members to showcase your staff.</p>
            {canEdit && <button onClick={() => setIsModalOpen(true)} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">Add First Team Member</button>}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No members found</h3>
            <p className="text-gray-500 dark:text-gray-400">No members matching "{searchQuery}" were found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <div key={member._id} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200">
                <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 relative">
                  {member.image ? (
                    <img src={member.image} alt={`${member.name} - ${member.role}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Users className="w-12 h-12 text-white/50" /></div>
                  )}
                  {canEdit && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button onClick={() => { setEditingMember(member); setIsModalOpen(true); }} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`Edit ${member.name}`}>
                        <Edit3 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      <button onClick={() => handleDelete(member._id)} className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`Delete ${member.name}`}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{member.description || 'No description provided.'}</p>
                  {(member.email || member.phone) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
                      {member.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Mail className="w-3 h-3" /><span className="truncate">{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Phone className="w-3 h-3" /><span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminTeam;