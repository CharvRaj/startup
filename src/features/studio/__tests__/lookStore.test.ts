import { beforeEach, describe, expect, it, vi } from 'vitest';
import { COALESCE_MS, hasAnyEffect, useLookStore } from '../store/lookStore';
import { DEFAULT_LOOK } from '../lib/types';
import { PRESETS } from '../lib/presets';

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(1_000_000); useLookStore.setState({ look: DEFAULT_LOOK, past: [], future: [], lastKey: null, lastAt: 0, showOriginal: false }); });
const s = () => useLookStore.getState();
const tick = (ms = COALESCE_MS + 50) => vi.setSystemTime(Date.now() + ms);

describe('look store', () => {
  it('updates colour and intensity', () => { s().update('lips', { color: '#123456', intensity: 33, enabled: true }); expect(s().look.lips).toMatchObject({ color: '#123456', intensity: 33, enabled: true }); });
  it('coalesces a slider drag into one undo step', () => {
    s().update('lips', { enabled: true }); tick();
    for (let i = 1; i <= 10; i++) { s().update('lips', { intensity: i * 5 }); tick(20); }
    expect(s().past).toHaveLength(2); s().undo(); expect(s().look.lips.intensity).toBe(DEFAULT_LOOK.lips.intensity); expect(s().look.lips.enabled).toBe(true);
  });
  it('separate sections are separate undo steps; redo restores', () => {
    s().update('lips', { enabled: true }); s().update('blush', { enabled: true });
    s().undo(); expect(s().look.blush.enabled).toBe(false); expect(s().look.lips.enabled).toBe(true);
    s().redo(); expect(s().look.blush.enabled).toBe(true);
  });
  it('a new edit clears redo', () => { s().update('lips', { enabled: true }); s().undo(); s().update('blush', { enabled: true }); expect(s().future).toHaveLength(0); });
  it('reset is undoable', () => { s().update('lips', { enabled: true, color: '#abcdef' }); tick(); s().reset(); expect(hasAnyEffect(s().look)).toBe(false); s().undo(); expect(s().look.lips.color).toBe('#abcdef'); });
  it('applies combined looks that enable several effects', () => {
    const p = PRESETS[1]; s().applyLook(p.look); const on = Object.values(s().look).filter((x) => x.enabled).length; expect(on).toBeGreaterThanOrEqual(4);
    s().undo(); expect(hasAnyEffect(s().look)).toBe(false);
  });
  it('caps history', () => { for (let i = 0; i < 80; i++) { s().update('lips', { intensity: i }); tick(); } expect(s().past.length).toBeLessThanOrEqual(50); });
});
