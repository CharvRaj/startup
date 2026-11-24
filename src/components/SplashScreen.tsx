import React, { useEffect, useRef, useState, useCallback } from 'react';

// Flower types specification based on user reference + assets
interface FlowerType {
  name: string;
  start?: string;
  end?: string;
  minSize: number;
  maxSize: number;
  isImage?: boolean;
  imageKey?: string;
}

const FLOWER_TYPES: FlowerType[] = [
  {
    name: 'sakura', // Notched cherry blossom petal
    start: 'rgba(255, 214, 224, 0.95)',
    end: 'rgba(255, 133, 162, 0.65)',
    minSize: 10,
    maxSize: 18,
  },
  {
    name: 'rose', // Broad, deep red/crimson rose petal
    start: 'rgba(235, 45, 83, 0.95)',
    end: 'rgba(130, 10, 35, 0.75)',
    minSize: 12,
    maxSize: 22,
  },
  {
    name: 'marigold', // Ruffled golden/orange petal
    start: 'rgba(255, 195, 0, 0.95)',
    end: 'rgba(235, 95, 0, 0.75)',
    minSize: 9,
    maxSize: 16,
  },
  {
    name: 'lavender', // Slender purple/violet petal
    start: 'rgba(216, 180, 254, 0.9)',
    end: 'rgba(139, 92, 246, 0.65)',
    minSize: 8,
    maxSize: 15,
  },
  {
    name: 'blossom', // Full 5-petal tiny flower with golden center
    start: 'rgba(255, 245, 238, 0.95)',
    end: 'rgba(255, 182, 193, 0.75)',
    minSize: 11,
    maxSize: 17,
  },
  {
    name: 'rose_full', // Uploaded Red Rose flower illustration
    isImage: true,
    imageKey: 'rose',
    minSize: 20,
    maxSize: 32,
  },
  {
    name: 'maple_leaf', // Uploaded golden autumn leaf
    isImage: true,
    imageKey: 'leaf',
    minSize: 16,
    maxSize: 26,
  },
  {
    name: 'fresh_sprout', // Uploaded two-leaf sprout
    isImage: true,
    imageKey: 'sprout',
    minSize: 15,
    maxSize: 24,
  },
];

class FlowerParticle {
  type: FlowerType;
  x: number = 0;
  y: number = 0;
  size: number = 0;
  speedY: number = 0;
  speedX: number = 0;
  swayAmplitude: number = 0;
  swayFrequency: number = 0;
  angle: number = 0;
  spinSpeed: number = 0;
  flip: number = 0;
  flipSpeed: number = 0;
  time: number = 0;
  opacity: number = 0;

  constructor(width: number, height: number, initial: boolean = false) {
    this.type = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
    this.reset(width, height, initial);
  }

  reset(width: number, height: number, initial: boolean = false) {
    this.type = FLOWER_TYPES[Math.floor(Math.random() * FLOWER_TYPES.length)];
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : -35;
    this.size = Math.random() * (this.type.maxSize - this.type.minSize) + this.type.minSize;
    this.speedY = Math.random() * 1.5 + 0.85;
    this.speedX = Math.random() * 0.9 - 0.45;
    this.swayAmplitude = Math.random() * 1.8 + 0.6;
    this.swayFrequency = Math.random() * 0.02 + 0.008;
    this.angle = Math.random() * Math.PI * 2;
    this.spinSpeed = (Math.random() - 0.5) * 0.038;
    this.flip = Math.random() * Math.PI;
    this.flipSpeed = Math.random() * 0.032 + 0.012;
    this.time = Math.random() * 100;
    this.opacity = Math.random() * 0.4 + 0.6;
  }

  update(width: number, height: number) {
    this.time += 1;
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.time * this.swayFrequency) * this.swayAmplitude;
    this.angle += this.spinSpeed;
    this.flip += this.flipSpeed;

    if (this.y > height + 40 || this.x < -60 || this.x > width + 60) {
      this.reset(width, height, false);
    }
  }

  draw(ctx: CanvasRenderingContext2D, loadedImages: { [key: string]: HTMLImageElement }) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(1, Math.cos(this.flip) * 0.65 + 0.35); // 3D tumbling flutter
    ctx.globalAlpha = this.opacity;

    const s = this.size;

    // Check if drawing an uploaded flower / leaf image
    if (this.type.isImage && this.type.imageKey && loadedImages[this.type.imageKey]) {
      const img = loadedImages[this.type.imageKey];
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -s / 2, -s / 2, s, s);
        ctx.restore();
        return;
      }
    }

    // Canvas Bezier Vector Petals
    if (this.type.start && this.type.end) {
      const grad = ctx.createRadialGradient(0, 0, 1, 0, 0, s);
      grad.addColorStop(0, this.type.start);
      grad.addColorStop(1, this.type.end);
      ctx.fillStyle = grad;
    }

    ctx.beginPath();
    if (this.type.name === 'sakura') {
      // Classic cherry blossom petal with a V-notch at the tip
      ctx.moveTo(0, -s * 0.5);
      ctx.bezierCurveTo(s * 0.7, -s * 0.4, s * 0.8, s * 0.5, s * 0.2, s);
      ctx.lineTo(0, s * 0.75); // Notch
      ctx.lineTo(-s * 0.2, s);
      ctx.bezierCurveTo(-s * 0.8, s * 0.5, -s * 0.7, -s * 0.4, 0, -s * 0.5);
    } else if (this.type.name === 'rose') {
      // Wide curved rose petal
      ctx.moveTo(0, -s * 0.4);
      ctx.bezierCurveTo(s * 1.1, -s * 0.8, s * 1.2, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 1.2, s * 0.6, -s * 1.1, -s * 0.8, 0, -s * 0.4);
    } else if (this.type.name === 'marigold') {
      // Ruffled, wavy edge marigold petal
      ctx.moveTo(0, -s * 0.6);
      ctx.quadraticCurveTo(s * 0.6, -s * 0.2, s * 0.5, s * 0.5);
      ctx.lineTo(s * 0.25, s * 0.9);
      ctx.lineTo(0, s * 0.75);
      ctx.lineTo(-s * 0.25, s * 0.9);
      ctx.lineTo(-s * 0.5, s * 0.5);
      ctx.quadraticCurveTo(-s * 0.6, -s * 0.2, 0, -s * 0.6);
    } else if (this.type.name === 'lavender') {
      // Slender elongated petal
      ctx.ellipse(0, 0, s * 0.35, s * 0.85, 0, 0, Math.PI * 2);
    } else if (this.type.name === 'blossom') {
      // Full 5-petal tiny flower
      for (let i = 0; i < 5; i++) {
        const rot = (i * Math.PI * 2) / 5;
        const px = Math.cos(rot) * (s * 0.45);
        const py = Math.sin(rot) * (s * 0.45);
        ctx.moveTo(px, py);
        ctx.arc(px, py, s * 0.35, 0, Math.PI * 2);
      }
    }

    ctx.closePath();
    ctx.fill();

    // Golden pistil center for full blossom
    if (this.type.name === 'blossom') {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 200, 60, 0.95)';
      ctx.fill();
    }

    ctx.restore();
  }
}

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

  // Animation timeline milestones
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

  // Canvas for high-performance flower & petal physics
  const flowerCanvasRef = useRef<HTMLCanvasElement>(null);
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

  // Canvas Flower & Petal Particle Loop
  useEffect(() => {
    if (isDone || !gatesOpening) return;

    const canvas = flowerCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleCanvasResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleCanvasResize);

    // Preload custom uploaded flower illustrations
    const loadedImages: { [key: string]: HTMLImageElement } = {};
    const imgSources = [
      { key: 'rose', src: '/assets/intro/flower_rose.png' },
      { key: 'leaf', src: '/assets/intro/flower_leaf.png' },
      { key: 'sprout', src: '/assets/intro/flower_sprout.png' },
    ];

    imgSources.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      loadedImages[key] = img;
    });

    // Particle count: 110 for desktop, 70 for mobile
    const count = window.innerWidth < 640 ? 70 : 110;
    const particles = Array.from({ length: count }, () => new FlowerParticle(width, height, true));

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(width, height);
        particles[i].draw(ctx, loadedImages);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleCanvasResize);
    };
  }, [isDone, gatesOpening]);

  // Main Intro Sequence with Regal, Stately Pacing
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

      // TIMELINE (Majestic, Heart-Touching Pacing):
      // 0.0s - 1.2s: Gates closed in regal presence.
      // 1.2s: Gates slowly swing open in 3D (3.2s); Flowers start falling from above.
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

      // 2.2s: Welcome text floats in gracefully (No card/box!)
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          setWelcomeTextVisible(true);
        }, 2200)
      );

      // 4.6s: Welcome text begins smooth fade out
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          setWelcomeTextFading(true);
        }, 4600)
      );

      // 4.9s: Red Carpet smoothly unrolls forward along the FLOOR (from doorway to foreground)
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          setCarpetRolling(true);
        }, 4900)
      );

      // 6.4s: Warm sunlight dissolve into landing page
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          if (floodRef.current) {
            floodRef.current.style.transition = 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            floodRef.current.style.opacity = '1';
          }
        }, 6400)
      );

      // 7.4s: Complete entrance and reveal landing page
      timeouts.push(
        setTimeout(() => {
          if (!isMounted) return;
          finish();
        }, 7400)
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
        @keyframes hostGentleBow {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(1.5%) rotate(var(--r)) scaleY(0.97); }
        }
        @keyframes hostBreathe {
          0%, 100% { transform: scale(1, 1); }
          50% { transform: scale(1.008, 1.014); }
        }
        
        /* Red Carpet Unroll Flat on the Floor (Forward along perspective floor plane) */
        @keyframes floorCarpetRollOut {
          0% {
            clip-path: inset(0 0 100% 0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          100% {
            clip-path: inset(0 0 0% 0);
            opacity: 1;
          }
        }

        /* 3D Carpet Roll Cylinder rolling forward along the floor plane */
        @keyframes cylinderRollAlongFloor {
          0% {
            top: 0%;
            width: 54%;
            opacity: 0;
            transform: translate(-50%, -50%) rotate(0deg);
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            width: 96%;
            opacity: 0;
            transform: translate(-50%, -50%) rotate(900deg);
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
          {/* RED CARPET ON THE FLOOR (NO WIND - GROUNDED FLOOR PLANE) */}
          {/* ======================================================== */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-15"
            style={{
              width: isPortrait ? '88%' : '56%',
              height: isPortrait ? '45%' : '48%',
              perspective: '550px',
              perspectiveOrigin: '50% 25%',
            }}
          >
            {carpetRolling && (
              <div
                className="w-full h-full relative"
                style={{
                  transform: 'rotateX(64deg)',
                  transformOrigin: '50% 100%', // ANCHORED FIRMLY AT FLOOR BASE!
                }}
              >
                {/* 1. Flat Carpet Body on Floor with Cast Floor Shadow */}
                <div
                  className="w-full h-full relative"
                  style={{
                    animation: 'floorCarpetRollOut 1.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                    filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.85))',
                  }}
                >
                  <div
                    className="w-full h-full relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(180deg, #4d0510 0%, #730d1d 22%, #8c1024 60%, #680816 100%)',
                      boxShadow: 'inset 0 0 35px rgba(0,0,0,0.65)',
                      clipPath: 'polygon(20% 0%, 80% 0%, 98% 100%, 2% 100%)',
                    }}
                  >
                    {/* Left Gold Border along linear perspective */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-3 sm:w-4 bg-gradient-to-r from-[#d4af37] via-[#faeaae] to-[#a88225] opacity-95"
                      style={{
                        transform: 'skewX(-10deg)',
                        transformOrigin: '0% 100%',
                      }}
                    />

                    {/* Right Gold Border along linear perspective */}
                    <div
                      className="absolute top-0 bottom-0 right-0 w-3 sm:w-4 bg-gradient-to-l from-[#d4af37] via-[#faeaae] to-[#a88225] opacity-95"
                      style={{
                        transform: 'skewX(10deg)',
                        transformOrigin: '100% 100%',
                      }}
                    />

                    {/* Regal Golden Floral Lattice Pattern */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffd700_1px,transparent_1px)] [background-size:14px_14px]" />

                    {/* Floor Base Golden Fringe Tassels */}
                    <div
                      className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-t from-[#e5c158] to-transparent opacity-90"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, #d4af37 0px, #d4af37 3px, transparent 3px, transparent 6px)',
                      }}
                    />
                  </div>
                </div>

                {/* 2. Velvet Cylinder Roll that rolls forward along the floor plane */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 h-5 sm:h-6 rounded-full overflow-hidden pointer-events-none"
                  style={{
                    animation: 'cylinderRollAlongFloor 1.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
                    background: 'linear-gradient(180deg, #b51c33 0%, #520712 40%, #7e1022 75%, #250207 100%)',
                    boxShadow: '0 8px 14px rgba(0,0,0,0.9), inset 0 2px 4px rgba(255,200,100,0.4)',
                    borderLeft: '3px solid #d4af37',
                    borderRight: '3px solid #d4af37',
                  }}
                />
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* PURE HEARTY WELCOME TYPOGRAPHY (NO CARD / NO BOX)        */}
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
                    <path d="M64 154L48 214L90 186" fill="none" stroke="#d63f2a" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M64 154L48 214L90 186" fill="none" stroke="#ba1c10" strokeWidth="21" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M76 198L86 190" stroke="#e0bb6c" strokeWidth="3" strokeLinecap="round" />
                  </g>
                </defs>
                <ellipse cx="100" cy="482" rx="68" ry="9" fill="rgba(0,0,0,.35)" />
                <path d="M62 216L18 474Q100 492 182 474L138 216Z" fill="#a4180c" stroke="#781006" strokeWidth="1.5" />
                <path d="M62 216L18 474Q100 492 182 474L138 216Z" fill="url(#paisIntroSvg)" />
                <path d="M22 458Q100 478 178 458" stroke="#e0bb6c" strokeWidth="10" fill="none" />
                <path d="M24 446Q100 464 176 446" stroke="#3d6c34" strokeWidth="3" fill="none" />
                <path d="M21 468Q100 486 179 468" stroke="#f6eed7" strokeWidth="2" fill="none" />
                <rect x="91" y="106" width="18" height="24" fill="#d79a6a" />
                <path d="M64 126Q100 114 136 126L142 208Q100 216 58 208Z" fill="#ba1c10" stroke="#781006" strokeWidth="1.2" />
                <path d="M72 126Q100 156 128 126" fill="none" stroke="#e0bb6c" strokeWidth="3" />
                <ellipse cx="100" cy="144" rx="20" ry="12" fill="none" stroke="#3d6c34" strokeWidth="2.2" />
                <path d="M60 206Q100 216 140 206" stroke="#e0bb6c" strokeWidth="4" fill="none" />
                <use href="#wArm" />
                <use href="#wArm" transform="translate(200 0) scale(-1 1)" />
                <path d="M100 162Q110 172 106 196L94 196Q90 172 100 162Z" fill="#e6ab7c" stroke="#b97a4e" strokeWidth="1.2" />
                <path d="M100 168V194" stroke="#b97a4e" strokeWidth="1.2" />
                <ellipse cx="71" cy="88" rx="4.8" ry="7.5" fill="#e6ab7c" />
                <ellipse cx="129" cy="88" rx="4.8" ry="7.5" fill="#e6ab7c" />
                <circle cx="71" cy="94" r="3.2" fill="#e0bb6c" />
                <circle cx="129" cy="94" r="3.2" fill="#e0bb6c" />
                <ellipse cx="100" cy="84" rx="27" ry="32" fill="#e6ab7c" />
                <path d="M80 75Q88 70 96 75M104 75Q112 70 120 75" stroke="#1f1209" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                <ellipse cx="88" cy="82" rx="3.5" ry="2.2" fill="#1f1209" />
                <ellipse cx="112" cy="82" rx="3.5" ry="2.2" fill="#1f1209" />
                <circle cx="89" cy="81" r="1.1" fill="#fff" />
                <circle cx="113" cy="81" r="1.1" fill="#fff" />
                <path d="M100 82Q97 93 101 95" stroke="#b97a4e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="95" cy="94" r="2.8" fill="none" stroke="#e0bb6c" strokeWidth="1" />
                <path d="M92 104Q100 111 108 104" stroke="#991b1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <circle cx="100" cy="72" r="3.5" fill="#a4180c" />
                <circle cx="100" cy="67" r="1.4" fill="#e0bb6c" />
                <path d="M68 66C68 36 82 22 100 22C118 22 132 36 132 66C120 48 80 48 68 66Z" fill="#140b06" />
                <circle cx="100" cy="46" r="4.2" fill="#e0bb6c" stroke="#991b1b" strokeWidth="1.5" />
                <path d="M50 48Q100 18 150 48Q176 130 152 470L136 470Q158 200 136 100Q100 94 64 100Q42 200 64 470L48 470Q24 130 50 48Z" fill="rgba(216,68,48,.55)" stroke="#e0bb6c" strokeWidth="1.8" />
                <path d="M56 58Q100 32 144 58" stroke="#e0bb6c" strokeWidth="2.5" fill="none" strokeDasharray="4 3" />
              </svg>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CANVAS FLOWER & PETAL SHOWER (MIXED PETALS & BLOSSOMS)   */}
        {/* ======================================================== */}
        <canvas
          ref={flowerCanvasRef}
          className="absolute inset-0 pointer-events-none z-25"
        />

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
