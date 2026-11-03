'use client'; // needed for Next.js App Router; harmless elsewhere

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import './BlindGlowTryOn.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export type Look = {
  name: string;
  /** lipstick swatch color */
  lip: string;
  /** soft color wash used for the "after" side */
  tint: [string, string];
  /** Image candidates, tried in order. Put your own file FIRST. */
  srcs: string[];
  /** Accurate skin tone description */
  toneLabel?: string;
  /** Match confidence */
  toneMatch?: string;
};

type Chapter = { label: string; lead: string; accent: string; text: string; chips: string[] };
type Theme = { b1: string; b2: string; acc: string; hi: string };

export type BlindGlowTryOnProps = {
  looks?: Look[];
  ctaLabel?: string;
  ctaHref?: string;
  onLaunchStudio?: () => void;
};

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const DEFAULT_LOOKS: Look[] = [
  {
    name: 'Rosewood',
    lip: '#a9585f',
    tint: ['#f4dcd3', '#dca7a6'],
    srcs: ['/images/blindglow/model-1.jpg', '/images/model.png', unsplash('1610889957733-ce9a7bde0da3')],
    toneLabel: 'Warm Honey · Gold Undertone',
    toneMatch: '98% match',
  },
  {
    name: 'Berry Night',
    lip: '#7a3a58',
    tint: ['#ecd9e3', '#bd93ac'],
    srcs: ['/images/blindglow/model-2.jpg', '/images/category-bridal.jpg', unsplash('1599407365109-d62ea7d81a42')],
    toneLabel: 'Royal Bridal · Neutral Warm',
    toneMatch: '99% match',
  },
  {
    name: 'Coral Pop',
    lip: '#c8725f',
    tint: ['#f6e2d0', '#e4a98f'],
    srcs: ['/images/blindglow/model-3.jpg', '/images/diwali-campaign-master.jpg', unsplash('1619749652035-d026e321389f')],
    toneLabel: 'Festive Radiance · Amber Glow',
    toneMatch: '97% match',
  },
];

const CHAPTERS: Chapter[] = [
  { label: 'Discover', lead: 'Meet your new', accent: 'makeup studio.', chips: ['Virtual try-on', 'Natural-looking results'],
    text: 'BlindGlow AI turns your camera into a virtual couture beauty counter. Scroll to see how it works.' },
  { label: 'Scan', lead: 'It reads', accent: 'your face.', chips: ['32-Point Mesh', 'Sub-millimeter tracking'],
    text: 'Facial contours, eye angles, and lip curvatures are mapped in real-time, placing every pigment with millimeter precision.' },
  { label: 'Match', lead: 'It finds', accent: 'your shades.', chips: ['Undertone aware', 'Indian skin tones'],
    text: 'Skin tone, depth, and undertone (warm, cool, neutral) are matched to curated pigments that naturally complement your complexion.' },
  { label: 'Apply', lead: 'Watch the color', accent: 'land.', chips: ['Velvet Lipstick', 'Silk Blush', 'Prism Eyeshadow'],
    text: 'Choose a couture finish and watch it blend realistically, reacting naturally to lighting and facial contours.' },
  { label: 'Compare', lead: 'Slide between', accent: 'you and your glow.', chips: ['Interactive slider', 'Side-by-side view'],
    text: 'Drag or scroll the before & after divider to inspect bare skin versus the finished look without guesswork.' },
  { label: 'Explore', lead: 'Every look.', accent: 'Every skin tone.', chips: ['1-Tap Switch', 'Couture Palettes'],
    text: 'Explore soft everyday glow, royal bridal glam, and festive radiance. Tap any shade swatch below to switch model and tone.' },
];

/* Muted but colourful backgrounds, one per chapter */
const THEMES: Theme[] = [
  { b1: '#e7cfd6', b2: '#d3b3c6', acc: '#7a3358', hi: '#f1dfe5' }, // mauve
  { b1: '#c9dccb', b2: '#a8c4b0', acc: '#2f5d4b', hi: '#e3efe4' }, // sage
  { b1: '#f0c9ae', b2: '#e3a58b', acc: '#8f3d27', hi: '#f8e2d2' }, // clay
  { b1: '#e9bcc6', b2: '#d99aac', acc: '#8a2f4b', hi: '#f6dbe1' }, // rose
  { b1: '#bcd0e6', b2: '#9fb6d6', acc: '#2c4f82', hi: '#dce8f5' }, // dusty blue
  { b1: '#ecd88f', b2: '#d9bd6a', acc: '#7a5a10', hi: '#f6ecbb' }, // mustard
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Scroll progress (0..1) through a tall section, smoothed. Autoplays until the visitor scrolls. */
function useStory(ref: { current: HTMLElement | null }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let tgt = 0, cur = 0, auto = false, hold = 0, visible = true, raf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const read = () => {
      const r = el.getBoundingClientRect();
      tgt = clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 0.9999);
    };
    const onScroll = () => { auto = false; read(); };
    const onUser = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (auto && !t?.closest?.('.tl,.tray')) auto = false;
    };
    const tick = () => {
      if (visible) {
        if (auto) {
          if (hold > 0) { hold--; if (hold === 0) { tgt = 0; cur = 0; } }
          else { tgt += 0.0007; if (tgt >= 0.9999) { tgt = 0.9999; hold = 170; } }
        }
        cur += (tgt - cur) * 0.16;
        if (Math.abs(tgt - cur) < 0.0004) cur = tgt;
        setP(cur);
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    read(); cur = tgt;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', read);
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) =>
      window.addEventListener(ev, onUser, { passive: true }));
    const timer = window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (!reduce && r.top > -10 && r.top < window.innerHeight * 0.5) auto = true;
    }, 1600);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer); io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', read);
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) =>
        window.removeEventListener(ev, onUser));
    };
  }, [ref]);
  return p;
}

/** Tries each src in order; renders nothing if all fail (placeholder stays visible). */
function Photo({ srcs, alt }: { srcs: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (i >= srcs.length) return null;
  return (
    <img src={srcs[i]} alt={alt} decoding="async" referrerPolicy="no-referrer"
         onError={() => setI((n) => n + 1)} />
  );
}

function Headline({ lead, accent }: { lead: string; accent: string }) {
  let n = 0;
  const words = (s: string, em: boolean) =>
    s.split(' ').filter(Boolean).map((w) => {
      const k = n++;
      const inner = (
        <span className="wd" key={`${em ? 'e' : 'p'}${k}`}>
          <span className="c" style={{ ['--i' as string]: k } as CSSProperties}>{w}</span>
        </span>
      );
      return em ? <em key={`em${k}`}>{inner}</em> : inner;
    });
  return <h2 aria-label={`${lead} ${accent}`}>{words(lead, false)}{words(accent, true)}</h2>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function BlindGlowTryOn({
  looks = DEFAULT_LOOKS,
  ctaLabel = 'Start glowing',
  ctaHref = '#',
  onLaunchStudio,
}: BlindGlowTryOnProps) {
  const ref = useRef<HTMLElement | null>(null);
  const p = useStory(ref);
  const [picked, setPicked] = useState(0);
  const [dragWipe, setDragWipe] = useState<number | null>(null);
  const isDragging = useRef(false);

  const N = CHAPTERS.length;
  const safeP = clamp(Number.isFinite(p) ? p : 0, 0, 0.9999);
  const x = safeP * N;
  const i = clamp(Math.floor(x), 0, N - 1);
  const t = clamp(x - i, 0, 1);
  const active = Math.min(looks.length - 1, Math.max(0, i === 5 ? picked : 0));
  const th = THEMES[i] || THEMES[0];

  // Anatomically accurate 32-point facial landmark constellation (forehead, brows, eyes, nose, cheeks, lips, jaw)
  const mesh = useMemo(
    () => [
      // Forehead & hairline curve
      { left: 50, top: 21 }, { left: 40, top: 23 }, { left: 60, top: 23 },
      { left: 32, top: 27 }, { left: 68, top: 27 },
      // Eyebrows & upper eye contours
      { left: 36, top: 34 }, { left: 42, top: 33 }, { left: 46, top: 35 },
      { left: 64, top: 34 }, { left: 58, top: 33 }, { left: 54, top: 35 },
      // Left eye contour
      { left: 35, top: 39 }, { left: 43, top: 39 }, { left: 39, top: 38 }, { left: 39, top: 41 },
      // Right eye contour
      { left: 65, top: 39 }, { left: 57, top: 39 }, { left: 61, top: 38 }, { left: 61, top: 41 },
      // Nose bridge and tip
      { left: 50, top: 37 }, { left: 50, top: 43 }, { left: 50, top: 49 },
      { left: 45, top: 51 }, { left: 55, top: 51 },
      // Cheekbone strobe highlights
      { left: 28, top: 46 }, { left: 72, top: 46 },
      { left: 32, top: 53 }, { left: 68, top: 53 },
      // Lips & Cupid's bow contour
      { left: 44, top: 60 }, { left: 50, top: 59 }, { left: 56, top: 60 },
      { left: 50, top: 64 }, { left: 42, top: 62 }, { left: 58, top: 62 },
      // Jawline and chin contour
      { left: 50, top: 74 }, { left: 42, top: 71 }, { left: 58, top: 71 },
      { left: 34, top: 64 }, { left: 66, top: 64 },
    ],
    []
  );

  const sparks = useMemo(
    () => Array.from({ length: 6 }, (_, k) => ({ left: 26 + ((k * 37) % 48), top: 30 + ((k * 53) % 40), delay: k * 0.12 })), []);

  const compare = (v: number) =>
    v < 0.4 ? lerp(100, 30, ease(v / 0.4)) : v < 0.8 ? lerp(30, 78, ease((v - 0.4) / 0.4)) : lerp(78, 100, ease((v - 0.8) / 0.2));

  // Interactive before/after pointer drag handlers (Chapter 4)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (i !== 4) return;
    isDragging.current = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    setDragWipe(pos);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || i !== 4) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    setDragWipe(pos);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging.current) {
      isDragging.current = false;
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    }
  };

  useEffect(() => {
    if (i !== 4) setDragWipe(null);
  }, [i]);

  const autoWipe = i === 3 ? t * 100 : i === 4 ? compare(t) : i === 5 ? 100 : 0;
  const wipe = dragWipe !== null && i === 4 ? dragWipe : autoWipe;
  const meshAmt = i === 1 ? t * 1.15 : i === 2 ? 1.2 : i === 3 ? Math.max(0, 1 - t * 2) : 0;
  const burst = (i === 3 && t > 0.85) || (i === 4 && t < 0.15);
  const pct = i === 2 ? Math.round(t * 98) : i > 2 ? 98 : 0;
  const trayIdx = i === 5 ? active : i === 2 ? Math.min(looks.length - 1, Math.floor(t * 3)) : i === 3 ? 0 : -1;

  const goTo = (k: number) => {
    const el = ref.current;
    if (!el) return;
    const h = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (h * (k + 0.02)) / N, behavior: 'smooth' });
  };

  const rootStyle = { '--b1': th.b1, '--b2': th.b2, '--acc': th.acc, '--hi': th.hi } as CSSProperties;

  return (
    <section className="bgr" id="blindglow" ref={ref} style={rootStyle}>
      <div className="stick">
        <div className="blob bl1" /><div className="blob bl2" />
        <div className="brand">
          <i />
          <span>BlindGlow AI · Virtual Try-On</span>
        </div>

        {onLaunchStudio && (
          <button
            type="button"
            className="skip-btn"
            onClick={onLaunchStudio}
            aria-label="Jump directly to live interactive makeup studio"
          >
            <span>Live Try-On</span>
            <span aria-hidden="true">↓</span>
          </button>
        )}

        <div className="wrap">
          {/* ---------- text ---------- */}
          <div className="texts">
            {CHAPTERS.map((c, k) => (
              <div key={c.label} className={`tx${k === i ? ' on' : ''}${k < i ? ' past' : ''}`}>
                <div className="num">0{k + 1}</div>
                <Headline lead={c.lead} accent={c.accent} />
                <p>{c.text}</p>
                {c.chips.length > 0 && <div className="chips">{c.chips.map((chip) => <span key={chip}>{chip}</span>)}</div>}
                {k === 5 && (
                  <a
                    className="cta"
                    href={ctaHref}
                    onClick={(e) => {
                      if (onLaunchStudio) {
                        e.preventDefault();
                        onLaunchStudio();
                      }
                    }}
                  >
                    {ctaLabel} <span aria-hidden="true">→</span>
                  </a>
                )}
                {k === 0 && <div className="hint">Keep scrolling ↓</div>}
              </div>
            ))}
          </div>

          {/* ---------- visual ---------- */}
          <div className="stage">
            <div className={`pill${i === 1 || i === 2 ? ' show' : ''}`}>
              <span>{looks[active]?.toneLabel || 'Skin tone detected'}</span>
            </div>
            <div className={`match card${i === 2 || i === 3 ? ' show' : ''}`}>
              <b>{pct}%</b>
              <small>{looks[active]?.toneMatch || 'shade match'}</small>
            </div>

            <div style={{ position: 'absolute', inset: 0, transform: `translate3d(0,${p * -34 + 17}px,0)` }}>
              {looks.map((l, k) => {
                const main = k === 0;
                const w = main ? wipe : 100;
                return (
                  <div key={l.name} className={`pc${k === active ? ' act' : ''}${main && burst ? ' burst' : ''}`}>
                    <div
                      className={`ph${main && (i === 1 || i === 2) ? ' vf-on' : ''}${main && i === 4 ? ' cmp' : ''}`}
                      style={{ ['--g1' as string]: l.tint[0], ['--g2' as string]: l.tint[1], ['--w' as string]: `${w}%` } as CSSProperties}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                    >
                      <div className="lay before">
                        <Photo srcs={l.srcs} alt={`${l.name} model`} />
                        <div className="empty">
                          <svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="4" /><path d="M4 21c1-4.5 4.5-6.5 8-6.5s7 2 8 6.5" /></svg>
                          Model photo
                        </div>
                      </div>
                      <div className="lay after"><Photo srcs={l.srcs} alt="" /></div>
                      <div className="vf">
                        <i /><i /><i /><i />
                        {main && mesh.map((m, q) => {
                          const v = clamp(meshAmt * 32 - q, 0, 1);
                          return <b key={q} style={{ left: `${m.left}%`, top: `${m.top}%`, opacity: v, transform: `scale(${0.4 + v * 0.9})` }} />;
                        })}
                      </div>
                      <div className="scan" style={main && i === 1 ? { opacity: t > 0.04 && t < 0.96 ? 1 : 0, top: `${lerp(19, 74, t)}%` } : { opacity: 0 }} />
                      <div className="dv" />
                      <span className="tag b">Before</span><span className="tag a">After</span>
                    </div>
                    <div className="cap card" style={{ opacity: i >= 3 && k === active ? 1 : 0 }}>
                      <i style={{ background: l.lip }} />
                      <div className="cap-meta">
                        <b>{l.name}</b>
                        {l.toneLabel && <small>{l.toneLabel}</small>}
                      </div>
                    </div>
                    {main && sparks.map((s, q) => (
                      <span key={q} className="sp" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }} />
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Direct interactive dragging hint on compare */}
            <div className={`drag-hint card${i === 4 ? ' show' : ''}`}>
              ↔ Drag to inspect bare skin vs glow
            </div>

            <div className={`fc card f1${i >= 3 ? ' show' : ''}`}><i className="lipt" />Lipstick</div>
            <div className={`fc card f2${i >= 3 ? ' show' : ''}`}><i className="blt" />Blush</div>
            <div className={`fc card f3${i >= 3 ? ' show' : ''}`}><i className="sht" />Eyeshadow</div>

            <div className={`tip card${i === 5 ? ' show' : ''}`}>Tap a shade</div>
            <div className={`tray card${i === 2 || i === 3 || i === 5 ? ' show' : ''}${i === 5 ? ' pick' : ''}`}>
              {looks.map((l, k) => (
                <i key={l.name} role="button" tabIndex={0} aria-label={l.name}
                   className={k === trayIdx ? 'sel' : ''} style={{ background: l.lip }}
                   onClick={() => i === 5 && setPicked(k)}
                   onKeyDown={(e) => { if (i === 5 && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setPicked(k); } }} />
              ))}
            </div>
          </div>
        </div>

        {/* ---------- chapter timeline ---------- */}
        <div className="tl" aria-label="Chapters">
          {CHAPTERS.map((c, k) => (
            <button key={c.label} className={k === i ? 'on' : ''} onClick={() => goTo(k)} aria-label={`Go to ${c.label}`}>
              {c.label}<i style={{ width: `${k < i ? 100 : k === i ? t * 100 : 0}%` }} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
