export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MIN_DIMENSION = 320;
export const MAX_DIMENSION = 8000;
/** Working bitmaps are downscaled to this long side to bound memory. */
export const MAX_WORKING_SIDE = 3072;

export type ImageMime = 'image/jpeg' | 'image/png' | 'image/webp';
export type Validation =
  | { ok: true; mime: ImageMime }
  | { ok: false; code: string; message: string };

/** Identify the real format from magic bytes (never trust the extension / declared MIME). */
export function sniffImageType(b: Uint8Array): ImageMime | 'heic' | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'image/png';
  const ascii = (s: number, e: number) => String.fromCharCode(...Array.from(b.slice(s, e)));
  if (b.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (b.length >= 12 && ascii(4, 8) === 'ftyp' && /^(heic|heix|hevc|mif1|msf1)/.test(ascii(8, 12))) return 'heic';
  return null;
}

export function validateImageHeader(args: { size: number; declaredType: string; head: Uint8Array }): Validation {
  const { size, declaredType, head } = args;
  if (size <= 0) return { ok: false, code: 'empty', message: 'That file is empty.' };
  if (size > MAX_FILE_BYTES)
    return { ok: false, code: 'too-large', message: `That photo is ${(size / 1048576).toFixed(1)} MB. Please use one under ${MAX_FILE_BYTES / 1048576} MB.` };
  const sniffed = sniffImageType(head);
  if (sniffed === 'heic')
    return { ok: false, code: 'heic', message: 'HEIC/HEIF photos can’t be read by most browsers. Please export or share the photo as JPEG or PNG.' };
  if (!sniffed) return { ok: false, code: 'not-image', message: 'That file isn’t a JPEG, PNG or WebP image.' };
  if (declaredType && declaredType !== sniffed)
    return { ok: false, code: 'type-mismatch', message: 'The file’s type doesn’t match its contents, so it was rejected.' };
  return { ok: true, mime: sniffed };
}

export function checkDimensions(w: number, h: number): Validation | null {
  if (Math.min(w, h) < MIN_DIMENSION)
    return { ok: false, code: 'too-small', message: `The photo is too small (${w}×${h}). Please use one at least ${MIN_DIMENSION}px on its short side.` };
  if (Math.max(w, h) > MAX_DIMENSION)
    return { ok: false, code: 'too-big-dim', message: `The photo is too large (${w}×${h}). The maximum is ${MAX_DIMENSION}px on its long side.` };
  return null;
}

export type LoadResult = { ok: true; bitmap: ImageBitmap } | { ok: false; code: string; message: string };

/** Browser-only: validate a File, decode it (EXIF-rotated) and downscale to the working size. */
export async function loadValidatedBitmap(file: File): Promise<LoadResult> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const v = validateImageHeader({ size: file.size, declaredType: file.type, head });
  if (v.ok === false) return v;
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return { ok: false, code: 'decode', message: 'That image is damaged or couldn’t be decoded.' };
  }
  const bad = checkDimensions(bmp.width, bmp.height);
  if (bad && bad.ok === false) { bmp.close(); return bad; }
  const long = Math.max(bmp.width, bmp.height);
  if (long <= MAX_WORKING_SIDE) return { ok: true, bitmap: bmp };
  const s = MAX_WORKING_SIDE / long;
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  const small = await createImageBitmap(c);
  c.width = c.height = 0;
  return { ok: true, bitmap: small };
}
