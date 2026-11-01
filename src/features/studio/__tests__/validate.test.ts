import { describe, expect, it } from 'vitest';
import { checkDimensions, MAX_FILE_BYTES, sniffImageType, validateImageHeader } from '../lib/validate';

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
const heic = new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]);
const text = new TextEncoder().encode('<html>not an image</html>');

describe('image validation', () => {
  it('identifies real formats from magic bytes', () => {
    expect(sniffImageType(jpeg)).toBe('image/jpeg'); expect(sniffImageType(png)).toBe('image/png');
    expect(sniffImageType(webp)).toBe('image/webp'); expect(sniffImageType(heic)).toBe('heic'); expect(sniffImageType(text)).toBeNull();
  });
  it('accepts a valid image', () => expect(validateImageHeader({ size: 1000, declaredType: 'image/jpeg', head: jpeg }).ok).toBe(true));
  it('rejects non-images renamed as images', () => {
    const r = validateImageHeader({ size: 100, declaredType: 'image/png', head: text }); expect(r.ok).toBe(false); expect((r as any).code).toBe('not-image');
  });
  it('rejects MIME/content mismatch', () => { const r = validateImageHeader({ size: 100, declaredType: 'image/png', head: jpeg }); expect((r as any).code).toBe('type-mismatch'); });
  it('rejects oversize and empty files', () => {
    expect(validateImageHeader({ size: MAX_FILE_BYTES + 1, declaredType: 'image/jpeg', head: jpeg })).toMatchObject({ ok: false, code: 'too-large' });
    expect(validateImageHeader({ size: 0, declaredType: '', head: jpeg })).toMatchObject({ ok: false, code: 'empty' });
  });
  it('gives a helpful HEIC message', () => { const r = validateImageHeader({ size: 100, declaredType: '', head: heic }); expect((r as any).message).toMatch(/JPEG or PNG/); });
  it('checks dimensions', () => {
    expect(checkDimensions(200, 900)).toMatchObject({ code: 'too-small' }); expect(checkDimensions(9000, 900)).toMatchObject({ code: 'too-big-dim' }); expect(checkDimensions(1200, 900)).toBeNull();
  });
});
