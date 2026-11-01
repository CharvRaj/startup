import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, Download, Eye, Loader2, Redo2, RotateCcw, Trash2, Undo2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCamera } from '../hooks/useCamera';
import { detectStill, detectVideoFrame, getFaceLandmarker, segmentHair } from '../lib/landmarker';
import { ExportError, computeExportSize, downloadBlob, exportPng, releaseRenderResources, renderLook } from '../lib/render';
import { hasFullMesh } from '../lib/regions';
import { loadValidatedBitmap } from '../lib/validate';
import { DEFAULT_LOOK, type HairMask, type LM } from '../lib/types';
import { useLookStore } from '../store/lookStore';
import { MakeupPanels } from './MakeupPanels';

type Source = 'none' | 'photo' | 'live';
type Status = 'idle' | 'loading-model' | 'detecting' | 'ready' | 'no-face' | 'error';
const DISPLAY_MAX = 1400;
const SIZES: { id: string; label: string; v: number | 'original' }[] = [
  { id: 'share', label: 'Share · 1080 px', v: 1080 }, { id: 'hd', label: 'HD · 2048 px', v: 2048 }, { id: 'orig', label: 'Original size', v: 'original' },
];
const MODEL_ERR = 'The face-detection model couldn’t be loaded. Check your connection and that the model files are installed (see README), then retry.';

export function QuickMakeup({ initialBitmap, onDiscarded }: { initialBitmap?: ImageBitmap | null; onDiscarded?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const lmRef = useRef<LM[] | null>(null);
  const hairRef = useRef<HairMask | null>(null);
  const rafRef = useRef(0);
  const loadSeq = useRef(0);
  const { videoRef, state: cam, start: startCam, stop: stopCam } = useCamera();

  const [source, setSource] = useState<Source>('none');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hairState, setHairState] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [sizeId, setSizeId] = useState('share');
  const [exporting, setExporting] = useState(false);

  const look = useLookStore((s) => s.look);
  const showOriginal = useLookStore((s) => s.showOriginal);
  const canUndo = useLookStore((s) => s.past.length > 0);
  const canRedo = useLookStore((s) => s.future.length > 0);
  const { undo, redo, reset, setShowOriginal } = useLookStore.getState();

  /* ----- still rendering (coalesced to one paint per frame) ----- */
  const paintStill = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const bmp = bitmapRef.current, c = canvasRef.current; if (!bmp || !c) return;
      const s = Math.min(1, DISPLAY_MAX / Math.max(bmp.width, bmp.height));
      const w = Math.round(bmp.width * s), h = Math.round(bmp.height * s);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      const ctx = c.getContext('2d'); if (!ctx) { setError('Your browser couldn’t create a drawing surface.'); return; }
      const st = useLookStore.getState();
      renderLook(ctx, w, h, bmp, lmRef.current, st.showOriginal ? null : st.look, { hair: hairRef.current });
    });
  }, []);
  useEffect(() => { if (source === 'photo') paintStill(); }, [look, showOriginal, source, status, hairState, paintStill]);

  /* ----- load a bitmap (upload / capture / handoff) ----- */
  const adopt = useCallback(async (bmp: ImageBitmap) => {
    const seq = ++loadSeq.current;
    stopCam(); bitmapRef.current?.close(); bitmapRef.current = bmp; hairRef.current = null; lmRef.current = null; setHairState('idle');
    setSource('photo'); setError(null); setStatus('loading-model');
    try {
      setStatus('detecting');
      const lm = await detectStill(bmp);
      if (seq !== loadSeq.current) return;
      lmRef.current = hasFullMesh(lm) ? lm : null;
      setStatus(lmRef.current ? 'ready' : 'no-face');
    } catch {
      if (seq !== loadSeq.current) return;
      setStatus('error'); setError(MODEL_ERR);
    }
  }, [stopCam]);

  useEffect(() => { if (initialBitmap) void adopt(initialBitmap); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [initialBitmap]);

  const onFile = async (f?: File | null) => {
    if (!f) return; setError(null);
    const r = await loadValidatedBitmap(f);
    if (fileRef.current) fileRef.current.value = '';
    if (r.ok === false) { setError(r.message); return; }
    await adopt(r.bitmap);
  };

  /* ----- hair (lazy, photo only) ----- */
  useEffect(() => {
    if (source !== 'photo' || !look.hair.enabled || hairRef.current || hairState === 'loading' || hairState === 'failed' || !bitmapRef.current) return;
    const seq = loadSeq.current; setHairState('loading');
    segmentHair(bitmapRef.current)
      .then((m) => { if (seq !== loadSeq.current) return; hairRef.current = m; setHairState(m ? 'ready' : 'failed'); })
      .catch(() => { if (seq === loadSeq.current) setHairState('failed'); });
  }, [look.hair.enabled, source, hairState]);

  /* ----- live camera ----- */
  const goLive = async () => {
    setError(null); bitmapRef.current?.close(); bitmapRef.current = null; lmRef.current = null; hairRef.current = null;
    setSource('live'); setStatus('loading-model');
    const ok = await startCam('user');
    if (!ok) { setSource('none'); setStatus('idle'); return; }
    try { await getFaceLandmarker(); } catch { stopCam(); setSource('none'); setStatus('error'); setError(MODEL_ERR); return; }
    setStatus('ready');
  };

  useEffect(() => {
    if (source !== 'live' || cam.status !== 'active') return;
    let stopped = false; let last = -1; let busy = false;
    const loop = async () => {
      if (stopped) return;
      const v = videoRef.current, c = canvasRef.current;
      if (v && c && v.readyState >= 2 && v.currentTime !== last && !busy) {
        busy = true; last = v.currentTime;
        try {
          const s = Math.min(1, DISPLAY_MAX / Math.max(v.videoWidth, v.videoHeight));
          const w = Math.round(v.videoWidth * s), h = Math.round(v.videoHeight * s);
          if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
          const lm = await detectVideoFrame(v, performance.now()); lmRef.current = hasFullMesh(lm) ? lm : null;
          const ctx = c.getContext('2d'); const st = useLookStore.getState();
          if (ctx) renderLook(ctx, w, h, v, lmRef.current, st.showOriginal ? null : st.look);
        } catch { /* skip frame */ } finally { busy = false; }
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => { stopped = true; };
  }, [source, cam.status, videoRef]);

  const capture = async () => {
    const v = videoRef.current; if (!v) return;
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight;
    const x = c.getContext('2d')!; x.translate(c.width, 0); x.scale(-1, 1); x.drawImage(v, 0, 0); // mirrored, as the user saw it
    const bmp = await createImageBitmap(c); c.width = c.height = 0; await adopt(bmp);
  };

  /* ----- export ----- */
  const download = async () => {
    const bmp = bitmapRef.current; if (!bmp) return; setExporting(true); setError(null);
    try {
      const size = SIZES.find((s) => s.id === sizeId)!.v;
      const { blob } = await exportPng(bmp, lmRef.current, useLookStore.getState().look, size, hairRef.current);
      downloadBlob(blob, `satguru-virtual-makeup-${Date.now()}.png`);
    } catch (e) { setError(e instanceof ExportError ? e.message : 'Export failed. Please try again.'); } finally { setExporting(false); }
  };

  /* ----- discard / cleanup ----- */
  const discard = useCallback(() => {
    loadSeq.current++; cancelAnimationFrame(rafRef.current); stopCam();
    bitmapRef.current?.close(); bitmapRef.current = null; lmRef.current = null; hairRef.current = null;
    const c = canvasRef.current; if (c) { c.width = 1; c.height = 1; }
    releaseRenderResources(); useLookStore.setState({ past: [], future: [], look: DEFAULT_LOOK, lastKey: null, showOriginal: false });
    setSource('none'); setStatus('idle'); setError(null); setHairState('idle'); onDiscarded?.();
  }, [stopCam, onDiscarded]);
  useEffect(() => () => { cancelAnimationFrame(rafRef.current); bitmapRef.current?.close(); releaseRenderResources(); }, []);

  const faceReady = source === 'photo' && status === 'ready';
  const exportInfo = bitmapRef.current ? computeExportSize(bitmapRef.current.width, bitmapRef.current.height, SIZES.find((s) => s.id === sizeId)!.v) : null;
  const busy = status === 'loading-model' || status === 'detecting';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
          <video ref={videoRef} className="hidden" playsInline muted aria-hidden />
          <canvas ref={canvasRef} role="img" aria-label="Makeup preview" className={`mx-auto block max-h-[70vh] w-auto max-w-full ${source === 'none' ? 'hidden' : ''} ${source === 'live' ? '-scale-x-100' : ''}`} />
          {source === 'none' && (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
              <p className="font-display text-2xl">Try makeup on your photo</p>
              <p className="max-w-sm text-sm text-muted-foreground">Upload a clear, front-facing photo or use your camera. Everything stays on your device.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload photo</Button>
                <Button variant="outline" onClick={goLive}><Camera className="mr-2 h-4 w-4" />Use camera</Button>
              </div>
            </div>
          )}
          {busy && <div role="status" className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-sm"><Loader2 className="h-4 w-4 animate-spin" />{status === 'loading-model' ? 'Loading face model…' : 'Finding your face…'}</div>}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload a photo" onChange={(e) => onFile(e.target.files?.[0])} />

        <div aria-live="polite" className="space-y-2">
          {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Something went wrong</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          {cam.message && source === 'none' && <Alert><AlertTriangle className="h-4 w-4" /><AlertTitle>Camera unavailable</AlertTitle><AlertDescription>{cam.message}</AlertDescription></Alert>}
          {status === 'no-face' && <Alert><AlertTriangle className="h-4 w-4" /><AlertTitle>No face detected</AlertTitle><AlertDescription>Try a well-lit, front-facing photo with your whole face visible. Makeup can’t be placed without a detected face.</AlertDescription></Alert>}
          {hairState === 'failed' && <Alert><AlertDescription>Hair colour isn’t available for this photo (the hair model couldn’t run or found no hair).</AlertDescription></Alert>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {source === 'live' && <Button onClick={capture} disabled={cam.status !== 'active' || busy}><Camera className="mr-2 h-4 w-4" />Capture frame</Button>}
          {source !== 'none' && <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" />New photo</Button>}
          <Button variant="outline" size="icon" aria-label="Undo" onClick={undo} disabled={!canUndo}><Undo2 className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Redo" onClick={redo} disabled={!canRedo}><Redo2 className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Reset look</Button>
          <Button variant="outline" disabled={source === 'none'} aria-label="Hold to compare with original"
            onPointerDown={() => setShowOriginal(true)} onPointerUp={() => setShowOriginal(false)} onPointerLeave={() => setShowOriginal(false)} onPointerCancel={() => setShowOriginal(false)}
            onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setShowOriginal(true)} onKeyUp={() => setShowOriginal(false)} onBlur={() => setShowOriginal(false)}>
            <Eye className="mr-2 h-4 w-4" />Hold: original
          </Button>
          {source !== 'none' && <Button variant="ghost" onClick={discard}><Trash2 className="mr-2 h-4 w-4" />Discard session</Button>}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
          <label className="text-sm" htmlFor="export-size">PNG size</label>
          <select id="export-size" value={sizeId} onChange={(e) => setSizeId(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1.5 text-sm">{SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
          {exportInfo && <span className="text-xs text-muted-foreground">{exportInfo.w}×{exportInfo.h}{exportInfo.upscaled ? ' (upscaled)' : ''}{exportInfo.capped ? ' (limited for device memory)' : ''}</span>}
          <Button className="ml-auto" onClick={download} disabled={source !== 'photo' || exporting || busy} title={source === 'live' ? 'Capture a frame first' : undefined}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Download PNG
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Quick Makeup: a 2D, landmark-aligned preview of one photo. It can’t rotate your head in 3D, and colours depend on your screen and the photo’s lighting.</p>
      </div>
      <aside aria-label="Makeup controls"><MakeupPanels faceReady={faceReady} hairDisabledReason={source === 'live' ? 'Hair colour works on photos only. Capture a frame first.' : undefined} /></aside>
    </div>
  );
}
