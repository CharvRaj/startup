import { IDX, dist, eyeOpening, faceMetrics, hasFullMesh, lerpPt, mean, px, resample, type EyeDef, type Pt } from './regions';
import type { HairMask, LM, Look } from './types';

/**
 * 2D landmark-mask renderer. Every effect is drawn into a scratch layer from MediaPipe landmark
 * geometry, feathered, clipped to the relevant skin/feature mask, then blended onto the photo with a
 * blend mode suited to that effect. Resolution independent: landmarks are normalised.
 * This is NOT a physically based skin/hair simulation.
 */
type Ctx = CanvasRenderingContext2D;
const k = (v: number) => Math.max(0, Math.min(1, v / 100));

let scratch: HTMLCanvasElement | null = null;
function layer(W: number, H: number): { c: HTMLCanvasElement; x: Ctx } {
  if (!scratch) scratch = document.createElement('canvas');
  if (scratch.width !== W || scratch.height !== H) { scratch.width = W; scratch.height = H; }
  const x = scratch.getContext('2d')!;
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
  x.shadowBlur = 0; x.shadowColor = 'transparent'; x.shadowOffsetX = 0; x.clearRect(0, 0, W, H);
  return { c: scratch, x };
}
export function releaseRenderResources() { if (scratch) { scratch.width = scratch.height = 0; scratch = null; } }

const blend = (ctx: Ctx, src: HTMLCanvasElement, op: GlobalCompositeOperation, alpha: number) => {
  if (alpha <= 0.002) return;
  ctx.save(); ctx.globalCompositeOperation = op; ctx.globalAlpha = Math.min(1, alpha); ctx.drawImage(src, 0, 0); ctx.restore();
};

/** Feather via shadow trick (works in every browser, unlike ctx.filter): draw off-canvas, shadow lands on-canvas. */
function feathered(x: Ctx, W: number, color: string, blurPx: number, draw: (x: Ctx) => void) {
  x.save();
  x.shadowColor = color; x.shadowBlur = Math.max(0, blurPx); x.shadowOffsetX = W * 2; x.translate(-W * 2, 0);
  x.fillStyle = color; x.strokeStyle = color; draw(x);
  x.restore();
}

const poly = (x: Ctx, pts: Pt[], close = true) => { x.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i].x, pts[i].y); if (close) x.closePath(); };
function smoothLine(x: Ctx, pts: Pt[]) {
  x.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) { const m = lerpPt(pts[i], pts[i + 1], 0.5); x.quadraticCurveTo(pts[i].x, pts[i].y, m.x, m.y); }
  x.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
}

function cutOut(x: Ctx, W: number, shapes: Pt[][], blur: number) {
  x.save(); x.globalCompositeOperation = 'destination-out';
  for (const s of shapes) feathered(x, W, '#000', blur, (c) => { c.beginPath(); poly(c, s); c.fill(); });
  x.restore();
}
function keepInside(x: Ctx, W: number, shape: Pt[], blur: number) {
  x.save(); x.globalCompositeOperation = 'destination-in';
  feathered(x, W, '#000', blur, (c) => { c.beginPath(); poly(c, shape); c.fill(); });
  x.restore();
}

export function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const hexA = (hex: string, a: number) => { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; };

export interface RenderOpts { hair?: HairMask | null }

export function renderLook(ctx: Ctx, W: number, H: number, source: CanvasImageSource, lm: LM[] | null, look: Look | null, opts: RenderOpts = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.imageSmoothingQuality = 'high'; ctx.drawImage(source, 0, 0, W, H); ctx.restore();
  if (!look) return;
  const faceOk = hasFullMesh(lm);
  const fm = faceOk ? faceMetrics(lm!, W, H) : null;

  if (faceOk && fm) {
    const eyes: EyeDef[] = [IDX.rightEye, IDX.leftEye];
    const oval = px(lm!, IDX.faceOval, W, H);
    const openings = eyes.map((e) => eyeOpening(lm!, e, W, H));
    const lipsOuter = px(lm!, IDX.lipsOuter, W, H), lipsInner = px(lm!, IDX.lipsInner, W, H);
    const brows = eyes.map((e) => px(lm!, e.browLoop, W, H));
    const f = fm.eyeSpan;

    if (look.foundation.enabled) {
      const { c, x } = layer(W, H); const L = look.foundation; const a = k(L.intensity);
      feathered(x, W, L.color, f * 0.05, (cx) => { cx.beginPath(); poly(cx, oval); cx.fill(); });
      cutOut(x, W, [...openings, ...brows, lipsOuter], f * 0.012);
      blend(ctx, c, 'soft-light', 0.95 * a); blend(ctx, c, 'color', 0.22 * a);
    }

    const sides = [
      { cheek: IDX.cheekRight, bone: IDX.boneRight, tilt: 0.35 },   // subject's right = image-left
      { cheek: IDX.cheekLeft, bone: IDX.boneLeft, tilt: -0.35 },
    ];
    const ellipse = (x: Ctx, c: Pt, rx: number, ry: number, ang: number, color: string) => {
      x.save(); x.translate(c.x, c.y); x.rotate(ang); x.scale(1, ry / rx);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, hexA(color, 1)); g.addColorStop(0.5, hexA(color, 0.5)); g.addColorStop(1, hexA(color, 0));
      x.fillStyle = g; x.beginPath(); x.arc(0, 0, rx, 0, Math.PI * 2); x.fill(); x.restore();
    };

    if (look.blush.enabled) {
      const { c, x } = layer(W, H); const L = look.blush; const a = k(L.intensity); const apple = L.style === 'apple';
      for (const s of sides) ellipse(x, mean(px(lm!, s.cheek, W, H)), f * (apple ? 0.2 : 0.26), f * (apple ? 0.17 : 0.13), fm.rollRad + (apple ? 0 : s.tilt), L.color);
      keepInside(x, W, oval, f * 0.03); cutOut(x, W, [...openings, lipsOuter], f * 0.02);
      blend(ctx, c, 'soft-light', 0.9 * a); blend(ctx, c, 'multiply', 0.28 * a);
    }

    if (look.highlighter.enabled) {
      const { c, x } = layer(W, H); const L = look.highlighter; const a = k(L.intensity);
      for (const s of sides) ellipse(x, mean(px(lm!, s.bone, W, H)), f * 0.13, f * 0.045, fm.rollRad + s.tilt, L.color);
      const [t, b] = px(lm!, IDX.noseBridge, W, H);
      feathered(x, W, L.color, f * 0.03, (cx) => { cx.lineCap = 'round'; cx.lineWidth = f * 0.035; cx.beginPath(); cx.moveTo(t.x, t.y); cx.lineTo(b.x, b.y); cx.stroke(); });
      keepInside(x, W, oval, f * 0.02); cutOut(x, W, openings, f * 0.01);
      blend(ctx, c, 'screen', 0.55 * a); blend(ctx, c, 'soft-light', 0.5 * a);
    }

    if (look.eyeshadow.enabled) {
      const { c, x } = layer(W, H); const L = look.eyeshadow; const a = k(L.intensity); const smoky = L.style === 'smoky';
      eyes.forEach((e) => {
        const eyeW = dist({ x: lm![e.outer].x * W, y: lm![e.outer].y * H }, { x: lm![e.inner].x * W, y: lm![e.inner].y * H });
        const lid = resample(px(lm!, e.upper, W, H), 9), brow = resample(px(lm!, e.brow, W, H), 9);
        const raised = lid.map((p, i) => lerpPt(p, brow[i], smoky ? 0.78 - 0.25 * (i / 8) : 0.52));
        feathered(x, W, L.color, eyeW * (smoky ? 0.16 : 0.11), (cx) => { cx.beginPath(); poly(cx, [...lid, ...raised.slice().reverse()]); cx.fill(); });
        if (smoky) {
          const low = resample(px(lm!, e.lower, W, H), 9).slice(0, 6);
          feathered(x, W, L.color, eyeW * 0.08, (cx) => { cx.lineWidth = eyeW * 0.08; cx.lineCap = 'round'; cx.beginPath(); smoothLine(cx, low); cx.stroke(); });
        }
      });
      cutOut(x, W, openings, f * 0.006);
      blend(ctx, c, 'multiply', (smoky ? 0.75 : 0.5) * a); blend(ctx, c, 'source-over', 0.3 * a);
    }

    if (look.eyeliner.enabled) {
      const { c, x } = layer(W, H); const L = look.eyeliner; const a = k(L.intensity);
      eyes.forEach((e) => {
        const O = { x: lm![e.outer].x * W, y: lm![e.outer].y * H }, I = { x: lm![e.inner].x * W, y: lm![e.inner].y * H };
        const eyeW = dist(O, I); const up = px(lm!, e.upper, W, H); const lo = px(lm!, e.lower, W, H);
        const width = eyeW * ({ classic: 0.05, winged: 0.055, bold: 0.095, smudged: 0.085, lower: 0.045 } as const)[L.style];
        const blur = L.style === 'smudged' ? eyeW * 0.07 : Math.max(0.6, eyeW * 0.008);
        feathered(x, W, L.color, blur, (cx) => {
          cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.lineWidth = width; cx.beginPath(); smoothLine(cx, up); cx.stroke();
          if (L.style === 'lower' || L.style === 'smudged') { cx.lineWidth = width * 0.7; cx.beginPath(); smoothLine(cx, lo); cx.stroke(); }
          if (L.style === 'winged') {
            const d = { x: O.x - I.x, y: O.y - I.y }, len = Math.hypot(d.x, d.y) || 1; const u = { x: d.x / len, y: d.y / len };
            const rot = (s: number) => ({ x: u.x * Math.cos(s) - u.y * Math.sin(s), y: u.x * Math.sin(s) + u.y * Math.cos(s) });
            const r1 = rot(0.4), r2 = rot(-0.4); const dir = r1.y < r2.y ? r1 : r2; // pick the upward-pointing rotation
            const tip = { x: O.x + dir.x * eyeW * 0.4, y: O.y + dir.y * eyeW * 0.4 };
            const nrm = { x: -u.y, y: u.x }; const upN = nrm.y < 0 ? nrm : { x: -nrm.x, y: -nrm.y };
            cx.beginPath(); cx.moveTo(O.x - upN.x * width * 0.3, O.y - upN.y * width * 0.3); cx.lineTo(tip.x, tip.y);
            cx.lineTo(up[1].x + upN.x * width * 0.5, up[1].y + upN.y * width * 0.5); cx.closePath(); cx.fill();
          }
        });
      });
      blend(ctx, c, 'source-over', 0.95 * a);
    }

    if (look.lips.enabled) {
      const L = look.lips; const a = k(L.intensity); const matte = L.finish === 'matte';
      const lipMask = (cx: Ctx) => { cx.beginPath(); poly(cx, lipsOuter); poly(cx, lipsInner); cx.fill('evenodd'); };
      const { c, x } = layer(W, H);
      feathered(x, W, L.color, Math.max(1, f * 0.012), lipMask);
      blend(ctx, c, 'color', (matte ? 0.95 : 0.85) * a); blend(ctx, c, 'multiply', (matte ? 0.35 : 0.22) * a);
      if (!matte) {
        const { c: g, x: gx } = layer(W, H);
        const lc = mean(px(lm!, [14, 17], W, H)); const lw = dist(lipsOuter[0], lipsOuter[10]); const glossy = L.finish === 'glossy';
        gx.save(); gx.translate(lc.x, lc.y - lw * 0.02); gx.scale(1, 0.28);
        const grad = gx.createRadialGradient(0, 0, 0, 0, 0, lw * 0.3);
        grad.addColorStop(0, `rgba(255,255,255,${glossy ? 0.95 : 0.5})`); grad.addColorStop(1, 'rgba(255,255,255,0)');
        gx.fillStyle = grad; gx.beginPath(); gx.arc(0, 0, lw * 0.3, 0, Math.PI * 2); gx.fill(); gx.restore();
        gx.save(); gx.globalCompositeOperation = 'destination-in'; feathered(gx, W, '#000', 1, lipMask); gx.restore();
        blend(ctx, g, glossy ? 'screen' : 'soft-light', (glossy ? 0.55 : 0.4) * a);
      }
    }

    if (look.eyebrows?.enabled) {
      const { c, x } = layer(W, H);
      const L = look.eyebrows;
      const a = k(L.intensity);
      for (const b of brows) {
        feathered(x, W, L.color, f * 0.018, (cx) => {
          cx.beginPath();
          poly(cx, b);
          cx.fill();
        });
      }
      blend(ctx, c, 'multiply', 0.8 * a);
      blend(ctx, c, 'source-over', 0.25 * a);
    }

    if (look.contour?.enabled) {
      const { c, x } = layer(W, H);
      const L = look.contour;
      const a = k(L.intensity);
      for (const s of sides) {
        const pt = mean(px(lm!, s.cheek, W, H));
        ellipse(x, { x: pt.x, y: pt.y + f * 0.055 }, f * 0.22, f * 0.09, fm.rollRad + s.tilt, L.color);
      }
      keepInside(x, W, oval, f * 0.03);
      cutOut(x, W, [...openings, lipsOuter], f * 0.02);
      blend(ctx, c, 'multiply', 0.65 * a);
      blend(ctx, c, 'soft-light', 0.55 * a);
    }

    if (look.nose?.enabled) {
      const { c, x } = layer(W, H);
      const L = look.nose;
      const a = k(L.intensity);
      const [t, b] = px(lm!, IDX.noseBridge, W, H);
      const offset = f * 0.032;
      feathered(x, W, L.color, f * 0.022, (cx) => {
        cx.lineWidth = f * 0.03;
        cx.lineCap = 'round';
        cx.beginPath();
        cx.moveTo(t.x - offset, t.y);
        cx.lineTo(b.x - offset, b.y + f * 0.04);
        cx.stroke();
        cx.beginPath();
        cx.moveTo(t.x + offset, t.y);
        cx.lineTo(b.x + offset, b.y + f * 0.04);
        cx.stroke();
      });
      blend(ctx, c, 'multiply', 0.6 * a);
      blend(ctx, c, 'soft-light', 0.5 * a);
    }
  }

  if (look.hair.enabled && opts.hair) {
    const { data, width, height } = opts.hair; const a = k(look.hair.intensity);
    const m = document.createElement('canvas'); m.width = width; m.height = height;
    const mx = m.getContext('2d')!; const img = mx.createImageData(width, height);
    const [r, g, b] = hexRgb(look.hair.color);
    for (let i = 0; i < data.length; i++) { img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = Math.round(255 * Math.max(0, Math.min(1, data[i]))); }
    mx.putImageData(img, 0, 0);
    const { c, x } = layer(W, H); x.imageSmoothingQuality = 'high'; x.drawImage(m, 0, 0, W, H);
    blend(ctx, c, 'color', 0.9 * a); blend(ctx, c, 'overlay', 0.35 * a);
    m.width = m.height = 0;
  }
}

/* ---------- export ---------- */
export const MAX_EXPORT_PIXELS = 16_000_000;
export const MAX_EXPORT_SIDE = 4096;
export function computeExportSize(sw: number, sh: number, targetLongSide: number | 'original') {
  const wanted = targetLongSide === 'original' ? Math.max(sw, sh) : targetLongSide;
  const long = Math.min(wanted, MAX_EXPORT_SIDE); const s = long / Math.max(sw, sh);
  let w = Math.round(sw * s), h = Math.round(sh * s);
  if (w * h > MAX_EXPORT_PIXELS) { const r = Math.sqrt(MAX_EXPORT_PIXELS / (w * h)); w = Math.floor(w * r); h = Math.floor(h * r); }
  return { w, h, upscaled: Math.max(w, h) > Math.max(sw, sh), capped: Math.max(w, h) < wanted };
}

export class ExportError extends Error {}

/** Renders the real edited result at the requested size into a PNG blob (never a UI screenshot). */
export async function exportPng(source: ImageBitmap, lm: LM[] | null, look: Look, longSide: number | 'original', hair?: HairMask | null): Promise<{ blob: Blob; w: number; h: number }> {
  const { w, h } = computeExportSize(source.width, source.height, longSide);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new ExportError('Your browser couldn’t create a canvas for export. Try a smaller size.');
  try {
    renderLook(ctx, w, h, source, lm, look, { hair });
    const blob: Blob | null = await new Promise((res) => c.toBlob(res, 'image/png'));
    if (!blob) throw new ExportError('Export failed — the image may be too large for this device. Try a smaller size.');
    return { blob, w, h };
  } catch (e) {
    if (e instanceof ExportError) throw e;
    throw new ExportError('Export failed. Try a smaller size or reload the page.');
  } finally { c.width = c.height = 0; }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
