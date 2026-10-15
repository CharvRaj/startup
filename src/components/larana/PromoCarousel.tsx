import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PromotionalBanner, fetchActivePromotionalBanners } from '@/lib/banners';

export function PromoCarousel() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadBanners = async () => {
    try {
      const data = await fetchActivePromotionalBanners();
      setBanners(data);
    } catch (e) {
      console.error('Failed to load promotional banners:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();

    const handleUpdate = () => {
      loadBanners();
    };

    window.addEventListener('larana-banners-updated', handleUpdate);
    return () => window.removeEventListener('larana-banners-updated', handleUpdate);
  }, []);

  const handlePrev = () => {
    if (banners.length === 0) return;
    const nextIdx = (currentIndex - 1 + banners.length) % banners.length;
    setCurrentIndex(nextIdx);
    scrollToCard(nextIdx);
  };

  const handleNext = () => {
    if (banners.length === 0) return;
    const nextIdx = (currentIndex + 1) % banners.length;
    setCurrentIndex(nextIdx);
    scrollToCard(nextIdx);
  };

  const scrollToCard = (index: number) => {
    if (!scrollContainerRef.current) return;
    const cards = scrollContainerRef.current.children;
    if (cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-[#F4F2F0]">
        <div className="container-custom max-w-7xl mx-auto px-4 flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#8C6754]" />
        </div>
      </section>
    );
  }

  // Graceful fallback if no active banners
  if (banners.length === 0) {
    return null;
  }

  return (
    <section
      id="promotions-carousel"
      className="py-10 sm:py-14 border-t border-b overflow-hidden"
      style={{
        background: '#F4F2F0',
        borderColor: '#E6DDDA',
      }}
    >
      <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Carousel Header & Controls */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <span
              className="text-xs uppercase tracking-[0.16em] font-semibold"
              style={{ color: '#8C6754' }}
            >
              Curated Highlights
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold mt-1"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#2D1F1D',
              }}
            >
              Featured Seasonal Moments
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              style={{
                background: '#FFFFFF',
                borderColor: '#E6DDDA',
                color: '#4A3B32',
              }}
              aria-label="Previous promotional card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
              style={{
                background: '#FFFFFF',
                borderColor: '#E6DDDA',
                color: '#4A3B32',
              }}
              aria-label="Next promotional card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Row (3 visible on desktop) */}
        <div
          ref={scrollContainerRef}
          className="grid grid-flow-col auto-cols-[85%] sm:auto-cols-[48%] lg:auto-cols-[calc(33.333%-1rem)] gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              onClick={() => {
                if (banner.ctaLink) {
                  if (banner.ctaLink.startsWith('/#')) {
                    const id = banner.ctaLink.replace('/#', '');
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    navigate(banner.ctaLink);
                  }
                }
              }}
              className="snap-start group cursor-pointer rounded-3xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-400 flex flex-col justify-between"
              style={{
                background: '#FFFFFF',
                borderColor: '#E6DDDA',
              }}
            >
              {/* Realistic Beauty Treatment Image */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#FFF8ED]">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Promotional Badge */}
                {banner.badge && (
                  <div
                    className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide shadow-sm backdrop-blur-md"
                    style={{
                      background: 'rgba(255, 248, 237, 0.95)',
                      color: '#4A3B32',
                      border: '1px solid rgba(199, 178, 153, 0.5)',
                    }}
                  >
                    {banner.badge}
                  </div>
                )}
              </div>

              {/* Card Content Area */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between text-left">
                <div>
                  <h3
                    className="text-lg sm:text-xl font-bold mb-2 group-hover:text-[#8C6754] transition-colors"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: '#2D1F1D',
                    }}
                  >
                    {banner.title}
                  </h3>
                  <p
                    className="text-xs sm:text-sm leading-relaxed line-clamp-2"
                    style={{ color: '#5A4A42' }}
                  >
                    {banner.subtitle}
                  </p>
                </div>

                {/* Card CTA */}
                <div className="pt-4 mt-3 border-t border-[#E6DDDA]/60 flex items-center justify-between text-xs sm:text-sm font-semibold" style={{ color: '#8C6754' }}>
                  <span>{banner.ctaLabel || 'Discover More'}</span>
                  <div className="w-8 h-8 rounded-full bg-[#FFF8ED] border border-[#E6DDDA] flex items-center justify-center group-hover:bg-[#8C6754] group-hover:text-white transition-all">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center items-center gap-1.5 mt-5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                scrollToCard(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === i ? 'w-6 bg-[#8C6754]' : 'w-1.5 bg-[#E6DDDA] hover:bg-[#C7B299]'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
