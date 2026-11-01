import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export function SplashScreen() {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit' | 'done'>('enter');

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('splash_shown');
    if (alreadyShown) { setPhase('done'); return; }

    const t1 = setTimeout(() => setPhase('show'), 200);
    const t2 = setTimeout(() => setPhase('exit'), 2800);
    const t3 = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem('splash_shown', '1');
    }, 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0614 0%, #150b22 40%, #0a1020 100%)',
        opacity: phase === 'exit' ? 0 : 1,
        transform: phase === 'exit' ? 'scale(1.04)' : 'scale(1)',
        transition: phase === 'exit' ? 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)' : 'none',
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}
    >
      {/* Iridescent Blob 1 - Top Right */}
      <div className="splash-blob splash-blob-1" />
      {/* Iridescent Blob 2 - Bottom Left */}
      <div className="splash-blob splash-blob-2" />
      {/* Iridescent Blob 3 - Center Right */}
      <div className="splash-blob splash-blob-3" />

      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Center content */}
      <div
        className="relative z-10 text-center px-8"
        style={{
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(20px)' : 'translateY(0)',
          transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s',
        }}
      >
        {/* Logo icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(190,24,93,0.5), rgba(124,58,237,0.5))',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              animation: 'splashIconFloat 2s ease-in-out infinite',
            }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Brand name with shimmer */}
        <div className="overflow-hidden mb-3">
          <h1
            className="font-display text-4xl md:text-5xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #f9a8d4 0%, #fbbf24 30%, #f472b6 60%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 100%',
              animation: 'splashShimmerText 3s linear infinite',
              transform: phase === 'enter' ? 'translateY(100%)' : 'translateY(0)',
              transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s',
              display: 'inline-block',
            }}
          >
            BlindGlow By Satguru
          </h1>
        </div>

        {/* Subtitle */}
        <div className="overflow-hidden">
          <p
            className="text-base md:text-lg"
            style={{
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              transform: phase === 'enter' ? 'translateY(100%)' : 'translateY(0)',
              transition: 'transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s',
            }}
          >
            Beauty at Your Doorstep
          </p>
        </div>

        {/* Animated dots loader */}
        <div className="flex justify-center gap-2 mt-10">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f9a8d4, #c084fc)',
                opacity: phase === 'enter' ? 0 : 1,
                transition: `opacity 0.4s ease ${0.8 + i * 0.15}s`,
                animation: phase === 'show' ? `splashDot 1.2s ease-in-out ${i * 0.2}s infinite` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        .splash-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          mix-blend-mode: screen;
          pointer-events: none;
        }
        .splash-blob-1 {
          width: 500px; height: 500px;
          top: -100px; right: -80px;
          background: conic-gradient(from 0deg, #ff6eb4, #a855f7, #3b82f6, #06b6d4, #10b981, #eab308, #ef4444, #ff6eb4);
          opacity: 0.55;
          animation: blobRotate1 12s linear infinite, blobScale 6s ease-in-out infinite;
        }
        .splash-blob-2 {
          width: 400px; height: 400px;
          bottom: -80px; left: -60px;
          background: conic-gradient(from 180deg, #f472b6, #818cf8, #67e8f9, #86efac, #fde68a, #fb923c, #f472b6);
          opacity: 0.45;
          animation: blobRotate2 10s linear infinite, blobScale 8s ease-in-out 1s infinite;
        }
        .splash-blob-3 {
          width: 300px; height: 300px;
          top: 40%; right: 10%;
          background: conic-gradient(from 90deg, #c084fc, #f9a8d4, #fbbf24, #34d399, #60a5fa, #c084fc);
          opacity: 0.4;
          animation: blobRotate3 8s linear infinite, blobFloat 5s ease-in-out 0.5s infinite;
        }
        @keyframes blobRotate1 {
          from { transform: rotate(0deg) scale(1); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes blobRotate2 {
          from { transform: rotate(180deg) scale(1); }
          to   { transform: rotate(-180deg) scale(1); }
        }
        @keyframes blobRotate3 {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes blobScale {
          0%,100% { transform: scale(1) rotate(var(--r,0deg)); }
          50%     { transform: scale(1.12) rotate(var(--r,0deg)); }
        }
        @keyframes blobFloat {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50%     { transform: translateY(-30px) rotate(-180deg); }
        }
        @keyframes splashIconFloat {
          0%,100% { transform: translateY(0) rotate(-2deg); }
          50%     { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes splashShimmerText {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes splashDot {
          0%,100% { transform: translateY(0); opacity: 0.5; }
          50%     { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
