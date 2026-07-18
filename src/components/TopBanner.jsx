import React from "react";
import { Link } from "react-router-dom";
import { Gift, Clock, Tag } from "lucide-react";

export function TopBanner() {
  return (
    <Link to="/free-wheel-service" className="block group" aria-label="Book a free wheel service every Saturday">
      <div className="bg-white text-blue-700 text-center py-3 relative z-40  cursor-pointer">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            {/* Gift Icon */}
            <div className="bg-blue-600 p-1 rounded-full" aria-hidden="true">
              <Gift className="w-3.5 h-3.5 text-white" />
            </div>
            
            {/* Main Text */}
            <span className="font-bold text-sm sm:text-base tracking-wide text-blue-800">
              FREE WHEEL SERVICE EVERY SATURDAY
            </span>
            
            {/* Time */}
            <div className="flex items-center gap-1 text-xs sm:text-sm bg-blue-100 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-blue-600" aria-hidden="true" />
              <span className="text-blue-700 font-medium">10AM - 4PM</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default TopBanner;