import React from 'react';
import { Star, Clock, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { CatalogService } from '@/lib/servicesCatalog';
import { useWishlistStore } from '@/stores/wishlist';
import { useToast } from '@/hooks/use-toast';

interface ServiceCardProps {
  service: CatalogService;
  onViewDetails: (service: CatalogService) => void;
  onBookNow: (service: CatalogService) => void;
}

export function ServiceCard({ service, onViewDetails, onBookNow }: ServiceCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toast } = useToast();
  const wishlisted = isInWishlist(service.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWishlist(service.id);
    toast({
      title: added ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist',
      description: `${service.name} has been ${added ? 'added to' : 'removed from'} your wishlist.`,
    });
  };

  return (
    <div
      onClick={() => onViewDetails(service)}
      className="group cursor-pointer rounded-3xl overflow-hidden border shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
      style={{
        background: '#FFFFFF',
        borderColor: '#E6DDDA',
      }}
    >
      {/* Service Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FFF8ED]">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLElement).setAttribute('src', '/images/larana-glow-refresh.png');
          }}
        />

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={handleWishlist}
          aria-label="Save to Wishlist"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md transition-all active:scale-90 hover:scale-110 z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-[#8C6754] text-[#8C6754]' : 'text-slate-400 hover:text-[#8C6754]'
            }`}
          />
        </button>

        {/* Category Pill (Top Left) */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide shadow-xs backdrop-blur-md"
          style={{
            background: 'rgba(255, 248, 237, 0.95)',
            color: '#4A3B32',
            border: '1px solid rgba(199, 178, 153, 0.5)',
          }}
        >
          {service.displayCategory}
        </div>

        {/* Discount Badge if available */}
        {service.discountPercent && service.discountPercent > 0 && (
          <div
            className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs"
            style={{ background: '#8C6754' }}
          >
            {service.discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-left">
        <div>
          {/* Rating and Duration Metadata */}
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1 font-semibold" style={{ color: '#4A3B32' }}>
              <Star className="w-3.5 h-3.5 fill-[#C7B299] text-[#C7B299]" />
              <span>{service.rating.toFixed(1)}</span>
              <span className="text-[#8C6754]/80 text-[11px]">({service.reviewCount})</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: '#5A4A42' }}>
              <Clock className="w-3 h-3 text-[#8C6754]" />
              <span>{service.durationMinutes} mins</span>
            </div>
          </div>

          {/* Service Name */}
          <h3
            className="text-base sm:text-lg font-bold group-hover:text-[#8C6754] transition-colors line-clamp-1 mb-1.5"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#2D1F1D',
            }}
          >
            {service.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#5A4A42' }}>
            {service.description}
          </p>
        </div>

        {/* Pricing & Action Buttons */}
        <div className="pt-4 mt-3 border-t border-[#E6DDDA]/60">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs font-medium" style={{ color: '#8C6754' }}>Price: </span>
              <span className="text-lg font-bold tracking-tight" style={{ color: '#2D1F1D' }}>
                ₹{service.price}
              </span>
              {service.originalPrice && service.originalPrice > service.price && (
                <span className="ml-1.5 text-xs line-through" style={{ color: '#9B8E85' }}>
                  ₹{service.originalPrice}
                </span>
              )}
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(service);
              }}
              className="text-xs font-semibold hover:underline"
              style={{ color: '#8C6754' }}
            >
              Details
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookNow(service);
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #4A3B32 0%, #2D1F1D 100%)',
              }}
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
