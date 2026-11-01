import type { ScanRole } from '../lib/quality';

/**
 * Swappable 3D-reconstruction contract. NOTHING in the UI may show a "3D face" unless a provider
 * returns status:'success' AND validateReconstruction() reports no errors.
 */
export interface ReconFrame { role: ScanRole; bitmap: ImageBitmap; yawDeg: number | null }
export interface ReconInput { frames: ReconFrame[]; signal: AbortSignal; onProgress: (fraction: number, message: string) => void }

export interface ReconResult {
  vertices: Float32Array;   // xyz
  indices: Uint32Array;     // triangles
  uvs: Float32Array;        // uv per vertex, 0..1
  texture: Blob;            // image/png | image/jpeg | image/webp
  meta: { model: string; license: string; viewsUsed: ScanRole[] };
}
export type ReconOutcome =
  | { status: 'success'; result: ReconResult }
  | { status: 'unavailable'; reason: string }
  | { status: 'failed'; error: string };

export interface ReconstructionProvider { readonly id: string; readonly label: string; reconstruct(input: ReconInput): Promise<ReconOutcome> }

/** Default: no licensed multi-view reconstruction model has passed the integration gate yet. */
export const UnavailableProvider: ReconstructionProvider = {
  id: 'none',
  label: 'No reconstruction model installed',
  async reconstruct() {
    return { status: 'unavailable', reason: 'Real 3D reconstruction isn’t enabled on this site yet. No licensed multi-view model has passed testing, so no 3D model was created.' };
  },
};

/** Returns a list of problems; empty list = a verifiable textured mesh. */
export function validateReconstruction(r: ReconResult, minVertices = 500): string[] {
  const e: string[] = [];
  const nV = r.vertices.length / 3;
  if (!Number.isInteger(nV) || nV < minVertices) e.push(`Mesh has too few vertices (${nV}).`);
  if (r.vertices.some((v) => !Number.isFinite(v))) e.push('Mesh contains non-finite vertex values.');
  if (r.indices.length === 0 || r.indices.length % 3 !== 0) e.push('Mesh has no valid triangles.');
  else {
    let max = 0; for (const i of r.indices) if (i > max) max = i;
    if (max >= nV) e.push('Mesh triangles reference vertices that don’t exist.');
  }
  if (r.uvs.length !== nV * 2) e.push('UV coordinates are missing or don’t match the vertex count.');
  else if (r.uvs.some((u) => !Number.isFinite(u) || u < -0.001 || u > 1.001)) e.push('UV coordinates fall outside 0–1.');
  if (!r.texture || r.texture.size < 1024 || !/^image\/(png|jpeg|webp)$/.test(r.texture.type)) e.push('No usable texture image was produced.');
  return e;
}

/** Runs a provider with a single in-flight guard so duplicate requests can’t be started. */
export function createReconRunner(provider: ReconstructionProvider) {
  let controller: AbortController | null = null;
  return {
    get busy() { return controller !== null; },
    cancel() { controller?.abort(); },
    async run(frames: ReconFrame[], onProgress: ReconInput['onProgress'], timeoutMs = 120_000): Promise<ReconOutcome> {
      if (controller) return { status: 'failed', error: 'A reconstruction is already running.' };
      controller = new AbortController();
      const c = controller; const timer = setTimeout(() => c.abort(), timeoutMs);
      try {
        const out = await provider.reconstruct({ frames, signal: c.signal, onProgress });
        if (c.signal.aborted) return { status: 'failed', error: 'Reconstruction was cancelled or timed out.' };
        if (out.status === 'success') {
          const problems = validateReconstruction(out.result);
          if (problems.length) return { status: 'failed', error: `The result failed verification: ${problems.join(' ')}` };
        }
        return out;
      } catch (err) {
        return { status: 'failed', error: c.signal.aborted ? 'Reconstruction was cancelled or timed out.' : (err as Error).message || 'Reconstruction failed.' };
      } finally { clearTimeout(timer); controller = null; }
    },
  };
}
