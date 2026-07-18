import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/* ----- icons (same as before) ----- */
const StarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const Edit3Icon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const ThumbsUpIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
  </svg>
);
const AwardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const MailIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

function Testimonials() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', rating: 5, review: '', service: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const abortRef = useRef(null);

  const servicesList = ["Wheel Balancing", "General Inspection & Diagnostic", "Wheel Alignment", "Tyre Acquisition", "Quick Service", "Brake Disc Maintenance"];

  const fetchReviews = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      // ✅ Use environment variable
      const response = await fetch(`${API_BASE_URL}/api/reviews`, { signal: controller.signal });
      const data = await response.json();
      if (data.success && data.data) {
        const formattedReviews = data.data.map(review => ({
          id: review._id,
          name: review.customerName,
          rating: review.rating,
          text: review.comment,
          date: new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          service: review.service
        }));
        setReviews(formattedReviews);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching reviews:', error);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
    return () => abortRef.current?.abort();
  }, [fetchReviews]);

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, t) => sum + t.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const totalReviews = reviews.length;
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fourStarCount = reviews.filter(r => r.rating === 4).length;
  const threeStarCount = reviews.filter(r => r.rating === 3).length;

  const renderStars = (rating, size = "w-5 h-5") => {
    return Array(5).fill(0).map((_, i) => {
      if (i < rating) return <StarIcon key={i} className={`${size} text-yellow-400 fill-current`} />;
      return <StarIcon key={i} className={`${size} text-gray-600`} />;
    });
  };

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleRatingClick = (rating) => { setFormData(prev => ({ ...prev, rating: rating })); };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim() && formData.review.trim()) {
      const reviewData = { customerName: formData.name, customerEmail: formData.email, rating: formData.rating, comment: formData.review, service: formData.service || "General Service" };
      try {
        // ✅ Use environment variable
        const response = await fetch(`${API_BASE_URL}/api/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewData) });
        const data = await response.json();
        if (data.success) {
          // Refresh the list with environment variable
          const refreshRes = await fetch(`${API_BASE_URL}/api/reviews`);
          const refreshData = await refreshRes.json();
          if (refreshData.success && refreshData.data) {
            const formatted = refreshData.data.map(review => ({ id: review._id, name: review.customerName, rating: review.rating, text: review.comment, date: new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), service: review.service }));
            setReviews(formatted);
          }
          setFormData({ name: '', email: '', rating: 5, review: '', service: '' });
          setShowReviewForm(false);
          alert('Thank you for your review! It will appear after admin approval.');
        }
      } catch (error) { console.error('Error submitting review:', error); alert('Failed to submit review. Please try again.'); }
    } else { alert('Please fill in all required fields (Name, Email, and Review)'); }
  };

  return (
    <>
      <SEO title="Client Testimonials | DGW Autospa Reviews" description="Read real reviews from satisfied customers who experienced the DGW Autospa difference. Join thousands of happy car owners in Lagos." />
      
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        <section className="pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-blue-500/50"><span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>TESTIMONIALS</div>
            <h1 id='hero-head' className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-4">CLIENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">REVIEWS</span></h1>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto leading-relaxed">Don't just take our word for it. Hear what our satisfied customers have to say.</p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-blue-800/30 rounded-2xl p-6 md:p-8 border border-blue-500/30 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-3">
                  <span className="text-5xl md:text-6xl font-bold text-white">{averageRating}</span>
                  <div>
                    <div className="flex mb-1">{renderStars(Math.round(parseFloat(averageRating)), "w-5 h-5")}</div>
                    <span className="text-sm text-blue-200">Based on {totalReviews} reviews</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1 text-blue-200 text-sm"><AwardIcon className="w-4 h-4 text-blue-300" /><span>Trusted by {totalReviews}+ customers</span></div>
              </div>
              <div className="flex-1 max-w-md w-full space-y-2">
                {[5, 4, 3].map((star) => { const count = star === 5 ? fiveStarCount : star === 4 ? fourStarCount : threeStarCount; const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0; return (<div key={star} className="flex items-center gap-2"><span className="text-sm text-blue-200 w-8">{star}★</span><div className="flex-1 h-2 bg-blue-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full" style={{ width: `${percentage}%` }}></div></div><span className="text-xs text-blue-200 w-8">{count}</span></div>); })}
              </div>
              <div>
                <button onClick={() => setShowReviewForm(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-blue-500/25"><Edit3Icon className="w-4 h-4" />Write a Review</button>
                <p className="text-xs text-blue-300 mt-2 text-center">Share your experience</p>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEW FORM MODAL – fully scrollable */}
        {showReviewForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
            {/* backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowReviewForm(false)}></div>
            
            <div className="relative bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl max-w-lg w-full p-6 md:p-8 border border-blue-500/30 shadow-2xl shadow-blue-500/20 my-auto">
              <button onClick={() => setShowReviewForm(false)} className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors z-10"><XIcon className="w-5 h-5" /></button>
              <div className="text-center mb-6">
                <h3 id='hero-head' className="text-2xl font-bold text-white mb-2">Share Your Experience</h3>
                <p className="text-blue-200 text-sm">Your feedback helps us serve you better</p>
              </div>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label id='hero-head' className="block text-blue-200 font-semibold mb-2">Your Name *</label>
                  <div className="relative"><UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" /><input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your name" className="w-full pl-10 pr-4 py-2.5 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all" required /></div>
                </div>
                <div>
                  <label id='hero-head' className="block text-blue-200 font-semibold mb-2">Your Email *</label>
                  <div className="relative"><MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" /><input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" className="w-full pl-10 pr-4 py-2.5 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all" required /></div>
                </div>
                <div>
                  <label id='hero-head' className="block text-blue-200 font-semibold mb-2">Service Used</label>
                  <select name="service" value={formData.service} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"><option value="">Select a service</option>{servicesList.map(service => <option key={service} value={service}>{service}</option>)}</select>
                </div>
                <div>
                  <label id='hero-head' className="block text-blue-200 font-semibold mb-2">Rating *</label>
                  <div className="flex gap-2">{[1,2,3,4,5].map((star) => (<button key={star} type="button" onClick={() => handleRatingClick(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="focus:outline-none transition-transform hover:scale-110"><StarIcon className={`w-8 h-8 transition-all ${star <= (hoverRating || formData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} /></button>))}</div>
                </div>
                <div>
                  <label id='hero-head' className="block text-blue-200 font-semibold mb-2">Your Review *</label>
                  <textarea name="review" value={formData.review} onChange={handleInputChange} placeholder="Tell us about your experience..." rows="4" className="w-full px-4 py-2.5 bg-blue-700/50 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all resize-none" required></textarea>
                </div>
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-blue-500/25">Submit Review <ArrowRightIcon className="w-4 h-4" /></button>
              </form>
            </div>
          </div>
        )}

        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {reviews.length === 0 ? (
              <div className="text-center py-20 bg-blue-800/30 rounded-xl border border-blue-500/30"><StarIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" /><p className="text-blue-200 text-lg">No reviews yet</p><p className="text-blue-300 text-sm mt-2">Be the first to leave a review!</p></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((testimonial) => (
                  <div key={testimonial.id} className="group bg-blue-800/30 rounded-2xl p-6 md:p-8 border border-blue-500/30 hover:border-blue-400/60 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
                    <div className="flex gap-1 mb-4">{renderStars(testimonial.rating, "w-5 h-5")}</div>
                    <p className="text-blue-100 leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                    <div className="pt-4 border-t border-blue-700/50">
                      <p className="text-blue-300 font-semibold text-lg">{testimonial.name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-blue-200">
                        {testimonial.service && (<span className="flex items-center gap-1"><ThumbsUpIcon className="w-3 h-3" />{testimonial.service}</span>)}
                        {testimonial.date && (<span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{testimonial.date}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="relative py-24 overflow-hidden border-t border-blue-500/30">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-500/50"><span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>READY TO EXPERIENCE THE DIFFERENCE</div>
            <h2 id='hero-head' className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">JOIN OUR <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">SATISFIED CUSTOMERS</span></h2>
            <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">Experience the DGW Autospa difference today. Book your service and join our family of happy customers.</p>
            <Link to="/contact"><button className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden"><span className="relative z-10 flex items-center gap-2">Contact for Pricing <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" /></span></button></Link>
            <p className="text-blue-300 text-sm mt-6">Join {totalReviews}+ satisfied customers • Expert technicians • Premium quality</p>
          </div>
        </section>
      </div>
    </>
  );
}

export default Testimonials;