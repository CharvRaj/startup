import React from 'react';
import { X, Star, Clock, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { CatalogService } from '@/lib/servicesCatalog';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/stores/wishlist';
import { useToast } from '@/hooks/use-toast';

interface ServiceDetailsModalProps {
  service: CatalogService | null;
  onClose: () => void;
  onBookNow: (service: CatalogService) => void;
}

export function ServiceDetailsModal({ service, onClose, onBookNow }: ServiceDetailsModalProps) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toast } = useToast();

  if (!service) return null;

  const wishlisted = isInWishlist(service.id);

  const handleWishlist = () => {
    const added = toggleWishlist(service.id);
    toast({
      title: added ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: `${service.name} has been ${added ? 'added to' : 'removed from'} your wishlist.`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border shadow-2xl flex flex-col text-left"
        style={{
          borderColor: '#E6DDDA',
          background: '#FFFFFF',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#2D1F1D] hover:bg-[#F4F2F0] transition-colors shadow-md border border-[#E6DDDA]"
          aria-label="Close service details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image & Gallery */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#FFF8ED]">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Badges on Hero Image */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide backdrop-blur-md"
                style={{
                  background: 'rgba(255, 248, 237, 0.95)',
                  color: '#4A3B32',
                  border: '1px solid rgba(199, 178, 153, 0.5)',
                }}
              >
                {service.displayCategory}
              </span>
              <h2
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-1 drop-shadow-md"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {service.name}
              </h2>
            </div>

            <button
              onClick={handleWishlist}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlisted ? 'fill-[#8C6754] text-[#8C6754]' : 'text-slate-400 hover:text-[#8C6754]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 space-y-6">
          
          {/* Metadata Row: Price, Duration, Rating */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF8ED] border border-[#E6DDDA]">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold" style={{ color: '#2D1F1D' }}>
                ₹{service.price}
              </span>
              {service.originalPrice && service.originalPrice > service.price && (
                <span className="text-sm line-through text-[#9B8E85]">
                  ₹{service.originalPrice}
                </span>
              )}
              {service.discountPercent && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-[#8C6754]">
                  {service.discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold" style={{ color: '#4A3B32' }}>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#8C6754]" />
                <span>{service.durationMinutes} Minutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-[#C7B299] text-[#C7B299]" />
                <span>{service.rating.toFixed(1)} ({service.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8C6754' }}>
              About This Treatment
            </h4>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#5A4A42' }}>
              {service.description}
            </p>
          </div>

          {/* What's Included */}
          {service.inclusions && service.inclusions.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#8C6754' }}>
                <Sparkles className="w-4 h-4" />
                What's Included
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.inclusions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm p-2.5 rounded-xl border"
                    style={{
                      background: '#F4F2F0',
                      borderColor: '#E6DDDA',
                      color: '#2D1F1D',
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#8C6754] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treatment Steps if available */}
          {service.steps && service.steps.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: '#8C6754' }}>
                Treatment Steps
              </h4>
              <div className="space-y-2.5">
                {service.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl border"
                    style={{ background: '#FFFFFF', borderColor: '#E6DDDA' }}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FFF8ED] border border-[#C7B299] text-[#8C6754] font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold" style={{ color: '#2D1F1D' }}>
                        {st.title}
                      </p>
                      <p className="text-xs text-[#5A4A42] mt-0.5">
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hygiene and Safety Guarantee */}
          <div
            className="p-4 rounded-2xl border flex items-center gap-3.5"
            style={{
              background: '#FFF8ED',
              borderColor: '#E6DDDA',
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#8C6754] text-white flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold" style={{ color: '#2D1F1D' }}>
                100% Sanitized & Sterile Guarantee
              </p>
              <p className="text-xs text-[#5A4A42]">
                Our certified aesthetician carries a sealed, single-use disposable toolkit with medical-grade antiseptic sanitization.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#E6DDDA] flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold border hover:bg-[#F4F2F0] transition-colors"
              style={{
                borderColor: '#E6DDDA',
                color: '#5A4A42',
              }}
            >
              Close
            </button>
            <Button
              onClick={() => {
                onClose();
                onBookNow(service);
              }}
              className="h-12 px-7 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #4A3B32 0%, #2D1F1D 100%)',
              }}
            >
              <span>Book This Service</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
