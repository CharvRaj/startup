export interface LM { x: number; y: number; z?: number }

export type Finish = 'matte' | 'satin' | 'glossy';
export type LinerStyle = 'classic' | 'winged' | 'bold' | 'smudged' | 'lower';
export type ShadowStyle = 'wash' | 'smoky';
export type BlushStyle = 'apple' | 'sculpt';

export interface Look {
  lips: { enabled: boolean; color: string; finish: Finish; intensity: number };
  eyeliner: { enabled: boolean; color: string; style: LinerStyle; intensity: number };
  eyeshadow: { enabled: boolean; color: string; style: ShadowStyle; intensity: number };
  blush: { enabled: boolean; color: string; style: BlushStyle; intensity: number };
  highlighter: { enabled: boolean; color: string; intensity: number };
  foundation: { enabled: boolean; color: string; intensity: number };
  hair: { enabled: boolean; color: string; intensity: number };
}
export type SectionKey = keyof Look;

export const DEFAULT_LOOK: Look = {
  lips: { enabled: false, color: '#B3122F', finish: 'satin', intensity: 70 },
  eyeliner: { enabled: false, color: '#1A1416', style: 'winged', intensity: 70 },
  eyeshadow: { enabled: false, color: '#C9877A', style: 'wash', intensity: 55 },
  blush: { enabled: false, color: '#E2788C', style: 'apple', intensity: 45 },
  highlighter: { enabled: false, color: '#F7E3C2', intensity: 45 },
  foundation: { enabled: false, color: '#E3B894', intensity: 35 },
  hair: { enabled: false, color: '#6B3A24', intensity: 60 },
};

export interface HairMask { data: Float32Array; width: number; height: number }
