import { DEFAULT_LOOK, type Look } from './types';

export interface Swatch { name: string; color: string }

export const LIP_SWATCHES: Swatch[] = [
  { name: 'Classic red', color: '#B3122F' }, { name: 'Berry', color: '#7B1E4D' }, { name: 'Rose', color: '#C25872' },
  { name: 'Nude', color: '#B77A6A' }, { name: 'Coral', color: '#E2604F' }, { name: 'Plum', color: '#5E2B4F' },
  { name: 'Mauve', color: '#A5617B' }, { name: 'Brick', color: '#8E3B2E' },
];
export const LINER_SWATCHES: Swatch[] = [
  { name: 'Black', color: '#1A1416' }, { name: 'Brown', color: '#4A2C20' }, { name: 'Navy', color: '#1F2C54' }, { name: 'Plum', color: '#4A2146' },
];
export const SHADOW_SWATCHES: Swatch[] = [
  { name: 'Bronze', color: '#A9703F' }, { name: 'Rose gold', color: '#C9877A' }, { name: 'Plum', color: '#5C3A5E' },
  { name: 'Emerald', color: '#1F6B57' }, { name: 'Navy', color: '#243A6B' }, { name: 'Champagne', color: '#D8B98A' }, { name: 'Charcoal', color: '#3A3A40' },
];
export const BLUSH_SWATCHES: Swatch[] = [
  { name: 'Peach', color: '#F2A08A' }, { name: 'Rose', color: '#E2788C' }, { name: 'Berry', color: '#B74A63' }, { name: 'Coral', color: '#EE7B62' },
];
export const HIGHLIGHT_SWATCHES: Swatch[] = [
  { name: 'Champagne', color: '#F7E3C2' }, { name: 'Pearl', color: '#FFF3EA' }, { name: 'Gold', color: '#F2D08A' }, { name: 'Pink', color: '#FBD5D5' },
];
export const FOUNDATION_SWATCHES: Swatch[] = [
  { name: 'Ivory', color: '#F3D7C0' }, { name: 'Beige', color: '#E3B894' }, { name: 'Sand', color: '#D2A075' },
  { name: 'Honey', color: '#BE8456' }, { name: 'Caramel', color: '#A06A43' }, { name: 'Espresso', color: '#744A2E' },
];
export const HAIR_SWATCHES: Swatch[] = [
  { name: 'Black', color: '#1B1412' }, { name: 'Dark brown', color: '#3B2418' }, { name: 'Chestnut', color: '#6B3A24' }, { name: 'Auburn', color: '#8C3B26' },
  { name: 'Burgundy', color: '#6A1B35' }, { name: 'Honey blonde', color: '#B98B4B' }, { name: 'Ash', color: '#8B7F78' },
];

export interface Preset { id: string; name: string; blurb: string; look: Look }
const on = <T extends object>(o: T) => ({ ...o, enabled: true });
const D = DEFAULT_LOOK;

export const PRESETS: Preset[] = [
  { id: 'natural', name: 'Natural glow', blurb: 'Soft peach cheeks and a satin nude lip.',
    look: { ...D, blush: on({ ...D.blush, color: '#F2A08A', intensity: 35 }), highlighter: on({ ...D.highlighter, intensity: 30 }),
      lips: on({ ...D.lips, color: '#B77A6A', finish: 'satin' as const, intensity: 45 }) } },
  { id: 'bridal', name: 'Bridal red', blurb: 'Winged liner, rose-gold lids and a classic red lip.',
    look: { ...D, eyeshadow: on({ ...D.eyeshadow, color: '#C9877A', style: 'wash' as const, intensity: 55 }),
      eyeliner: on({ ...D.eyeliner, style: 'winged' as const, intensity: 75 }),
      blush: on({ ...D.blush, color: '#E2788C', style: 'sculpt' as const, intensity: 45 }), highlighter: on({ ...D.highlighter, intensity: 45 }),
      lips: on({ ...D.lips, color: '#B3122F', finish: 'satin' as const, intensity: 85 }) } },
  { id: 'smoky', name: 'Evening smoky', blurb: 'Charcoal smoky eye with a matte plum lip.',
    look: { ...D, eyeshadow: on({ ...D.eyeshadow, color: '#3A3A40', style: 'smoky' as const, intensity: 75 }),
      eyeliner: on({ ...D.eyeliner, style: 'bold' as const, intensity: 80 }), blush: on({ ...D.blush, color: '#B74A63', intensity: 30 }),
      lips: on({ ...D.lips, color: '#5E2B4F', finish: 'matte' as const, intensity: 70 }) } },
  { id: 'rose', name: 'Soft rose', blurb: 'Rosy glow with a glossy mauve lip.',
    look: { ...D, eyeshadow: on({ ...D.eyeshadow, color: '#D8B98A', style: 'wash' as const, intensity: 40 }),
      blush: on({ ...D.blush, color: '#E2788C', intensity: 45 }), highlighter: on({ ...D.highlighter, color: '#FBD5D5', intensity: 40 }),
      lips: on({ ...D.lips, color: '#A5617B', finish: 'glossy' as const, intensity: 65 }) } },
];
