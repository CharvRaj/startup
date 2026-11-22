import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function BookALookMarquee() {
  const navigate = useNavigate();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false]);

  const looks = [
    {
      id: 'royal-velvet',
      title: 'Royal Velvet Bride',
      subtitle: 'Crimson lehenga, Kundan & Matha Patti',
      image: '/images/bridal-gallery/satguru-look-1.jpg',
    },
    {
      id: 'maroon-zardosi',
      title: 'Maroon Zardosi Queen',
      subtitle: 'Full bridal lehenga & jewellery styling',
      image: '/images/bridal-gallery/satguru-look-2.jpg',
    },
    {
      id: 'double-celebration',
      title: 'Double Celebration',
      subtitle: 'Twin bridal glam, Kundan & Polki',
      image: '/images/bridal-gallery/satguru-look-3.jpg',
    },
  ];

  // Each card gets its own IntersectionObserver — fires individually on scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Small delay per card index so they still feel staggered even if
            // multiple cards enter the viewport at the same time
            setTimeout(() => {
              setVisibleCards(prev => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 160);
            obs.disconnect();
          }
        },
        { threshold: 0.18 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <section
      className="relative overflow-hidden py-14 sm:py-20 bg-[#FDF8F6] dark:bg-stone-950/70 border-y border-stone-200/60 dark:border-border/50"
    >
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes marqueeScrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeScrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes cardRiseIn {
          0% {
            opacity: 0;
            transform: translateY(70px) scale(0.90);
          }
          55% {
            transform: translateY(-8px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes archSheenReflection {
          0% {
            transform: translateX(-180%) rotate(28deg);
            opacity: 0;
          }
          25% { opacity: 0.7; }
          50% { opacity: 0.9; }
          75% { opacity: 0.7; }
          100% {
            transform: translateX(280%) rotate(28deg);
            opacity: 0;
          }
        }
        .animate-marquee-l {
          display: flex;
          width: max-content;
          animation: marqueeScrollLeft 22s linear infinite;
        }
        .animate-marquee-r {
          display: flex;
          width: max-content;
          animation: marqueeScrollRight 22s linear infinite;
        }
        .animate-card-rise {
          animation: cardRiseIn 0.72s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-arch-sheen {
          animation: archSheenReflection 3.6s ease-in-out infinite;
        }
      `}</style>

      {/* ── PART 1: DUAL KINETIC RUNWAY MARQUEE ── */}
      <div className="w-full overflow-hidden select-none mb-14 sm:mb-20 space-y-1 sm:space-y-2">
        {/* Row 1: Outlined Typography Left */}
        <div className="overflow-hidden">
          <div className="animate-marquee-l">
            {[0, 1].map((c) => (
              <div
                key={c}
                className="flex items-center gap-6 sm:gap-10 pr-6 sm:pr-10 text-6xl sm:text-8xl md:text-9xl lg:text-[130px] font-black tracking-tighter uppercase whitespace-nowrap leading-none"
              >
                <span className="text-transparent" style={{ WebkitTextStroke: '2px #3D101C' }}>GLOW</span>
                <span className="text-transparent" style={{ WebkitTextStroke: '2px #3D101C' }}>SHINE</span>
                <span className="text-transparent" style={{ WebkitTextStroke: '2px #3D101C' }}>SPARKLE</span>
                <span className="text-transparent" style={{ WebkitTextStroke: '2px #3D101C' }}>GLOW</span>
                <span className="text-transparent" style={{ WebkitTextStroke: '2px #3D101C' }}>SHINE</span>
                <span className="text-transparent" style={{ WebkitTextStroke: '2px #3D101C' }}>SPARKLE</span>
              </div>
            ))}
          </div>
        </div>
        {/* Row 2: Solid Magenta Right */}
        <div className="overflow-hidden">
          <div className="animate-marquee-r">
            {[0, 1].map((c) => (
              <div
                key={c}
                className="flex items-center gap-6 sm:gap-10 pr-6 sm:pr-10 text-6xl sm:text-8xl md:text-9xl lg:text-[130px] font-black tracking-tighter uppercase whitespace-nowrap text-[#DE1B76] leading-none"
              >
                <span>DOORSTEP ARTISTS</span>
                <span>DOORSTEP ARTISTS</span>
                <span>DOORSTEP ARTISTS</span>
                <span>DOORSTEP ARTISTS</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PART 2: BOOK A LOOK SECTION ── */}
      <div className="container-custom max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left: Heading */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#2A1810] dark:text-stone-100 leading-[1.12]">
              Book a look,<br />
              not a service.
            </h2>
            <p className="text-[#6D635C] dark:text-stone-400 text-sm sm:text-base font-light leading-relaxed max-w-sm">
              Choose the result you want and we send the artist
            </p>
          </div>

          {/* Right: 3 Bridal Photo Arch Cards — Each animates as it enters viewport on scroll */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {looks.map((look, i) => (
                <div
                  key={look.id}
                  ref={el => { cardRefs.current[i] = el; }}
                  onClick={() => navigate('/doorstep')}
                  className="cursor-pointer flex flex-col items-center text-center group"
                  style={{
                    opacity: visibleCards[i] ? 1 : 0,
                    transform: visibleCards[i] ? 'translateY(0) scale(1)' : 'translateY(70px) scale(0.90)',
                    transition: visibleCards[i]
                      ? `opacity 0.72s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms, transform 0.72s cubic-bezier(0.22,1,0.36,1) ${i * 100}ms`
                      : 'none',
                  }}
                >
                  {/* Arched Pill with Real Bridal Photo */}
                  <div
                    className="relative w-full aspect-[3/4] rounded-t-full rounded-b-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2"
                  >
                    {/* Real Bridal Photo fills the arch */}
                    <img
                      src={look.image}
                      alt={look.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Sweeping Diagonal Gloss Reflection */}
                    <div
                      className="pointer-events-none absolute -inset-full w-[300%] h-[300%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-arch-sheen"
                    />

                    {/* Soft vignette at bottom for text contrast */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  </div>

                  {/* Title & CTA */}
                  <div className="mt-3 sm:mt-4 space-y-0.5">
                    <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold text-[#2A1810] dark:text-stone-100 leading-tight">
                      {look.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#7A7068] dark:text-stone-400 font-light">
                      {look.subtitle}
                    </p>
                    <div className="pt-1.5">
                      <span className="inline-block text-xs font-semibold text-[#DE1B76] dark:text-pink-400 underline underline-offset-4 decoration-2 hover:opacity-80 transition-opacity">
                        Book this look
                      </span>
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
