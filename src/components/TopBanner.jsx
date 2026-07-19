import React from "react";
import { Link } from "react-router-dom";
import { Gift, Clock } from "lucide-react";
import useSettings from "../hooks/useSettings";
import { formatPromotionHours } from '../admin/utils/formatHours';

export function TopBanner() {
  const { promotion, loading } = useSettings();

  // Nothing to show while we don't know the state yet, or if the admin has
  // disabled the promotion — this banner is 100% driven by Promotion
  // Settings, never General Business Hours.
  if (loading || !promotion || promotion.enabled === false) return null;

  const message = `${promotion.text || 'FREE WHEEL SERVICE AVAILABLE'} • ${formatPromotionHours(promotion)}`;

  // Repeat the message so the marquee loop has no visible seam
  const repeated = Array.from({ length: 6 }, () => message);

  return (
    <Link to="/free-wheel-service" className="block group" aria-label={`${message} — tap to book`}>
      <div className="bg-white text-blue-700 py-2.5 relative z-40 border-b border-blue-100 cursor-pointer">
        <div className="flex items-center">
          <div className="flex items-center gap-2 shrink-0 pl-4 pr-3">
            <div className="bg-blue-600 p-1 rounded-full shrink-0" aria-hidden="true">
              <Gift className="w-3.5 h-3.5 text-white" />
            </div>
            <Clock className="w-3.5 h-3.5 text-blue-500 hidden sm:block" aria-hidden="true" />
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="marquee-track flex whitespace-nowrap w-max">
              {repeated.map((text, i) => (
                <span key={i} className="font-bold text-sm sm:text-base tracking-wide text-blue-800 px-6">
                  {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track {
          animation: dgw-marquee 28s linear infinite;
          will-change: transform;
        }
        .group:hover .marquee-track {
          animation-play-state: paused;
        }
        @keyframes dgw-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
    </Link>
  );
}

export default TopBanner;
