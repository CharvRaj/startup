import React from 'react';
import { CatalogService } from '@/lib/servicesCatalog';
import { ServiceCard } from './ServiceCard';
import { SearchX, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServiceGridProps {
  services: CatalogService[];
  activeCategory: string;
  searchQuery: string;
  onViewDetails: (service: CatalogService) => void;
  onBookNow: (service: CatalogService) => void;
  onResetFilters: () => void;
}

export function ServiceGrid({
  services,
  activeCategory,
  searchQuery,
  onViewDetails,
  onBookNow,
  onResetFilters,
}: ServiceGridProps) {
  return (
    <div id="catalogue-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header with Title and Filtering Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 text-left">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#2D1F1D',
            }}
          >
            {activeCategory === 'All' ? 'Complete Beauty Catalogue' : activeCategory}
          </h2>
          <p className="text-xs sm:text-sm text-[#5A4A42] mt-1">
            {searchQuery ? (
              <span>
                Showing results matching <span className="font-semibold text-[#2D1F1D]">"{searchQuery}"</span> ({services.length} {services.length === 1 ? 'treatment' : 'treatments'})
              </span>
            ) : (
              <span>
                Explore all verified doorstep treatments ({services.length} available)
              </span>
            )}
          </p>
        </div>

        {/* Clear Filters button if filtering active */}
        {(activeCategory !== 'All' || searchQuery) && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors hover:bg-white"
            style={{
              borderColor: '#E6DDDA',
              color: '#8C6754',
              background: '#FFF8ED',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      {/* Grid or Empty State */}
      {services.length === 0 ? (
        <div
          className="rounded-3xl border p-12 text-center max-w-md mx-auto my-8 shadow-xs"
          style={{
            background: '#FFFFFF',
            borderColor: '#E6DDDA',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#FFF8ED', border: '1px solid #E6DDDA' }}
          >
            <SearchX className="w-6 h-6 text-[#8C6754]" />
          </div>
          <h3
            className="text-lg font-bold mb-1"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#2D1F1D',
            }}
          >
            No Treatments Found
          </h3>
          <p className="text-xs sm:text-sm text-[#5A4A42] mb-5 leading-relaxed">
            We couldn't find any beauty services matching your search or category filter. Try clearing your filters or searching for terms like "facial", "waxing", or "hair".
          </p>
          <Button
            onClick={onResetFilters}
            className="h-10 text-xs font-bold text-white rounded-xl px-5"
            style={{
              background: 'linear-gradient(135deg, #4A3B32 0%, #2D1F1D 100%)',
            }}
          >
            Reset Filters & View All
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewDetails={onViewDetails}
              onBookNow={onBookNow}
            />
          ))}
        </div>
      )}
    </div>
  );
}
