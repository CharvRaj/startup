import React from 'react';
import { DISPLAY_CATEGORIES } from '@/lib/servicesCatalog';

interface CategoryScrollerProps {
  selectedCategory: string; // 'All' or filterTag
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export function CategoryScroller({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}: CategoryScrollerProps) {
  return (
    <div id="categories-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
      {/* Scrollable Container */}
      <div
        className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {DISPLAY_CATEGORIES.map((cat) => {
          const isSelected =
            cat.id === 'all'
              ? selectedCategory === 'All'
              : selectedCategory === cat.filterTag;

          const count =
            cat.id === 'all'
              ? categoryCounts['All']
              : categoryCounts[cat.filterTag || ''];

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id === 'all' ? 'All' : cat.filterTag || 'All')}
              className={`snap-start group flex-shrink-0 flex flex-col items-center p-2.5 sm:p-3 rounded-2xl transition-all duration-300 border text-center ${
                isSelected
                  ? 'scale-105 shadow-md'
                  : 'hover:-translate-y-0.5 hover:shadow-xs hover:border-[#C7B299]'
              }`}
              style={{
                background: isSelected ? '#FFF8ED' : '#FFFFFF',
                borderColor: isSelected ? '#8C6754' : '#E6DDDA',
                minWidth: '100px',
              }}
              aria-pressed={isSelected}
            >
              {/* Thumbnail with realistic beauty photography */}
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2 transition-transform duration-300 ${
                  isSelected ? 'ring-2 ring-[#8C6754] ring-offset-2' : 'group-hover:scale-105'
                }`}
                style={{ background: '#F4F2F0' }}
              >
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute('src', '/images/larana-glow-refresh.png');
                  }}
                />
              </div>

              {/* Category Label */}
              <span
                className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors line-clamp-1 ${
                  isSelected ? 'text-[#2D1F1D] font-bold' : 'text-[#4A3B32]'
                }`}
              >
                {cat.label}
              </span>

              {/* Service count badge */}
              {count !== undefined && count > 0 && (
                <span
                  className="text-[10px] mt-0.5 px-1.5 py-0.2 rounded-full font-medium"
                  style={{
                    color: isSelected ? '#8C6754' : '#5A4A42',
                  }}
                >
                  {count} {count === 1 ? 'service' : 'services'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
