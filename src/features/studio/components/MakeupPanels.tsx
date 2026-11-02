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

/** Individual Beauty Product Section with Luxury Design, Responsive Grid Swatches & Depth */
function Section({ def, disabledReason }: { def: SectionDef; disabledReason?: string }) {
  const sec = useLookStore((s) => s.look[def.key]) as any;
  const update = useLookStore((s) => s.update) as (k: SectionKey, p: any) => void;
  const dis = !!disabledReason;
  const same = (a: string, b: string) => a?.toLowerCase() === b?.toLowerCase();

  const currentSwatch = def.swatches.find((s) => same(s.color, sec.color)) || { name: 'Custom Shade', color: sec.color };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md p-4 sm:p-5 shadow-sm transition-all hover:border-[#C83E68]/30">
      {/* Product Header & Toggle Switch */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/60 shadow-xs ring-1 ring-black/10"
            style={{ background: finishPreview(def.key, sec.finish || '', sec.color) }}
          />
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

      {/* Selected Shade Callout (Luxury Beauty Brand Style) */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60 mb-4">
        <div
          className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white dark:border-zinc-800 ring-2 ring-primary/20"
          style={{ background: finishPreview(def.key, sec.finish || '', sec.color) }}
        >
          <span className="w-3 h-3 rounded-full bg-white/40 shadow-xs" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground truncate">{currentSwatch.name}</h4>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {sec.finish || sec.style || 'Couture'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Depth: <span className="font-semibold text-foreground">{sec.intensity}%</span>
            {def.note && ` · ${def.note}`}
          </p>
        </div>
      </div>

      <fieldset disabled={dis} className={cn('space-y-4', dis && 'opacity-50 pointer-events-none')}>
        {/* Style / Finish Selector Options */}
        {def.opts && (
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Style &amp; Finish</div>
            <div role="radiogroup" aria-label={`${def.title} style`} className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {def.opts.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={sec[def.optKey!] === o.id}
                  onClick={() => update(def.key, { [def.optKey!]: o.id, enabled: true })}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium transition-all text-center',
                    sec[def.optKey!] === o.id
                      ? 'border-[#C83E68] bg-[#C83E68] text-white shadow-xs font-semibold'
                      : 'border-border/80 bg-background/80 text-foreground hover:bg-muted'
                  )}
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full border border-black/20 flex-shrink-0"
                    style={{ background: finishPreview(def.key, o.id, sec.color) }}
                  />
                  <span className="truncate">{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Responsive Luxury Shade Grid - All shades clearly visible without horizontal cutoff */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Select Shade ({def.swatches.length} Tones)</span>
          </div>

          <div
            role="radiogroup"
            aria-label={`${def.title} colour shades`}
            className="grid grid-cols-4 sm:grid-cols-6 gap-2"
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
                    'group flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center',
                    isSelected
                      ? 'border-[#C83E68] bg-rose-500/10 shadow-xs ring-2 ring-[#C83E68]/30 scale-102'
                      : 'border-border/70 bg-card hover:border-border hover:bg-muted/50'
                  )}
                >
                  <div
                    className="relative w-8 h-8 rounded-full shadow-sm border-2 border-white dark:border-zinc-800 ring-1 ring-black/10 flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ background: s.color }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />}
                  </div>
                  <span className="text-[10px] font-medium text-foreground mt-1.5 truncate w-full text-center">
                    {s.name}
                  </span>
                </button>
              );
            })}

            {/* Custom Shade Picker */}
            <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-border/80 hover:border-primary/50 text-center transition-colors">
              <label
                htmlFor={`c-${def.key}`}
                className="relative w-8 h-8 rounded-full cursor-pointer flex items-center justify-center bg-gradient-to-tr from-rose-500 via-amber-400 to-indigo-500 shadow-sm hover:scale-105 transition-transform"
                title="Choose custom shade"
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
              <span className="text-[10px] text-muted-foreground mt-1.5 truncate w-full text-center">
                Custom
              </span>
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
