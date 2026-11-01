import { describe, expect, it } from 'vitest';
import { IDX, hasFullMesh, resample, eyeOpening, faceMetrics } from '../lib/regions';
import { computeExportSize } from '../lib/render';
import type { LM } from '../lib/types';

describe('landmark index tables', () => {
  const all = [...IDX.lipsOuter, ...IDX.lipsInner, ...IDX.faceOval, ...IDX.rightEye.upper, ...IDX.rightEye.lower, ...IDX.rightEye.brow, ...IDX.rightEye.browLoop, ...IDX.leftEye.upper, ...IDX.leftEye.lower, ...IDX.leftEye.brow, ...IDX.leftEye.browLoop, ...IDX.cheekRight, ...IDX.cheekLeft, ...IDX.boneRight, ...IDX.boneLeft, ...IDX.noseBridge];
  it('are all valid mesh indices', () => expect(all.every((i) => Number.isInteger(i) && i >= 0 && i < 478)).toBe(true));
  it('have no duplicate points inside each loop', () => {
    for (const l of [IDX.lipsOuter, IDX.lipsInner, IDX.faceOval]) expect(new Set(l).size).toBe(l.length);
  });
  it('eyes run outer→inner and share corners', () => {
    for (const e of [IDX.rightEye, IDX.leftEye]) { expect(e.upper[0]).toBe(e.outer); expect(e.upper[e.upper.length - 1]).toBe(e.inner); expect(e.lower[0]).toBe(e.outer); expect(e.lower[e.lower.length - 1]).toBe(e.inner); }
  });
});

describe('geometry helpers', () => {
  it('resamples a polyline evenly and keeps endpoints', () => {
    const r = resample([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], 5);
    expect(r).toHaveLength(5); expect(r[0]).toEqual({ x: 0, y: 0 }); expect(r[4]).toEqual({ x: 10, y: 10 }); expect(r[2].x).toBeCloseTo(10); expect(r[2].y).toBeCloseTo(0);
  });
  it('validates mesh completeness', () => {
    expect(hasFullMesh(null)).toBe(false); expect(hasFullMesh(Array(100).fill({ x: 0, y: 0 }))).toBe(false); expect(hasFullMesh(Array(478).fill({ x: 0.5, y: 0.5 }))).toBe(true);
    const bad: LM[] = Array(478).fill({ x: 0.5, y: 0.5 }); bad[10] = { x: NaN, y: 0 }; expect(hasFullMesh(bad)).toBe(false);
  });
  it('builds eye opening polygons and metrics', () => {
    const lm: LM[] = Array.from({ length: 478 }, (_, i) => ({ x: (i % 50) / 50, y: Math.floor(i / 50) / 10 }));
    expect(eyeOpening(lm, IDX.rightEye, 100, 100)).toHaveLength(9 + 7); expect(faceMetrics(lm, 100, 100).eyeSpan).toBeGreaterThan(0);
  });
});

describe('export sizing', () => {
  it('honours the requested long side and keeps aspect', () => { const s = computeExportSize(3000, 2000, 1080); expect(s).toMatchObject({ w: 1080, h: 720, upscaled: false }); });
  it('flags upscaling', () => expect(computeExportSize(800, 600, 2048).upscaled).toBe(true));
  it('caps side and pixel count for device memory', () => {
    const s = computeExportSize(3072, 3072, 'original'); expect(s.w * s.h).toBeLessThanOrEqual(16_000_000); expect(Math.max(s.w, s.h)).toBeLessThanOrEqual(4096);
    expect(computeExportSize(3072, 3072, 9000).capped).toBe(true);
  });
});
