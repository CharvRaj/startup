import React from 'react';
import { Search, X } from 'lucide-react';

interface ServiceSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount?: number;
  totalCount?: number;
}

export function ServiceSearch({ query, onQueryChange, resultCount, totalCount }: ServiceSearchProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div
        className="relative flex items-center rounded-2xl bg-white border shadow-sm transition-all duration-300 focus-within:shadow-md focus-within:border-[#C7B299]"
        style={{
          borderColor: 'rgba(199, 178, 153, 0.6)',
          background: '#FFFFFF',
        }}
      >
        {/* Search Icon */}
        <div className="pl-4 pr-2 text-[#8C6754] flex-shrink-0">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search facial, waxing, hair spa, makeup..."
          className="w-full py-3 sm:py-3.5 pr-3 text-xs sm:text-sm bg-transparent outline-none placeholder:text-[#8C6754]/60 font-normal"
          style={{ color: '#2D1F1D' }}
          aria-label="Search beauty services"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="p-1.5 mr-2 rounded-full hover:bg-[#F4F2F0] text-[#5A4A42] hover:text-[#2D1F1D] transition-colors"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Matching counter badge */}
        {resultCount !== undefined && totalCount !== undefined && (
          <div
            className="mr-3 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap hidden sm:inline-block"
            style={{
              background: '#FFF8ED',
              color: '#8C6754',
              border: '1px solid #E6DDDA',
            }}
          >
            {resultCount} of {totalCount} Services
          </div>
        )}
      </div>
    </div>
  );
}
