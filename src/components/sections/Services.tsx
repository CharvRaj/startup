import { useState, useEffect, useRef, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SilhouetteService {
  title: string;
  tagline: string;
  shape: 'flower' | 'arch' | 'clover' | 'rounded-square';
  image: string;
  category: string;
}

const SILHOUETTE_CATEGORIES: SilhouetteService[] = [
  {
    title: 'Facials & Peels',
    tagline: 'Gentle, restorative skincare',
    shape: 'flower',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
    category: 'Skin & Facial',
  },
  {
    title: 'Makeup Artistry',
    tagline: 'Framing your beauty',
    shape: 'arch',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    category: 'Bridal',
  },
  {
    title: 'Lashes & Brows',
    tagline: 'Day-to-night glam',
    shape: 'clover',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    category: 'Party Glam',
  },
  {
    title: 'Pedicure & Foot Care',
    tagline: 'Pure soothing relief',
    shape: 'rounded-square',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80',
    category: 'Doorstep Packages',
  },
  {
    title: 'Spa & Moroccan Rituals',
    tagline: 'Deep holistic wellness',
    shape: 'arch',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
    category: 'Hair & Spa',
  },
  {
    title: 'Royal Bridal Shringar',
    tagline: 'Timeless heritage elegance',
    shape: 'flower',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    category: 'Bridal Suite',
  },
  {
    title: 'Henna & Mehndi Art',
    tagline: 'Dark-stain organic bridal henna',
    shape: 'clover',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    category: 'Mehndi Art',
  },
  {
    title: 'Hair Spa & Keratin',
    tagline: 'Silky smooth blowout therapy',
    shape: 'arch',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
    category: 'Hair & Spa',
  },
  {
    title: '24K Gold Radiance',
    tagline: 'Instant luminous bridal glow',
    shape: 'flower',
    image: 'https://images.unsplash.com/photo-1583001809809-a26e75f03606?w=600&q=80',
    category: 'Facials & Skincare',
  },
  {
    title: 'Doorstep VIP Salon',
    tagline: 'Luxury pampering at your doorstep',
    shape: 'rounded-square',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
    category: 'Doorstep Packages',
  },
];

export function Services() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const total = SILHOUETTE_CATEGORIES.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const [visibleCards, setVisibleCards] = useState(() => {
    if (typeof window === 'undefined') return 5;
    if (window.innerWidth >= 1024) return 5;
    if (window.innerWidth >= 640) return 3;
    return 2;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setVisibleCards(5);
      else if (window.innerWidth >= 640) setVisibleCards(3);
      else setVisibleCards(2);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance through services from right to left with a 1-second transition
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleCategoryClick = (title: string) => {
    toast({
      title: `${title} ✨`,
      description: `Select your preferred date and time to book ${title}.`,
    });
    const el = document.getElementById('booking');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#booking');
    }
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) nextSlide();
    else if (diff < -40) prevSlide();
    touchStartX.current = null;
  };

  return (
    <>
      <style>{`
        @keyframes greenSweepRTL {
          0% {
            transform: translateX(140%) skewX(-15deg);
            opacity: 0;
          }
          40% {
            opacity: 0.9;
          }
          60% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(-140%) skewX(-15deg);
            opacity: 0;
          }
        }
        .animate-green-sweep {
          animation: greenSweepRTL 1000ms cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        @keyframes greenLightPulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.4), 0 0 20px rgba(16, 185, 129, 0.2);
            opacity: 0.85;
          }
          50% {
            box-shadow: 0 0 18px rgba(16, 185, 129, 0.7), 0 0 35px rgba(16, 185, 129, 0.4);
            opacity: 1;
          }
        }
        .animate-green-pulse {
          animation: greenLightPulse 2000ms ease-in-out infinite;
        }
      `}</style>

      {/* ── Services Section ── */}
      <section
        id="services"
        className="section-padding relative overflow-hidden transition-colors duration-300"
        style={{
          background: 'linear-gradient(180deg, var(--background) 0%, hsl(var(--secondary) / 0.4) 100%)',
        }}
      >
        {/* Subtle Green Botanical Glow Line Effect at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="container-custom relative z-10">
          {/* ── 1. Header with Organic Intro ── */}
          <div className="text-center mb-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tailored Beauty Experiences</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              From deep restorative facials to delicate lash lifts and royal bridal styling, our services are designed to elevate your natural radiance. Every treatment is tailored, every visit — an experience.
            </p>
          </div>

          {/* ── 2. Carousel / Slider of Organic Silhouette Services ── */}
          <div
            className="relative mb-14 select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Desktop Left / Right Navigation Buttons */}
            <button
              onClick={prevSlide}
              aria-label="Previous service"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/85 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-emerald-500 hover:text-white transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next service"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/85 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-emerald-500 hover:text-white transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Edge fades for smooth visual blending */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-background via-background/60 to-transparent z-10" />

            {/* Carousel Overflow Wrapper */}
            <div className="overflow-hidden py-4 px-1">
              <div
                className="flex items-center transition-transform ease-out"
                style={{
                  // 1 second smooth glide right to left
                  transitionDuration: '1000ms',
                  transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
                  transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                }}
              >
                {/* Tripled list to enable seamless continuous visual sliding */}
                {[...SILHOUETTE_CATEGORIES, ...SILHOUETTE_CATEGORIES, ...SILHOUETTE_CATEGORIES].map((item, idx) => {
                  const actualIndex = idx % total;
                  const isActive = actualIndex === currentIndex;

                  return (
                    <div
                      key={`${item.title}-${idx}`}
                      onClick={() => handleCategoryClick(item.title)}
                      className="group cursor-pointer flex-shrink-0 flex flex-col items-center text-center p-3 transition-all duration-700 ease-out relative"
                      style={{
                        width: `${100 / visibleCards}%`,
                      }}
                    >
                      {/* Active green light pool aura directly under current service */}
                      <div
                        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-700 ${
                          isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                        }`}
                      >
                        <div className="w-24 h-6 rounded-full bg-emerald-500/35 blur-md" />
                      </div>

                      {/* Silhouette Frame */}
                      <div
                        className={`relative w-28 h-28 sm:w-32 sm:h-32 mb-3 flex items-center justify-center transition-transform duration-500 ${
                          isActive ? 'scale-105' : 'group-hover:scale-105'
                        }`}
                      >
                        {/* Glowing background ring */}
                        <div
                          className={`absolute inset-0 rounded-full transition-all duration-500 ${
                            isActive
                              ? 'bg-gradient-to-br from-emerald-500/30 to-teal-400/20 blur-lg scale-110'
                              : 'bg-gradient-to-br from-emerald-500/10 to-rose-400/10 blur-md group-hover:scale-110'
                          }`}
                        />

                        {/* Shaped Image Frame */}
                        <div
                          className={`relative w-full h-full overflow-hidden shadow-md transition-all duration-500 ${
                            isActive
                              ? 'border-2 border-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
                              : 'border-2 border-stone-200/80 dark:border-stone-700/60 group-hover:border-emerald-400/60'
                          } ${
                            item.shape === 'flower'
                              ? 'rounded-[38%_62%_63%_37%_/_41%_44%_56%_59%]'
                              : item.shape === 'arch'
                              ? 'rounded-t-full rounded-b-2xl'
                              : item.shape === 'clover'
                              ? 'rounded-[45%_55%_48%_52%_/_54%_46%_54%_46%]'
                              : 'rounded-3xl'
                          }`}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ${
                              isActive ? 'scale-110' : 'group-hover:scale-110'
                            }`}
                            loading="lazy"
                          />
                          <div
                            className={`absolute inset-0 transition-colors duration-300 ${
                              isActive ? 'bg-transparent' : 'bg-black/10 group-hover:bg-transparent'
                            }`}
                          />

                          {/* 1-second Right-to-Left light sweep effect on current service */}
                          {isActive && (
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                              <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-green-sweep" />
                            </div>
                          )}
                        </div>

                        {/* Active sparkle badge */}
                        {isActive && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-bounce">
                            <Sparkles className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Title & Tagline */}
                      <h4
                        className={`font-display font-bold text-sm transition-colors duration-300 ${
                          isActive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-foreground group-hover:text-primary'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        {item.tagline}
                      </p>

                      {/* Little bit of green light bar directly under current active service */}
                      <div className="mt-2.5 h-1 flex items-center justify-center">
                        <div
                          className={`h-1 rounded-full transition-all duration-700 ${
                            isActive
                              ? 'w-10 bg-emerald-500 shadow-[0_0_10px_#10B981] animate-green-pulse'
                              : 'w-0 bg-transparent'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Dedicated Green Light Bar Below the Services ── */}
            <div className="relative mt-2 max-w-2xl mx-auto px-4">
              {/* Subtle ambient green light baseline */}
              <div className="relative w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-full overflow-hidden">
                {/* 1s right-to-left travelling green light sweep beam */}
                <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-green-sweep" />
              </div>

              {/* Little bit green light floor glow pool */}
              <div className="w-3/4 mx-auto h-3 -mt-1 bg-emerald-500/20 blur-md rounded-full pointer-events-none animate-green-pulse" />

              {/* Navigation Indicator Dots with Green Light */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {SILHOUETTE_CATEGORIES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    aria-label={`Go to service ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === currentIndex
                        ? 'w-6 bg-emerald-500 shadow-[0_0_8px_#10b981]'
                        : 'w-1.5 bg-emerald-500/25 hover:bg-emerald-500/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Before / After Visual Transformations Slider ── */}
          <div className="pt-8 border-t border-border/60">
            <div className="text-center mb-10">
              <div className="section-pill">
                <Star className="w-4 h-4 text-emerald-500" />
                <span>Verified Results</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 text-foreground">
                Before & After <span className="gradient-text">Makeovers</span>
              </h2>
              <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                Real customer transformations crafted with precision and personalized artistry
              </p>
            </div>
            <BeforeAfterGrid />
          </div>
        </div>
      </section>
    </>
  );
}

// ── Before/After slider grid ──────────────────────────────────────────────────
function BeforeAfterGrid() {
  const pairs = [
    {
      before: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80',
      after: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
      label: 'Bridal Transformation',
    },
    {
      before: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
      after: 'https://images.unsplash.com/photo-1596704017254-9b121068ec31?w=600&q=80',
      label: 'Hair Makeover',
    },
    {
      before: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
      after: 'https://images.unsplash.com/photo-1583001809809-a26e75f03606?w=600&q=80',
      label: 'Skin Glow Facial',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {pairs.map((pair, i) => (
        <BeforeAfterCard key={i} {...pair} />
      ))}
    </div>
  );
}

function BeforeAfterCard({ before, after, label }: { before: string; after: string; label: string }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  return (
    <div
      className="group relative overflow-hidden rounded-3xl select-none shadow-md cursor-col-resize border border-border"
      style={{
        background: '#000',
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onTouchMove={(e) => {
        const t = e.touches[0];
        handleMove(t.clientX, e.currentTarget.getBoundingClientRect());
      }}
    >
      {/* AFTER image (base) */}
      <img src={after} alt="After" className="w-full h-72 object-cover" draggable={false} />

      {/* BEFORE image (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img src={before} alt="Before" className="w-full h-72 object-cover" draggable={false} />
        <div className="absolute inset-0 bg-black/10" />
        <div
          className="absolute top-3 left-3 text-white text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        >
          Before
        </div>
      </div>

      {/* AFTER label */}
      <div
        className="absolute top-3 right-3 text-white text-[11px] px-2.5 py-0.5 rounded-full font-semibold shadow-sm"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}
      >
        After
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 flex flex-col items-center justify-center z-10 pointer-events-none"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-0.5 h-full bg-emerald-400" />
        <div
          className="absolute w-8 h-8 rounded-full bg-white shadow-xl flex items-center justify-center top-1/2 -translate-y-1/2 border-2 border-emerald-500"
        >
          <svg width="14" height="12" viewBox="0 0 18 14" fill="none">
            <path d="M5 7H1M1 7L4 4M1 7L4 10" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 7H17M17 7L14 4M17 7L14 10" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
        <p className="text-white font-semibold text-xs text-center">{label}</p>
        <p className="text-[10px] text-center mt-0.5 text-white/60">Drag to compare</p>
      </div>
    </div>
  );
}
