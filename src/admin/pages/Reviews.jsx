import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Star, MessageSquare, Search, CheckCircle, XCircle, Reply, Trash2, X, Send, RotateCcw } from 'lucide-react';
import SEO from '../../components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ---------- safe JSON parser ----------
const safeJson = async (res) => {
  try {
    return await res.json();
  } catch (e) {
    console.error('Invalid JSON response:', e);
    return { success: false, data: [] };
  }
};

// ---------- Reply Modal ----------
const ReplyModal = ({ isOpen, onClose, review, onSubmit }) => {
  const [reply, setReply] = useState('');
  if (!isOpen || !review) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(review._id, reply);
    setReply('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reply to Review</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
                {review.customerName?.charAt(0)}
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{review.customerName}</span>
              <div className="flex">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                ))}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
          </div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Write your reply</label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a response... (optional)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Post Reply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== Main Reviews Component ====================
function Reviews() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminData');
    if (storedAdmin) {
      try {
        const parsed = JSON.parse(storedAdmin);
        setUserRole(parsed.role);
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
  }, []);

  const canModerate = userRole === 'Super Admin' || userRole === 'Manager';

  const fetchReviews = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/reviews/admin`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal,
      });
      const data = await safeJson(response);
      if (data.success) setReviews(data.data || []);
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    return () => abortRef.current?.abort();
  }, [fetchReviews]);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/api/reviews/${id}/approve`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      fetchReviews();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this review?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/api/reviews/${id}/reject`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      fetchReviews();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/api/reviews/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchReviews();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleFeatured = async (id, isFeatured) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/api/reviews/${id}/featured`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isFeatured }),
      });
      fetchReviews();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const handleSubmitReply = async (reviewId, replyText) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reply: replyText }),
      });
      fetchReviews();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      searchQuery === '' ||
      review.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || review.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalReviews = reviews.length;
  const pendingCount = reviews.filter(r => r.status === 'pending').length;
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 dark:border-gray-400 mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Reviews Management" description="Manage customer reviews and feedback" noIndex={true} />
      <div className="p-6">
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => {
            setIsReplyModalOpen(false);
            setSelectedReview(null);
          }}
          review={selectedReview}
          onSubmit={handleSubmitReply}
        />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews & Feedback</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{totalReviews} customer review{totalReviews !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={fetchReviews}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-gray-800 dark:bg-gray-700 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                All ({totalReviews})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="p-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No reviews yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Customer reviews will appear here.</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No reviews found</h3>
                <p className="text-gray-500 dark:text-gray-400">No reviews match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredReviews.map(review => (
                  <div key={review._id} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center font-semibold text-gray-700 dark:text-gray-300">
                          {review.customerName?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{review.customerName}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{review.service || 'General Service'}</span>
                            {review.clientRole && <span>• {review.clientRole}</span>}
                            {review.companyName && <span>• {review.companyName}</span>}
                            <span>•</span>
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            review.status === 'approved'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : review.status === 'rejected'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          }`}
                        >
                          {review.status}
                        </span>
                        {canModerate && (
                          <div className="flex gap-1">
                            {/* REPLY BUTTON – always visible */}
                            <button
                              onClick={() => {
                                setSelectedReview(review);
                                setIsReplyModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              title="Reply"
                            >
                              <Reply className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            {review.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(review._id)}
                                  className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </button>
                                <button
                                  onClick={() => handleReject(review._id)}
                                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </button>
                              </>
                            )}
                            {/* 👇 FEATURED TOGGLE BUTTON */}
                            <button
                              onClick={() => handleToggleFeatured(review._id, !review.isFeatured)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                review.isFeatured
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
                              }`}
                              title={review.isFeatured ? 'Remove from featured' : 'Feature on homepage'}
                            >
                              <Star className={`w-4 h-4 ${review.isFeatured ? 'fill-yellow-400' : ''}`} />
                            </button>
                            {/* DELETE BUTTON */}
                            <button
                              onClick={() => handleDelete(review._id)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500 dark:text-red-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex mb-2">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{review.comment}</p>
                    {review.reply && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-4 border-l-4 border-gray-500">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Your Response</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.repliedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{review.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Reviews;