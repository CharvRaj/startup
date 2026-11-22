import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Petal shape data — position, size, rotation, animation timing
const PETALS = [
  { left: '4%',   top: '12%', size: 18, rot: -30, delay: 0,    dur: 4.2 },
  { left: '10%',  top: '55%', size: 13, rot: 20,  delay: 0.6,  dur: 3.8 },
  { left: '18%',  top: '25%', size: 22, rot: -15, delay: 1.2,  dur: 5.0 },
  { left: '28%',  top: '70%', size: 11, rot: 45,  delay: 0.3,  dur: 4.5 },
  { left: '38%',  top: '8%',  size: 15, rot: -40, delay: 1.8,  dur: 3.6 },
  { left: '48%',  top: '60%', size: 19, rot: 10,  delay: 0.9,  dur: 4.8 },
  { left: '58%',  top: '20%', size: 12, rot: -25, delay: 2.1,  dur: 3.9 },
  { left: '65%',  top: '75%', size: 16, rot: 35,  delay: 0.4,  dur: 5.2 },
  { left: '74%',  top: '15%', size: 20, rot: -50, delay: 1.5,  dur: 4.1 },
  { left: '82%',  top: '50%', size: 14, rot: 60,  delay: 0.7,  dur: 3.7 },
  { left: '90%',  top: '30%', size: 17, rot: -20, delay: 2.4,  dur: 4.6 },
  { left: '96%',  top: '65%', size: 10, rot: 15,  delay: 1.1,  dur: 5.1 },
  { left: '22%',  top: '85%', size: 13, rot: -60, delay: 1.6,  dur: 4.3 },
  { left: '52%',  top: '88%', size: 16, rot: 30,  delay: 0.2,  dur: 3.5 },
  { left: '78%',  top: '82%', size: 11, rot: -45, delay: 2.0,  dur: 4.9 },
];

export function GlowUpCTA() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        minHeight: '340px',
        background: 'linear-gradient(160deg, #FDE8EE 0%, #FBD6E2 40%, #F8C8D8 100%)',
      }}
    >
      {/* Inline keyframes */}
      <style>{`
        @keyframes petalFloat {
          0%   { transform: translateY(0px)   rotate(var(--r)) scale(1);    opacity: 0.85; }
          25%  { transform: translateY(-18px) rotate(calc(var(--r) + 15deg)) scale(1.05); opacity: 1; }
          50%  { transform: translateY(-8px)  rotate(calc(var(--r) - 10deg)) scale(0.95); opacity: 0.9; }
          75%  { transform: translateY(-22px) rotate(calc(var(--r) + 20deg)) scale(1.08); opacity: 1; }
          100% { transform: translateY(0px)   rotate(var(--r)) scale(1);    opacity: 0.85; }
        }
        @keyframes glowUpPulse {
          0%, 100% { text-shadow: 0 0 0px transparent; }
          50%       { text-shadow: 0 4px 32px rgba(180,20,70,0.18); }
        }
        .glow-up-title {
          animation: glowUpPulse 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* ── Falling Petals (absolutely positioned, pointer-events-none) ── */}
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute select-none"
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            ['--r' as string]: `${p.rot}deg`,
            animation: `petalFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
            willChange: 'transform',
            zIndex: 1,
          }}
        >
          {/* SVG petal — teardrop / leaf shape matching the reference image */}
          <svg
            viewBox="0 0 24 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%' }}
          >
            <path
              d="M12 36 C4 28 0 20 2 11 C4 4 10 0 12 0 C14 0 20 4 22 11 C24 20 20 28 12 36Z"
              fill="#E8629A"
              fillOpacity="0.75"
            />
            {/* Central vein line for a real petal look */}
            <line x1="12" y1="2" x2="12" y2="34" stroke="#D04A82" strokeWidth="0.8" strokeOpacity="0.5" />
          </svg>
        </span>
      ))}

      {/* ── Main Content ── */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20"
        style={{ zIndex: 2 }}
      >
        {/* Headline */}
        <h2
          className="glow-up-title font-black uppercase leading-none tracking-tight text-[#2D0A1F]"
          style={{
            fontSize: 'clamp(2.8rem, 9vw, 7rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          Ready for your<br />glow up?
        </h2>

        {/* Subtitle */}
        <p
          className="mt-4 sm:mt-5 text-[#7A3050]/80 font-medium"
          style={{ fontSize: 'clamp(0.85rem, 2vw, 1.05rem)' }}
        >
          Same-day slots across Jaipur.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/doorstep')}
          className="mt-7 sm:mt-8 font-bold text-white rounded-full px-8 py-3 text-sm sm:text-base shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #E0366E 0%, #C02860 100%)',
            boxShadow: '0 6px 28px rgba(200,40,90,0.35)',
          }}
        >
          Book your artist
        </button>

        {/* Small floating circle decoration — matching reference */}
        <span
          className="absolute pointer-events-none"
          style={{
            right: '5%',
            bottom: '20%',
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '2px solid #E0729A',
            opacity: 0.5,
            zIndex: 1,
          }}
        />
      </div>
    </section>
  );
}
