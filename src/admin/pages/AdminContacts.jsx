import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Mail, Phone, MessageSquare, Send, X, RotateCcw } from 'lucide-react';
import SEO from '/src/components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const ReplyModal = ({ contact, onClose, onSubmit }) => {
  const [reply, setReply] = useState('');
  if (!contact) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(contact._id, reply);
    setReply('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-xl font-semibold">Reply to {contact.name}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Original message:</p>
            <p className="text-gray-900 dark:text-white mt-1">{contact.message}</p>
          </div>
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium mb-2">Your Reply</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={5}
              required
              className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              placeholder="Type your reply..."
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-gray-800 text-white rounded-lg flex items-center gap-2"><Send className="w-4 h-4" /> Send Reply</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const abortRef = useRef(null);

  const fetchContacts = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/api/contact`, { 
        headers: { 'Authorization': `Bearer ${token}` }, 
        signal: controller.signal 
      });
      const data = await res.json();
      if (data.success) setContacts(data.data);
    } catch (err) { 
      if (err.name !== 'AbortError') console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchContacts(); 
    return () => abortRef.current?.abort(); 
  }, [fetchContacts]);

  const handleReplySubmit = async (id, reply) => {
    const token = localStorage.getItem('adminToken');
    const res = await fetch(`${API_BASE_URL}/api/contact/${id}/reply`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ reply }),
    });
    const data = await res.json();
    if (data.success) {
      setContacts(prev => prev.map(c => c._id === id ? data.data : c));
    } else {
      alert(data.message || 'Failed to send reply');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return;
    const token = localStorage.getItem('adminToken');
    await fetch(`${API_BASE_URL}/api/contact/${id}`, { 
      method: 'DELETE', 
      headers: { 'Authorization': `Bearer ${token}` } 
    });
    setContacts(prev => prev.filter(c => c._id !== id));
  };

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      replied: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>{status}</span>;
  };

  if (loading) return <div className="flex justify-center h-64"><div className="animate-spin h-12 w-12 border-b-2 border-gray-700 rounded-full" /></div>;

  return (
    <>
      <SEO title="Contact Messages | DGW Autospa Admin" noIndex />
      <div className="p-6">
        <ReplyModal contact={selected} onClose={() => setReplyOpen(false)} onSubmit={handleReplySubmit} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Messages</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{contacts.length} message{contacts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchContacts} title="Refresh" className="p-2 bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50"><RotateCcw className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No contact messages found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(contact => (
              <div key={contact._id} className="bg-white dark:bg-gray-900 rounded-xl border p-5 hover:shadow-md transition">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{contact.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {contact.email}</span>
                      {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {contact.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(contact.status || 'pending')}
                    {contact.status !== 'replied' && (
                      <button
                        onClick={() => { setSelected(contact); setReplyOpen(true); }}
                        className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Reply
                      </button>
                    )}
                    <button onClick={() => handleDelete(contact._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                {contact.subject && <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject: {contact.subject}</p>}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{contact.message}</p>
                {contact.reply && (
                  <div className="border-t pt-3 mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Reply:</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{contact.reply}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(contact.repliedAt).toLocaleString()}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{new Date(contact.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminContacts;