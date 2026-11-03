import React from 'react';
import { Sparkles } from 'lucide-react';

const RIBBON_ITEMS_1 = [
  'ILLUMINATING YOUR SACRED INNER GRACE',
  'CELEBRATING EVERY INDIAN SKIN TONE & STORY',
  '100% PRIVATE ON-DEVICE NEURAL MAPPING',
  'ROYAL BRIDAL GLOW CRAFTED WITH DEVOTION',
  'REAL-TIME 3D SUB-MILLIMETER TRACKING',
  'HONORING NATURAL BEAUTY · NEVER CHANGING YOU',
  'SEPHORA-GRADE PIGMENTS & PURE SILK FINISH',
  'LOOK IN THE MIRROR AND FALL IN LOVE WITH YOURSELF',
];

const RIBBON_ITEMS_2 = [
  'FOR WEDDING MORNING MEMORIES THAT LAST A LIFETIME',
  'WARM, GOLDEN & HONEY UNDERTONE HARMONY',
  'WHERE HERITAGE ARTISTRY MEETS FUTURE AI',
  '24K GOLD SHIMMER LIDS & VELVET SATIN LIPS',
  'DESIGNED TO TOUCH THE HEART OF EVERY BRIDE',
  'BESPOKE BRIDAL & FESTIVE MAKEOVERS CITYWIDE',
  'ZERO-LATENCY INSTANT LIVE TRY-ON',
  'BEAUTY ROOTED IN CONFIDENCE, GRACE & LOVE',
];

export function StudioMarqueeBanner() {
  return (
    <section
      aria-label="BlindGlow AI Couture Highlights"
      className="relative overflow-hidden py-12 sm:py-16 my-8 border-y border-amber-500/20 bg-gradient-to-b from-card/60 via-muted/30 to-card/60 backdrop-blur-md select-none"
    >
      {/* Animated Ambient Light Blobs in Background */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl pointer-events-none animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '-4s' }}
      />

      {/* Luxury Geometric Cross Pattern Background (Design Cross Effects) */}
      <div className="absolute inset-0 opacity-15 dark:opacity-25 pointer-events-none [background-image:radial-gradient(rgba(197,160,89,0.4)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Floating Animated Cross & Star Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '15%', left: '8%', size: 'text-xs', delay: '0s' },
          { top: '25%', right: '12%', size: 'text-sm', delay: '1.5s' },
          { bottom: '20%', left: '16%', size: 'text-sm', delay: '2.5s' },
          { bottom: '30%', right: '8%', size: 'text-xs', delay: '3.5s' },
          { top: '50%', left: '50%', size: 'text-base', delay: '0.8s' },
        ].map((item, idx) => (
          <span
            key={idx}
            className={`absolute ${item.size} text-amber-500/40 animate-pulse font-serif`}
            style={{
              top: item.top,
              left: (item as any).left,
              right: (item as any).right,
              bottom: (item as any).bottom,
              animationDelay: item.delay,
              animationDuration: '4s',
            }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* Decorative Cross Lines Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.06]">
        <div className="w-[140vw] h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent rotate-12" />
        <div className="w-[140vw] h-[1px] bg-gradient-to-r from-transparent via-rose-500 to-transparent -rotate-12 absolute" />
      </div>

      {/* Edge Gradient Masks for Smooth In/Out Fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-20 pointer-events-none" />

      {/* Crossing Marquee Ribbons Container with 3D Cross Perspective */}
      <div className="relative py-4 space-y-4">
        {/* RIBBON 1: Angled -1.5deg Moving Smoothly from RIGHT TO LEFT */}
        <div className="relative transform -rotate-1 origin-center py-2.5 bg-gradient-to-r from-amber-950/80 via-neutral-900/90 to-amber-950/80 dark:from-neutral-950 dark:via-zinc-900 dark:to-neutral-950 text-white shadow-xl border-y border-amber-500/40 backdrop-blur-md">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] text-xs sm:text-sm font-semibold tracking-widest uppercase">
            {/* Duplicated for seamless infinite loop */}
            {[0, 1].map((copyIndex) => (
              <div key={copyIndex} className="flex items-center gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10">
                {RIBBON_ITEMS_1.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-3 shrink-0">
                    <span className="text-[#C83E68] drop-shadow-[0_0_6px_rgba(200,62,104,0.6)]">✦</span>
                    <span className="text-amber-100/90 tracking-[0.2em] font-medium font-sans">
                      {item}
                    </span>
                    <Sparkles className="w-3 h-3 text-amber-400/80 inline shrink-0" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* RIBBON 2: Cross Counter Ribbon Angled +1.5deg Moving Opposite or Offset */}
        <div className="relative transform rotate-1 origin-center py-2.5 bg-gradient-to-r from-rose-950/80 via-neutral-900/90 to-rose-950/80 dark:from-zinc-950 dark:via-neutral-900 dark:to-zinc-950 text-white shadow-xl border-y border-rose-500/40 backdrop-blur-md">
          <div className="flex w-max animate-marquee-reverse hover:[animation-play-state:paused] text-xs sm:text-sm font-semibold tracking-widest uppercase">
            {/* Duplicated for seamless infinite loop */}
            {[0, 1].map((copyIndex) => (
              <div key={copyIndex} className="flex items-center gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10">
                {RIBBON_ITEMS_2.map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-3 shrink-0">
                    <span className="text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]">✧</span>
                    <span className="text-rose-100/90 tracking-[0.2em] font-medium font-sans">
                      {item}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400/70 inline shrink-0" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StudioMarqueeBanner;
