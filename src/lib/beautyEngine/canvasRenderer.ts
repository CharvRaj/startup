import { FaceLandmarkPoint, MakeupState } from '@/types/beautyStudio';
import { FACE_REGIONS, getLandmarkCenter } from './faceSegmentation';

export interface RenderOptions {
  showLandmarks?: boolean;
  intensityScale?: number;
}

// Convert normalized landmark (0-1) to pixel coords
function toPx(point: FaceLandmarkPoint, width: number, height: number): [number, number] {
  return [point.x * width, point.y * height];
}

// Draw a smooth closed path connecting landmark indices
function drawSmoothClosedPath(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  indices: number[],
  width: number,
  height: number
) {
  if (indices.length < 3) return;

  const points: [number, number][] = indices.map(idx => toPx(landmarks[idx] || { x: 0, y: 0, z: 0 }, width, height));

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const midX = (current[0] + next[0]) / 2;
    const midY = (current[1] + next[1]) / 2;
    ctx.quadraticCurveTo(current[0], current[1], midX, midY);
  }

  ctx.closePath();
}

// Draw a smooth open path
function drawSmoothOpenPath(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  indices: number[],
  width: number,
  height: number
) {
  if (indices.length < 2) return;

  const points: [number, number][] = indices.map(idx => toPx(landmarks[idx] || { x: 0, y: 0, z: 0 }, width, height));

  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current[0] + next[0]) / 2;
    const midY = (current[1] + next[1]) / 2;
    ctx.quadraticCurveTo(current[0], current[1], midX, midY);
  }
}

// Render complete makeup layers onto target canvas
export function renderMakeupOnCanvas(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  makeup: MakeupState,
  width: number,
  height: number,
  options: RenderOptions = {}
) {
  if (!landmarks || landmarks.length < 468) return;

  ctx.save();

  // 1. Foundation / Complexion Layer
  if (makeup.face.foundation.enabled && makeup.face.foundation.coverage > 0) {
    renderFoundation(ctx, landmarks, makeup, width, height);
  }

  // 2. Blush Layer
  if (makeup.face.blush.enabled && makeup.face.blush.intensity > 0) {
    renderBlush(ctx, landmarks, makeup, width, height);
  }

  // 3. Highlighter Layer
  if (makeup.face.highlighter.enabled && makeup.face.highlighter.intensity > 0) {
    renderHighlighter(ctx, landmarks, makeup, width, height);
  }

  // 4. Eyeshadow Layer
  if (makeup.eyes.eyeshadow.enabled && makeup.eyes.eyeshadow.intensity > 0) {
    renderEyeshadow(ctx, landmarks, makeup, width, height);
  }

  // 5. Eyeliner Layer
  if (makeup.eyes.eyeliner.enabled && makeup.eyes.eyeliner.style !== 'none') {
    renderEyeliner(ctx, landmarks, makeup, width, height);
  }

  // 6. Lips Layer
  if (makeup.lips.enabled && makeup.lips.intensity > 0) {
    renderLips(ctx, landmarks, makeup, width, height);
  }

  // 7. Hair Tint Layer
  if (makeup.hair.enabled && makeup.hair.intensity > 0) {
    renderHairTint(ctx, landmarks, makeup, width, height);
  }

  // Debug landmarks overlay
  if (options.showLandmarks) {
    renderDebugLandmarks(ctx, landmarks, width, height);
  }

  ctx.restore();
}

// ── LIPS RENDERING ─────────────────────────────────────────────────────────────
function renderLips(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  makeup: MakeupState,
  width: number,
  height: number
) {
  const { color, intensity, finish, glossLevel } = makeup.lips;

  ctx.save();

  // Upper Lip Path
  ctx.save();
  ctx.beginPath();
  drawSmoothClosedPath(ctx, landmarks, FACE_REGIONS.UPPER_LIP_OUTER, width, height);

  // Exclude inner mouth cavity by winding
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = color;
  ctx.globalAlpha = Math.min(0.9, intensity * 0.85);
  ctx.fill();

  // Blend with natural texture
  ctx.globalCompositeOperation = finish === 'matte' ? 'multiply' : 'soft-light';
  ctx.globalAlpha = intensity * 0.6;
  ctx.fill();
  ctx.restore();

  // Lower Lip Path
  ctx.save();
  ctx.beginPath();
  drawSmoothClosedPath(ctx, landmarks, FACE_REGIONS.LOWER_LIP_OUTER, width, height);
  ctx.fillStyle = color;
  ctx.globalAlpha = Math.min(0.9, intensity * 0.85);
  ctx.fill();

  ctx.globalCompositeOperation = finish === 'matte' ? 'multiply' : 'soft-light';
  ctx.globalAlpha = intensity * 0.6;
  ctx.fill();
  ctx.restore();

  // Gloss / Satin Highlight Curve across center of lower lip
  if (finish === 'gloss' || finish === 'satin' || finish === 'shimmer') {
    ctx.save();
    const centerLower = toPx(landmarks[17], width, height);
    const radiusX = Math.abs(landmarks[291].x - landmarks[61].x) * width * 0.22;
    const radiusY = Math.abs(landmarks[17].y - landmarks[14].y) * height * 0.45;

    const glossGrad = ctx.createRadialGradient(
      centerLower[0], centerLower[1] - radiusY * 0.2, 1,
      centerLower[0], centerLower[1] - radiusY * 0.2, radiusX
    );
    glossGrad.addColorStop(0, `rgba(255, 255, 255, ${finish === 'gloss' ? glossLevel * 0.85 : 0.4})`);
    glossGrad.addColorStop(0.5, `rgba(255, 255, 255, ${finish === 'gloss' ? glossLevel * 0.35 : 0.15})`);
    glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = glossGrad;
    ctx.beginPath();
    ctx.ellipse(centerLower[0], centerLower[1] - radiusY * 0.2, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Shimmer Micro-Glints
  if (finish === 'shimmer') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(254, 243, 199, 0.45)';
    const lowerLipCenter = toPx(landmarks[17], width, height);
    for (let s = -3; s <= 3; s++) {
      ctx.beginPath();
      ctx.arc(lowerLipCenter[0] + (s * 8), lowerLipCenter[1] - 4 + (Math.sin(s) * 3), 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

// ── BLUSH RENDERING ────────────────────────────────────────────────────────────
function renderBlush(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  makeup: MakeupState,
  width: number,
  height: number
) {
  const { color, intensity, style } = makeup.face.blush;

  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';

  // Left cheek center: landmark 117
  const leftCenter = toPx(landmarks[FACE_REGIONS.LEFT_CHEEK_CENTER], width, height);
  // Right cheek center: landmark 346
  const rightCenter = toPx(landmarks[FACE_REGIONS.RIGHT_CHEEK_CENTER], width, height);

  const cheekDist = Math.hypot(rightCenter[0] - leftCenter[0], rightCenter[1] - leftCenter[1]);
  const radius = Math.max(25, cheekDist * 0.24);

  [leftCenter, rightCenter].forEach((pos, idx) => {
    const isLeft = idx === 0;
    // Angle offset for sculpted blush towards ear tragus
    const earPoint = toPx(landmarks[isLeft ? 234 : 454], width, height);
    const angle = Math.atan2(earPoint[1] - pos[1], earPoint[0] - pos[0]);

    ctx.save();
    ctx.translate(pos[0], pos[1]);
    ctx.rotate(style === 'sculpted' ? angle * 0.5 : 0);

    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
    grad.addColorStop(0, color);
    grad.addColorStop(0.45, color);
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.globalAlpha = intensity * 0.75;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * (style === 'sculpted' ? 1.4 : 1.0), radius * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  ctx.restore();
}

// ── HIGHLIGHTER RENDERING ──────────────────────────────────────────────────────
function renderHighlighter(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  makeup: MakeupState,
  width: number,
  height: number
) {
  const { tone, intensity } = makeup.face.highlighter;

  const toneColorMap = {
    champagne: 'rgba(254, 240, 138, 0.7)',
    'rose-gold': 'rgba(251, 207, 232, 0.75)',
    pearl: 'rgba(255, 255, 255, 0.8)',
    bronze: 'rgba(217, 119, 6, 0.65)',
  };

  const highColor = toneColorMap[tone] || toneColorMap.champagne;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = intensity * 0.65;

  // 1. Nose Tip & Nose Bridge
  const noseTip = toPx(landmarks[FACE_REGIONS.NOSE_TIP], width, height);
  const bridgeTop = toPx(landmarks[168], width, height);

  // Nose tip dot
  const tipGrad = ctx.createRadialGradient(noseTip[0], noseTip[1], 1, noseTip[0], noseTip[1], 10);
  tipGrad.addColorStop(0, highColor);
  tipGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = tipGrad;
  ctx.beginPath();
  ctx.arc(noseTip[0], noseTip[1], 10, 0, Math.PI * 2);
  ctx.fill();

  // Nose bridge line
  ctx.strokeStyle = highColor;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bridgeTop[0], bridgeTop[1]);
  ctx.lineTo(noseTip[0], noseTip[1] - 8);
  ctx.stroke();

  // 2. Cheekbone Highlighting
  const leftCheekbone = toPx(landmarks[116], width, height);
  const rightCheekbone = toPx(landmarks[345], width, height);

  [leftCheekbone, rightCheekbone].forEach((cb) => {
    const cbGrad = ctx.createRadialGradient(cb[0], cb[1], 1, cb[0], cb[1], 24);
    cbGrad.addColorStop(0, highColor);
    cbGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = cbGrad;
    ctx.beginPath();
    ctx.arc(cb[0], cb[1], 24, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Cupid's Bow
  const cupid = toPx(landmarks[0], width, height);
  const cupidGrad = ctx.createRadialGradient(cupid[0], cupid[1] - 3, 1, cupid[0], cupid[1] - 3, 7);
  cupidGrad.addColorStop(0, highColor);
  cupidGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = cupidGrad;
  ctx.beginPath();
  ctx.arc(cupid[0], cupid[1] - 3, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── EYESHADOW RENDERING ────────────────────────────────────────────────────────
function renderEyeshadow(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  makeup: MakeupState,
  width: number,
  height: number
) {
  const { primaryColor, secondaryColor, intensity, shimmer } = makeup.eyes.eyeshadow;

  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = intensity * 0.75;

  // Left & Right Eyeshadow Zones
  [
    { zone: FACE_REGIONS.LEFT_EYESHADOW_ZONE, centerIdx: 159, outerIdx: 33 },
    { zone: FACE_REGIONS.RIGHT_EYESHADOW_ZONE, centerIdx: 386, outerIdx: 263 },
  ].forEach(({ zone, centerIdx, outerIdx }) => {
    const center = toPx(landmarks[centerIdx], width, height);
    const outer = toPx(landmarks[outerIdx], width, height);

    ctx.save();
    ctx.beginPath();
    drawSmoothClosedPath(ctx, landmarks, zone, width, height);
    ctx.clip();

    // Dual-tone gradient
    const shadowGrad = ctx.createLinearGradient(center[0], center[1], outer[0], outer[1]);
    shadowGrad.addColorStop(0, primaryColor);
    shadowGrad.addColorStop(1, secondaryColor || primaryColor);

    ctx.fillStyle = shadowGrad;
    ctx.fillRect(0, 0, width, height);

    // Shimmer reflection on eyelid center
    if (shimmer > 0.1) {
      const shimGrad = ctx.createRadialGradient(center[0], center[1], 1, center[0], center[1], 18);
      shimGrad.addColorStop(0, `rgba(255, 255, 255, ${shimmer * 0.6})`);
      shimGrad.addColorStop(1, 'transparent');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = shimGrad;
      ctx.beginPath();
      ctx.arc(center[0], center[1], 18, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  ctx.restore();
}

// ── EYELINER RENDERING ─────────────────────────────────────────────────────────
function renderEyeliner(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  makeup: MakeupState,
  width: number,
  height: number
) {
  const { style, color, intensity } = makeup.eyes.eyeliner;
  if (style === 'none') return;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = intensity;

  const lineWidth = style === 'bold' ? 3.5 : style === 'winged' ? 2.8 : 2.0;
  ctx.lineWidth = lineWidth;

  // Left Eye Line (viewer's left)
  drawSmoothOpenPath(ctx, landmarks, FACE_REGIONS.LEFT_EYE_UPPER, width, height);
  ctx.stroke();

  // Right Eye Line (viewer's right)
  drawSmoothOpenPath(ctx, landmarks, FACE_REGIONS.RIGHT_EYE_UPPER, width, height);
  ctx.stroke();

  // Wing Extensions for winged / cat-eye
  if (style === 'winged' || style === 'cat-eye') {
    const wingLen = style === 'cat-eye' ? 14 : 10;

    // Left eye outer corner: landmark 33
    const leftOuter = toPx(landmarks[33], width, height);
    const leftBrowTail = toPx(landmarks[70], width, height);
    const leftAngle = Math.atan2(leftBrowTail[1] - leftOuter[1], leftBrowTail[0] - leftOuter[0]);

    ctx.beginPath();
    ctx.moveTo(leftOuter[0], leftOuter[1]);
    const lx = leftOuter[0] + Math.cos(leftAngle) * wingLen;
    const ly = leftOuter[1] + Math.sin(leftAngle) * wingLen;
    ctx.lineTo(lx, ly);
    ctx.lineTo(leftOuter[0] + 4, leftOuter[1] - 1);
    ctx.closePath();
    ctx.fill();

    // Right eye outer corner: landmark 263
    const rightOuter = toPx(landmarks[263], width, height);
    const rightBrowTail = toPx(landmarks[336], width, height);
    const rightAngle = Math.atan2(rightBrowTail[1] - rightOuter[1], rightBrowTail[0] - rightOuter[0]);

    ctx.beginPath();
    ctx.moveTo(rightOuter[0], rightOuter[1]);
    const rx = rightOuter[0] + Math.cos(rightAngle) * wingLen;
    const ry = rightOuter[1] + Math.sin(rightAngle) * wingLen;
    ctx.lineTo(rx, ry);
    ctx.lineTo(rightOuter[0] - 4, rightOuter[1] - 1);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

// ── FOUNDATION RENDERING ───────────────────────────────────────────────────────
function renderFoundation(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  makeup: MakeupState,
  width: number,
  height: number
) {
  const { shade, coverage } = makeup.face.foundation;

  ctx.save();
  ctx.beginPath();
  drawSmoothClosedPath(ctx, landmarks, FACE_REGIONS.FACE_OVAL, width, height);

  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillStyle = shade;
  ctx.globalAlpha = coverage * 0.45;
  ctx.fill();

  ctx.restore();
}

// ── HAIR TINT RENDERING ────────────────────────────────────────────────────────
function renderHairTint(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  makeup: MakeupState,
  width: number,
  height: number
) {
  const { color, intensity } = makeup.hair;

  ctx.save();
  ctx.globalCompositeOperation = 'color';
  ctx.fillStyle = color;
  ctx.globalAlpha = intensity * 0.45;

  // Approximate top forehead hairline contour
  const foreheadCenter = toPx(landmarks[10], width, height);
  const leftTemple = toPx(landmarks[21], width, height);
  const rightTemple = toPx(landmarks[251], width, height);

  ctx.beginPath();
  ctx.moveTo(leftTemple[0] - 30, leftTemple[1]);
  ctx.quadraticCurveTo(foreheadCenter[0], foreheadCenter[1] - 60, rightTemple[0] + 30, rightTemple[1]);
  ctx.lineTo(width, 0);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Debug Landmarks Display
function renderDebugLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: FaceLandmarkPoint[],
  width: number,
  height: number
) {
  ctx.save();
  ctx.fillStyle = '#10B981';
  landmarks.forEach((p, idx) => {
    const [x, y] = toPx(p, width, height);
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

export const CanvasMakeupRenderer = {
  drawMakeup(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement | HTMLVideoElement,
    landmarks: FaceLandmarkPoint[],
    makeup: MakeupState,
    options: RenderOptions = {}
  ) {
    const width = (image as any).naturalWidth || (image as any).videoWidth || canvas.width || 1200;
    const height = (image as any).naturalHeight || (image as any).videoHeight || canvas.height || 1200;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);
    renderMakeupOnCanvas(ctx, landmarks, makeup, width, height, options);
  }
};

