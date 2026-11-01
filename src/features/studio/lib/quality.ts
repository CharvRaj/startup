import type { LM } from './types';

export type ScanRole = 'front' | 'left' | 'right' | 'left-profile' | 'right-profile';

/**
 * Thresholds are STARTING VALUES, validated only against synthetic data in the unit tests.
 * They must be calibrated on real devices/faces before being relied on (see docs).
 * Yaw convention: positive = nose displaced toward image-right = the USER turned to THEIR left
 * (on an un-mirrored camera frame). The selfie preview is mirrored, so "turn left" looks like moving screen-left.
 */
export const QUALITY = {
  BLUR_MIN: 40,
  MEAN_MIN: 60, MEAN_MAX: 210,
  CLIP_MAX: 0.12,
  BALANCE_MAX: 0.35,
  FACE_MIN: 0.3, FACE_MAX: 0.9,
  CENTRE_MAX: 0.22,
  ROLL_MAX_DEG: 12,
  PITCH_TOL: 0.12,
  MOUTH_OPEN_MAX: 0.06,
  DUP_DIST_MAX: 0.18,
  YAW_K: 0.3,
} as const;

export const ROLE_YAW: Record<ScanRole, [number, number]> = {
  front: [-8, 8],
  left: [15, 40],
  right: [-40, -15],
  'left-profile': [50, 95],
  'right-profile': [-95, -50],
};
export const isProfile = (r: ScanRole) => r === 'left-profile' || r === 'right-profile';

/* ---------- pixel metrics (pure) ---------- */
export function toGray(rgba: Uint8ClampedArray | Uint8Array, w: number, h: number): Float32Array {
  const g = new Float32Array(w * h);
  for (let i = 0, j = 0; i < g.length; i++, j += 4) g[i] = 0.2126 * rgba[j] + 0.7152 * rgba[j + 1] + 0.0722 * rgba[j + 2];
  return g;
}

export function laplacianVariance(g: Float32Array, w: number, h: number): number {
  if (w < 3 || h < 3) return 0;
  let s = 0, s2 = 0, n = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    const l = g[i - 1] + g[i + 1] + g[i - w] + g[i + w] - 4 * g[i];
    s += l; s2 += l * l; n++;
  }
  const m = s / n;
  return s2 / n - m * m;
}

export function lumaStats(g: Float32Array) {
  let sum = 0, clip = 0;
  for (let i = 0; i < g.length; i++) { sum += g[i]; if (g[i] > 245) clip++; }
  return { mean: sum / g.length, clipFrac: clip / g.length };
}

export function halfBalance(g: Float32Array, w: number, h: number) {
  let l = 0, r = 0, nl = 0, nr = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (x < w / 2) { l += g[y * w + x]; nl++; } else { r += g[y * w + x]; nr++; }
  }
  return { left: l / (nl || 1), right: r / (nr || 1) };
}

/** 16×16 area-averaged, mean/std-normalised signature used for duplicate detection. */
export function signature(g: Float32Array, w: number, h: number, n = 16): Float32Array {
  const out = new Float32Array(n * n);
  for (let by = 0; by < n; by++) for (let bx = 0; bx < n; bx++) {
    const x0 = Math.floor((bx * w) / n), x1 = Math.max(x0 + 1, Math.floor(((bx + 1) * w) / n));
    const y0 = Math.floor((by * h) / n), y1 = Math.max(y0 + 1, Math.floor(((by + 1) * h) / n));
    let s = 0, c = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { s += g[y * w + x]; c++; }
    out[by * n + bx] = s / c;
  }
  let m = 0; for (const v of out) m += v; m /= out.length;
  let sd = 0; for (const v of out) sd += (v - m) ** 2; sd = Math.sqrt(sd / out.length) || 1;
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - m) / sd;
  return out;
}

export function signatureDistance(a: Float32Array, b: Float32Array): number {
  let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
}

/* ---------- pose (landmark based, approximate) ---------- */
export function estimateYawDeg(lm: LM[]): number {
  const xr = lm[234].x, xl = lm[454].x;
  const ratio = (lm[1].x - xr) / (xl - xr || 1e-6);
  return (Math.atan((ratio - 0.5) / QUALITY.YAW_K) * 180) / Math.PI;
}
export function estimateRollDeg(lm: LM[]): number {
  return (Math.atan2(lm[263].y - lm[33].y, lm[263].x - lm[33].x) * 180) / Math.PI;
}
/** Nose position between eye-line and mouth; compared against the front frame, not an absolute. */
export function pitchRatio(lm: LM[]): number {
  const eyeY = (lm[33].y + lm[263].y) / 2, mouthY = (lm[13].y + lm[14].y) / 2;
  return (lm[1].y - eyeY) / (mouthY - eyeY || 1e-6);
}
export function mouthOpenRatio(lm: LM[]): number {
  return Math.abs(lm[14].y - lm[13].y) / (Math.abs(lm[152].y - lm[10].y) || 1e-6);
}
export function faceBox(lm: LM[]) {
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (let i = 0; i < Math.min(lm.length, 468); i++) { x0 = Math.min(x0, lm[i].x); y0 = Math.min(y0, lm[i].y); x1 = Math.max(x1, lm[i].x); y1 = Math.max(y1, lm[i].y); }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

/* ---------- assessment ---------- */
export type Severity = 'error' | 'warn';
export interface Issue { code: string; severity: Severity; message: string }
export interface Assessment {
  ok: boolean; issues: Issue[];
  metrics: { blur: number; mean: number; clipFrac: number; yaw: number | null; roll: number | null; pitch: number | null; faceSize: number | null; mouthOpen: number | null };
  signature: Float32Array;
}

export interface AssessInput {
  role: ScanRole;
  landmarks: LM[] | null;
  gray: Float32Array; gw: number; gh: number;
  baselinePitch?: number | null;
  otherSignatures?: Float32Array[];
}

const TURN_HINT: Record<ScanRole, string> = {
  front: 'Look straight at the camera.',
  left: 'Turn your head slightly to YOUR left (about a quarter turn).',
  right: 'Turn your head slightly to YOUR right (about a quarter turn).',
  'left-profile': 'Turn fully to YOUR left so the camera sees the side of your face.',
  'right-profile': 'Turn fully to YOUR right so the camera sees the side of your face.',
};

export function assessFrame(i: AssessInput): Assessment {
  const issues: Issue[] = [];
  const err = (code: string, message: string) => issues.push({ code, severity: 'error', message });
  const warn = (code: string, message: string) => issues.push({ code, severity: 'warn', message });
  const lm = i.landmarks;
  const m: Assessment['metrics'] = { blur: laplacianVariance(i.gray, i.gw, i.gh), mean: 0, clipFrac: 0, yaw: null, roll: null, pitch: null, faceSize: null, mouthOpen: null };
  const ls = lumaStats(i.gray); m.mean = ls.mean; m.clipFrac = ls.clipFrac;

  if (!lm) {
    if (isProfile(i.role)) warn('unverified-pose', 'Face tracking can’t follow this extreme angle, so the pose couldn’t be verified. Check the thumbnail yourself.');
    else err('no-face', 'No face found. Face the camera in good light.');
  } else {
    const box = faceBox(lm);
    m.faceSize = box.h; m.yaw = estimateYawDeg(lm); m.roll = estimateRollDeg(lm); m.pitch = pitchRatio(lm); m.mouthOpen = mouthOpenRatio(lm);
    if (box.h < QUALITY.FACE_MIN) err('too-far', 'Move closer so your face fills the oval.');
    if (box.h > QUALITY.FACE_MAX) err('too-close', 'Move back a little.');
    if (Math.abs(box.cx - 0.5) > QUALITY.CENTRE_MAX || Math.abs(box.cy - 0.5) > QUALITY.CENTRE_MAX) err('off-centre', 'Centre your face in the oval.');
    const [lo, hi] = ROLE_YAW[i.role];
    if (m.yaw < lo || m.yaw > hi) err('wrong-angle', TURN_HINT[i.role]);
    if (Math.abs(m.roll) > QUALITY.ROLL_MAX_DEG) err('tilted', 'Keep your head level (don’t tilt it sideways).');
    if (i.baselinePitch != null && !isProfile(i.role) && Math.abs(m.pitch - i.baselinePitch) > QUALITY.PITCH_TOL) err('pitch', 'Keep your chin level — don’t nod up or down.');
    if (m.mouthOpen > QUALITY.MOUTH_OPEN_MAX) err('mouth-open', 'Relax your mouth — keep a neutral expression.');
  }
  if (m.blur < QUALITY.BLUR_MIN) err('blurry', 'The image is blurry. Hold still and make sure the lens is clean.');
  if (m.mean < QUALITY.MEAN_MIN) err('dark', 'Too dark. Face a window or a light.');
  if (m.mean > QUALITY.MEAN_MAX || m.clipFrac > QUALITY.CLIP_MAX) err('bright', 'Too bright or glare on your face. Soften the light.');
  const bal = halfBalance(i.gray, i.gw, i.gh);
  if (m.mean > 0 && Math.abs(bal.left - bal.right) / m.mean > QUALITY.BALANCE_MAX && !isProfile(i.role)) warn('uneven-light', 'Lighting looks uneven (one side is much darker).');

  const sig = signature(i.gray, i.gw, i.gh);
  if (i.otherSignatures?.some((o) => signatureDistance(sig, o) < QUALITY.DUP_DIST_MAX)) err('duplicate', 'This looks the same as another captured view. Change your head angle.');
  return { ok: !issues.some((x) => x.severity === 'error'), issues, metrics: m, signature: sig };
}

/* ---------- browser helper: sample a grayscale crop ---------- */
export function sampleGray(source: CanvasImageSource, sw: number, sh: number, lm: LM[] | null, outW = 192) {
  const box = lm ? faceBox(lm) : { x0: 0.25, y0: 0.2, w: 0.5, h: 0.6 };
  const pad = lm ? 0.08 : 0;
  const sx = Math.max(0, (box.x0 - pad) * sw), sy = Math.max(0, (box.y0 - pad) * sh);
  const cw = Math.min(sw - sx, (box.w + pad * 2) * sw), ch = Math.min(sh - sy, (box.h + pad * 2) * sh);
  const gw = outW, gh = Math.max(16, Math.round((outW * ch) / Math.max(1, cw)));
  const c = document.createElement('canvas'); c.width = gw; c.height = gh;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(source, sx, sy, cw, ch, 0, 0, gw, gh);
  const gray = toGray(ctx.getImageData(0, 0, gw, gh).data, gw, gh);
  c.width = c.height = 0;
  return { gray, gw, gh };
}
