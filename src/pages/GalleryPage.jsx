import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import useSettings from '../hooks/useSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// ---------- SVG Icons (kept as before) ----------
const MaximizeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [stats, setStats] = useState({
    vehiclesDetailed: 0,
    satisfactionRate: 0,
    averageRating: 0
  });
  const abortRef = useRef(null);
  const { business } = useSettings();

  const fetchGallery = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(`${API_BASE_URL}/api/gallery`, { signal: controller.signal });
      const data = await response.json();
      if (data.success && data.data) {
        const images = data.data.map(img => ({
          src: img.image,
          alt: img.title || "DGW Autospa gallery image",
          id: img._id,
          title: img.title
        }));
        setGalleryImages(images);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching gallery:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
    fetchStats();
    return () => abortRef.current?.abort();
  }, [fetchGallery, fetchStats]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setSelectedImage(null); setSelectedImageIndex(null); }
      else if (e.key === 'ArrowLeft' && selectedImageIndex !== null) handlePrevious();
      else if (e.key === 'ArrowRight' && selectedImageIndex !== null) handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, galleryImages]);

  const handleImageClick = (image, index) => { setSelectedImage(image.src); setSelectedImageIndex(index); };
  const handlePrevious = () => {
    if (selectedImageIndex > 0) {
      setSelectedImage(galleryImages[selectedImageIndex - 1].src);
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };
  const handleNext = () => {
    if (selectedImageIndex < galleryImages.length - 1) {
      setSelectedImage(galleryImages[selectedImageIndex + 1].src);
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  return (
    <>
      <SEO title="Gallery | DGW Autospa Portfolio & Before/After Results" description="Browse our portfolio of completed automotive detailing and service work in Lagos. See the DGW Autospa difference in our transformation gallery." />
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-500/50">
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>
              OUR WORK
            </div>
            <h1 id='hero-head' className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-6">THE GLEAM <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">EXPERIENCE</span></h1>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto leading-relaxed">Browse through our portfolio of completed work and witness the <span className="text-blue-300 font-semibold">DGW Autospa</span> difference.</p>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {galleryImages.length === 0 ? (
              <div className="text-center py-20 bg-blue-800/30 rounded-xl border border-blue-500/30">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-800/50 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-blue-200 text-lg">No images in gallery yet</p>
                <p className="text-blue-300 text-sm mt-2">Check back soon for our transformation photos!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {galleryImages.map((image, index) => (
                  <div key={image.id || index} onClick={() => handleImageClick(image, index)} className="group cursor-pointer">
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-blue-800/30 border border-blue-500/30 hover:border-blue-400/60 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1">
                      <img src={image.src} alt={image.alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" onError={(e) => { e.target.src = 'https://placehold.co/600x450/1e3a8a/white?text=Image+Not+Found'; }} />
                      {image.title && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-900/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300"><p className="text-white text-sm font-medium">{image.title}</p></div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-blue-900/80 backdrop-blur-sm rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform border border-blue-400/50"><MaximizeIcon className="w-5 h-5 text-white" /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center mt-16">
              <p className="text-blue-200 mb-4">Follow us for more transformations</p>
              <div className="flex justify-center gap-4">
                <a href={business.instagram || 'https://instagram.com/deepgleamonwheels'} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-800/30 rounded-full hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-500 transition-all duration-300 border border-blue-500/30 hover:border-transparent group"><InstagramIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" /></a>
                <a href={business.facebook || 'https://facebook.com/DeepGleamOnWheelsAutospa'} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-800/30 rounded-full hover:bg-blue-700 transition-all duration-300 border border-blue-500/30 hover:border-blue-400 group"><FacebookIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" /></a>
                <a href={business.tiktok || 'https://tiktok.com/@dgwautospa'} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-800/30 rounded-full hover:bg-black transition-all duration-300 border border-blue-500/30 hover:border-gray-500 group"><TikTokIcon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" /></a>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Stats Section – correct handling of zero reviews */}
        <section className="py-20 bg-gradient-to-b from-blue-800/30 to-blue-900/30 border-t border-blue-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Vehicles Detailed */}
              <div className="text-center p-6 rounded-2xl bg-blue-800/30 border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1">
                <CheckCircleIcon className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.vehiclesDetailed}+</div>
                <div className="text-blue-200 text-xs md:text-sm">Vehicles Detailed</div>
              </div>

              {/* Satisfaction Rate – shows 0% when no reviews */}
              <div className="text-center p-6 rounded-2xl bg-blue-800/30 border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1">
                <StarIcon className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stats.satisfactionRate === 0 && stats.averageRating === 0 ? '—' : `${stats.satisfactionRate}%`}
                </div>
                <div className="text-blue-200 text-xs md:text-sm">
                  {stats.satisfactionRate === 0 && stats.averageRating === 0 ? 'No reviews yet' : 'Satisfaction Rate'}
                </div>
              </div>

              {/* Average Rating – shows — when zero reviews */}
              <div className="text-center p-6 rounded-2xl bg-blue-800/30 border border-blue-500/30 backdrop-blur-sm hover:border-blue-400/60 transition-all duration-300 hover:-translate-y-1">
                <SparklesIcon className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stats.averageRating === 0 ? '—' : `${stats.averageRating}⭐`}
                </div>
                <div className="text-blue-200 text-xs md:text-sm">
                  {stats.averageRating === 0 ? 'No reviews yet' : 'Average Rating'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl" onClick={() => { setSelectedImage(null); setSelectedImageIndex(null); }}>
            <button className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-blue-800/50 hover:bg-blue-700 transition-colors border border-blue-500/30 z-10" onClick={() => { setSelectedImage(null); setSelectedImageIndex(null); }}><XIcon className="w-5 h-5 md:w-6 md:h-6 text-white" /></button>
            {selectedImageIndex > 0 && <button className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full bg-blue-800/50 hover:bg-blue-700 transition-colors border border-blue-500/30 z-10" onClick={(e) => { e.stopPropagation(); handlePrevious(); }}><svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg></button>}
            {selectedImageIndex < galleryImages.length - 1 && <button className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full bg-blue-800/50 hover:bg-blue-700 transition-colors border border-blue-500/30 z-10" onClick={(e) => { e.stopPropagation(); handleNext(); }}><svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></button>}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-900/80 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm text-white border border-blue-500/30">{selectedImageIndex + 1} / {galleryImages.length}</div>
            <div className="max-w-6xl w-full" onClick={(e) => e.stopPropagation()}><img src={selectedImage} alt="Gallery" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl" /></div>
          </div>
        )}

        {/* Call to Action Section */}
        <section className="relative py-20 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800/20 to-transparent pointer-events-none"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-500/50">
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>
              READY TO TRANSFORM YOUR RIDE
            </div>
            <h2 id='hero-head' className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">READY TO GIVE YOUR<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">CAR THE CARE IT DESERVES?</span></h2>
            <p className="text-blue-100 text-base md:text-lg max-w-3xl mx-auto mb-8 md:mb-10 leading-relaxed">Contact us today for a free consultation and custom pricing.</p>
            <Link to="/contact">
              <button className="group relative inline-flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-base md:text-lg rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">Contact for Pricing <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-300" /></span>
              </button>
            </Link>
            <p className="text-blue-300 text-xs md:text-sm mt-6">Free consultation • Expert technicians • Premium quality</p>
          </div>
        </section>
      </div>
    </>
  );
}

export default GalleryPage;