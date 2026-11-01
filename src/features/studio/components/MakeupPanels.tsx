import React, { useState } from 'react';
import { Eye, Smile, Sparkles, Waves, Wand2, Check, Sliders, Palette, ShieldCheck, Sun, Moon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLookStore } from '../store/lookStore';
import type { SectionKey } from '../lib/types';
import * as P from '../lib/presets';

type Cat = 'lips' | 'eyes' | 'face' | 'hair' | 'looks';

const CATS: { id: Cat; label: string; icon: React.ElementType; sub: string }[] = [
  { id: 'lips', label: 'Lips', icon: Smile, sub: 'Lipsticks & Gloss' },
  { id: 'eyes', label: 'Eyes', icon: Eye, sub: 'Liner & Shadows' },
  { id: 'face', label: 'Face', icon: Sparkles, sub: 'Blush & Glow' },
  { id: 'hair', label: 'Hair', icon: Waves, sub: 'Salon Gloss' },
  { id: 'looks', label: 'Looks', icon: Wand2, sub: 'Curated Sets' },
];

interface Opt { id: string; label: string; icon?: string }
interface SectionDef {
  key: SectionKey;
  title: string;
  categoryLabel: string;
  swatches: P.Swatch[];
  optKey?: string;
  opts?: Opt[];
  note?: string;
  preview?: boolean;
}

const DEFS: Record<Exclude<Cat, 'looks'>, SectionDef[]> = {
  lips: [
    {
      key: 'lips',
      title: 'Couture Lipstick & Gloss',
      categoryLabel: 'Lip Artistry',
      swatches: P.LIP_SWATCHES,
      optKey: 'finish',
      opts: [
        { id: 'matte', label: 'Velvet Matte' },
        { id: 'satin', label: 'Silk Satin' },
        { id: 'glossy', label: 'Crystal Gloss' },
      ],
    },
  ],
  eyes: [
    {
      key: 'eyeliner',
      title: 'Precision Eyeliner',
      categoryLabel: 'Eye Definition',
      swatches: P.LINER_SWATCHES,
      optKey: 'style',
      opts: [
        { id: 'classic', label: 'Classic' },
        { id: 'winged', label: 'Winged Drama' },
        { id: 'bold', label: 'Bold Cat' },
        { id: 'smudged', label: 'Smoky Blend' },
        { id: 'lower', label: 'Dual Rim' },
      ],
    },
    {
      key: 'eyeshadow',
      title: 'Silk Eyeshadow Palette',
      categoryLabel: 'Eye Shimmer',
      swatches: P.SHADOW_SWATCHES,
      optKey: 'style',
      opts: [
        { id: 'wash', label: 'Soft Wash' },
        { id: 'smoky', label: 'Smoky Dimension' },
      ],
    },
  ],
  face: [
    {
      key: 'blush',
      title: 'Radiant Silk Blush',
      categoryLabel: 'Cheek Color',
      swatches: P.BLUSH_SWATCHES,
      optKey: 'style',
      opts: [
        { id: 'apple', label: 'Apple Glow' },
        { id: 'sculpt', label: 'Sculpted Contour' },
      ],
    },
    {
      key: 'highlighter',
      title: 'Prism Highlighter',
      categoryLabel: 'Strobe Glow',
      swatches: P.HIGHLIGHT_SWATCHES,
    },
    {
      key: 'foundation',
      title: 'Complexion Glow Tint',
      categoryLabel: 'Skin Tone Filter',
      swatches: P.FOUNDATION_SWATCHES,
      preview: true,
      note: 'Luminous skin tone filter tailored for Indian lighting and warm/cool undertones.',
    },
  ],
  hair: [
    {
      key: 'hair',
      title: 'Botanical Hair Colour',
      categoryLabel: 'Gloss & Highlights',
      swatches: P.HAIR_SWATCHES,
      preview: true,
      note: 'Photo try-on for hair undertones. Works best on front-facing portrait photos.',
    },
  ],
};

function finishPreview(key: SectionKey, id: string, color: string) {
  if (key === 'lips') {
    return id === 'glossy'
      ? `radial-gradient(circle at 35% 30%, #fff 0, ${color} 65%)`
      : id === 'satin'
      ? `linear-gradient(135deg, ${color}, #ffffff55)`
      : color;
  }
  return color;
}

/** Product Photo / Luxury SVG Visual Component */
function ProductVisual({ defKey, color, finish }: { defKey: SectionKey; color: string; finish?: string }) {
  if (defKey === 'lips') {
    return (
      <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-950/10 via-amber-500/10 to-rose-500/10 border border-amber-500/20 shadow-inner flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Base Casing - Gold & Obsidian */}
          <rect x="36" y="52" width="28" height="38" rx="3" fill="#1C1819" />
          <rect x="38" y="54" width="24" height="34" rx="2" fill="url(#goldGrad)" />
          <rect x="42" y="46" width="16" height="8" rx="1" fill="#D4AF37" />
          {/* Lipstick Bullet */}
          <path
            d="M 43,46 L 43,26 C 43,18 51,12 55,8 C 57,20 57,26 57,46 Z"
            fill={color}
          />
          {finish === 'glossy' && (
            <path
              d="M 45,26 C 45,20 50,15 52,12"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
          )}
          {/* Gold Trim Gradients */}
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C5A059" />
              <stop offset="50%" stopColor="#EAD397" />
              <stop offset="100%" stopColor="#8C6510" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (defKey === 'eyeshadow') {
    return (
      <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-950/10 via-amber-500/10 to-rose-500/10 border border-amber-500/20 shadow-inner flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Palette Case */}
          <rect x="20" y="24" width="60" height="56" rx="6" fill="#1F1B1C" stroke="#D4AF37" strokeWidth="1.5" />
          {/* 4 Wells */}
          <rect x="26" y="30" width="20" height="20" rx="3" fill={color} />
          <rect x="54" y="30" width="20" height="20" rx="3" fill="#E8C37B" />
          <rect x="26" y="54" width="20" height="20" rx="3" fill="#6A3B24" />
          <rect x="54" y="54" width="20" height="20" rx="3" fill="#D9A5B3" />
          {/* Shimmer Highlight */}
          <circle cx="36" cy="40" r="4" fill="#ffffff" opacity="0.35" />
        </svg>
      </div>
    );
  }

  if (defKey === 'eyeliner') {
    return (
      <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-950/10 via-amber-500/10 to-rose-500/10 border border-amber-500/20 shadow-inner flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Eyeliner Wand */}
          <path d="M 22,78 L 72,28" stroke="#181516" strokeWidth="8" strokeLinecap="round" />
          <path d="M 44,56 L 48,52" stroke="#D4AF37" strokeWidth="8" />
          <path d="M 72,28 L 84,16" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
          {/* Wing Stroke */}
          <path d="M 24,84 Q 50,86 76,70" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (defKey === 'blush') {
    return (
      <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-950/10 via-amber-500/10 to-rose-500/10 border border-amber-500/20 shadow-inner flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Compact Case */}
          <circle cx="50" cy="50" r="34" fill="#181516" stroke="#D4AF37" strokeWidth="2" />
          {/* Powder Well with Marbled Texture */}
          <circle cx="50" cy="50" r="26" fill={color} />
          <circle cx="46" cy="46" r="18" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.25" />
          <circle cx="52" cy="52" r="10" fill="none" stroke="#000000" strokeWidth="1" opacity="0.15" />
        </svg>
      </div>
    );
  }

  if (defKey === 'highlighter') {
    return (
      <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-950/10 via-amber-500/10 to-rose-500/10 border border-amber-500/20 shadow-inner flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Diamond Strobe Compact */}
          <polygon points="50,16 84,50 50,84 16,50" fill="#1F1B1C" stroke="#D4AF37" strokeWidth="2" />
          <polygon points="50,24 76,50 50,76 24,50" fill={color} />
          <polygon points="50,32 68,50 50,68 32,50" fill="#ffffff" opacity="0.4" />
        </svg>
      </div>
    );
  }

  if (defKey === 'foundation') {
    return (
      <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-950/10 via-amber-500/10 to-rose-500/10 border border-amber-500/20 shadow-inner flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
          {/* Dropper Bottle */}
          <rect x="36" y="44" width="28" height="42" rx="6" fill={color} stroke="#D4AF37" strokeWidth="1.5" />
          <rect x="42" y="34" width="16" height="10" rx="1" fill="#C5A059" />
          <rect x="45" y="20" width="10" height="14" rx="2" fill="#1C1819" />
          <circle cx="44" cy="54" r="3" fill="#ffffff" opacity="0.4" />
        </svg>
      </div>
    );
  }

  // Hair
  return (
    <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-950/10 via-amber-500/10 to-rose-500/10 border border-amber-500/20 shadow-inner flex-shrink-0">
      <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
        {/* Hair Gloss Elixir Bottle */}
        <rect x="36" y="42" width="28" height="44" rx="8" fill="#1F1A1B" stroke="#D4AF37" strokeWidth="1.5" />
        <path d="M 44,42 Q 50,26 50,22 L 50,22 Q 50,26 56,42 Z" fill="#D4AF37" />
        <rect x="40" y="50" width="20" height="28" rx="4" fill={color} />
        <path d="M 43,54 L 43,72" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    </div>
  );
}

/** Individual Beauty Product Section with Real Visuals, Swatch Carousel & Intensity */
function Section({ def, disabledReason }: { def: SectionDef; disabledReason?: string }) {
  const sec = useLookStore((s) => s.look[def.key]) as any;
  const update = useLookStore((s) => s.update) as (k: SectionKey, p: any) => void;
  const dis = !!disabledReason;
  const same = (a: string, b: string) => a?.toLowerCase() === b?.toLowerCase();

  const currentSwatch = def.swatches.find((s) => same(s.color, sec.color)) || { name: 'Custom Shade', color: sec.color };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-4 sm:p-5 shadow-sm transition-all hover:border-amber-500/30">
      {/* Product Header & Toggle */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500" />
          <div>
            <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{def.title}</h3>
            <p className="text-[11px] text-muted-foreground">{def.categoryLabel}</p>
          </div>
          {def.preview && <Badge variant="secondary" className="text-[10px] py-0 px-1.5">Preview</Badge>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-medium text-muted-foreground">{sec.enabled && !dis ? 'Applied' : 'Off'}</span>
          <Switch
            checked={sec.enabled && !dis}
            disabled={dis}
            onCheckedChange={(v) => update(def.key, { enabled: v })}
            aria-label={`Apply ${def.title}`}
          />
        </div>
      </div>

      {disabledReason && (
        <p role="status" className="mb-3 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
          {disabledReason}
        </p>
      )}

      {/* Hero Visual Card with Current Active Product Info */}
      <div className="flex items-center gap-3.5 p-3 rounded-xl bg-muted/40 border border-border/60 mb-4">
        <ProductVisual defKey={def.key} color={sec.color} finish={sec.finish} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs flex-shrink-0"
              style={{ background: finishPreview(def.key, sec.finish || '', sec.color) }}
            />
            <h4 className="font-bold text-sm text-foreground truncate">{currentSwatch.name}</h4>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {sec.finish ? `Finish: ${sec.finish.toUpperCase()}` : sec.style ? `Style: ${sec.style.toUpperCase()}` : 'Couture Pigment'} · {sec.intensity}% Depth
          </p>
          {def.note && <p className="text-[10px] text-muted-foreground/80 mt-1 line-clamp-1">{def.note}</p>}
        </div>
      </div>

      <fieldset disabled={dis} className={cn('space-y-4', dis && 'opacity-50 pointer-events-none')}>
        {/* Style / Finish Selector Pills */}
        {def.opts && (
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Style &amp; Finish</div>
            <div role="radiogroup" aria-label={`${def.title} style`} className="flex flex-wrap gap-1.5">
              {def.opts.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={sec[def.optKey!] === o.id}
                  onClick={() => update(def.key, { [def.optKey!]: o.id, enabled: true })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    sec[def.optKey!] === o.id
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border/80 bg-background/80 text-foreground hover:bg-muted'
                  )}
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-full border border-black/20"
                    style={{ background: finishPreview(def.key, o.id, sec.color) }}
                  />
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Horizontal Scroll Shade Carousel (NO vertical page scroll required!) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Select Shade</span>
            <span className="text-[10px] font-normal lowercase">← Swipe to explore →</span>
          </div>

          <div
            role="radiogroup"
            aria-label={`${def.title} colour shades`}
            className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x"
          >
            {def.swatches.map((s) => {
              const isSelected = same(sec.color, s.color);
              return (
                <button
                  key={s.color}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={s.name}
                  onClick={() => update(def.key, { color: s.color, enabled: true })}
                  className={cn(
                    'group relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all flex-shrink-0 snap-start min-w-[70px]',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/30 scale-102'
                      : 'border-border/70 bg-card hover:bg-muted/60'
                  )}
                >
                  <div
                    className="relative w-8 h-8 rounded-full shadow-sm border-2 border-white ring-1 ring-black/10 flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ background: s.color }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />}
                  </div>
                  <span className="text-[10.5px] font-medium text-foreground mt-1.5 text-center truncate max-w-[64px]">
                    {s.name}
                  </span>
                </button>
              );
            })}

            {/* Custom Shade Picker Pill */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-border/80 flex-shrink-0 min-w-[70px]">
              <label
                htmlFor={`c-${def.key}`}
                className="relative w-8 h-8 rounded-full cursor-pointer flex items-center justify-center bg-gradient-to-tr from-rose-500 via-amber-400 to-indigo-500 shadow-sm"
              >
                <Palette className="w-4 h-4 text-white drop-shadow" />
                <input
                  id={`c-${def.key}`}
                  type="color"
                  value={sec.color}
                  onChange={(e) => update(def.key, { color: e.target.value, enabled: true })}
                  className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                />
              </label>
              <span className="text-[10px] text-muted-foreground mt-1.5">Custom</span>
            </div>
          </div>
        </div>

        {/* Intensity Control with Instant Preset Chips */}
        <div className="pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Depth &amp; Intensity</span>
            <div className="flex items-center gap-1.5">
              {[
                { label: 'Soft', val: 35 },
                { label: 'Natural', val: 65 },
                { label: 'Glam', val: 90 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => update(def.key, { intensity: p.val, enabled: true })}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] border transition-colors',
                    sec.intensity === p.val
                      ? 'border-primary bg-primary text-primary-foreground font-semibold'
                      : 'border-border/70 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {p.label}
                </button>
              ))}
              <span className="ml-1 font-bold text-primary text-xs">{sec.intensity}%</span>
            </div>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[sec.intensity]}
            onValueChange={([v]) => update(def.key, { intensity: v, enabled: true })}
            className="cursor-pointer"
          />
        </div>
      </fieldset>
    </div>
  );
}

/** Pre-Curated Luxury Signature Looks */
function Looks() {
  const apply = useLookStore((s) => s.applyLook);

  const curatedLooks = [
    {
      ...P.PRESETS[1], // Bridal Red
      badge: 'Royal Wedding',
      icon: '👑',
      tagline: '24K Gold shimmer lids, classic winged cat-eye & royal crimson velvet lip.',
    },
    {
      ...P.PRESETS[0], // Natural Glow
      badge: 'Everyday Glow',
      icon: '✨',
      tagline: 'Dewy peach blush, sunlit champagne strobe & satin silk nude lip.',
    },
    {
      ...P.PRESETS[3], // Soft Rose
      badge: 'Festive Pastel',
      icon: '🌸',
      tagline: 'Rosy cheeks, soft gold wash lid & crystal gloss mauve lips.',
    },
    {
      ...P.PRESETS[2], // Evening Smoky
      badge: 'Runway Gala',
      icon: '🌙',
      tagline: 'Charcoal smoky lids, bold sculpted contour & velvet plum lip.',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/20">
        <p className="text-xs font-medium text-foreground">
          ✨ 1-Tap Signature Makeovers. Tap any couture look to apply the entire harmonized palette, then fine-tune any shade below.
        </p>
      </div>

      <div className="grid gap-3">
        {curatedLooks.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => apply(p.look)}
            className="group relative flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card/90 p-4 text-left transition-all hover:border-amber-500/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-muted/60 border border-border/70 flex-shrink-0 text-2xl shadow-inner group-hover:scale-105 transition-transform">
              <span>{p.icon}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">{p.name}</h4>
                  <Badge variant="outline" className="text-[9.5px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                    {p.badge}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.tagline || p.blurb}</p>

              {/* Shade Palette Preview Pills */}
              <div className="mt-2.5 flex items-center gap-1.5">
                {[
                  { label: 'Lip', c: p.look.lips.color },
                  { label: 'Eye', c: p.look.eyeshadow.enabled ? p.look.eyeshadow.color : p.look.eyeliner.color },
                  { label: 'Blush', c: p.look.blush.color },
                  { label: 'Glow', c: p.look.highlighter.color },
                ].map((item, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-muted/80 border border-border/60"
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-xs" style={{ background: item.c }} />
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MakeupPanels({ hairDisabledReason, faceReady }: { hairDisabledReason?: string; faceReady: boolean }) {
  const [cat, setCat] = useState<Cat>('lips');
  const look = useLookStore((s) => s.look);
  const has = (c: Cat) => c !== 'looks' && DEFS[c].some((d) => look[d.key].enabled);

  return (
    <div className="flex flex-col gap-4">
      {/* Category Tab Bar - Luxury Rounded Glass Style */}
      <div
        role="tablist"
        aria-label="Makeup categories"
        className="flex gap-1.5 overflow-x-auto rounded-2xl bg-muted/70 p-1.5 border border-border/70 scrollbar-none"
      >
        {CATS.map(({ id, label, icon: Icon, sub }) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={cat === id}
            aria-controls={`panel-${id}`}
            type="button"
            onClick={() => setCat(id)}
            className={cn(
              'relative flex min-w-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-2 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
              cat === id
                ? 'bg-background text-primary shadow-sm font-semibold scale-102 border border-border/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span className="text-[11px] whitespace-nowrap">{label}</span>
            {has(id) && (
              <span
                aria-label="active"
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 shadow-xs"
              />
            )}
          </button>
        ))}
      </div>

      {!faceReady && (
        <div className="rounded-xl border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Select any shade below — your choices will instantly preview as soon as a photo or camera is active.</span>
        </div>
      )}

      {/* Tab Panels */}
      <div role="tabpanel" id={`panel-${cat}`} aria-labelledby={`tab-${cat}`} key={cat} className="space-y-4">
        {cat === 'looks' ? (
          <Looks />
        ) : (
          DEFS[cat].map((d) => (
            <Section key={d.key} def={d} disabledReason={d.key === 'hair' ? hairDisabledReason : undefined} />
          ))
        )}
      </div>
    </div>
  );
}
