import React, { useEffect, useRef, useState, useCallback } from 'react';

// Flower petal data for the royal pushpa varsha (flower shower)
const FLOWER_PETALS = [
  // Saffron & Golden Marigold (Genda Phool) petals
  { left: '10%', top: '-5%', size: 18, delay: 1.8, dur: 4.8, rot: 45, dx: 40, color: '#f59e0b', type: 'marigold' },
  { left: '18%', top: '-8%', size: 22, delay: 2.1, dur: 5.2, rot: -60, dx: -30, color: '#d97706', type: 'marigold' },
  { left: '25%', top: '-4%', size: 16, delay: 1.9, dur: 4.5, rot: 80, dx: 60, color: '#fbbf24', type: 'marigold' },
  { left: '32%', top: '-6%', size: 20, delay: 2.3, dur: 5.0, rot: -30, dx: -25, color: '#f59e0b', type: 'marigold' },
  { left: '42%', top: '-7%', size: 24, delay: 2.0, dur: 4.6, rot: 90, dx: 50, color: '#fbbf24', type: 'marigold' },
  { left: '50%', top: '-5%', size: 19, delay: 2.4, dur: 5.1, rot: -45, dx: -40, color: '#f59e0b', type: 'marigold' },
  { left: '58%', top: '-8%', size: 23, delay: 2.1, dur: 4.7, rot: 60, dx: 35, color: '#d97706', type: 'marigold' },
  { left: '68%', top: '-6%', size: 17, delay: 1.9, dur: 5.3, rot: -75, dx: -55, color: '#fbbf24', type: 'marigold' },
  { left: '76%', top: '-7%', size: 21, delay: 2.2, dur: 4.9, rot: 40, dx: 45, color: '#f59e0b', type: 'marigold' },
  { left: '85%', top: '-5%', size: 19, delay: 2.0, dur: 5.0, rot: -50, dx: -35, color: '#d97706', type: 'marigold' },
  { left: '92%', top: '-8%', size: 22, delay: 2.5, dur: 4.6, rot: 70, dx: 25, color: '#fbbf24', type: 'marigold' },

  // Velvet Red & Crimson Rose Petals (Gulab Pankhudi)
  { left: '14%', top: '-6%', size: 20, delay: 2.0, dur: 5.0, rot: -20, dx: 50, color: '#b91c1c', type: 'rose' },
  { left: '22%', top: '-9%', size: 24, delay: 2.3, dur: 4.7, rot: 55, dx: -45, color: '#991b1b', type: 'rose' },
  { left: '36%', top: '-5%', size: 18, delay: 1.8, dur: 5.4, rot: -65, dx: 30, color: '#dc2626', type: 'rose' },
  { left: '46%', top: '-8%', size: 22, delay: 2.2, dur: 4.8, rot: 35, dx: -50, color: '#b91c1c', type: 'rose' },
  { left: '54%', top: '-4%', size: 26, delay: 2.0, dur: 5.1, rot: -40, dx: 40, color: '#991b1b', type: 'rose' },
  { left: '64%', top: '-7%', size: 19, delay: 2.4, dur: 4.9, rot: 85, dx: -30, color: '#dc2626', type: 'rose' },
  { left: '72%', top: '-5%', size: 23, delay: 2.1, dur: 5.2, rot: -55, dx: 45, color: '#b91c1c', type: 'rose' },
  { left: '82%', top: '-9%', size: 20, delay: 1.9, dur: 4.6, rot: 60, dx: -40, color: '#991b1b', type: 'rose' },
  { left: '90%', top: '-6%', size: 25, delay: 2.3, dur: 5.3, rot: -30, dx: 35, color: '#dc2626', type: 'rose' },

  // Petals "thrown" outward from the sides (Host Welcome Blessing)
  { left: '16%', top: '45%', size: 20, delay: 2.6, dur: 3.8, rot: 45, dx: 110, color: '#f59e0b', type: 'marigold' },
  { left: '20%', top: '50%', size: 18, delay: 2.8, dur: 3.6, rot: -40, dx: 95, color: '#dc2626', type: 'rose' },
  { left: '80%', top: '45%', size: 20, delay: 2.6, dur: 3.8, rot: -45, dx: -110, color: '#f59e0b', type: 'marigold' },
  { left: '84%', top: '50%', size: 18, delay: 2.8, dur: 3.6, rot: 40, dx: -95, color: '#dc2626', type: 'rose' },
];

export function SplashScreen() {
  const [isDone, setIsDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const forceIntro = params.get('intro') === '1' || params.get('gate') === '1';
    if (forceIntro) return false;
    return Boolean(sessionStorage.getItem('satguru_gate_shown'));
  });

  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth / window.innerHeight < 0.9;
  });

  // State milestones
  const [gatesOpening, setGatesOpening] = useState(false);
  const [welcomeTextVisible, setWelcomeTextVisible] = useState(false);
  const [welcomeTextFading, setWelcomeTextFading] = useState(false);
  const [carpetRolling, setCarpetRolling] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const introRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const leafLRef = useRef<HTMLDivElement>(null);
  const leafRRef = useRef<HTMLDivElement>(null);
  const interiorRef = useRef<HTMLDivElement>(null);
  const intBgRef = useRef<HTMLImageElement>(null);
  const intShadeRef = useRef<HTMLDivElement>(null);
  const intSunRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const floodRef = useRef<HTMLDivElement>(null);
  const rimLRef = useRef<SVGPolylineElement>(null);
  const rimL2Ref = useRef<SVGPolylineElement>(null);
  const rimRRef = useRef<SVGPolylineElement>(null);
  const rimR2Ref = useRef<SVGPolylineElement>(null);

  const hasFinishedRef = useRef<boolean>(false);

  // Compute multi-lobed Rajasthani arch profile points
  const getArchPoints = useCallback((portrait: boolean) => {
    const ys = portrait ? 0.13 : 0.27;
    const lobes = portrait ? 2 : 3;
    const amp = portrait ? 0.035 : 0.055;
    const N = 90;
    const pts: [number, number][] = [];

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const f = (t * lobes) % 1;
      const lobe = Math.sqrt(Math.max(0, 1 - Math.pow(2 * f - 1, 2)));
      const base = ys * (1 - Math.pow(t, 1.35));
      pts.push([t, Math.max(0, base - amp * lobe * (1 - 0.35 * t))]);
    }
    return pts;
  }, []);

  // Apply clip-paths and SVG rim borders
  const applyArchGeometry = useCallback((portrait: boolean) => {
    const P = getArchPoints(portrait);
    const left: [number, number][] = [[0, 100], ...P.map(([t, y]) => [t * 100, y * 100] as [number, number]), [100, 100]];
    const right: [number, number][] = left.map(([x, y]) => [100 - x, y] as [number, number]);

    const poly = (a: [number, number][]) =>
      'polygon(' + a.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',') + ')';

    if (leafLRef.current) leafLRef.current.style.clipPath = poly(left);
    if (leafRRef.current) leafRRef.current.style.clipPath = poly(right);

    const line = (a: [number, number][]) =>
      a.slice(1, -1).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

    const setRim = (el: SVGPolylineElement | null, a: [number, number][], w: number, c: string) => {
      if (!el) return;
      el.setAttribute('points', line(a));
      el.setAttribute('stroke', c);
      el.setAttribute('stroke-width', String(w));
      el.setAttribute('vector-effect', 'non-scaling-stroke');
      el.setAttribute('stroke-linejoin', 'round');
    };

    setRim(rimLRef.current, left, 12, '#3a1b0b');
    setRim(rimL2Ref.current, left, 2.5, '#b4703f');
    setRim(rimRRef.current, right, 12, '#3a1b0b');
    setRim(rimR2Ref.current, right, 2.5, '#b4703f');

    const full: [number, number][] = [
      [0, 100],
      ...P.map(([t, y]) => [t * 50, y * 100] as [number, number]),
      ...P.slice().reverse().map(([t, y]) => [100 - t * 50, y * 100] as [number, number]).slice(1),
      [100, 100],
    ];

    if (interiorRef.current) {
      interiorRef.current.style.clipPath = poly(full);
    }
  }, [getArchPoints]);

  const finish = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    sessionStorage.setItem('satguru_gate_shown', '1');
    document.body.classList.add('home-ready');

    setIsFadingOut(true);
    setTimeout(() => {
      setIsDone(true);
      document.dispatchEvent(new CustomEvent('satguru:intro-done'));
    }, 700);
  }, []);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const portrait = window.innerWidth / window.innerHeight < 0.9;
      setIsPortrait(portrait);
      applyArchGeometry(portrait);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [applyArchGeometry]);

  // Main Intro Sequence with Regal, Heart-Touching Pacing
  useEffect(() => {
    if (isDone) return;

    applyArchGeometry(isPortrait);

    // Escape key skips
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', handleKeyDown);

    const files = isPortrait
      ? ['/assets/intro/port_leaf_l.webp', '/assets/intro/port_leaf_r.webp', '/assets/intro/interior_port.webp']
      : ['/assets/intro/desk_leaf_l.webp', '/assets/intro/desk_leaf_r.webp', '/assets/intro/interior_wide.webp'];

    let isMounted = true;
    const timeouts: NodeJS.Timeout[] = [];

    // Preload door assets
    Promise.all(
      files.map(
        src =>
          new Promise(resolve => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
          })
      )
    ).then(() => {
      if (!isMounted) return;

      // TIMELINE (Graceful, Heart-Touching & Grand Pacing):
      // 0.0s - 1.2s: Gates closed in majestic presence.
      // 1.2s: Gates slowly and grandly start swinging open in 3D (duration: 3.2s)
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          setGatesOpening(true);

          if (leafLRef.current) {
            leafLRef.current.style.transition = 'transform 3.2s cubic-bezier(0.45, 0, 0.2, 1)';
            leafLRef.current.style.transform = 'rotateY(95deg)';
          }
          if (leafRRef.current) {
            leafRRef.current.style.transition = 'transform 3.2s cubic-bezier(0.45, 0, 0.2, 1)';
            leafRRef.current.style.transform = 'rotateY(-95deg)';
          }
          if (seamRef.current) {
            seamRef.current.style.transition = 'opacity 0.9s ease';
            seamRef.current.style.opacity = '0';
          }
          if (intShadeRef.current) {
            intShadeRef.current.style.transition = 'opacity 3.0s ease-in-out';
            intShadeRef.current.style.opacity = '0';
          }
          if (intSunRef.current) {
            intSunRef.current.style.transition = 'opacity 3.0s ease-in-out';
            intSunRef.current.style.opacity = '1';
          }
          if (camRef.current) {
            camRef.current.style.transition = 'transform 5.5s cubic-bezier(0.25, 0, 0.35, 1)';
            camRef.current.style.transform = 'scale(1.18)';
          }
        }, 1200)
      );

      // 2.2s: Welcoming text appears gracefully with golden radiance (No card/box!)
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          setWelcomeTextVisible(true);
        }, 2200)
      );

      // 4.6s: Welcoming text begins gentle fade-out into the sunlight
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          setWelcomeTextFading(true);
        }, 4600)
      );

      // 4.9s: Red Carpet unrolls forward from the palace corridor to the viewer!
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          setCarpetRolling(true);
        }, 4900)
      );

      // 6.2s: Sunlight flood dissolves warmly into the landing page
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          if (floodRef.current) {
            floodRef.current.style.transition = 'opacity 1.3s cubic-bezier(0.4, 0, 0.2, 1)';
            floodRef.current.style.opacity = '1';
          }
        }, 6200)
      );

      // 7.2s: Complete entrance smoothly and display landing page
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          finish();
        }, 7200)
      );
    });

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      timeouts.forEach(clearTimeout);
    };
  }, []); // Run ONCE on mount

  if (isDone) return null;

  const currentFiles = isPortrait
    ? {
        imgL: '/assets/intro/port_leaf_l.webp',
        imgR: '/assets/intro/port_leaf_r.webp',
        intBg: '/assets/intro/interior_port.webp',
      }
    : {
        imgL: '/assets/intro/desk_leaf_l.webp',
        imgR: '/assets/intro/desk_leaf_r.webp',
        intBg: '/assets/intro/interior_wide.webp',
      };

  return (
    <div
      ref={introRef}
      id="satguru-haveli-intro"
      aria-label="Satguru Royal Haveli Gate Opening"
      className={`fixed inset-0 z-[99999] overflow-hidden select-none transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 15%, #fdfaf3 0%, #efe8da 60%, #ddd3c0 100%)',
      }}
    >
      {/* Dynamic Keyframes for Animation Finishing */}
      <style>{`
        @keyframes flowerFallDrift {
          0% {
            transform: translate3d(0, -6vh, 0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          50% {
            transform: translate3d(calc(var(--dx) * 0.6), 50vh, 0) rotate(220deg);
            opacity: 0.95;
          }
          100% {
            transform: translate3d(var(--dx), 108vh, 0) rotate(480deg);
            opacity: 0;
          }
        }
        @keyframes hostGentleBow {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(1.5%) rotate(var(--r)) scaleY(0.97); }
        }
        @keyframes hostBreathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.008, 1.014); }
        }
        @keyframes redCarpetUnroll {
          0% {
            transform: perspective(700px) rotateX(48deg) scaleY(0.02);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: perspective(700px) rotateX(48deg) scaleY(1);
            opacity: 1;
          }
        }
        @keyframes textWarmGlow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(255, 220, 140, 0.5), 0 2px 10px rgba(0, 0, 0, 0.85);
          }
          50% {
            text-shadow: 0 0 40px rgba(255, 235, 170, 0.9), 0 0 60px rgba(220, 160, 50, 0.6), 0 2px 14px rgba(0, 0, 0, 0.95);
          }
        }
        .anim-gent {
          animation: hostGentleBow 2.2s ease-in-out 2.4s 2, hostBreathe 4s ease-in-out 6.8s infinite;
          transform-origin: 50% 98%;
        }
        .anim-lady {
          animation: hostGentleBow 2.2s ease-in-out 2.4s 2, hostBreathe 4.2s ease-in-out 6.8s infinite;
          transform-origin: 50% 98%;
        }
        .text-glow-animated {
          animation: textWarmGlow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Main 3D Camera Container */}
      <div
        ref={camRef}
        className="absolute inset-0"
        style={{
          transformOrigin: '50% 50%',
        }}
      >
        {/* INTERIOR HAVELI COURTYARD (BEHIND THE DOORS) */}
        <div
          ref={interiorRef}
          className="absolute inset-0 overflow-hidden bg-[#2a160c]"
          style={{ willChange: 'clip-path' }}
        >
          {/* Background Corridor Image */}
          <img
            ref={intBgRef}
            src={currentFiles.intBg}
            alt="Royal Haveli Courtyard"
            className="absolute inset-0 w-full h-full object-cover transform-origin-[50%_55%]"
          />

          {/* Palace Ambience Lighting & Sun Spill */}
          <div
            ref={intShadeRef}
            className="absolute inset-0 bg-[#0a0502] opacity-60 pointer-events-none z-10"
          />
          <div
            ref={intSunRef}
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-0 z-10"
            style={{
              background: 'radial-gradient(ellipse 65% 65% at 50% 45%, rgba(255,220,150,0.55), rgba(255,190,110,0) 75%)',
            }}
          />

          {/* ======================================================== */}
          {/* RED CARPET ROLLOUT ANIMATION (CENTRAL PALACE PATHWAY)    */}
          {/* ======================================================== */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[68%] sm:w-[48%] lg:w-[38%] pointer-events-none z-15"
            style={{
              height: '52%',
              transformOrigin: '50% 0%',
            }}
          >
            {carpetRolling && (
              <div
                className="w-full h-full relative"
                style={{
                  animation: 'redCarpetUnroll 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                  transformOrigin: '50% 0%',
                }}
              >
                {/* Velvet Red Carpet Body */}
                <div
                  className="w-full h-full rounded-t-sm shadow-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, #5c0715 0%, #800e20 25%, #991228 65%, #7a0b1c 100%)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Left Gold Embroidered Border */}
                  <div className="absolute left-0 top-0 bottom-0 w-3 sm:w-4 bg-gradient-to-r from-[#d4af37] via-[#f7e7a9] to-[#b38f2a] opacity-90 border-r border-[#61470c]" />
                  <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-1 bg-[#4a0812]" />

                  {/* Right Gold Embroidered Border */}
                  <div className="absolute right-0 top-0 bottom-0 w-3 sm:w-4 bg-gradient-to-l from-[#d4af37] via-[#f7e7a9] to-[#b38f2a] opacity-90 border-l border-[#61470c]" />
                  <div className="absolute right-3 sm:right-4 top-0 bottom-0 w-1 bg-[#4a0812]" />

                  {/* Subtle Golden Floral Weave in carpet center */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* PURE HEARTY WELCOME TYPOGRAPHY (NO CARD / NO BOX)       */}
          {/* ======================================================== */}
          <div
            className={`absolute top-[16%] sm:top-[18%] inset-x-0 text-center pointer-events-none z-30 transition-all duration-1000 ${
              welcomeTextVisible && !welcomeTextFading
                ? 'opacity-100 translate-y-0'
                : welcomeTextFading
                ? 'opacity-0 -translate-y-6'
                : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="max-w-4xl mx-auto px-4">
              {/* "Hearty Welcome to" */}
              <p
                className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#ffeec2] tracking-wide mb-1 text-glow-animated"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
              >
                Hearty Welcome to
              </p>

              {/* "Satguru Makeup Arts" */}
              <h1
                className="font-serif font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider text-[#fff7df] uppercase text-glow-animated leading-tight"
                style={{
                  fontFamily: "'Cinzel', 'Playfair Display', serif",
                  letterSpacing: '0.08em',
                }}
              >
                Satguru Makeup Arts
              </h1>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ANIMATED WELCOMING HOSTS (ILLUSTRATED RAJASTHANI HOSTS)  */}
          {/* ======================================================== */}
          <div
            className={`absolute bottom-0 inset-x-0 h-[64%] sm:h-[72%] pointer-events-none z-20 flex justify-between px-[4%] sm:px-[10%] lg:px-[14%] items-end transition-opacity duration-1000 ${
              gatesOpening ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* 1. ANIMATED GENTLEMAN HOST (LEFT) */}
            <div className="relative h-[85%] sm:h-[95%] w-[44%] sm:w-[32%] flex items-end justify-center filter drop-shadow-[0_14px_22px_rgba(20,8,2,0.7)]">
              <svg
                className="anim-gent w-auto h-full max-w-full overflow-visible"
                style={{ ['--r' as string]: '2.4deg' }}
                viewBox="0 0 200 500"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Animated Rajasthani Gentleman Host"
              >
                <defs>
                  <g id="mLeg">
                    <path d="M72 300L99 300L95 452L72 452Z" fill="#efe4c6" stroke="#cdbb8c" strokeWidth="1.2" />
                    <path d="M73 420q11 4 22 0M73 430q11 4 22 0M73 440q11 4 22 0" stroke="#cdbb8c" fill="none" />
                    <path d="M64 452L97 452L99 470Q78 476 54 472Q50 462 64 452Z" fill="#dcc080" stroke="#a8782a" strokeWidth="1.5" />
                    <path d="M54 472Q44 466 51 457" stroke="#a8782a" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </g>
                  <g id="mArm">
                    <path d="M66 138L50 204L92 172" fill="none" stroke="#d6c493" strokeWidth="27" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M66 138L50 204L92 172" fill="none" stroke="#f6eed7" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M76 186L90 176" stroke="#d4a53a" strokeWidth="4" strokeLinecap="round" />
                  </g>
                </defs>
                <ellipse cx="100" cy="482" rx="62" ry="9" fill="rgba(0,0,0,.35)" />
                <use href="#mLeg" />
                <use href="#mLeg" transform="translate(200 0) scale(-1 1)" />
                <rect x="91" y="108" width="18" height="26" fill="#d79a6a" />
                <path d="M60 130Q100 116 140 130L156 308Q100 322 44 308Z" fill="#f6eed7" stroke="#d6c493" strokeWidth="1.5" />
                <path d="M82 190Q78 260 70 310M118 190Q122 260 130 310" stroke="#e2d4a8" fill="none" />
                <path d="M82 124L100 152L118 124" fill="none" stroke="#d4a53a" strokeWidth="3" />
                <path d="M100 154V250" stroke="#d4a53a" strokeWidth="3.5" strokeDasharray="0 10" strokeLinecap="round" />
                <path d="M46 300Q100 314 154 300" stroke="#d4a53a" fill="none" strokeWidth="2.5" />
                <use href="#mArm" />
                <use href="#mArm" transform="translate(200 0) scale(-1 1)" />
                <path d="M100 146Q111 158 108 182L92 182Q89 158 100 146Z" fill="#e6ab7c" stroke="#b97a4e" strokeWidth="1.2" />
                <path d="M100 152V180" stroke="#b97a4e" strokeWidth="1.2" />
                <ellipse cx="69" cy="84" rx="5" ry="8" fill="#e6ab7c" />
                <ellipse cx="131" cy="84" rx="5" ry="8" fill="#e6ab7c" />
                <ellipse cx="100" cy="80" rx="30" ry="35" fill="#e6ab7c" />
                <path d="M78 70Q88 65 96 70M104 70Q112 65 122 70" stroke="#2a1408" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <ellipse cx="88" cy="78" rx="3.2" ry="2.1" fill="#2a1408" />
                <ellipse cx="112" cy="78" rx="3.2" ry="2.1" fill="#2a1408" />
                <path d="M100 80Q96 92 101 94" stroke="#b97a4e" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <path d="M82 99Q91 93 100 97Q109 93 118 99Q109 102 100 100Q91 102 82 99Z" fill="#1f1209" />
                <path d="M90 106Q100 114 110 106" stroke="#8a3b2c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <path d="M100 56V68" stroke="#d3261a" strokeWidth="3.4" strokeLinecap="round" />
                <path d="M136 40Q160 52 152 102Q148 114 142 100Q146 72 130 54Z" fill="#e0561e" stroke="#7e1a0f" strokeWidth="1.2" />
                <path d="M62 66C56 30 72 8 102 8C132 8 146 30 138 66C122 52 80 52 62 66Z" fill="#c8341f" stroke="#7e1a0f" strokeWidth="1.5" />
                <path d="M66 54Q100 36 136 54" stroke="#f0902a" strokeWidth="5" fill="none" />
                <path d="M63 41Q100 22 138 41" stroke="#f6c244" strokeWidth="4" fill="none" />
                <path d="M70 27Q102 12 130 27" stroke="#f0902a" strokeWidth="4" fill="none" />
                <circle cx="100" cy="47" r="3.6" fill="#e0bb6c" stroke="#7e1a0f" strokeWidth=".8" />
              </svg>
            </div>

            {/* 2. ANIMATED LADY HOSTESS (RIGHT) */}
            <div className="relative h-[85%] sm:h-[95%] w-[44%] sm:w-[32%] flex items-end justify-center filter drop-shadow-[0_14px_22px_rgba(20,8,2,0.7)]">
              <svg
                className="anim-lady w-auto h-full max-w-full overflow-visible"
                style={{ ['--r' as string]: '-2.4deg' }}
                viewBox="0 0 200 500"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Animated Rajasthani Lady Hostess"
              >
                <defs>
                  <pattern id="paisIntroSvg" width="16" height="20" patternUnits="userSpaceOnUse">
                    <path d="M8 3Q13 9 8 16Q3 9 8 3Z" fill="#e0bb6c" opacity=".9" />
                  </pattern>
                  <g id="wArm">
                    <path d="M70 140L52 200L92 172" fill="none" stroke="#c98d66" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M70 140L52 200L92 172" fill="none" stroke="#e8b088" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M73 134L61 172" stroke="#7a1030" strokeWidth="22" strokeLinecap="round" />
                    <path d="M73 134L61 172" stroke="#d4a53a" strokeWidth="22" strokeLinecap="round" strokeDasharray="1.5 40" strokeDashoffset="-26" />
                    <path d="M72.9 174.8L83.1 188.2" stroke="#c4263a" strokeWidth="3.2" strokeLinecap="round" />
                    <path d="M77.1 172.1L87.3 185.5" stroke="#2fa84f" strokeWidth="3.2" strokeLinecap="round" />
                    <path d="M81.1 169.3L91.3 182.7" stroke="#e0bb6c" strokeWidth="3.2" strokeLinecap="round" />
                    <path d="M84.5 166.5L94.7 179.9" stroke="#2a6fd0" strokeWidth="3.2" strokeLinecap="round" />
                  </g>
                </defs>
                <ellipse cx="100" cy="482" rx="66" ry="9" fill="rgba(0,0,0,.35)" />
                <path d="M70 226L130 226L170 468Q100 486 30 468Z" fill="#a3122b" />
                <path d="M70 226L130 226L170 468Q100 486 30 468Z" fill="url(#paisIntroSvg)" />
                <path d="M100 228V482" stroke="#7a1030" strokeOpacity=".45" strokeWidth="2" />
                <path d="M54 360Q100 372 146 360" stroke="#d4a53a" strokeWidth="3" fill="none" />
                <path d="M33 450Q100 466 167 450L170 468Q100 486 30 468Z" fill="#d4a53a" />
                <path d="M33 458Q100 474 167 458" stroke="#7a1030" strokeWidth="3" fill="none" />
                <rect x="76" y="200" width="48" height="32" fill="#e8b088" />
                <rect x="72" y="224" width="56" height="7" fill="#d4a53a" />
                <path d="M62 92Q58 40 100 30Q142 40 138 92Q146 124 152 158L48 158Q54 124 62 92Z" fill="#8c1636" stroke="#d4a53a" strokeWidth="2" />
                <rect x="92" y="108" width="16" height="26" fill="#d99a72" />
                <path d="M72 128Q100 120 128 128L124 204Q100 212 76 204Z" fill="#7a1030" stroke="#d4a53a" strokeWidth="1.5" />
                <path d="M86 124L100 154L114 124Z" fill="#e8b088" />
                <path d="M84 128Q100 164 116 128" fill="none" stroke="#e0bb6c" strokeWidth="2.6" />
                <path d="M90 140Q100 154 110 140" fill="none" stroke="#e0bb6c" strokeWidth="2" strokeDasharray="1 4" strokeLinecap="round" />
                <path d="M66 126Q60 200 66 300L84 306Q86 200 94 132Z" fill="#8c1636" stroke="#d4a53a" strokeWidth="2" />
                <use href="#wArm" />
                <use href="#wArm" transform="translate(200 0) scale(-1 1)" />
                <path d="M100 146Q111 158 108 182L92 182Q89 158 100 146Z" fill="#e8b088" stroke="#c98d66" strokeWidth="1.2" />
                <path d="M100 152V180" stroke="#c98d66" strokeWidth="1.2" />
                <ellipse cx="100" cy="80" rx="29" ry="34" fill="#e8b088" />
                <path d="M71 78Q72 50 100 46Q128 50 129 78Q122 58 100 56Q78 58 71 78Z" fill="#1a0f0c" />
                <path d="M100 56V66" stroke="#e0bb6c" strokeWidth="1.6" />
                <circle cx="100" cy="68" r="3.2" fill="#e0bb6c" stroke="#8c1636" strokeWidth=".8" />
                <path d="M77 72Q87 67 95 72M105 72Q113 67 123 72" stroke="#2a1408" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <ellipse cx="88" cy="81" rx="4.4" ry="2.5" fill="#fff" />
                <ellipse cx="112" cy="81" rx="4.4" ry="2.5" fill="#fff" />
                <circle cx="88" cy="81" r="1.9" fill="#2a1408" />
                <circle cx="112" cy="81" r="1.9" fill="#2a1408" />
                <path d="M82 81Q88 77 94 81M106 81Q112 77 118 81" stroke="#1a0f0c" strokeWidth="1.4" fill="none" />
                <circle cx="100" cy="76" r="2.4" fill="#c4263a" />
                <path d="M100 82Q97 92 101 94" stroke="#c98d66" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="94" cy="96" r="3" fill="none" stroke="#e0bb6c" strokeWidth="1.4" />
                <path d="M89 104Q95 102 100 104Q105 102 111 104Q106 112 100 112Q94 112 89 104Z" fill="#c4263a" />
                <circle cx="71" cy="90" r="3" fill="#e0bb6c" />
                <path d="M71 93V102" stroke="#e0bb6c" strokeWidth="1.4" />
                <circle cx="71" cy="104" r="2.6" fill="#e0bb6c" />
                <circle cx="129" cy="90" r="3" fill="#e0bb6c" />
                <path d="M129 93V102" stroke="#e0bb6c" strokeWidth="1.4" />
                <circle cx="129" cy="104" r="2.6" fill="#e0bb6c" />
              </svg>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SHOWER OF FALLING & THROWING FLOWERS (MARIGOLD & ROSES)  */}
        {/* ======================================================== */}
        {gatesOpening && (
          <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
            {FLOWER_PETALS.map((petal, idx) => (
              <span
                key={idx}
                className="absolute select-none pointer-events-none"
                style={{
                  left: petal.left,
                  top: petal.top,
                  width: `${petal.size}px`,
                  height: `${petal.size * 1.3}px`,
                  ['--dx' as string]: `${petal.dx}px`,
                  animation: `flowerFallDrift ${petal.dur}s ease-in-out ${petal.delay}s infinite`,
                  willChange: 'transform',
                }}
              >
                {petal.type === 'marigold' ? (
                  // Marigold Petal (Genda Phool)
                  <svg viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    <path
                      d="M10 0 C15 5 20 12 18 20 C16 26 12 28 10 28 C8 28 4 26 2 20 C0 12 5 5 10 0 Z"
                      fill={petal.color}
                    />
                    <path d="M10 4 V24" stroke="#d97706" strokeWidth="0.8" strokeOpacity="0.6" />
                  </svg>
                ) : (
                  // Rose Petal (Gulab)
                  <svg viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    <path
                      d="M12 2 C18 0 24 6 23 15 C22 22 17 27 12 28 C7 27 2 22 1 15 C0 6 6 0 12 2 Z"
                      fill={petal.color}
                    />
                    <path d="M12 4 C15 10 15 18 12 24" stroke="#7f1d1d" strokeWidth="0.8" strokeOpacity="0.5" />
                  </svg>
                )}
              </span>
            ))}
          </div>
        )}

        {/* ======================================================== */}
        {/* 3D CARVED HAVELI DOORS (FOREGROUND GATES)                */}
        {/* ======================================================== */}
        <div
          className="leaves absolute inset-0 pointer-events-none"
          style={{
            perspective: '1500px',
            perspectiveOrigin: '50% 45%',
            filter: 'drop-shadow(0 10px 18px rgba(40,18,6,0.45))',
          }}
        >
          {/* LEFT DOOR LEAF */}
          <div
            ref={leafLRef}
            className="leaf l absolute top-0 left-0 h-full overflow-hidden"
            style={{
              width: '50.15%',
              transformOrigin: '0 50%',
              willChange: 'transform',
            }}
          >
            <img
              src={currentFiles.imgL}
              alt="Carved Left Haveli Door"
              className="absolute inset-0 w-full h-full object-cover object-left"
            />
            {/* Arched Rim Border */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline ref={rimLRef} fill="none" />
              <polyline ref={rimL2Ref} fill="none" />
            </svg>
            {/* Shading layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 pointer-events-none" />
          </div>

          {/* RIGHT DOOR LEAF */}
          <div
            ref={leafRRef}
            className="leaf r absolute top-0 right-0 h-full overflow-hidden"
            style={{
              width: '50.15%',
              transformOrigin: '100% 50%',
              willChange: 'transform',
            }}
          >
            <img
              src={currentFiles.imgR}
              alt="Carved Right Haveli Door"
              className="absolute inset-0 w-full h-full object-cover object-right"
            />
            {/* Arched Rim Border */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline ref={rimRRef} fill="none" />
              <polyline ref={rimR2Ref} fill="none" />
            </svg>
            {/* Shading layer */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/30 pointer-events-none" />
          </div>
        </div>

        {/* Center Vertical Seam */}
        <div
          ref={seamRef}
          className="absolute left-1/2 top-0 bottom-0 w-1.5 -ml-[3px] pointer-events-none z-30"
          style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0), rgba(15,6,2,0.85), rgba(0,0,0,0))',
          }}
        />
      </div>

      {/* Warm Golden Flood Dissolve */}
      <div
        ref={floodRef}
        className="absolute inset-0 pointer-events-none z-50 opacity-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 46%, #fffaf0 0%, #ffeed2 55%, #fbe3bd 100%)',
        }}
      />

      {/* SKIP INTRO BUTTON */}
      <button
        onClick={finish}
        type="button"
        className="absolute right-4 sm:right-6 top-4 sm:top-6 z-[60] px-4 py-2 text-xs font-serif font-bold tracking-[0.2em] uppercase rounded-full border border-[#e0bb6c]/60 bg-black/45 text-[#f7e4c0] backdrop-blur-md hover:bg-[#e0bb6c] hover:text-[#24130b] hover:border-[#e0bb6c] transition-all shadow-lg cursor-pointer"
      >
        Skip Intro &rarr;
      </button>
    </div>
  );
}
