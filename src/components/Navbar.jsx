import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Gift, Car, Calendar, Image, Users, Phone } from "lucide-react";
import useSettings from "../hooks/useSettings";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { business } = useSettings();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Car },
    { name: "Services", path: "/services", icon: Calendar },
    { name: "Gallery", path: "/gallery", icon: Image },
    { name: "Free Wheel Service", path: "/free-wheel-service", icon: Gift, highlight: true },
    { name: "Teams", path: "/teams", icon: Users },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  return (
    <nav className="bg-blue-700 text-white w-full sticky top-0 z-50 shadow-lg" role="navigation">
      <div className="flex items-center justify-between w-[92%] max-w-7xl mx-auto py-2.5 lg:py-3 gap-4">
        
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3 shrink-0" onClick={closeMenu} aria-label={`${business.businessName || 'DGW Autospa'} home page`}>
          {business.logo && (
            <img
              src={business.logo}
              alt={business.businessName || 'DGW Autospa'}
              className="h-14 sm:h-16 lg:h-20 w-auto max-w-[170px] sm:max-w-[220px] lg:max-w-[280px] object-contain shrink-0"
            />
          )}
          {!business.logo && (
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide leading-tight">
                DGW <span className="text-blue-200 group-hover:text-blue-100 transition-colors">AUTOSPA</span>
              </h1>
              <p className="text-[11px] sm:text-sm text-blue-200 hidden sm:block">{business.tagline || 'Deep Gleam On Wheels'}</p>
            </div>
          )}
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex gap-6 xl:gap-8 text-sm font-medium items-center flex-1 justify-center">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`transition-all duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-blue-200 after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all after:duration-300 flex items-center gap-1 ${
                    link.highlight
                      ? 'text-blue-200 hover:text-blue-100 bg-blue-600/50 px-3 py-1.5 rounded-full'
                      : 'text-blue-100 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={isMenuOpen ? "Close main menu" : "Open main menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Book Service Button (Desktop) */}
        <Link to="/bookservice" className="hidden lg:block shrink-0">
          <button className="bg-white hover:bg-blue-50 px-6 xl:px-8 py-2.5 rounded-full text-sm font-semibold text-blue-700 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5">
            Book Service
          </button>
        </Link>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-blue-800 border-t border-blue-600 shadow-xl animate-slide-down">
          <div className="flex flex-col py-4 px-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`transition-colors py-3 text-base font-medium border-b border-blue-600/50 last:border-0 flex items-center gap-3 ${
                    link.highlight
                      ? 'text-yellow-200 hover:text-yellow-100'
                      : 'text-white hover:text-blue-200'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {link.name}
                </Link>
              );
            })}
            {/* Book Service Button (Mobile) */}
            <Link to="/bookservice" onClick={closeMenu} className="mt-3">
              <button className="w-full bg-white hover:bg-blue-50 px-6 py-3 rounded-full text-sm font-semibold text-blue-700 transition-all duration-300 shadow-md">
                Book Service
              </button>
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.25s ease-out;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;