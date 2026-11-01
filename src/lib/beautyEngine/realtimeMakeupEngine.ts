/**
 * Real-Time Virtual Makeup & Hair Styler Engine
 * Inspired by MediaPipe Tasks Vision + OpenCV soft compositing
 * High-performance 60 FPS client-side rendering with local WASM & TFLite models
 */

import { FilesetResolver, FaceLandmarker, ImageSegmenter, ImageSegmenterResult } from '@mediapipe/tasks-vision';
import { MakeupState } from '@/types/beautyStudio';

// Local asset paths bundled in public/task-vision
const WASM_PATH = '/task-vision/wasm';
const FACE_MODEL_PATH = '/task-vision/model/face_landmarker.task';
const HAIR_MODEL_PATH = '/task-vision/model/hair_segmenter.tflite';

// 468-Landmark Connections (exact precision contours)
export const LIP_OUTER_RING = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 308, 415, 310, 312, 13, 82, 81, 80, 191, 78];
export const LIP_INNER_RING = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 402, 317, 14, 87, 178, 88, 95, 78, 61];

export const EYE_SHADOW_BOTTOM = [
  [243, 112, 26, 22, 23, 24, 110, 25, 226, 130, 33, 7, 163, 144, 145, 153, 154, 155, 133, 243],
  [463, 362, 382, 381, 380, 374, 373, 390, 249, 263, 359, 446, 255, 339, 254, 253, 252, 256, 341, 463],
];

export const EYE_SHADOW_TOP = [
  [226, 247, 30, 29, 27, 28, 56, 190, 243, 173, 157, 158, 159, 160, 161, 246, 33, 130, 226],
  [463, 414, 286, 258, 257, 259, 260, 467, 446, 359, 263, 466, 388, 387, 386, 385, 384, 398, 362, 463],
];

export const EYE_BROW_LEFT = [55, 107, 66, 105, 63, 70, 46, 53, 52, 65, 55];
export const EYE_BROW_RIGHT = [285, 336, 296, 334, 293, 300, 276, 283, 295, 285];

export const EYELINER_LEFT = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
export const EYELINER_RIGHT = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// Cheek Centers for Blush
export const CHEEK_LEFT_CENTER = 205;
export const CHEEK_RIGHT_CENTER = 425;

export interface Point2D {
  x: number;
  y: number;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

// MediaPipe Vision Singletons
let visionFilesetPromise: Promise<any> | null = null;
let imageFaceLandmarker: FaceLandmarker | null = null;
let videoFaceLandmarker: FaceLandmarker | null = null;
let imageHairSegmenter: ImageSegmenter | null = null;
let videoHairSegmenter: ImageSegmenter | null = null;

async function getFileset() {
  if (!visionFilesetPromise) {
    visionFilesetPromise = FilesetResolver.forVisionTasks(WASM_PATH).catch(async () => {
      // Fallback to CDN if local files are missing
      return FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
    });
  }
  return visionFilesetPromise;
}

export async function getVisionModels(mode: 'IMAGE' | 'VIDEO'): Promise<{
  faceLandmarker: FaceLandmarker;
  hairSegmenter: ImageSegmenter | null;
}> {
  const fileset = await getFileset();

  if (mode === 'IMAGE') {
    if (!imageFaceLandmarker) {
      try {
        imageFaceLandmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL_PATH, delegate: 'GPU' },
          runningMode: 'IMAGE',
          numFaces: 1,
          outputFaceBlendshapes: false,
        });
      } catch (err) {
        console.warn('Falling back to CPU for Image FaceLandmarker:', err);
        imageFaceLandmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL_PATH, delegate: 'CPU' },
          runningMode: 'IMAGE',
          numFaces: 1,
        });
      }
    }

    if (!imageHairSegmenter) {
      try {
        imageHairSegmenter = await ImageSegmenter.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: HAIR_MODEL_PATH, delegate: 'CPU' },
          runningMode: 'IMAGE',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });
      } catch (err) {
        console.warn('Hair segmenter could not load:', err);
        imageHairSegmenter = null;
      }
    }

    return { faceLandmarker: imageFaceLandmarker, hairSegmenter: imageHairSegmenter };
  } else {
    if (!videoFaceLandmarker) {
      try {
        videoFaceLandmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL_PATH, delegate: 'GPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
        });
      } catch (err) {
        console.warn('Falling back to CPU for Video FaceLandmarker:', err);
        videoFaceLandmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL_PATH, delegate: 'CPU' },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      }
    }

    if (!videoHairSegmenter) {
      try {
        videoHairSegmenter = await ImageSegmenter.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: HAIR_MODEL_PATH, delegate: 'CPU' },
          runningMode: 'VIDEO',
          outputCategoryMask: true,
          outputConfidenceMasks: false,
        });
      } catch (err) {
        console.warn('Video hair segmenter could not load:', err);
        videoHairSegmenter = null;
      }
    }

    return { faceLandmarker: videoFaceLandmarker, hairSegmenter: videoHairSegmenter };
  }
}

/**
 * Draws a smooth polygon through an array of landmark indices
 */
function drawLandmarkPolygon(
  ctx: CanvasRenderingContext2D,
  indices: number[],
  landmarks: { x: number; y: number }[],
  width: number,
  height: number,
  closePath = true
) {
  if (indices.length < 2) return;
  const first = landmarks[indices[0]];
  if (!first) return;

  ctx.beginPath();
  ctx.moveTo(first.x * width, first.y * height);

  for (let i = 1; i < indices.length; i++) {
    const pt = landmarks[indices[i]];
    if (!pt) continue;
    ctx.lineTo(pt.x * width, pt.y * height);
  }

  if (closePath) {
    ctx.closePath();
  }
}

/**
 * Applies natural makeup layers to the 2D canvas context
 */
export function renderRealtimeMakeup(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[],
  makeup: MakeupState,
  width: number,
  height: number
) {
  if (!landmarks || landmarks.length < 468) return;

  ctx.save();

  // 1. BLUSH (Left & Right Cheek apples with radial gaussian diffusion)
  if (makeup.face?.blushColor && (makeup.face?.blushIntensity ?? 0) > 0) {
    const blushRgb = hexToRgb(makeup.face.blushColor);
    const intensity = Math.min(1, (makeup.face.blushIntensity || 50) / 100) * 0.45;

    const leftCheek = landmarks[CHEEK_LEFT_CENTER];
    const rightCheek = landmarks[CHEEK_RIGHT_CENTER];

    const blushRadius = width * 0.085;

    [leftCheek, rightCheek].forEach(cheek => {
      if (!cheek) return;
      const cx = cheek.x * width;
      const cy = cheek.y * height;

      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, blushRadius);
      grad.addColorStop(0, `rgba(${blushRgb.r}, ${blushRgb.g}, ${blushRgb.b}, ${intensity})`);
      grad.addColorStop(0.5, `rgba(${blushRgb.r}, ${blushRgb.g}, ${blushRgb.b}, ${intensity * 0.5})`);
      grad.addColorStop(1, `rgba(${blushRgb.r}, ${blushRgb.g}, ${blushRgb.b}, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, blushRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // 2. EYE SHADOW - TOP & BOTTOM (Soft Blended Pigment)
  if (makeup.eyes?.eyeshadowColor && (makeup.eyes?.eyeshadowIntensity ?? 0) > 0) {
    const shadowRgb = hexToRgb(makeup.eyes.eyeshadowColor);
    const shadowIntensity = Math.min(1, (makeup.eyes.eyeshadowIntensity || 50) / 100) * 0.55;

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.filter = 'blur(4px)';
    ctx.fillStyle = `rgba(${shadowRgb.r}, ${shadowRgb.g}, ${shadowRgb.b}, ${shadowIntensity})`;

    // Top crease
    EYE_SHADOW_TOP.forEach(ring => {
      drawLandmarkPolygon(ctx, ring, landmarks, width, height, true);
      ctx.fill();
    });

    // Bottom lash line
    EYE_SHADOW_BOTTOM.forEach(ring => {
      drawLandmarkPolygon(ctx, ring, landmarks, width, height, true);
      ctx.fill();
    });
    ctx.restore();

    // Metallic/Shimmer highlight on eyelids if shimmer style is selected
    if (makeup.eyes.eyeshadowStyle === 'shimmer' || makeup.eyes.eyeshadowStyle === 'halo') {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.filter = 'blur(3px)';
      ctx.fillStyle = `rgba(255, 235, 180, ${shadowIntensity * 0.4})`;
      [landmarks[159], landmarks[386]].forEach(lidCenter => {
        if (!lidCenter) return;
        ctx.beginPath();
        ctx.arc(lidCenter.x * width, lidCenter.y * height, width * 0.025, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // 3. EYELINER (Sculpted lash line)
  if (makeup.eyes?.eyelinerColor && (makeup.eyes?.eyelinerIntensity ?? 0) > 0) {
    const linerRgb = hexToRgb(makeup.eyes.eyelinerColor);
    const linerAlpha = Math.min(1, (makeup.eyes.eyelinerIntensity || 70) / 100) * 0.85;

    ctx.save();
    ctx.strokeStyle = `rgba(${linerRgb.r}, ${linerRgb.g}, ${linerRgb.b}, ${linerAlpha})`;
    ctx.lineWidth = Math.max(2, width * 0.0035);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    drawLandmarkPolygon(ctx, EYELINER_LEFT, landmarks, width, height, false);
    ctx.stroke();

    drawLandmarkPolygon(ctx, EYELINER_RIGHT, landmarks, width, height, false);
    ctx.stroke();

    // Winged extension if cat-eye or wing style
    if (makeup.eyes.eyelinerStyle === 'winged' || makeup.eyes.eyelinerStyle === 'cat-eye') {
      const leftOuter = landmarks[33];
      const rightOuter = landmarks[263];
      if (leftOuter && rightOuter) {
        ctx.beginPath();
        ctx.moveTo(leftOuter.x * width, leftOuter.y * height);
        ctx.lineTo((leftOuter.x - 0.018) * width, (leftOuter.y - 0.012) * height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rightOuter.x * width, rightOuter.y * height);
        ctx.lineTo((rightOuter.x + 0.018) * width, (rightOuter.y - 0.012) * height);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // 4. EYEBROWS (Natural Micro-Shading)
  if (makeup.eyes?.browColor && (makeup.eyes?.browIntensity ?? 0) > 0) {
    const browRgb = hexToRgb(makeup.eyes.browColor);
    const browAlpha = Math.min(1, (makeup.eyes.browIntensity || 60) / 100) * 0.45;

    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.filter = 'blur(2px)';
    ctx.fillStyle = `rgba(${browRgb.r}, ${browRgb.g}, ${browRgb.b}, ${browAlpha})`;

    drawLandmarkPolygon(ctx, EYE_BROW_LEFT, landmarks, width, height, true);
    ctx.fill();

    drawLandmarkPolygon(ctx, EYE_BROW_RIGHT, landmarks, width, height, true);
    ctx.fill();
    ctx.restore();
  }

  // 5. LIPS (Vermilion Border + Inner Cutout + Specular Finish)
  if (makeup.lips?.color && (makeup.lips?.intensity ?? 0) > 0) {
    const lipRgb = hexToRgb(makeup.lips.color);
    const lipAlpha = Math.min(1, (makeup.lips.intensity || 75) / 100) * 0.65;

    ctx.save();
    // Using soft-light or overlay for natural skin-textured lip coloring
    ctx.globalCompositeOperation = makeup.lips.finish === 'matte' ? 'multiply' : 'source-over';
    ctx.filter = 'blur(2.5px)';

    // Outer Lip Fill
    ctx.fillStyle = `rgba(${lipRgb.r}, ${lipRgb.g}, ${lipRgb.b}, ${lipAlpha})`;
    drawLandmarkPolygon(ctx, LIP_OUTER_RING, landmarks, width, height, true);
    ctx.fill();

    // Inner Lip Cutout (so teeth and mouth cavity stay clean and natural)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.filter = 'blur(1.5px)';
    drawLandmarkPolygon(ctx, LIP_INNER_RING, landmarks, width, height, true);
    ctx.fill();
    ctx.restore();

    // Gloss / Satin Highlight
    if (makeup.lips.finish === 'gloss' || (makeup.lips.glossLevel ?? 0) > 30) {
      const glossStrength = ((makeup.lips.glossLevel || 50) / 100) * 0.45;
      const lowerLipCenter = landmarks[14];
      const upperLipCenter = landmarks[0];

      if (lowerLipCenter && upperLipCenter) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.filter = 'blur(3px)';
        ctx.fillStyle = `rgba(255, 255, 255, ${glossStrength})`;

        // Lower lip specular highlight
        ctx.beginPath();
        ctx.ellipse(
          lowerLipCenter.x * width,
          lowerLipCenter.y * height,
          width * 0.025,
          height * 0.008,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Cupid's bow highlight
        ctx.beginPath();
        ctx.ellipse(
          upperLipCenter.x * width,
          upperLipCenter.y * height,
          width * 0.018,
          height * 0.005,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      }
    }
  }

  // 6. HIGHLIGHTER (Bridge of nose + cheekbone crowns)
  if (makeup.face?.highlighterColor && (makeup.face?.highlighterIntensity ?? 0) > 0) {
    const hlRgb = hexToRgb(makeup.face.highlighterColor);
    const hlAlpha = Math.min(1, (makeup.face.highlighterIntensity || 40) / 100) * 0.35;
    const noseBridge = landmarks[168];
    const noseTip = landmarks[1];

    if (noseBridge && noseTip) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.filter = 'blur(3px)';
      ctx.fillStyle = `rgba(${hlRgb.r}, ${hlRgb.g}, ${hlRgb.b}, ${hlAlpha})`;

      // Nose bridge sheen
      ctx.beginPath();
      ctx.ellipse(
        noseBridge.x * width,
        noseBridge.y * height,
        width * 0.008,
        height * 0.025,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Nose tip button highlight
      ctx.beginPath();
      ctx.arc(noseTip.x * width, noseTip.y * height, width * 0.006, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * Applies natural hair tinting using MediaPipe Hair Segmenter category mask
 */
export function renderHairTint(
  ctx: CanvasRenderingContext2D,
  segmentation: ImageSegmenterResult | null,
  colorHex: string,
  opacity: number,
  width: number,
  height: number
) {
  if (!segmentation || !segmentation.categoryMask) return;
  const categoryMask = segmentation.categoryMask;
  const hairMaskArray = categoryMask.getAsUint8Array();
  if (!hairMaskArray || hairMaskArray.length === 0) return;

  const hairRgb = hexToRgb(colorHex);
  const alphaVal = Math.min(255, Math.max(0, Math.round(opacity * 255 * 0.75)));

  // Create temporary offscreen image data
  const maskImageData = ctx.createImageData(width, height);
  const data = maskImageData.data;

  const totalPixels = width * height;
  const step = Math.min(totalPixels, hairMaskArray.length);

  for (let i = 0; i < step; i++) {
    const offset = i * 4;
    // Hair class in MediaPipe hair_segmenter is category 1 (odd)
    if (hairMaskArray[i] % 2 === 1) {
      data[offset] = hairRgb.r;
      data[offset + 1] = hairRgb.g;
      data[offset + 2] = hairRgb.b;
      data[offset + 3] = alphaVal;
    }
  }

  // Draw hair mask with soft-light or multiply blending for realistic strands
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  tempCtx.putImageData(maskImageData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'soft-light';
  ctx.filter = 'blur(4px)';
  ctx.drawImage(tempCanvas, 0, 0);

  // Overlay pass for rich tone
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.45;
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
}
