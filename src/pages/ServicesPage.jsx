import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/* Custom SVG Icons (unchanged) */
const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CarIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h8M9 5h6m-3 7v6m-4-4h8M4 17h16a2 2 0 002-2V9a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);
const DiscIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M4 17h16a2 2 0 002-2V9a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2z" />
  </svg>
);
const SparklesIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);
const GaugeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);
const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
  </svg>
);
const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

function ServicesPage() {
  const [searchParams] = useSearchParams();  // Read query params
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [services, setServices] = useState([]);
  const abortRef = useRef(null);
  const scrolledRef = useRef(false);  // Prevent multiple scrolls

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Diagnostics': SearchIcon,
      'Wheel Services': GaugeIcon,
      'Tyre Services': CarIcon,
      'Maintenance': ClockIcon,
      'Brake Services': DiscIcon,
      'Other Services': SearchIcon,
    };
    return iconMap[category] || SearchIcon;
  };

  const categories = ["All", "Diagnostics", "Wheel Services", "Tyre Services", "Maintenance", "Brake Services", "Other Services"];

  const defaultServices = [
    { id: 1, title: 'General Inspection & Diagnostic', description: 'A full health check—electrical, mechanical, and safety—so you know exactly what your car needs.', icon: SearchIcon, category: "Diagnostics", image: null },
    { id: 2, title: 'Wheel Balancing', description: 'Eliminate vibrations and uneven wear. We balance every wheel to spec for a smoother drive.', icon: SparklesIcon, category: "Wheel Services", image: null },
    { id: 3, title: 'Wheel Alignment', description: 'Correct toe, camber, and caster for stable steering, better tyre life, and safer cornering.', icon: GaugeIcon, category: "Wheel Services", image: null },
    { id: 4, title: 'Tyre Acquisition', description: 'Supply and fit premium tyres with balanced handling and safe mounting—ready for city streets or highway cruising.', icon: CarIcon, category: "Tyre Services", image: null },
    { id: 5, title: 'Quick Service', description: 'Oil, filters, fluids, and checks—done fast without cutting corners. Book a slot and keep your day moving.', icon: ClockIcon, category: "Maintenance", image: null },
    { id: 6, title: 'Brake Disc Maintenance', description: 'Pads, discs, and fluid handled—expert brake disc inspection, resurfacing, and replacement.', icon: DiscIcon, category: "Brake Services", image: null }
  ];

  const fetchServices = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(`${API_BASE_URL}/api/services`, { signal: controller.signal });
      const data = await response.json();
      let allServices = [];
      if (data.success && data.data && data.data.length > 0) {
        allServices = data.data.map((service) => ({
          id: service._id,
          title: service.name,
          description: service.description,
          icon: getCategoryIcon(service.category),
          category: service.category,
          image: service.image,
        }));
      } else {
        allServices = defaultServices;
      }
      setServices(allServices);

      // Scroll to the focused service card after DOM update
      const focusId = searchParams.get('focus');
      if (focusId && !scrolledRef.current) {
        scrolledRef.current = true;
        setTimeout(() => {
          const el = document.getElementById(`service-${focusId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Brief highlight effect
            el.classList.add('ring-2', 'ring-blue-400', 'ring-offset-2', 'ring-offset-blue-900');
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-blue-400', 'ring-offset-2', 'ring-offset-blue-900');
            }, 2000);
          }
        }, 300);
      }
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Error fetching services:', error);
      setServices(defaultServices);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchServices();
    return () => abortRef.current?.abort();
  }, [fetchServices]);

  const filteredServices = services.filter(service => {
    const matchesCategory =
      selectedCategory === "All" ||
      service.category === selectedCategory ||
      (selectedCategory === "Other Services" && !categories.includes(service.category));
    const matchesSearch =
      searchTerm === "" ||
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <SEO title="Our Services | Professional Auto Care in Lagos" description="Comprehensive automotive services in Lagos: Tyre acquisition, wheel alignment, brake maintenance, vehicle diagnostics, and quick service." />
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950">
        {/* Hero */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-500/50">
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>
              OUR SERVICES
            </div>
            <h1 id='hero-head' className="text-white text-4xl md:text-5xl lg:text-6xl font-black mb-6">
              COMPREHENSIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-200">AUTO CARE</span>
            </h1>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto leading-relaxed">
              From routine maintenance to specialized services, we offer everything your vehicle needs to perform at its best.
            </p>
          </div>
        </section>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-blue-800/30 border border-blue-500/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Round category filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setSearchTerm(''); }}
                className={`px-6 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                    : "bg-blue-800/30 text-blue-200 hover:bg-blue-700/50 border border-blue-500/30"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredServices.length === 0 ? (
              <div className="text-center py-20 bg-blue-800/30 rounded-xl border border-blue-500/30">
                <CarIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-200 text-lg">No services found</p>
                <p className="text-blue-300 text-sm mt-2">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {filteredServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={service.id}
                      id={`service-${service.id}`}   // 👈 unique ID for scrolling
                      className="group bg-blue-800/30 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 overflow-hidden border border-blue-500/30 hover:border-blue-400/60 hover:-translate-y-1"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-2/5 relative overflow-hidden">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 min-h-[200px]"
                              onError={(e) => { e.target.src = 'https://placehold.co/400x300/1e3a8a/white?text=Service+Image'; }}
                            />
                          ) : (
                            <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center">
                              <CarIcon className="w-16 h-16 text-blue-300 opacity-50" />
                            </div>
                          )}
                        </div>
                        <div className="sm:w-3/5 p-6 flex flex-col">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600/30 to-blue-700/30 rounded-lg flex items-center justify-center group-hover:from-blue-500 group-hover:to-blue-600 transition-all">
                              <Icon className="w-5 h-5 text-blue-300 group-hover:text-white transition-colors" />
                            </div>
                            <h2 id='hero-head' className="text-xl font-bold text-white">{service.title}</h2>
                          </div>
                          <p className="text-blue-200 leading-relaxed mb-4 text-sm flex-1">{service.description}</p>
                          <div className="mb-3">
                            <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-1 rounded-full border border-blue-500/30">{service.category}</span>
                          </div>
                          <Link 
                            to={`/contact?service=${encodeURIComponent(service.title)}`} 
                            className="mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-blue-500/25"
                          >
                            Contact for Pricing <ChevronRightIcon className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Custom Service CTA */}
        <section className="py-20 bg-gradient-to-b from-blue-800/30 to-blue-900/30 border-t border-blue-500/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-blue-800/30 rounded-2xl p-8 md:p-12 border border-blue-500/30">
              <h2 id='hero-head' className="text-3xl md:text-4xl font-bold text-white mb-4">NEED A CUSTOM SERVICE?</h2>
              <p className="text-blue-200 text-lg mb-8">Contact us for specialized services tailored to your vehicle's unique needs.</p>
              <Link to="/contact">
                <button className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/30">
                  Contact Us <ArrowRightIcon className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default ServicesPage;