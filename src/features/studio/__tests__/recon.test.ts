import { describe, expect, it } from 'vitest';
import { UnavailableProvider, createReconRunner, validateReconstruction, type ReconResult, type ReconstructionProvider } from '../recon/provider';

const tex = new Blob([new Uint8Array(2048)], { type: 'image/png' });
function goodMesh(): ReconResult {
  const n = 600; const vertices = new Float32Array(n * 3).map((_, i) => (i % 7) * 0.1); const indices = new Uint32Array(300 * 3).map((_, i) => i % n);
  const uvs = new Float32Array(n * 2).map((_, i) => (i % 100) / 100);
  return { vertices, indices, uvs, texture: tex, meta: { model: 'test', license: 'test', viewsUsed: ['front'] } };
}
describe('validateReconstruction', () => {
  it('accepts a real-looking textured mesh', () => expect(validateReconstruction(goodMesh())).toEqual([]));
  it('rejects missing UVs', () => expect(validateReconstruction({ ...goodMesh(), uvs: new Float32Array(10) }).join()).toMatch(/UV/));
  it('rejects out-of-range indices', () => { const m = goodMesh(); m.indices[0] = 99999; expect(validateReconstruction(m).join()).toMatch(/don’t exist/); });
  it('rejects tiny meshes, NaNs and missing texture', () => {
    expect(validateReconstruction({ ...goodMesh(), vertices: new Float32Array(30) }).length).toBeGreaterThan(0);
    const m = goodMesh(); m.vertices[5] = NaN; expect(validateReconstruction(m).join()).toMatch(/non-finite/);
    expect(validateReconstruction({ ...goodMesh(), texture: new Blob([]) }).join()).toMatch(/texture/);
  });
});
describe('reconstruction runner', () => {
  it('default provider reports unavailable, never success', async () => expect((await createReconRunner(UnavailableProvider).run([], () => {})).status).toBe('unavailable'));
  it('turns a provider "success" with a bad mesh into a failure', async () => {
    const bad: ReconstructionProvider = { id: 'x', label: 'x', reconstruct: async () => ({ status: 'success', result: { ...goodMesh(), uvs: new Float32Array(0) } }) };
    const out = await createReconRunner(bad).run([], () => {}); expect(out.status).toBe('failed');
  });
  it('passes through a verified success', async () => {
    const ok: ReconstructionProvider = { id: 'x', label: 'x', reconstruct: async () => ({ status: 'success', result: goodMesh() }) };
    expect((await createReconRunner(ok).run([], () => {})).status).toBe('success');
  });
  it('blocks duplicate requests while one is running and supports cancel', async () => {
    const slow: ReconstructionProvider = { id: 's', label: 's', reconstruct: ({ signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(new Error('aborted')))) };
    const r = createReconRunner(slow); const first = r.run([], () => {}); const second = await r.run([], () => {});
    expect(second).toMatchObject({ status: 'failed', error: expect.stringMatching(/already running/) });
    r.cancel(); expect((await first).status).toBe('failed'); expect(r.busy).toBe(false);
  });
  it('times out', async () => {
    const hang: ReconstructionProvider = { id: 'h', label: 'h', reconstruct: ({ signal }) => new Promise((_, rej) => signal.addEventListener('abort', () => rej(new Error('x')))) };
    expect(await createReconRunner(hang).run([], () => {}, 20)).toMatchObject({ status: 'failed', error: expect.stringMatching(/timed out/) });
  });
});
