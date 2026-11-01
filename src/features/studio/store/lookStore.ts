import { create } from 'zustand';
import { DEFAULT_LOOK, type Look, type SectionKey } from '../lib/types';

const MAX_HISTORY = 50;
export const COALESCE_MS = 600;

interface LookState {
  look: Look; past: Look[]; future: Look[]; lastKey: SectionKey | null; lastAt: number; showOriginal: boolean;
  update: <K extends SectionKey>(key: K, patch: Partial<Look[K]>) => void;
  applyLook: (look: Look) => void;
  reset: () => void; undo: () => void; redo: () => void;
  setShowOriginal: (v: boolean) => void;
}

const push = (past: Look[], l: Look) => [...past, l].slice(-MAX_HISTORY);

export const useLookStore = create<LookState>((set, get) => ({
  look: DEFAULT_LOOK, past: [], future: [], lastKey: null, lastAt: 0, showOriginal: false,

  // Rapid edits to the same section (e.g. dragging a slider) collapse into one undo step.
  update: (key, patch) => {
    const s = get(); const now = Date.now();
    const coalesce = s.lastKey === key && now - s.lastAt < COALESCE_MS && s.past.length > 0;
    set({
      look: { ...s.look, [key]: { ...s.look[key], ...patch } },
      past: coalesce ? s.past : push(s.past, s.look), future: [], lastKey: key, lastAt: now,
    });
  },
  applyLook: (look) => { const s = get(); set({ look, past: push(s.past, s.look), future: [], lastKey: null }); },
  reset: () => { const s = get(); set({ look: DEFAULT_LOOK, past: push(s.past, s.look), future: [], lastKey: null }); },
  undo: () => {
    const s = get(); if (!s.past.length) return;
    set({ look: s.past[s.past.length - 1], past: s.past.slice(0, -1), future: [s.look, ...s.future], lastKey: null });
  },
  redo: () => {
    const s = get(); if (!s.future.length) return;
    set({ look: s.future[0], future: s.future.slice(1), past: push(s.past, s.look), lastKey: null });
  },
  setShowOriginal: (v) => set({ showOriginal: v }),
}));

export const hasAnyEffect = (l: Look) => (Object.keys(l) as SectionKey[]).some((k) => l[k].enabled);
