import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Image, Plus, Trash2, X, Upload, Eye, RotateCcw } from 'lucide-react';
import SEO from '../../components/SEO';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const UploadImageModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    return () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('File size should be less than 5MB'); return; }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) { alert('Please select an image'); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title || 'Gallery Image');
    formData.append('image', selectedFile);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/gallery`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success) { onUpload(data.data); onClose(); resetForm(); }
      else alert(data.message || 'Failed to upload image');
    } catch (error) { console.error('Error uploading image:', error); alert('Failed to upload image'); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setSelectedFile(null); setPreviewUrl(null); setTitle('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
  };

  const handleClose = () => { onClose(); resetForm(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Image</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add photos to your gallery.</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Title (Optional)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Luxury Car Detailing" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image <span className="text-red-500">*</span></label>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" id="image-upload" />
            {!previewUrl ? (
              <label htmlFor="image-upload" className="w-full py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-gray-500 dark:hover:border-gray-500 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload image</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG, WebP up to 5MB</p>
              </label>
            ) : (
              <div className="relative">
                <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; } }} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" aria-label="Remove image">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
            <button type="submit" disabled={!selectedFile || loading} className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
              {loading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImageViewerModal = ({ image, isOpen, onClose }) => {
  if (!isOpen || !image) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="Close viewer">
        <X className="w-6 h-6 text-white" />
      </button>
      <div className="max-w-5xl w-full mx-4">
        <img src={image.image || '/placeholder.jpg'} alt={image.title || "Gallery image"} className="w-full h-auto max-h-[80vh] object-contain rounded-xl" onError={(e) => { e.target.src = '/placeholder.jpg'; }} />
        {image.title && <div className="text-center mt-4"><h3 className="text-lg font-semibold text-white">{image.title}</h3></div>}
      </div>
    </div>
  );
};

function Gallery() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) { try { const parsed = JSON.parse(storedAdmin); setUserRole(parsed.role); } catch (error) { console.error('Error parsing admin data:', error); } }
  }, []);

  const canManage = userRole === 'Super Admin' || userRole === 'Manager';

  const fetchImages = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/gallery/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal,
      });
      const data = await response.json();
      if (data.success) setImages(data.data || []);
    } catch (error) { if (error.name !== 'AbortError') console.error('Error fetching gallery:', error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchImages(); return () => abortRef.current?.abort(); }, [fetchImages]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) { fetchImages(); if (viewingImage?._id === id) setViewingImage(null); }
      else alert(data.message || 'Failed to delete image');
    } catch (error) { console.error('Error deleting image:', error); alert('Failed to delete image'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400 mx-auto"></div><p className="text-gray-500 dark:text-gray-400 mt-4">Loading gallery...</p></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Gallery Management" description="Manage DGW Autospa portfolio gallery images" noIndex={true} />
      <div className="p-6">
        <UploadImageModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={fetchImages} />
        <ImageViewerModal image={viewingImage} isOpen={!!viewingImage} onClose={() => setViewingImage(null)} />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gallery</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{images.length} image{images.length !== 1 ? 's' : ''} in portfolio</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchImages} className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" title="Refresh">
              <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            {canManage && <button onClick={() => setIsUploadModalOpen(true)} className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" /> Upload Image</button>}
          </div>
        </div>
        {images.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <Image className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No images yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Upload photos to showcase your work.</p>
            {canManage && <button onClick={() => setIsUploadModalOpen(true)} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">Upload First Image</button>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {images.map(image => (
                <div key={image._id} className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200">
                  <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={image.image || '/placeholder.jpg'} 
                      alt={image.title || 'Gallery image'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                      <button onClick={() => setViewingImage(image)} className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="View image">
                        <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>
                      {canManage && <button onClick={() => handleDelete(image._id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors" aria-label="Delete image"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </div>
                  {image.title && <div className="p-3"><h3 className="font-medium text-gray-900 dark:text-white truncate">{image.title}</h3></div>}
                </div>
              ))}
            </div>
            {canManage && images.length >= 4 && (
              <div className="flex justify-center mt-6">
                <button onClick={() => setIsUploadModalOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-500 dark:hover:border-gray-500 transition-colors">
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" /> <span className="text-gray-700 dark:text-gray-300">Upload More Images</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Gallery;