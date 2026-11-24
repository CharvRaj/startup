import React from 'react';

interface AmbientFirefliesProps {
  count?: number;
  enableLanterns?: boolean;
  className?: string;
}

export function AmbientFireflies({
  count = 20,
  enableLanterns = false,
  className = '',
}: AmbientFirefliesProps) {
  // Generate deterministic glowing firefly particles
  const fireflies = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 7) % 94}%`,
    top: `${(i * 23 + 11) % 92}%`,
    size: (i % 3) * 1.5 + 2.5,
    dur: (i % 4) * 2 + 5,
    delay: (i % 5) * 1.2,
    driftX: (i % 2 === 0 ? 1 : -1) * ((i % 3) * 15 + 20),
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-10 ${className}`}>
      <style>{`
        @keyframes fireflyGlowFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(0.8);
            opacity: 0.15;
          }
          50% {
            transform: translate3d(var(--drift-x), -35px, 0) scale(1.4);
            opacity: 0.85;
            box-shadow: 0 0 14px #ffd700, 0 0 24px #f59e0b;
          }
        }
        @keyframes diyaFlicker {
          0%, 100% { transform: scale(1) rotate(-1deg); opacity: 0.9; }
          25% { transform: scale(1.08, 0.95) rotate(2deg); opacity: 1; }
          50% { transform: scale(0.96, 1.05) rotate(-2deg); opacity: 0.85; }
          75% { transform: scale(1.04, 0.98) rotate(1deg); opacity: 0.95; }
        }
      `}</style>

      {/* Floating Golden Sparks */}
      {fireflies.map(f => (
        <span
          key={f.id}
          className="absolute rounded-full bg-gradient-to-r from-[#ffd700] via-[#fef08a] to-[#f59e0b]"
          style={
            {
              left: f.left,
              top: f.top,
              width: `${f.size}px`,
              height: `${f.size}px`,
              '--drift-x': `${f.driftX}px`,
              animation: `fireflyGlowFloat ${f.dur}s ease-in-out ${f.delay}s infinite`,
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)',
            } as React.CSSProperties
          }
        />
      ))}

      {/* Optional Ambient Palace Lanterns / Diyas */}
      {enableLanterns && (
        <>
          {/* Top Left Diya Glow */}
          <div className="absolute top-4 left-6 flex flex-col items-center opacity-75">
            <div
              className="w-3.5 h-6 rounded-full bg-gradient-to-t from-[#ea580c] via-[#facc15] to-[#fef08a] blur-[1px]"
              style={{ animation: 'diyaFlicker 2.4s ease-in-out infinite' }}
            />
            <div className="w-8 h-2.5 rounded-full bg-[#854d0e] shadow-[0_0_15px_rgba(234,88,12,0.8)]" />
          </div>

          {/* Top Right Diya Glow */}
          <div className="absolute top-4 right-6 flex flex-col items-center opacity-75">
            <div
              className="w-3.5 h-6 rounded-full bg-gradient-to-t from-[#ea580c] via-[#facc15] to-[#fef08a] blur-[1px]"
              style={{ animation: 'diyaFlicker 2.8s ease-in-out infinite 0.5s' }}
            />
            <div className="w-8 h-2.5 rounded-full bg-[#854d0e] shadow-[0_0_15px_rgba(234,88,12,0.8)]" />
          </div>
        </>
      )}
    </div>
  );
}
