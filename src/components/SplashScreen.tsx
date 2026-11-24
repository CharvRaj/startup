import React, { useEffect, useRef, useState, useCallback } from 'react';

export function SplashScreen() {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'open' | 'travel' | 'fade' | 'done'>('loading');
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth / window.innerHeight < 0.9;
  });

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
  const hostManRef = useRef<HTMLDivElement>(null);
  const hostWomanRef = useRef<HTMLDivElement>(null);
  const rimLRef = useRef<SVGPolylineElement>(null);
  const rimL2Ref = useRef<SVGPolylineElement>(null);
  const rimRRef = useRef<SVGPolylineElement>(null);
  const rimR2Ref = useRef<SVGPolylineElement>(null);

  const hasFinishedRef = useRef<boolean>(false);

  // Check sessionStorage or force query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceIntro = params.get('intro') === '1' || params.get('gate') === '1';
    const alreadyShown = sessionStorage.getItem('satguru_gate_shown');

    if (alreadyShown && !forceIntro) {
      setPhase('done');
      return;
    }
  }, []);

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

    setPhase('fade');
    setTimeout(() => {
      setPhase('done');
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

  // Main Intro Sequence
  useEffect(() => {
    if (phase === 'done') return;

    applyArchGeometry(isPortrait);

    // Escape key skips
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Asset paths
    const files = isPortrait
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

    let isMounted = true;

    // Preload images
    const preload = Promise.all(
      Object.entries(files).map(
        ([, src]) =>
          new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true); // gracefully continue
          })
      )
    );

    preload.then(() => {
      if (!isMounted) return;
      setPhase('ready');

      // Play timing: snappy, royal, and grand with 0 lag
      // Phase 1: Closed doors stand with royal crest (0s - 0.7s)
      // Phase 2: Doors swing open, sunlight spills in (0.7s - 2.5s)
      // Phase 3: Hosts welcome with Namaste (2.0s - 3.8s)
      // Phase 4: Golden light dissolves smoothly into landing page (3.5s - 4.2s)
      const tOpen = setTimeout(() => {
        if (!isMounted) return;
        setPhase('open');

        // Swing doors open
        if (leafLRef.current) {
          leafLRef.current.style.transition = 'transform 2.2s cubic-bezier(0.55, 0, 0.2, 1)';
          leafLRef.current.style.transform = 'rotateY(94deg)';
        }
        if (leafRRef.current) {
          leafRRef.current.style.transition = 'transform 2.2s cubic-bezier(0.55, 0, 0.2, 1)';
          leafRRef.current.style.transform = 'rotateY(-94deg)';
        }
        if (seamRef.current) {
          seamRef.current.style.transition = 'opacity 0.6s ease';
          seamRef.current.style.opacity = '0';
        }
        if (intShadeRef.current) {
          intShadeRef.current.style.transition = 'opacity 2.2s ease-in-out';
          intShadeRef.current.style.opacity = '0';
        }
        if (intSunRef.current) {
          intSunRef.current.style.transition = 'opacity 2.2s ease-in-out';
          intSunRef.current.style.opacity = '1';
        }
        if (camRef.current) {
          camRef.current.style.transition = 'transform 3.8s cubic-bezier(0.3, 0, 0.4, 1)';
          camRef.current.style.transform = 'scale(1.22)';
        }
      }, 700);

      // Hosts fade in & bow
      const tHosts = setTimeout(() => {
        if (!isMounted) return;
        setPhase('travel');
        if (hostManRef.current) {
          hostManRef.current.style.transition = 'opacity 0.9s ease-out, transform 0.9s ease-out';
          hostManRef.current.style.opacity = '1';
          hostManRef.current.style.transform = 'none';
        }
        if (hostWomanRef.current) {
          hostWomanRef.current.style.transition = 'opacity 0.9s ease-out, transform 0.9s ease-out';
          hostWomanRef.current.style.opacity = '1';
          hostWomanRef.current.style.transform = 'none';
        }
      }, 1600);

      // Warm sunlight dissolves to landing
      const tFlood = setTimeout(() => {
        if (!isMounted) return;
        if (floodRef.current) {
          floodRef.current.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
          floodRef.current.style.opacity = '1';
        }
      }, 3400);

      // Complete & reveal landing page
      const tFinish = setTimeout(() => {
        if (!isMounted) return;
        finish();
      }, 4300);

      return () => {
        clearTimeout(tOpen);
        clearTimeout(tHosts);
        clearTimeout(tFlood);
        clearTimeout(tFinish);
      };
    });

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, isPortrait, applyArchGeometry, finish]);

  if (phase === 'done') return null;

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
        phase === 'fade' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at 50% 15%, #fdfaf3 0%, #efe8da 60%, #ddd3c0 100%)',
      }}
    >
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes hostBreathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.008, 1.014); }
        }
        @keyframes hostNamaste {
          0% { transform: rotate(0deg) translateY(0); }
          35% { transform: rotate(1.8deg) translateY(1.2%); }
          65% { transform: rotate(1.8deg) translateY(1.2%); }
          100% { transform: rotate(0deg) translateY(0); }
        }
        @keyframes royalGlowPulse {
          0%, 100% { box-shadow: 0 0 15px rgba(218, 165, 32, 0.4), inset 0 0 10px rgba(218, 165, 32, 0.2); }
          50% { box-shadow: 0 0 35px rgba(218, 165, 32, 0.75), inset 0 0 20px rgba(218, 165, 32, 0.4); }
        }
        @keyframes plaqueFadeOut {
          from { opacity: 1; transform: translate(-50%, 0) scale(1); }
          to { opacity: 0; transform: translate(-50%, -20px) scale(0.95); }
        }
        @keyframes loaderBar {
          0%, 100% { transform: scaleX(0.2); opacity: 0.3; }
          50% { transform: scaleX(1); opacity: 1; }
        }
        .host-svg-man {
          animation: hostBreathe 4s ease-in-out infinite;
          transform-origin: 50% 100%;
        }
        .host-svg-woman {
          animation: hostBreathe 4.2s ease-in-out 0.4s infinite;
          transform-origin: 50% 100%;
        }
      `}</style>

      {/* Subtle Initial Loader */}
      {phase === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#160c07] text-[#e0bb6c]">
          <div className="w-16 h-16 rounded-full border-2 border-[#b8863b]/30 border-t-[#b8863b] animate-spin mb-4" />
          <p className="font-serif tracking-widest text-xs uppercase text-[#e0bb6c]/90">
            Satguru Makeup Arts • Jaipur
          </p>
        </div>
      )}

      {/* Main 3D Camera Container */}
      <div
        ref={camRef}
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          transformOrigin: '50% 50%',
          opacity: phase === 'loading' ? 0 : 1,
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

          {/* WELCOMING HOST GENTLEMAN (LEFT SIDE) */}
          <div
            ref={hostManRef}
            className="absolute bottom-0 flex items-end justify-center pointer-events-none z-20"
            style={{
              left: isPortrait ? '3%' : '14%',
              height: isPortrait ? '58%' : '70%',
              width: isPortrait ? '38%' : '26%',
              opacity: 0,
              transform: 'translateY(4%)',
            }}
          >
            <div className="relative w-full h-full flex items-end justify-center filter drop-shadow-[0_12px_18px_rgba(20,8,2,0.65)]">
              {/* Rajasthani Host (Gentleman in royal safa & achkan with Namaste) */}
              <svg className="host-svg-man w-auto h-full max-w-full" viewBox="0 0 200 500" aria-label="Royal Rajasthani Host">
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
          </div>

          {/* WELCOMING HOSTESS LADY (RIGHT SIDE) */}
          <div
            ref={hostWomanRef}
            className="absolute bottom-0 flex items-end justify-center pointer-events-none z-20"
            style={{
              right: isPortrait ? '3%' : '14%',
              height: isPortrait ? '58%' : '70%',
              width: isPortrait ? '38%' : '26%',
              opacity: 0,
              transform: 'translateY(4%)',
            }}
          >
            <div className="relative w-full h-full flex items-end justify-center filter drop-shadow-[0_12px_18px_rgba(20,8,2,0.65)]">
              {/* Rajasthani Hostess (Lady in crimson lehenga, odhni, jewelry with Namaste) */}
              <svg className="host-svg-woman w-auto h-full max-w-full" viewBox="0 0 200 500" aria-label="Royal Rajasthani Hostess">
                <defs>
                  <pattern id="paisIntro" width="16" height="20" patternUnits="userSpaceOnUse">
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
                <path d="M70 226L130 226L170 468Q100 486 30 468Z" fill="url(#paisIntro)" />
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

          {/* Palace Ambience Lighting & Sun Spill */}
          <div
            ref={intShadeRef}
            className="absolute inset-0 bg-[#0a0502] opacity-60 pointer-events-none"
          />
          <div
            ref={intSunRef}
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-0"
            style={{
              background: 'radial-gradient(ellipse 60% 60% at 50% 45%, rgba(255,214,150,0.45), rgba(255,200,130,0) 70%)',
            }}
          />

          {/* Central Welcome Greeting in Courtyard */}
          <div
            className={`absolute top-[14%] inset-x-0 text-center pointer-events-none transition-all duration-1000 z-30 ${
              phase === 'open' || phase === 'travel' ? 'opacity-100 transform-none' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="text-[#e0bb6c] font-serif tracking-[0.25em] text-xs sm:text-sm uppercase font-semibold block mb-1">
              Shubh Aagaman • शुभ आगमन
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#fff3cf] font-bold tracking-tight drop-shadow-[0_4px_16px_rgba(30,5,20,0.9)]">
              पधारो सा
            </h2>
            <p className="text-xs sm:text-sm text-[#fbe7ab] tracking-widest uppercase font-medium mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Satguru Makeup Arts • Jaipur &amp; Singhana
            </p>
          </div>
        </div>

        {/* 3D CARVED HAVELI DOORS (FOREGROUND) */}
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

        {/* Central Royal Door Plaque (Before Doors Swing Open) */}
        {phase === 'ready' && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 text-center pointer-events-none animate-in fade-in duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(30,12,6,0.92), rgba(60,20,10,0.92))',
              border: '2px solid #e0bb6c',
              borderRadius: '16px',
              padding: '18px 28px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 20px rgba(224,187,108,0.3)',
            }}
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full border border-[#e0bb6c]/60 flex items-center justify-center text-[#e0bb6c]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" />
              </svg>
            </div>
            <p className="text-[#e0bb6c] text-[11px] font-serif uppercase tracking-[0.3em] font-medium">
              Royal Heritage Beauty
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#fff3cf] font-bold tracking-wide mt-0.5">
              Satguru Makeup Arts
            </h1>
            <p className="text-[10px] text-white/70 tracking-widest uppercase mt-1">
              Singhana &bull; Jaipur &bull; Rajasthan
            </p>
          </div>
        )}
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
