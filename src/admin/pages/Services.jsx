import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Search, Edit3, Trash2, X, Car, RotateCcw, Camera, Star } from 'lucide-react';
import SEO from '/src/components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// ---------- Helper: just returns the image URL as-is (backend already gives full Cloudinary URL) ----------
const imageUrl = (img) => img || null;

// ---------- Add Service Modal ----------
const AddServiceModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ name: '', description: '', category: 'Maintenance' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);   // ← new
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const categories = ['Diagnostics', 'Wheel Services', 'Tyre Services', 'Maintenance', 'Brake Services', 'Other Services'];

  useEffect(() => { return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); }; }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return; }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImageFile(file);
    setImagePreview(objectUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
  };

  const handleClose = () => { handleRemoveImage(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) { alert('Please fill in name and description'); return; }
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('category', formData.category);
    fd.append('isFeatured', isFeatured);          // ← send as string
    if (imageFile) fd.append('image', imageFile);
    try {
      const res = await fetch(`${API_BASE_URL}/api/services`, { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}` }, 
        body: fd 
      });
      const data = await res.json();
      if (data.success) { 
        onAdd(data.data); 
        handleClose(); 
        setFormData({ name: '', description: '', category: 'Maintenance' }); 
        setIsFeatured(false);
      }
      else alert(data.message || 'Failed to add service');
    } catch (err) { console.error(err); alert('Failed to add service'); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b flex justify-between items-center z-10">
          <div><h2 className="text-xl font-semibold">Add New Service</h2><p className="text-sm text-gray-500">Add a service to your offerings</p></div>
          <button onClick={handleClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Service Image</label>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" id="add-image" />
            {imagePreview ? (
              <div className="relative"><img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" /><button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button></div>
            ) : (
              <label htmlFor="add-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer"><Camera className="w-6 h-6 text-gray-400" /><span className="text-sm mt-1">Click to upload</span></label>
            )}
          </div>
          <div><label className="block text-sm font-medium mb-2">Service Name *</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Description *</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} required className="w-full px-4 py-2 border rounded-lg resize-none" /></div>
          <div><label className="block text-sm font-medium mb-2">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">{categories.map(c=><option key={c}>{c}</option>)}</select></div>
          
          {/* ✅ Featured Service Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Featured Service
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t"><button type="button" onClick={handleClose} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button><button type="submit" disabled={loading} className="flex-1 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50">{loading?'Adding...':'Add Service'}</button></div>
        </form>
      </div>
    </div>
  );
};

// ---------- Edit Service Modal ----------
const EditServiceModal = ({ isOpen, onClose, onUpdate, service }) => {
  const [formData, setFormData] = useState({ name: '', description: '', category: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);   // ← new
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);
  const categories = ['Diagnostics', 'Wheel Services', 'Tyre Services', 'Maintenance', 'Brake Services', 'Other Services'];

  useEffect(() => {
    if (service) {
      setFormData({ name: service.name||'', description: service.description||'', category: service.category||'Maintenance' });
      setImagePreview(imageUrl(service.image));
      setIsFeatured(service.isFeatured || false);   // ← set from service
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); };
  }, [service]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be less than 5MB'); return; }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setImageFile(file);
    setImagePreview(objectUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
  };

  const handleClose = () => { handleRemoveImage(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('category', formData.category);
    fd.append('isFeatured', isFeatured);            // ← send
    if (imageFile) fd.append('image', imageFile);
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/${service._id}`, { 
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${token}` }, 
        body: fd 
      });
      const data = await res.json();
      if (data.success) { 
        onUpdate(service._id, data.data); 
        handleClose(); 
      }
      else alert(data.message || 'Failed to update service');
    } catch (err) { console.error(err); alert('Failed to update service'); }
    finally { setLoading(false); }
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b flex justify-between items-center z-10">
          <div><h2 className="text-xl font-semibold">Edit Service</h2><p className="text-sm text-gray-500">Update service information</p></div>
          <button onClick={handleClose}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Service Image</label>
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" id="edit-image" />
            {imagePreview ? (
              <div className="relative"><img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" /><button type="button" onClick={handleRemoveImage} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button></div>
            ) : (
              <label htmlFor="edit-image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer"><Camera className="w-6 h-6 text-gray-400" /><span className="text-sm mt-1">Click to upload new image</span></label>
            )}
          </div>
          <div><label className="block text-sm font-medium mb-2">Service Name *</label><input type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required className="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-2">Description *</label><textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} rows={3} required className="w-full px-4 py-2 border rounded-lg resize-none" /></div>
          <div><label className="block text-sm font-medium mb-2">Category</label><select value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})} className="w-full px-4 py-2 border rounded-lg">{categories.map(c=><option key={c}>{c}</option>)}</select></div>
          
          {/* ✅ Featured Service Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Featured Service
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t"><button type="button" onClick={handleClose} className="flex-1 py-2 bg-gray-800 rounded-lg">Cancel</button><button type="submit" disabled={loading} className="flex-1 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50">{loading?'Updating...':'Update Service'}</button></div>
        </form>
      </div>
    </div>
  );
};

// ---------- Main Admin Services Page ----------
function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const abortRef = useRef(null);
  const knownCategories = ['Diagnostics', 'Wheel Services', 'Tyre Services', 'Maintenance', 'Brake Services', 'Other Services'];

  const fetchServices = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/services/admin/all`, { 
        headers: { 'Authorization': `Bearer ${token}` }, 
        signal: controller.signal 
      });
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (err) { if (err.name !== 'AbortError') console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchServices(); return () => abortRef.current?.abort(); }, [fetchServices]);

  const handleAdd = (newService) => {
    setServices(prev => [newService, ...prev]);
  };

  const handleUpdate = (id, updatedService) => {
    setServices(prev => prev.map(s => s._id === id ? updatedService : s));
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this service?')) {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/services/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await res.json();
      if (data.success) setServices(prev => prev.filter(s => s._id !== id));
      else alert(data.message || 'Failed');
    }
  };

  const filtered = services.filter(s => {
    const m = s.name?.toLowerCase().includes(search.toLowerCase()) || s.description?.toLowerCase().includes(search.toLowerCase());
    if (catFilter === 'all') return m;
    if (catFilter === 'Other Services') return m && !knownCategories.slice(0,5).includes(s.category);
    return m && s.category === catFilter;
  });

  const catColor = (cat) => ({
    'Diagnostics':'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    'Wheel Services':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    'Tyre Services':'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    'Maintenance':'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    'Brake Services':'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    'Other Services':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  })[cat] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';

  if (loading) return <div className="flex justify-center h-64"><div className="animate-spin h-12 w-12 border-b-2 border-gray-700 rounded-full" /></div>;

  return (
    <>
      <SEO title="Services Management" noIndex />
      <div className="p-6">
        <AddServiceModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
        <EditServiceModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelected(null); }} onUpdate={handleUpdate} service={selected} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{services.length} service{services.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchServices} title="Refresh" className="p-2 bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"><RotateCcw className="w-4 h-4" /></button>
            <button onClick={() => setIsAddOpen(true)} className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg flex items-center gap-2 hover:bg-gray-900 dark:hover:bg-gray-600"><Plus className="w-4 h-4" /> Add Service</button>
          </div>
        </div>

        {/* Round category filter buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          {['all', ...knownCategories].map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${catFilter === cat ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'bg-blue-800/30 text-blue-200 hover:bg-blue-700/50 border border-blue-500/30'}`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input type="text" placeholder="Search services..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border">
            <Car className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No services found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(s => (
              <div key={s._id} className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden hover:shadow-lg transition group relative">
                {/* Featured Badge */}
                {s.isFeatured && (
                  <div className="absolute top-3 right-3 z-10 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-current" /> Featured
                  </div>
                )}
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {s.image ? (
                    <img src={s.image} alt={s.name} className="w-full h-full object-cover" onError={(e)=>{ e.target.style.display='none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600"><Car className="w-12 h-12" /><span className="sr-only">No image</span></div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white pr-8">{s.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${catColor(s.category)}`}>{s.category}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{s.description}</p>
                  <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => { setSelected(s); setIsEditOpen(true); }} className="flex-1 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700"><Edit3 className="w-3 h-3" /> Edit</button>
                    <button onClick={() => handleDelete(s._id)} className="flex-1 py-1.5 text-sm bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center gap-1 hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Services;