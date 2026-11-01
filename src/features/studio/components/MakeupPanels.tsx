import { useState } from 'react';
import { Eye, Smile, Sparkles, Waves, Wand2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLookStore } from '../store/lookStore';
import type { SectionKey } from '../lib/types';
import * as P from '../lib/presets';

type Cat = 'lips' | 'eyes' | 'face' | 'hair' | 'looks';
const CATS: { id: Cat; label: string; icon: typeof Smile }[] = [
  { id: 'lips', label: 'Lips', icon: Smile }, { id: 'eyes', label: 'Eyes', icon: Eye }, { id: 'face', label: 'Face', icon: Sparkles },
  { id: 'hair', label: 'Hair', icon: Waves }, { id: 'looks', label: 'Looks', icon: Wand2 },
];

interface Opt { id: string; label: string }
interface SectionDef { key: SectionKey; title: string; swatches: P.Swatch[]; optKey?: string; opts?: Opt[]; note?: string; preview?: boolean }

const DEFS: Record<Exclude<Cat, 'looks'>, SectionDef[]> = {
  lips: [{ key: 'lips', title: 'Lipstick', swatches: P.LIP_SWATCHES, optKey: 'finish', opts: [{ id: 'matte', label: 'Matte' }, { id: 'satin', label: 'Satin' }, { id: 'glossy', label: 'Glossy' }] }],
  eyes: [
    { key: 'eyeliner', title: 'Eyeliner', swatches: P.LINER_SWATCHES, optKey: 'style', opts: [{ id: 'classic', label: 'Classic' }, { id: 'winged', label: 'Winged' }, { id: 'bold', label: 'Bold' }, { id: 'smudged', label: 'Smudged' }, { id: 'lower', label: 'Upper + lower' }] },
    { key: 'eyeshadow', title: 'Eyeshadow', swatches: P.SHADOW_SWATCHES, optKey: 'style', opts: [{ id: 'wash', label: 'Soft wash' }, { id: 'smoky', label: 'Smoky' }] },
  ],
  face: [
    { key: 'blush', title: 'Blush', swatches: P.BLUSH_SWATCHES, optKey: 'style', opts: [{ id: 'apple', label: 'Apple' }, { id: 'sculpt', label: 'Sculpted' }] },
    { key: 'highlighter', title: 'Highlighter', swatches: P.HIGHLIGHT_SWATCHES },
    { key: 'foundation', title: 'Complexion tone', swatches: P.FOUNDATION_SWATCHES, preview: true, note: 'A tone tint over skin — a preview, not a true foundation simulation.' },
  ],
  hair: [{ key: 'hair', title: 'Hair colour', swatches: P.HAIR_SWATCHES, preview: true, note: 'Colour preview only (photo mode). It can’t change hairstyle or length, and very dark hair shows colour subtly.' }],
};

function finishPreview(key: SectionKey, id: string, color: string) {
  if (key === 'lips') return id === 'glossy' ? `radial-gradient(circle at 35% 30%, #fff 0, ${color} 55%)` : id === 'satin' ? `linear-gradient(135deg, ${color}, #fff6)` : color;
  return color;
}

function Section({ def, disabledReason }: { def: SectionDef; disabledReason?: string }) {
  const sec = useLookStore((s) => s.look[def.key]) as any;
  const update = useLookStore((s) => s.update) as (k: SectionKey, p: any) => void;
  const dis = !!disabledReason;
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-medium">{def.title}{def.preview && <Badge variant="secondary">Preview</Badge>}</h3>
        <Switch checked={sec.enabled && !dis} disabled={dis} onCheckedChange={(v) => update(def.key, { enabled: v })} aria-label={`Apply ${def.title}`} />
      </div>
      {def.note && <p className="mb-3 text-xs text-muted-foreground">{def.note}</p>}
      {disabledReason && <p role="status" className="mb-3 text-xs text-amber-700 dark:text-amber-400">{disabledReason}</p>}
      <fieldset disabled={dis} className={cn('space-y-4', dis && 'opacity-50')}>
        {def.opts && (
          <div role="radiogroup" aria-label={`${def.title} style`} className="flex flex-wrap gap-2">
            {def.opts.map((o) => (
              <button key={o.id} type="button" role="radio" aria-checked={sec[def.optKey!] === o.id}
                onClick={() => update(def.key, { [def.optKey!]: o.id, enabled: true })}
                className={cn('flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  sec[def.optKey!] === o.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted')}>
                <span aria-hidden className="h-3 w-3 rounded-full border border-black/10" style={{ background: finishPreview(def.key, o.id, sec.color) }} />{o.label}
              </button>
            ))}
          </div>
        )}
        <div role="radiogroup" aria-label={`${def.title} colour`} className="flex flex-wrap items-center gap-2">
          {def.swatches.map((s) => (
            <button key={s.color} type="button" role="radio" aria-checked={same(sec.color, s.color)} aria-label={s.name} title={s.name}
              onClick={() => update(def.key, { color: s.color, enabled: true })}
              className={cn('h-8 w-8 rounded-full border-2 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                same(sec.color, s.color) ? 'scale-110 border-primary' : 'border-white shadow ring-1 ring-black/10')} style={{ background: s.color }} />
          ))}
          <label htmlFor={`c-${def.key}`} className="sr-only">Custom {def.title} colour</label>
          <input id={`c-${def.key}`} type="color" value={sec.color} onChange={(e) => update(def.key, { color: e.target.value, enabled: true })} className="h-8 w-8 cursor-pointer rounded-full border border-border bg-transparent p-0" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span id={`${def.key}-int`}>Intensity</span><span>{sec.intensity}%</span></div>
          <Slider min={0} max={100} step={1} value={[sec.intensity]} aria-labelledby={`${def.key}-int`} onValueChange={([v]) => update(def.key, { intensity: v, enabled: true })} />
        </div>
      </fieldset>
    </div>
  );
}

function Looks() {
  const apply = useLookStore((s) => s.applyLook);
  return (
    <div className="grid gap-3">
      <p className="text-xs text-muted-foreground">Combined looks set several effects at once. You can fine-tune any of them afterwards.</p>
      {P.PRESETS.map((p) => (
        <button key={p.id} type="button" onClick={() => apply(p.look)} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <span aria-hidden className="flex -space-x-1">{[p.look.lips.color, p.look.eyeshadow.enabled ? p.look.eyeshadow.color : p.look.blush.color, p.look.blush.color].map((c, i) => <span key={i} className="h-6 w-6 rounded-full border-2 border-white" style={{ background: c }} />)}</span>
          <span><span className="block text-sm font-medium">{p.name}</span><span className="block text-xs text-muted-foreground">{p.blurb}</span></span>
        </button>
      ))}
    </div>
  );
}

export function MakeupPanels({ hairDisabledReason, faceReady }: { hairDisabledReason?: string; faceReady: boolean }) {
  const [cat, setCat] = useState<Cat>('lips');
  const look = useLookStore((s) => s.look);
  const has = (c: Cat) => c !== 'looks' && DEFS[c].some((d) => look[d.key].enabled);
  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Makeup categories" className="flex gap-1 overflow-x-auto rounded-full bg-muted p-1">
        {CATS.map(({ id, label, icon: Icon }) => (
          <button key={id} role="tab" id={`tab-${id}`} aria-selected={cat === id} aria-controls={`panel-${id}`} type="button" onClick={() => setCat(id)}
            className={cn('relative flex min-w-[4.25rem] flex-1 flex-col items-center gap-0.5 rounded-full px-3 py-2 text-xs transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
              cat === id ? 'bg-background text-primary shadow' : 'text-muted-foreground hover:text-foreground')}>
            <Icon className="h-4 w-4" aria-hidden />{label}
            {has(id) && <span aria-label="active" className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
      {!faceReady && <p role="status" className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">Add a photo or capture a frame to see makeup applied. Your choices are remembered meanwhile.</p>}
      <div role="tabpanel" id={`panel-${cat}`} aria-labelledby={`tab-${cat}`} key={cat} className="space-y-3">
        {cat === 'looks' ? <Looks /> : DEFS[cat].map((d) => <Section key={d.key} def={d} disabledReason={d.key === 'hair' ? hairDisabledReason : undefined} />)}
      </div>
    </div>
  );
}
