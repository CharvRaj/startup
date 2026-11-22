import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface FallingPetal {
  id: number;
  left: number; // percentage 0-100
  size: number; // in px
  startDelay: number; // negative delay so they are already falling on load
  duration: number; // seconds
  drift: number; // horizontal sway distance in px
  initialRot: number; // deg
  spinSpeed: number; // deg per cycle
  opacity: number;
}

export function GlowUpCTA() {
  const navigate = useNavigate();

  // 38 falling leaves/petals distributed across the width with staggered continuous fall
  const petals: FallingPetal[] = useMemo(() => {
    const list: FallingPetal[] = [];
    const count = 38;
    for (let i = 0; i < count; i++) {
      const duration = 4.5 + ((i * 17) % 35) / 10; // 4.5s to 8.0s
      list.push({
        id: i,
        left: ((i * 100) / count) + (((i * 13) % 7) - 3), // nicely dispersed 0-100%
        size: 14 + ((i * 19) % 18), // 14px to 32px
        startDelay: -((i * 1.3) % duration), // pre-fills the screen immediately!
        duration,
        drift: ((i % 2 === 0 ? 1 : -1) * (20 + ((i * 23) % 45))), // sway -65px to +65px
        initialRot: (i * 37) % 360,
        spinSpeed: (i % 2 === 0 ? 1 : -1) * (180 + ((i * 47) % 200)),
        opacity: 0.7 + ((i * 11) % 30) / 100, // 0.70 to 0.99
      });
    }
    return list;
  }, []);

  return (
    <section
      aria-label="Ready for your glow up"
      className="relative w-full overflow-hidden select-none border-t border-rose-100"
      style={{
        background: 'linear-gradient(180deg, #FFF8F5 0%, #FEECE5 35%, #FCDFD6 75%, #F9D5CA 100%)',
        paddingTop: 'clamp(3.5rem, 7vw, 6rem)',
        paddingBottom: 'clamp(4rem, 8vw, 6.5rem)',
      }}
    >
      {/* Dynamic Keyframes for falling leaves / petals */}
      <style>{`
        @keyframes leafFall {
          0% {
            transform: translate3d(0, -60px, 0) rotate(var(--rot-start)) scale(var(--s, 1));
            opacity: 0;
          }
          8% {
            opacity: var(--op, 0.9);
          }
          50% {
            transform: translate3d(var(--drift), 260px, 0) rotate(calc(var(--rot-start) + var(--spin) * 0.5)) scale(var(--s, 1));
          }
          90% {
            opacity: var(--op, 0.9);
          }
          100% {
            transform: translate3d(calc(var(--drift) * 0.4), 540px, 0) rotate(calc(var(--rot-start) + var(--spin))) scale(var(--s, 1));
            opacity: 0;
          }
        }

        .falling-leaf {
          position: absolute;
          top: 0;
          pointer-events: none;
          animation-name: leafFall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        /* Impact / Bebas-style condensed typography */
        .glowup-headline {
          font-family: Impact, "Bebas Neue", "Arial Narrow", -apple-system, sans-serif;
          font-stretch: ultra-condensed;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.015em;
          color: #350A22;
        }
      `}</style>

      {/* ── CONTINUOUS FALLING LEAVES / PETALS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {petals.map((p) => (
          <span
            key={p.id}
            className="falling-leaf"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size * 1.55}px`,
              ['--rot-start' as string]: `${p.initialRot}deg`,
              ['--spin' as string]: `${p.spinSpeed}deg`,
              ['--drift' as string]: `${p.drift}px`,
              ['--op' as string]: `${p.opacity}`,
              ['--s' as string]: `${(p.size / 22).toFixed(2)}`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.startDelay}s`,
              zIndex: 2,
            }}
          >
            {/* Elegant curved rose petal / leaf SVG matching screenshot */}
            <svg
              viewBox="0 0 24 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_2px_4px_rgba(217,101,139,0.25)]"
            >
              <path
                d="M12 37 C3 29 -1 19 1 10 C3 3 9.5 0 12 0 C14.5 0 21 3 23 10 C25 19 21 29 12 37Z"
                fill="#DE457E"
                fillOpacity="0.85"
              />
              {/* Petal highlight & inner leaf contour */}
              <path
                d="M12 2 C13.5 10 18 18 12 34"
                stroke="#F9B3CC"
                strokeWidth="1"
                strokeLinecap="round"
                strokeOpacity="0.75"
              />
            </svg>
          </span>
        ))}
      </div>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center">

        {/* READY FOR YOUR GLOW UP? — matches image style 1:1 */}
        <h2
          className="glowup-headline leading-[0.92] text-center"
          style={{
            fontSize: 'clamp(3.4rem, 11vw, 7.8rem)',
          }}
        >
          READY FOR YOUR<br />GLOW UP?
        </h2>

        {/* Subtitle */}
        <p
          className="mt-4 sm:mt-5 font-normal tracking-normal text-[#4A1A2F]/80"
          style={{
            fontSize: 'clamp(0.95rem, 2.2vw, 1.25rem)',
          }}
        >
          Same-day slots across Jaipur.
        </p>

        {/* Action Button */}
        <div className="mt-6 sm:mt-8">
          <button
            onClick={() => navigate('/doorstep')}
            className="inline-flex items-center justify-center font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-xl"
            style={{
              backgroundColor: '#DE1B76',
              padding: '12px 34px',
              borderRadius: '9999px',
              fontSize: 'clamp(0.88rem, 1.6vw, 1.05rem)',
              boxShadow: '0 8px 24px -4px rgba(222, 27, 118, 0.45)',
            }}
          >
            Book your artist
          </button>
        </div>

        {/* Pink Outline Circle Accent — matching reference image on the right */}
        <div
          className="absolute pointer-events-none hidden sm:block"
          style={{
            right: '12%',
            bottom: '22%',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: '2px solid rgba(222, 27, 118, 0.45)',
          }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
