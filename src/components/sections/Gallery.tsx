import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, X, ChevronLeft, ChevronRight, ZoomIn, Play, Pause, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  display_order: number;
}

// Curated high-resolution authentic Indian bridal portraits (No broken URLs)
const defaultGalleryImages: GalleryImage[] = [
  {
    id: 'b1',
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=85',
    title: 'Radiant Heritage Bridal Glam',
    subtitle: 'Classic Royal Crimson & Kundan Art',
    display_order: 1,
  },
  {
    id: 'b2',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85',
    title: 'Rajasthani Royal Bride',
    subtitle: 'Heritage Matha Patti & Traditional Gold Nath',
    display_order: 2,
  },
  {
    id: 'b3',
    url: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=1200&q=85',
    title: 'Rose Gold & Pastel Reception Glam',
    subtitle: 'Sculpted Luminous Contour & Soft Glam Eyes',
    display_order: 3,
  },
  {
    id: 'b4',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=85',
    title: 'Traditional Sindoor & Red Lehenga',
    subtitle: 'Timeless Camera-Ready Velvet Elegance',
    display_order: 4,
  },
  {
    id: 'b5',
    url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=85',
    title: 'Flawless HD Airbrush Bridal Glow',
    subtitle: '16-Hour Sweatproof Dewy Formulation',
    display_order: 5,
  },
  {
    id: 'b6',
    url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1200&q=85',
    title: 'Heritage Henna & Shringar',
    subtitle: '100% Organic Henna Stains & Bridal Bangles',
    display_order: 6,
  },
  {
    id: 'b7',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=85',
    title: 'Sangeet & Gala Evening Makeover',
    subtitle: 'Smokey Kohl Eye Art & Voluminous Curls',
    display_order: 7,
  },
  {
    id: 'b8',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=85',
    title: 'Golden Hour Wedding Ceremony Look',
    subtitle: 'Subtle Highlight & Royal Velvet Draping',
    display_order: 8,
  },
  {
    id: 'b9',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=85',
    title: 'Minimalist Elegance & Nude Glam',
    subtitle: 'Feathered Brows & Velvety Berry Lips',
    display_order: 9,
  },
  {
    id: 'b10',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=85',
    title: 'Regal Temple Jewelry Bridal Style',
    subtitle: 'Traditional Antique Gold & Sculpted Look',
    display_order: 10,
  },
];

export function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(defaultGalleryImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [sweepKey, setSweepKey] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch from Supabase while maintaining reliable fallback
  useEffect(() => {
    fetchGalleryImages();
    const sub = supabase.channel('gallery_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_images' }, fetchGalleryImages)
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase.from('gallery_images').select('*').order('display_order');
      if (!error && data && data.length > 0) {
        // Filter out any broken or empty URLs, replace with default if needed
        const validData = data.filter(img => img.url && !img.url.includes('undefined') && !img.url.includes('null'));
        if (validData.length >= 3) {
          setGalleryImages(validData);
        }
      }
    } catch {
      // keep defaults
    }
  };

  const total = galleryImages.length;

  // Navigation handlers
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % total);
    setSweepKey(prev => prev + 1);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + total) % total);
    setSweepKey(prev => prev + 1);
  }, [total]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setSweepKey(prev => prev + 1);
  }, []);

  // Preload next and prev images for silky 60fps transitions
  useEffect(() => {
    if (total === 0) return;
    const next1 = (currentIndex + 1) % total;
    const next2 = (currentIndex + 2) % total;
    const prev1 = (currentIndex - 1 + total) % total;
    [next1, next2, prev1].forEach(idx => {
      const img = new Image();
      img.src = galleryImages[idx].url;
    });
  }, [currentIndex, galleryImages, total]);

  // Continuous Right-to-Left Auto-Advance Timer (3.5 seconds)
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !isPlaying || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goToNext();
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goToNext, isPlaying, isHovered]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const deltaX = touchStartX.current - touchEndX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        // Swiped left -> move to next (right-to-left motion)
        goToNext();
      } else {
        // Swiped right -> move to prev
        goToPrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLightboxIndex(prev => prev === null ? null : (prev + 1) % total);
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev === null ? null : (prev - 1 + total) % total);
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, total]);

  // Circular offset calculation for positioning slides
  const getOffset = (index: number) => {
    let diff = index - currentIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <section
      id="gallery"
      className="section-padding relative overflow-hidden transition-colors duration-300 border-t border-border/40"
      style={{
        background: 'linear-gradient(180deg, var(--background) 0%, hsl(var(--secondary) / 0.25) 100%)',
      }}
    >
      {/* Signature Royal Spotlight Sweep Keyframe Definition */}
      <style>{`
        @keyframes royalSpotlightSweep {
          0% {
            transform: translateX(-150%) skewX(-20deg);
            opacity: 0;
          }
          30% {
            opacity: 0.55;
          }
          60% {
            opacity: 0.8;
          }
          100% {
            transform: translateX(250%) skewX(-20deg);
            opacity: 0;
          }
        }
        .animate-royal-sweep {
          animation: royalSpotlightSweep 1050ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Subtle Warm Ambient Top Highlight Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E27D6B]/40 to-transparent" />

      <div className="container-custom relative z-10">

        {/* ── Section Header (Per Specification #5) ── */}
        <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#E27D6B]/10 border border-[#E27D6B]/20 rounded-full px-4 py-1.5 mb-4 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#C75D4D]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-[#C75D4D] dark:text-[#E27D6B]">
              The Bridal Spotlight
            </span>
          </div>

          {/* Heading: "Beauty" in espresso-brown, "Gallery" in coral-to-soft-peach */}
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="text-[#2A1810] dark:text-stone-100">Beauty </span>
            <span className="bg-gradient-to-r from-[#C75D4D] via-[#D97768] to-[#F29F8D] bg-clip-text text-transparent">
              Gallery
            </span>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Explore our portfolio of stunning transformations and beauty creations
          </p>
        </div>

        {/* ── CINEMATIC CAROUSEL WRAPPER ── */}
        <div
          className="relative w-full overflow-hidden select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Edge Gradient Fades for depth */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 md:w-40 bg-gradient-to-r from-background via-background/60 to-transparent z-40" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 md:w-40 bg-gradient-to-l from-background via-background/60 to-transparent z-40" />

          {/* Carousel Stage / Track */}
          <div className="relative w-full h-[460px] sm:h-[530px] md:h-[610px] lg:h-[650px] flex items-center justify-center">
            {galleryImages.map((image, index) => {
              const diff = getOffset(index);
              const isCenter = diff === 0;
              const isImmediatePrev = diff === -1;
              const isImmediateNext = diff === 1;
              const isVisible = Math.abs(diff) <= 2;

              if (!isVisible) return null;

              // Responsive translation multiplier
              // Offset percentage: desktop is 72%, mobile is 82%
              const xPercent = diff * 74;

              // Visual styling per offset
              let scale = 1;
              let opacity = 1;
              let blurPx = 0;
              let zIndex = 30;

              if (isCenter) {
                scale = 1;
                opacity = 1;
                blurPx = 0;
                zIndex = 30;
              } else if (isImmediatePrev || isImmediateNext) {
                scale = 0.84;
                opacity = 0.68;
                blurPx = 2.5;
                zIndex = 20;
              } else {
                // outer preview (diff === 2 or -2)
                scale = 0.68;
                opacity = 0.25;
                blurPx = 4.5;
                zIndex = 10;
              }

              return (
                <div
                  key={image.id}
                  onClick={() => {
                    if (isCenter) {
                      setLightboxIndex(index);
                    } else if (diff === 1) {
                      goToNext();
                    } else if (diff === -1) {
                      goToPrev();
                    }
                  }}
                  className={`absolute top-1/2 left-1/2 transition-all duration-1000 ${
                    isCenter ? 'cursor-pointer' : 'cursor-pointer hover:opacity-85'
                  }`}
                  style={{
                    transform: `translate(calc(-50% + ${xPercent}%), -50%) scale(${scale})`,
                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    zIndex,
                    opacity,
                    filter: `blur(${blurPx}px)`,
                    width: 'clamp(280px, 44vw, 500px)',
                    height: 'clamp(380px, 54vw, 600px)',
                  }}
                >
                  {/* Card Container with 4:5 Aspect Ratio & Rounded Corners */}
                  <div
                    className={`relative w-full h-full rounded-[24px] sm:rounded-[28px] overflow-hidden transition-all duration-700 ${
                      isCenter
                        ? 'shadow-[0_25px_60px_-15px_rgba(201,149,108,0.35),0_15px_30px_-10px_rgba(42,24,16,0.3)] ring-2 ring-[#E27D6B]/40 dark:ring-amber-400/30'
                        : 'shadow-lg border border-border/40'
                    }`}
                    style={{ background: '#1C1512' }}
                  >
                    {/* The Bridal Image */}
                    <img
                      src={image.url}
                      alt={image.title}
                      className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                        isCenter ? 'scale-100 hover:scale-105' : 'scale-100'
                      }`}
                      loading={Math.abs(diff) <= 1 ? 'eager' : 'lazy'}
                    />

                    {/* Gradient Overlay for Cinematic Depth & Text Contrast */}
                    <div
                      className={`absolute inset-0 transition-opacity duration-700 ${
                        isCenter
                          ? 'bg-gradient-to-t from-black/85 via-black/20 to-black/10'
                          : 'bg-gradient-to-t from-black/70 via-black/40 to-transparent'
                      }`}
                    />

                    {/* ── "ROYAL SPOTLIGHT SWEEP" SHIMMER BEAM (Only on Active Center Card) ── */}
                    {isCenter && (
                      <div
                        key={sweepKey}
                        className="pointer-events-none absolute inset-0 z-20 rounded-[24px] sm:rounded-[28px] overflow-hidden"
                      >
                        <div
                          className="w-[50%] h-[250%] absolute -top-3/4 left-0 bg-gradient-to-r from-transparent via-amber-200/35 to-transparent animate-royal-sweep"
                        />
                      </div>
                    )}

                    {/* Center Spotlight Badge */}
                    {isCenter && (
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold shadow-sm">
                        <Crown className="w-3.5 h-3.5 text-amber-300" />
                        <span>Bridal Spotlight</span>
                      </div>
                    )}

                    {/* Fullscreen Magnify Trigger Icon on Center Card */}
                    {isCenter && (
                      <div className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white hover:scale-110 transition-transform">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    )}

                    {/* Center Card Title & Subtitle Overlay */}
                    {isCenter && (
                      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-20 text-white space-y-1">
                        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#F29F8D]">
                          Exclusive Makeover
                        </span>
                        <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold leading-tight drop-shadow-md">
                          {image.title}
                        </h3>
                        {image.subtitle && (
                          <p className="text-xs text-white/80 line-clamp-1 drop-shadow-sm font-light">
                            {image.subtitle}
                          </p>
                        )}
                        <div className="pt-2 flex items-center gap-1.5 text-[11px] text-white/60">
                          <span>Click to expand portrait</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ARROW NAVIGATION CONTROLS (Specification #7) ── */}
          <div className="flex items-center justify-between pointer-events-none absolute inset-y-0 left-4 right-4 sm:left-8 sm:right-8 z-40">
            <button
              onClick={goToPrev}
              aria-label="Previous bridal photograph"
              className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card/80 hover:bg-card text-foreground border border-border/80 shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
            >
              <ChevronLeft className="w-5 h-5 text-foreground group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={goToNext}
              aria-label="Next bridal photograph"
              className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card/80 hover:bg-card text-foreground border border-border/80 shadow-lg backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
            >
              <ChevronRight className="w-5 h-5 text-foreground group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ── PAGINATION & PLAY/PAUSE CONTROLS (Specification #7) ── */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {galleryImages.map((img, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={img.id}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Jump to bridal photo ${idx + 1}: ${img.title}`}
                  className={`transition-all duration-500 rounded-full ${
                    isActive
                      ? 'w-7 sm:w-8 h-2.5 bg-gradient-to-r from-[#C75D4D] to-[#E27D6B] shadow-sm shadow-[#C75D4D]/30'
                      : 'w-2.5 h-2.5 bg-border hover:bg-muted-foreground/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Autoplay status toggle button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(p => !p)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/60 bg-card/60 backdrop-blur-xs transition-colors"
              title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 text-[#C75D4D]" />
                  <span>Auto-advance (3.5s)</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-500" />
                  <span>Paused</span>
                </>
              )}
            </button>

            <span className="text-xs text-muted-foreground font-medium">
              {currentIndex + 1} / {total}
            </span>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL (Preserved & Enhanced) ── */}
      {lightboxIndex !== null && galleryImages[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in p-4 sm:p-6"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all hover:scale-105 z-50"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close fullscreen viewer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all hover:scale-105 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => prev === null ? null : (prev - 1 + total) % total);
            }}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Image Content */}
          <div
            className="max-w-4xl max-h-[92vh] flex flex-col items-center gap-3 select-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black">
              <img
                src={galleryImages[lightboxIndex].url}
                alt={galleryImages[lightboxIndex].title}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl animate-scale-in"
              />
            </div>

            <div className="text-center text-white pt-1">
              <h4 className="font-display text-lg sm:text-xl font-bold">
                {galleryImages[lightboxIndex].title}
              </h4>
              {galleryImages[lightboxIndex].subtitle && (
                <p className="text-xs sm:text-sm text-white/70 mt-0.5">
                  {galleryImages[lightboxIndex].subtitle}
                </p>
              )}
              <span className="inline-block mt-1 text-xs text-amber-300/80 font-medium">
                {lightboxIndex + 1} of {total}
              </span>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 overflow-x-auto max-w-full py-1 scrollbar-none px-4">
              {galleryImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setLightboxIndex(i)}
                  className={`flex-shrink-0 w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden transition-all border ${
                    i === lightboxIndex
                      ? 'border-[#E27D6B] ring-2 ring-[#E27D6B] scale-105'
                      : 'border-white/20 opacity-50 hover:opacity-85'
                  }`}
                >
                  <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Next button */}
          <button
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-all hover:scale-105 z-50"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(prev => prev === null ? null : (prev + 1) % total);
            }}
            aria-label="Next image"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>
      )}
    </section>
  );
}
