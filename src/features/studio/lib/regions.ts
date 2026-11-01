import type { LM } from './types';

export interface Pt { x: number; y: number }

/**
 * MediaPipe Face Mesh (478-point) landmark indices. Ordered loops/polylines.
 * Eye "upper"/"lower"/"brow" run OUTER corner -> INNER corner.
 * "right"/"left" refer to the subject's own right/left (right eye = image-left on an unmirrored photo).
 */
export const IDX = {
  lipsOuter: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146],
  lipsInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95],
  faceOval: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
  rightEye: { upper: [33, 246, 161, 160, 159, 158, 157, 173, 133], lower: [33, 7, 163, 144, 145, 153, 154, 155, 133], brow: [46, 53, 52, 65, 55], browLoop: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46], outer: 33, inner: 133 },
  leftEye: { upper: [263, 466, 388, 387, 386, 385, 384, 398, 362], lower: [263, 249, 390, 373, 374, 380, 381, 382, 362], brow: [276, 283, 282, 295, 285], browLoop: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276], outer: 263, inner: 362 },
  cheekRight: [50, 205, 187],
  cheekLeft: [280, 425, 411],
  boneRight: [117, 116],
  boneLeft: [346, 345],
  noseBridge: [168, 6],
} as const;

export type EyeDef = typeof IDX.rightEye | typeof IDX.leftEye;

export const REQUIRED_LANDMARKS = 468;

export function px(lm: LM[], idxs: readonly number[], W: number, H: number): Pt[] {
  return idxs.map((i) => ({ x: lm[i].x * W, y: lm[i].y * H }));
}

export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
export const mean = (pts: Pt[]): Pt => ({
  x: pts.reduce((s, p) => s + p.x, 0) / pts.length,
  y: pts.reduce((s, p) => s + p.y, 0) / pts.length,
});
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** Resample a polyline to n points evenly spaced by arc length. */
export function resample(poly: Pt[], n: number): Pt[] {
  if (poly.length < 2 || n < 2) return poly.slice();
  const seg: number[] = [0];
  for (let i = 1; i < poly.length; i++) seg.push(seg[i - 1] + dist(poly[i - 1], poly[i]));
  const total = seg[seg.length - 1] || 1;
  const out: Pt[] = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const target = (k / (n - 1)) * total;
    while (j < poly.length - 1 && seg[j] < target) j++;
    const span = seg[j] - seg[j - 1] || 1;
    out.push(lerpPt(poly[j - 1], poly[j], Math.min(1, Math.max(0, (target - seg[j - 1]) / span))));
  }
  return out;
}

/** Closed polygon of the eye opening (excluded from shadow / foundation). */
export function eyeOpening(lm: LM[], eye: EyeDef, W: number, H: number): Pt[] {
  const up = px(lm, eye.upper, W, H);
  const lo = px(lm, eye.lower, W, H).slice(1, -1).reverse();
  return up.concat(lo);
}

export interface FaceMetrics { eyeSpan: number; rollRad: number; centre: Pt }

export function faceMetrics(lm: LM[], W: number, H: number): FaceMetrics {
  const a = { x: lm[33].x * W, y: lm[33].y * H };
  const b = { x: lm[263].x * W, y: lm[263].y * H };
  return { eyeSpan: dist(a, b), rollRad: Math.atan2(b.y - a.y, b.x - a.x), centre: mean(px(lm, IDX.faceOval, W, H)) };
}

export function hasFullMesh(lm: LM[] | null | undefined): lm is LM[] {
  return !!lm && lm.length >= REQUIRED_LANDMARKS && lm.every((p, i) => i > 477 || (Number.isFinite(p.x) && Number.isFinite(p.y)));
}
