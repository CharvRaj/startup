import type { FaceLandmarker, ImageSegmenter } from '@mediapipe/tasks-vision';
import type { HairMask, LM } from './types';

/**
 * Lazy MediaPipe loaders. Heavy WASM/models load only when first used and are self-hosted
 * (see scripts/fetch-mediapipe-assets.mjs) so face data never touches a third-party CDN.
 */
const BASE = (import.meta.env.VITE_MEDIAPIPE_BASE as string | undefined) ?? '/mediapipe';
const FACE_MODEL = (import.meta.env.VITE_FACE_MODEL_URL as string | undefined) ?? `${BASE}/models/face_landmarker.task`;
const HAIR_MODEL = (import.meta.env.VITE_HAIR_MODEL_URL as string | undefined) ?? `${BASE}/models/hair_segmenter.tflite`;

let faceP: Promise<FaceLandmarker> | null = null;
let hairP: Promise<ImageSegmenter> | null = null;
let faceMode: 'IMAGE' | 'VIDEO' = 'IMAGE';

async function fileset() {
  const { FilesetResolver } = await import('@mediapipe/tasks-vision');
  try {
    return await FilesetResolver.forVisionTasks(`${BASE}/wasm`);
  } catch {
    return await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
  }
}

export function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!faceP) {
    faceP = (async () => {
      const { FaceLandmarker } = await import('@mediapipe/tasks-vision');
      const fs = await fileset();
      const cdnModel = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
      const make = (modelPath: string, delegate: 'GPU' | 'CPU') => FaceLandmarker.createFromOptions(fs, {
        baseOptions: { modelAssetPath: modelPath, delegate }, runningMode: 'IMAGE', numFaces: 1,
        outputFaceBlendshapes: false, outputFacialTransformationMatrixes: false,
      });

      try {
        const l = await make(FACE_MODEL, 'GPU');
        faceMode = 'IMAGE';
        return l;
      } catch {
        try {
          const l = await make(FACE_MODEL, 'CPU');
          faceMode = 'IMAGE';
          return l;
        } catch {
          // CDN fallback if local asset is unavailable or corrupt
          try {
            const l = await make(cdnModel, 'GPU');
            faceMode = 'IMAGE';
            return l;
          } catch {
            const l = await make(cdnModel, 'CPU');
            faceMode = 'IMAGE';
            return l;
          }
        }
      }
    })();
    faceP.catch(() => { faceP = null; });
  }
  return faceP;
}

const toLM = (r: { faceLandmarks: { x: number; y: number; z: number }[][] }): LM[] | null =>
  r.faceLandmarks?.[0]?.length ? r.faceLandmarks[0].map((p) => ({ x: p.x, y: p.y, z: p.z })) : null;

export async function detectStill(src: ImageBitmap | HTMLCanvasElement): Promise<LM[] | null> {
  const l = await getFaceLandmarker();
  if (faceMode !== 'IMAGE') { await l.setOptions({ runningMode: 'IMAGE' }); faceMode = 'IMAGE'; }
  return toLM(l.detect(src));
}

export async function detectVideoFrame(video: HTMLVideoElement, tsMs: number): Promise<LM[] | null> {
  const l = await getFaceLandmarker();
  if (faceMode !== 'VIDEO') { await l.setOptions({ runningMode: 'VIDEO' }); faceMode = 'VIDEO'; }
  return toLM(l.detectForVideo(video, tsMs));
}

export function getHairSegmenter(): Promise<ImageSegmenter> {
  if (!hairP) {
    hairP = (async () => {
      const { ImageSegmenter } = await import('@mediapipe/tasks-vision');
      const fs = await fileset();
      const make = (delegate: 'GPU' | 'CPU') => ImageSegmenter.createFromOptions(fs, {
        baseOptions: { modelAssetPath: HAIR_MODEL, delegate }, runningMode: 'IMAGE', outputConfidenceMasks: true, outputCategoryMask: false,
      });
      try { return await make('GPU'); } catch { return await make('CPU'); }
    })();
    hairP.catch(() => { hairP = null; });
  }
  return hairP;
}

/** Hair confidence mask (photo mode only). Model is 2-class (background, hair); falls back to the last mask. */
export async function segmentHair(src: ImageBitmap): Promise<HairMask | null> {
  const s = await getHairSegmenter();
  const res = s.segment(src);
  try {
    const masks = res.confidenceMasks; if (!masks?.length) return null;
    const m = masks[masks.length > 1 ? 1 : 0];
    return { data: m.getAsFloat32Array().slice(), width: m.width, height: m.height };
  } finally { res.close(); }
}

export function disposeMediaPipe() {
  faceP?.then((l) => l.close()).catch(() => {}); hairP?.then((s) => s.close()).catch(() => {});
  faceP = null; hairP = null;
}
