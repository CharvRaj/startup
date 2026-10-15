import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CatalogService } from '@/lib/servicesCatalog';
import { ServiceCard } from './ServiceCard';

interface PopularServicesProps {
  services: CatalogService[];
  onViewDetails: (service: CatalogService) => void;
  onBookNow: (service: CatalogService) => void;
  onViewAllClick: () => void;
}

export function PopularServices({
  services,
  onViewDetails,
  onBookNow,
  onViewAllClick,
}: PopularServicesProps) {
  // Curate popular services (top 4 to 8 services)
  const popularList = services.filter(s => s.isPopular).slice(0, 4);
  const displayList = popularList.length >= 3 ? popularList : services.slice(0, 4);

  if (displayList.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8 text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider mb-2"
            style={{
              background: '#FFE7D9',
              color: '#4A3B32',
              border: '1px solid rgba(199, 178, 153, 0.4)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C7B299]" />
            Trending at Home
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#2D1F1D',
            }}
          >
            Popular Beauty Services
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4A42] mt-1">
            Most-requested treatments performed by verified salon specialists
          </p>
        </div>

        {/* View All Services Link */}
        <button
          onClick={onViewAllClick}
          className="text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors hover:underline flex-shrink-0"
          style={{ color: '#8C6754' }}
        >
          <span>View All Services ({services.length})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Responsive Grid (4 cards on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {displayList.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onViewDetails={onViewDetails}
            onBookNow={onBookNow}
          />
        ))}
      </div>
    </div>
  );
}
