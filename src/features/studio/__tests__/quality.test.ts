import { describe, expect, it } from 'vitest';
import { assessFrame, estimateYawDeg, halfBalance, laplacianVariance, lumaStats, signature, signatureDistance, ROLE_YAW } from '../lib/quality';
import type { LM } from '../lib/types';

const W = 96, H = 96;
function img(fn: (x: number, y: number) => number) { const g = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y * W + x] = fn(x, y); return g; }
let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const sharp = () => { seed = 7; return img((x, y) => 120 + ((x >> 2) + (y >> 2)) % 2 * 60 + rnd() * 10); };           // checker + texture
const blurred = () => img((x, y) => 140 + Math.sin(x / 30) * 10 + Math.cos(y / 30) * 10);                          // smooth
const dark = () => img((x, y) => 20 + ((x >> 2) + (y >> 2)) % 2 * 20);
const bright = () => img((x, y) => 250 - ((x >> 2) + (y >> 2)) % 2 * 3);

/** Synthetic 478-point mesh with controllable nose position (yaw), face centred in frame. */
function mesh(noseRatio = 0.5, o: { mouthGap?: number; rollY?: number } = {}): LM[] {
  const lm: LM[] = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const set = (i: number, x: number, y: number) => { lm[i] = { x, y, z: 0 }; };
  set(234, 0.3, 0.5); set(454, 0.7, 0.5); set(1, 0.3 + 0.4 * noseRatio, 0.55);
  set(33, 0.38, 0.42); set(263, 0.62, 0.42 + (o.rollY ?? 0)); set(13, 0.5, 0.68); set(14, 0.5, 0.68 + (o.mouthGap ?? 0.005));
  set(10, 0.5, 0.2); set(152, 0.5, 0.82);
  return lm;
}
const run = (role: any, lm: LM[] | null, g = sharp(), extra = {}) => assessFrame({ role, landmarks: lm, gray: g, gw: W, gh: H, ...extra });

describe('pixel metrics', () => {
  it('separates sharp from blurry', () => expect(laplacianVariance(sharp(), W, H)).toBeGreaterThan(laplacianVariance(blurred(), W, H) * 20));
  it('measures brightness and clipping', () => { expect(lumaStats(dark()).mean).toBeLessThan(60); expect(lumaStats(bright()).clipFrac).toBeGreaterThan(0.5); });
  it('detects uneven lighting', () => { const b = halfBalance(img((x) => (x < W / 2 ? 50 : 200)), W, H); expect(b.right - b.left).toBeGreaterThan(100); });
});

describe('duplicate detection', () => {
  it('flags the same view and passes a different one', () => {
    const a = signature(sharp(), W, H);
    seed = 99; const near = signature(img((x, y) => 120 + ((x >> 2) + (y >> 2)) % 2 * 60 + rnd() * 10), W, H);
    const diff = signature(img((x, y) => (x > y ? 200 : 60) + (x % 7) * 3), W, H);
    expect(signatureDistance(a, near)).toBeLessThan(0.18); expect(signatureDistance(a, diff)).toBeGreaterThan(0.18);
  });
});

describe('pose', () => {
  it('centred nose = ~0° yaw; sign follows nose direction', () => {
    expect(Math.abs(estimateYawDeg(mesh(0.5)))).toBeLessThan(1);
    expect(estimateYawDeg(mesh(0.65))).toBeGreaterThan(15); expect(estimateYawDeg(mesh(0.35))).toBeLessThan(-15);
  });
});

describe('assessFrame', () => {
  it('accepts a good front frame', () => expect(run('front', mesh(0.5)).ok).toBe(true));
  it('rejects blurry', () => expect(run('front', mesh(), blurred()).issues.map((i) => i.code)).toContain('blurry'));
  it('rejects dark and over-bright', () => {
    expect(run('front', mesh(), dark()).issues.map((i) => i.code)).toContain('dark');
    expect(run('front', mesh(), bright()).issues.map((i) => i.code)).toContain('bright');
  });
  it('rejects no face for non-profile roles', () => expect(run('front', null).issues.map((i) => i.code)).toContain('no-face'));
  it('rejects wrong orientation', () => {
    expect(run('left', mesh(0.5)).issues.map((i) => i.code)).toContain('wrong-angle');
    expect(run('front', mesh(0.7)).ok).toBe(false);
    const [lo, hi] = ROLE_YAW.left; const y = estimateYawDeg(mesh(0.62)); expect(y).toBeGreaterThanOrEqual(lo); expect(y).toBeLessThanOrEqual(hi);
    expect(run('left', mesh(0.62)).issues.map((i) => i.code)).not.toContain('wrong-angle');
  });
  it('flags open mouth and head tilt', () => {
    expect(run('front', mesh(0.5, { mouthGap: 0.06 })).issues.map((i) => i.code)).toContain('mouth-open');
    expect(run('front', mesh(0.5, { rollY: 0.15 })).issues.map((i) => i.code)).toContain('tilted');
  });
  it('rejects duplicates of other captured frames', () => {
    const sig = run('front', mesh()).signature;
    expect(run('left', mesh(0.62), sharp(), { otherSignatures: [sig] }).issues.map((i) => i.code)).toContain('duplicate');
  });
  it('profile without tracking is accepted but flagged unverified', () => {
    const a = run('left-profile', null); expect(a.ok).toBe(true); expect(a.issues.map((i) => i.code)).toContain('unverified-pose');
  });
  it('profile without tracking is still rejected when blurry', () => expect(run('left-profile', null, blurred()).ok).toBe(false));
});
