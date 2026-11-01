// Self-host MediaPipe runtime + models so face data/requests never depend on a third-party CDN.
// Usage: node scripts/fetch-mediapipe-assets.mjs   (add to "postinstall" or run once)
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = 'public/mediapipe';
mkdirSync(join(out, 'models'), { recursive: true });

const wasmSrc = 'node_modules/@mediapipe/tasks-vision/wasm';
if (!existsSync(wasmSrc)) { console.error('Run `npm i @mediapipe/tasks-vision` first.'); process.exit(1); }
cpSync(wasmSrc, join(out, 'wasm'), { recursive: true });
console.log('copied wasm runtime');

const MODELS = {
  'face_landmarker.task': 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  // UNVERIFIED path — confirm against https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter before shipping hair colour.
  'hair_segmenter.tflite': 'https://storage.googleapis.com/mediapipe-models/image_segmenter/hair_segmenter/float32/latest/hair_segmenter.tflite',
};
for (const [name, url] of Object.entries(MODELS)) {
  const dest = join(out, 'models', name);
  if (existsSync(dest)) { console.log('exists', name); continue; }
  const res = await fetch(url);
  if (!res.ok) { console.warn(`FAILED ${name}: HTTP ${res.status} (${url})`); continue; }
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log('downloaded', name);
}
