import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Trash2, X, RotateCcw, Gift } from 'lucide-react';
import SEO from '../../components/SEO';

// Uses the Vite env variable in every environment. Set VITE_API_URL in your
// hosting provider's env vars when you deploy — there's no hardcoded
// fallback to a specific backend host, so this works no matter where it's
// redeployed.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const PromoCodeModal = ({ isOpen, onClose, onSave, editingCode }) => {
  const [form, setForm] = useState({ code: '', description: '', isActive: true, validUntil: '', maxUses: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCode) {
      setForm({
        code: editingCode.code || '',
        description: editingCode.description || '',
        isActive: editingCode.isActive !== undefined ? editingCode.isActive : true,
        validUntil: editingCode.validUntil ? editingCode.validUntil.slice(0, 10) : '',
        maxUses: editingCode.maxUses || 0,
      });
    } else {
      setForm({ code: '', description: '', isActive: true, validUntil: '', maxUses: 0 });
    }
  }, [editingCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const url = editingCode ? `${API_BASE_URL}/api/promo-codes/${editingCode._id}` : `${API_BASE_URL}/api/promo-codes`;
    const method = editingCode ? 'PUT' : 'POST';
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        onSave();
        onClose();
      } else {
        alert(data.message || 'Error saving promo code');
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{editingCode ? 'Edit Promo Code' : 'New Promo Code'}</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Code *</label>
            <input type="text" value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full p-2 border rounded" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} /> Active
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valid Until (optional)</label>
            <input type="date" value={form.validUntil} onChange={(e) => setForm({...form, validUntil: e.target.value})} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Uses (0 = unlimited)</label>
            <input type="number" value={form.maxUses} onChange={(e) => setForm({...form, maxUses: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-gray-800 text-white rounded">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

function AdminPromoCodes() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE_URL}/api/promo-codes`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setCodes(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this promo code?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`${API_BASE_URL}/api/promo-codes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchCodes();
  };

  return (
    <>
      <SEO title="Manage Promo Codes" />
      <div className="p-6">
        <PromoCodeModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingCode(null); }} onSave={fetchCodes} editingCode={editingCode} />
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Promo Codes</h2>
            <p className="text-sm text-gray-500">Manage promotional codes for bookings</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchCodes} className="p-2 border rounded" title="Refresh"><RotateCcw className="w-4 h-4" /></button>
            <button onClick={() => { setEditingCode(null); setModalOpen(true); }} className="px-4 py-2 bg-gray-800 text-white rounded flex items-center gap-2"><Plus className="w-4 h-4" /> Add Code</button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No promo codes yet.</div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 text-left">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">Used / Max</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(code => (
                  <tr key={code._id} className="border-t border-gray-200 dark:border-gray-800">
                    <td className="p-3 font-mono font-bold">{code.code}</td>
                    <td className="p-3 text-sm">{code.description || '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${code.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {code.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{code.usedCount} / {code.maxUses || '∞'}</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => { setEditingCode(code); setModalOpen(true); }} className="p-1 text-gray-600 hover:bg-gray-100 rounded"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(code._id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default AdminPromoCodes;