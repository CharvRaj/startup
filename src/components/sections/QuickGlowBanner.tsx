import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface QuickGlowItem {
  id: string;
  title: string;
  discount: string;
  image?: string;
  isSpecialCoin?: boolean;
  filterName: string;
  badge: string;
}

const QUICK_GLOW_ITEMS: QuickGlowItem[] = [
  {
    id: 'qg-1',
    title: 'Instant Face Glow Clean-up',
    discount: 'UP TO 50% OFF',
    image: '/images/service-face.png',
    filterName: 'Face & Clean-up',
    badge: 'Popular',
  },
  {
    id: 'qg-2',
    title: 'Hydra Deep Pore Facial',
    discount: 'SPECIAL ₹1,499',
    image: '/images/service-facial.png',
    filterName: 'Facial Rituals',
    badge: 'Trending',
  },
  {
    id: 'qg-3',
    title: 'Organic Henna Art Hub',
    discount: 'STARTS AT ₹399',
    image: '/images/mehndi-minimal.jpg',
    filterName: 'Mehndi Art',
    badge: 'Organic',
  },
  {
    id: 'qg-4',
    title: 'Hair Keratin Silk Spa',
    discount: 'UP TO 40% OFF',
    image: '/images/service-hair.png',
    filterName: 'Hair & Styling',
    badge: 'Blowout',
  },
  {
    id: 'qg-5',
    title: 'Bridal Shringar HD Glow',
    discount: 'SAVE ₹1,500',
    image: '/images/category-bridal.jpg',
    filterName: 'Bridal Beauty',
    badge: 'Royal HD',
  },
  {
    id: 'qg-6',
    title: 'Milk & Honey Detan Pack',
    discount: 'UP TO 35% OFF',
    image: '/images/service-skincare.png',
    filterName: 'Skin Glow & Detan',
    badge: 'De-Tan',
  },
  {
    id: 'qg-7',
    title: 'Spa Pedicure & Gel Art',
    discount: 'UP TO 45% OFF',
    image: '/images/category-nails.jpg',
    filterName: 'Nails & Pedicure',
    badge: 'Gel Art',
  },
  {
    id: 'qg-8',
    title: 'Arabic Hand Henna Flow',
    discount: 'FLAT 30% OFF',
    image: '/images/mehndi-arabic.jpg',
    filterName: 'Mehndi Art',
    badge: 'Handcrafted',
  },
];

export function QuickGlowBanner() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Responsive items count
  const [visibleCards, setVisibleCards] = useState(4);

  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) setVisibleCards(2);
      else if (window.innerWidth < 1024) setVisibleCards(3);
      else setVisibleCards(4);
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const maxIndex = Math.max(0, QUICK_GLOW_ITEMS.length - visibleCards);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleCardClick = (item: QuickGlowItem) => {
    toast({
      title: `${item.title} ✨`,
      description: `Viewing ${item.discount} offer slots.`,
    });
    if (item.filterName.includes('Mehndi')) {
      navigate('/mehndi-service');
    } else {
      navigate('/doorstep-service');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  return (
    <section className="py-10 sm:py-14 overflow-hidden relative" style={{ background: '#FDF7F2' }}>
      <div className="container-custom">
        {/* Warm Ivory Deal Box */}
        <div
          className="rounded-3xl sm:rounded-[36px] p-6 sm:p-8 md:p-10 border shadow-lg relative overflow-hidden"
          style={{
            background: '#FFFFFF',
            borderColor: 'rgba(201,149,108,0.25)',
            boxShadow: '0 16px 40px -12px rgba(180,120,80,0.08)',
          }}
        >
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 mb-2">
                <Zap className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                Limited-Time Beauty Deals
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Quick Glow <span className="italic font-serif text-rose-700">Flash Offers</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Handpicked top treatments with verified doorstep arrival &amp; certified tools
              </p>
            </div>

            {/* Nav Arrows */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={prevSlide}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-xs"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-xs"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel Track */}
          <div
            className="overflow-hidden select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex items-stretch transition-transform ease-out duration-500 -mx-2 sm:-mx-2.5"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
              }}
            >
              {QUICK_GLOW_ITEMS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="flex-shrink-0 px-2 sm:px-2.5"
                  style={{ width: `${100 / visibleCards}%` }}
                >
                  <div
                    className="group cursor-pointer h-full rounded-2xl p-3 bg-[#FFFDF9] border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-rose-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Natural Image Container */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100 mb-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500"
                        style={{ filter: 'none', opacity: 1 }}
                        loading="lazy"
                      />

                      {/* Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-rose-700 backdrop-blur-md shadow-xs border border-rose-100">
                          {item.badge}
                        </span>
                      </div>
                    </div>

                    {/* Text Area */}
                    <div className="text-left px-0.5">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-1 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wide mt-1">
                        {item.discount}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-rose-700 group-hover:text-rose-800">
                      <span>Book Now</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
