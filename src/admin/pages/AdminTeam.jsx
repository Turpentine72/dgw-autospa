import React, { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Eye, EyeOff, X, Loader2, Upload } from 'lucide-react';
import SEO from '../../components/SEO';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const COMMON_POSITIONS = [
  'Manager', 'Supervisor', 'Director', 'Secretary', 'CEO',
  'Technician', 'Detailer', 'Customer Service Representative', 'Accountant',
];

const EMPTY_FORM = {
  name: '', position: '', customPosition: '', bio: '', phone: '', email: '',
  isVisible: true, order: 0,
  instagram: '', facebook: '', twitter: '', linkedin: '',
};

const AdminTeam = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const token = () => localStorage.getItem('adminToken');

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/team/admin/all`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) setTeam(data.data);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeam(); }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingId(member._id);
    const isCommon = COMMON_POSITIONS.includes(member.position);
    setForm({
      name: member.name,
      position: isCommon ? member.position : 'Custom...',
      customPosition: isCommon ? '' : member.position,
      bio: member.bio || '',
      phone: member.phone || '',
      email: member.email || '',
      isVisible: member.isVisible,
      order: member.order || 0,
      instagram: member.socialLinks?.instagram || '',
      facebook: member.socialLinks?.facebook || '',
      twitter: member.socialLinks?.twitter || '',
      linkedin: member.socialLinks?.linkedin || '',
    });
    setImageFile(null);
    setImagePreview(member.image || null);
    setError('');
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const finalPosition = form.position === 'Custom...' ? form.customPosition.trim() : form.position;

    if (!form.name.trim() || !finalPosition) {
      setError('Name and position are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('position', finalPosition);
      fd.append('bio', form.bio);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('isVisible', form.isVisible);
      fd.append('order', form.order);
      fd.append('instagram', form.instagram);
      fd.append('facebook', form.facebook);
      fd.append('twitter', form.twitter);
      fd.append('linkedin', form.linkedin);
      if (imageFile) fd.append('image', imageFile);

      const url = editingId ? `${API_BASE_URL}/api/team/${editingId}` : `${API_BASE_URL}/api/team`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchTeam();
      } else {
        setError(data.message || 'Failed to save team member.');
      }
    } catch (err) {
      setError('Failed to save team member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this team member? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/team/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) fetchTeam();
    } catch (err) {
      console.error('Failed to delete team member:', err);
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/team/${id}/visibility`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) fetchTeam();
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  return (
    <div>
      <SEO title="Team Management" noIndex={true} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Team Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Add, edit, and manage your team members.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Team Member
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : team.length === 0 ? (
        <div className="text-center py-24 text-gray-400">No team members yet. Click "Add Team Member" to get started.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(member => (
            <div key={member._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Users className="w-6 h-6" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{member.position}</p>
                  {!member.isVisible && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">Hidden</span>
                  )}
                </div>
              </div>
              {member.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">{member.bio}</p>}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => openEditModal(member)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleToggleVisibility(member._id)} className="inline-flex items-center justify-center p-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={member.isVisible ? 'Hide from public site' : 'Show on public site'}>
                  {member.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => handleDelete(member._id)} className="inline-flex items-center justify-center p-2 text-sm bg-red-50 dark:bg-red-950/30 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-5 space-y-4">
              {error && <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 text-sm rounded-lg">{error}</div>}

              {/* Image */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                  {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Users className="w-8 h-8" /></div>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm">
                  <Upload className="w-4 h-4" /> Upload Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Position / Role *</label>
                <select value={form.position} onChange={(e) => setForm(f => ({ ...f, position: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a position...</option>
                  {COMMON_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  <option value="Custom...">Custom...</option>
                </select>
                {form.position === 'Custom...' && (
                  <input
                    type="text"
                    value={form.customPosition}
                    onChange={(e) => setForm(f => ({ ...f, customPosition: e.target.value }))}
                    placeholder="Enter custom job title"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Biography / Description</label>
                <textarea value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone (optional)</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email (optional)</label>
                  <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Instagram</label>
                  <input type="url" value={form.instagram} onChange={(e) => setForm(f => ({ ...f, instagram: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">LinkedIn</label>
                  <input type="url" value={form.linkedin} onChange={(e) => setForm(f => ({ ...f, linkedin: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm(f => ({ ...f, isVisible: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show on public website</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-800">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} {editingId ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
