import React, { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  Car, Clock, Search, ChevronRight, Disc, Sparkles, Gauge, 
  CheckCircle, Shield, Wrench, Zap, Star, ArrowRight 
} from 'lucide-react';

import bg from '../assets/images/hero4.jpg';
import aboutCar from '../assets/images/about-workshop.jpg';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const StarRating = memo(function StarRating({ rating, maxRating = 5 }) {
  const stars = useMemo(() => 
    Array.from({ length: maxRating }, (_, i) => ({
      id: `star-${i}`,
      filled: i < rating
    })),
    [rating, maxRating]
  );
  return (
    <div className="flex gap-1">
      {stars.map(({ id, filled }) => (
        <Star key={id} className={`w-5 h-5 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
      ))}
    </div>
  );
});

const SectionBadge = memo(function SectionBadge({ text, animate = false }) {
  return (
    <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-blue-500/50">
      <span className={`w-2 h-2 bg-blue-300 rounded-full ${animate ? 'animate-pulse' : ''}`} />
      {text}
    </div>
  );
});

// ✅ Featured Service Card – button links to /services?focus=ID
const FeaturedServiceCard = memo(function FeaturedServiceCard({ service }) {
  const Icon = service.icon;
  return (
    <div className="block group bg-blue-800/30 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden border border-blue-500/30 hover:border-blue-400/60 hover:-translate-y-1 backdrop-blur-sm">
      <div className="p-6 md:p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300 border border-blue-500/30 group-hover:border-blue-400">
          <Icon className="w-8 h-8 text-blue-300 group-hover:text-white transition-colors" />
        </div>
        <h3 id='hero-head' className="text-xl font-bold text-white mb-2">{service.title}</h3>
        <p className="text-blue-200 text-sm">{service.description}</p>
        <Link
          to={`/services?focus=${service.id}`}
          className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-blue-500/25"
        >
          Learn More <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
});

const FeatureCard = memo(function FeatureCard({ feature }) {
  const Icon = feature.icon;
  return (
    <article className="group bg-blue-800/30 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden border border-blue-500/30 hover:border-blue-400/60 hover:-translate-y-1 backdrop-blur-sm text-center">
      <div className="p-6 md:p-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:from-blue-500 group-hover:to-blue-600 transition-all duration-300 border border-blue-500/30 group-hover:border-blue-400">
          <Icon className="w-8 h-8 text-blue-300 group-hover:text-white transition-colors" />
        </div>
        <h3 id='hero-head' className="text-xl font-bold text-white mb-3">{feature.title}</h3>
        <p className="text-blue-200 leading-relaxed">{feature.description}</p>
      </div>
    </article>
  );
});

// ✅ TestimonialCard – now displays role/company if available
const TestimonialCard = memo(function TestimonialCard({ testimonial }) {
  return (
    <article className="group bg-blue-800/30 rounded-2xl p-6 md:p-8 border border-blue-500/30 hover:border-blue-400/60 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
      <StarRating rating={testimonial.rating} />
      <blockquote className="text-blue-100 leading-relaxed mb-6 italic mt-4">"{testimonial.comment}"</blockquote>
      <footer className="pt-4 border-t border-blue-700/50">
        <cite className="text-blue-300 font-semibold text-lg not-italic">{testimonial.customerName}</cite>
        {testimonial.clientRole && <p className="text-blue-400 text-sm mt-1">{testimonial.clientRole}</p>}
        {testimonial.companyName && <p className="text-blue-400 text-sm">{testimonial.companyName}</p>}
        {testimonial.service && <p className="text-blue-400 text-sm mt-1">Service: {testimonial.service}</p>}
      </footer>
    </article>
  );
});

function HomePage() {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, averageRating: 0, totalReviews: 0, totalCustomers: 0 });
  const abortRef = useRef(null);

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Diagnostics': Search,
      'Wheel Services': Gauge,
      'Tyre Services': Car,
      'Maintenance': Clock,
      'Brake Services': Disc
    };
    return iconMap[category] || Wrench;
  };

  const fetchData = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const [servicesRes, reviewsRes, bookingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/services`, { signal: controller.signal }),
        fetch(`${API_BASE_URL}/api/reviews?featured=true`, { signal: controller.signal }),  // 👈 only featured reviews
        fetch(`${API_BASE_URL}/api/bookings`, { signal: controller.signal })
      ]);
      const servicesData = await servicesRes.json();
      const reviewsData = await reviewsRes.json();
      const bookingsData = await bookingsRes.json();

      if (servicesData.success && servicesData.data && servicesData.data.length > 0) {
        const formatted = servicesData.data
          .filter(s => s.isFeatured)
          .slice(0, 6)
          .map(service => ({
            id: service._id,
            title: service.name,
            description: service.description,
            icon: getCategoryIcon(service.category),
            category: service.category,
            image: null,
          }));
        setServices(formatted);
      }

      if (reviewsData.success && reviewsData.data) {
        const featuredReviews = reviewsData.data.slice(0, 3);
        setReviews(featuredReviews);
        if (featuredReviews.length > 0) {
          const avg = featuredReviews.reduce((sum, r) => sum + r.rating, 0) / featuredReviews.length;
          setStats(prev => ({ ...prev, averageRating: avg.toFixed(1), totalReviews: featuredReviews.length }));
        }
      }

      if (bookingsData.success && bookingsData.data) {
        const uniqueCustomers = new Set(bookingsData.data.map(b => b.customerEmail));
        setStats(prev => ({ ...prev, totalBookings: bookingsData.data.length, totalCustomers: uniqueCustomers.size }));
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching home data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  const features = [
    { icon: Shield, title: 'Professional Service', description: 'Our certified technicians deliver expert care with attention to every detail.' },
    { icon: Wrench, title: 'Quality Equipment', description: 'State-of-the-art tools and premium products for the best results.' },
    { icon: Zap, title: 'Fast & Reliable', description: 'Efficient service that respects your time without compromising quality.' }
  ];

  return (
    <>
      <SEO title="Premium Automotive Care & Auto Spa Services in Lagos | DGW Autospa" description="Expert automotive care services in Lagos: Tyre acquisition, wheel alignment, brake maintenance, and professional auto detailing. Contact us for pricing and bookings!" />
      
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bg})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent lg:from-black/70 lg:via-black/40" />
        <div className="absolute inset-0 bg-black/30 lg:hidden" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-5rem)]">
            <div className="text-white flex flex-col items-start space-y-6 py-12 lg:py-0">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="uppercase tracking-widest text-sm font-semibold">LAGOS • MON-SAT • 9AM-7PM</span>
              </div>
              <h1 id='hero-head' className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-lg">
                SMART DRIVE
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white mt-2">WITH OUR</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white mt-2">VALUE-ADDED SERVICES</span>
              </h1>
              <p className="text-white/90 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl drop-shadow-md">
                At DGW Autospa, we treat every vehicle like a premium build—precision cleaning, 
                protection, and finishing that lasts. Contact us for custom pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                <Link to="/contact" className="group inline-flex items-center justify-center rounded-full px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 font-semibold text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5">
                  Contact for Pricing <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/services" className="inline-flex items-center justify-center rounded-full px-8 py-3 bg-white/10 backdrop-blur-md border border-white/50 text-white font-semibold hover:bg-blue-700 hover:border-blue-600 transition-all duration-300 hover:-translate-y-0.5">
                  View Services
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-6 border-t border-white/20 mt-4">
                <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-300" /><span className="text-sm text-white/80">Certified Experts</span></div>
                <div className="flex items-center gap-2"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /><span className="text-sm text-white/80">{stats.averageRating || '5.0'} Rating</span></div>
              </div>
            </div>
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionBadge text="Why Choose Us" />
            <h2 id='hero-head' className="text-4xl md:text-5xl font-bold text-white mb-4">THE DGW DIFFERENCE</h2>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">Experience excellence in automotive care with our commitment to quality and service.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => <FeatureCard key={idx} feature={feature} />)}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative bg-gradient-to-b from-blue-950 to-blue-900 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="text-white space-y-6">
            <SectionBadge text="About Us" />
            <h2 id='hero-head' className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">EXPERIENCE THE<span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-200">ART OF AUTOMOTIVE</span>REJUVENATION</h2>
            <p className="text-blue-100 text-lg leading-relaxed">At DGW AUTOSPA, we understand the importance of a well-maintained vehicle. That's why we offer a comprehensive range of services designed to keep your car in top condition.</p>
            <p className="text-blue-200 leading-relaxed">Our team of skilled technicians uses state-of-the-art equipment and premium products to deliver exceptional results. From routine maintenance to specialized detailing, we treat every vehicle with the care it deserves.</p>
            <ul className="flex flex-wrap gap-6 pt-4">
              <li className="flex items-center gap-2 text-blue-200"><CheckCircle className="w-5 h-5 text-blue-300" /><span>Premium Products</span></li>
              <li className="flex items-center gap-2 text-blue-200"><CheckCircle className="w-5 h-5 text-blue-300" /><span>Expert Technicians</span></li>
              <li className="flex items-center gap-2 text-blue-200"><CheckCircle className="w-5 h-5 text-blue-300" /><span>Modern Equipment</span></li>
            </ul>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/30 border border-blue-500/30">
            <img src={aboutCar} alt="Professional automotive service workshop at DGW Autospa" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionBadge text="What We Offer" />
            <h2 id='hero-head' className="text-4xl md:text-5xl font-bold text-white mb-4">OUR SERVICES</h2>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">Comprehensive auto care solutions designed to keep your vehicle in peak condition. Contact us for custom pricing.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => <FeaturedServiceCard key={service.id} service={service} />)}
          </div>
          {services.length === 0 && (
            <div className="text-center py-12 text-blue-200">
              <p>No featured services at the moment.</p>
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/services" className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-blue-500/30">
              View All Services <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section – only featured reviews */}
      <section className="bg-gradient-to-b from-blue-950 to-blue-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <SectionBadge text="Testimonials" />
            <h2 id='hero-head' className="text-4xl md:text-5xl font-bold text-white mb-4">WHAT OUR CLIENTS SAY</h2>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">Real feedback from satisfied customers who trust us with their vehicles.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.length > 0 ? reviews.map((testimonial) => <TestimonialCard key={testimonial._id} testimonial={testimonial} />) : (
              <div className="col-span-3 text-center py-12"><p className="text-blue-200">No featured reviews yet.</p><Link to="/testimonials" className="inline-block mt-4 text-blue-300 hover:text-white">Leave a Review →</Link></div>
            )}
          </div>
          <div className="text-center mt-12">
            <Link to="/testimonials" className="group inline-flex items-center gap-2 px-8 py-3 bg-transparent border-2 border-blue-400 text-blue-300 font-semibold rounded-full hover:bg-blue-700 hover:text-white hover:border-blue-600 transition-all duration-300">
              View All Reviews <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-b from-blue-900 to-blue-950 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <SectionBadge text="Ready to Transform Your Ride" animate />
          <h2 id='hero-head' className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">READY TO GIVE YOUR<span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-200">CAR THE CARE IT DESERVES?</span></h2>
          <p className="text-blue-100 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">Contact us today for a free consultation and custom pricing. Premium care for your premium vehicle.</p>
          <Link to="/contact" className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">Contact for Pricing <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" /></span>
          </Link>
          <p className="text-blue-300 text-sm mt-6">Free consultation • Expert technicians • Premium quality</p>
        </div>
      </section>
    </>
  );
}

export default HomePage;