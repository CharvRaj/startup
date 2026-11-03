import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, Download, Eye, Loader2, Redo2, RotateCcw, Sparkles, Trash2, Undo2, Upload, User, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
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

const DEMO_MODELS = [
  { id: 'ananya', name: 'Ananya', tone: 'Warm Honey', src: '/images/model.png' },
  { id: 'tara', name: 'Tara', tone: 'Royal Bridal', src: '/images/category-bridal.jpg' },
  { id: 'diya', name: 'Diya', tone: 'Festive Radiance', src: '/images/diwali-campaign-master.jpg' },
];

export function QuickMakeup({ initialBitmap, onDiscarded }: { initialBitmap?: ImageBitmap | null; onDiscarded?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
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
  const [flash, setFlash] = useState(false);
  const [zoomEnabled, setZoomEnabled] = useState(true);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number; normX: number; normY: number } | null>(null);

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

  useEffect(() => {
    if (initialBitmap) {
      void adopt(initialBitmap);
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [initialBitmap]);

  const onFile = async (f?: File | null) => {
    if (!f) return; setError(null);
    const r = await loadValidatedBitmap(f);
    if (fileRef.current) fileRef.current.value = '';
    if (r.ok === false) { setError(r.message); return; }
    await adopt(r.bitmap);
  };

  /* ----- load preloaded sample demo model ----- */
  const loadDemoModel = async (src: string) => {
    setError(null);
    setStatus('loading-model');
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const bmp = await createImageBitmap(blob);
      await adopt(bmp);
    } catch {
      setError('Could not load sample portrait. Please upload a photo or use your camera.');
      setStatus('idle');
    }
  };

  /* ----- interactive canvas zoom loupe tracking ----- */
  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!zoomEnabled || source === 'none' || !canvasRef.current || !loupeRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      setZoomPos(null);
      return;
    }

    const normX = (clientX - rect.left) / rect.width;
    const normY = (clientY - rect.top) / rect.height;

    const containerRect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
      normX,
      normY,
    });

    // Draw magnified image onto loupe canvas
    const loupe = loupeRef.current;
    const lCtx = loupe.getContext('2d');
    if (!lCtx) return;

    const LOUPE_PX = 140;
    if (loupe.width !== LOUPE_PX || loupe.height !== LOUPE_PX) {
      loupe.width = LOUPE_PX;
      loupe.height = LOUPE_PX;
    }

    const zoomFactor = 2.5;
    const srcW = canvas.width / zoomFactor;
    const srcH = canvas.height / zoomFactor;
    const srcX = normX * canvas.width - srcW / 2;
    const srcY = normY * canvas.height - srcH / 2;

    lCtx.clearRect(0, 0, LOUPE_PX, LOUPE_PX);
    lCtx.imageSmoothingQuality = 'high';
    lCtx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, LOUPE_PX, LOUPE_PX);
  };

  const handleCanvasPointerLeave = () => {
    setZoomPos(null);
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
    setFlash(true);
    setTimeout(() => setFlash(false), 260);
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_460px] items-start">
      {/* Left: Interactive Canvas & Action Toolbar (Sticky on Desktop) */}
      <div className="space-y-3 lg:sticky lg:top-28">
        <div
          className="relative overflow-hidden rounded-3xl border border-border/80 bg-muted/60 shadow-lg min-h-[420px] flex items-center justify-center cursor-crosshair select-none"
          onPointerMove={handleCanvasPointerMove}
          onPointerLeave={handleCanvasPointerLeave}
        >
          <video ref={videoRef} className="hidden" playsInline muted aria-hidden />
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Makeup preview"
            className={`mx-auto block max-h-[65vh] w-auto max-w-full rounded-2xl ${source === 'none' ? 'hidden' : ''} ${source === 'live' ? '-scale-x-100' : ''}`}
          />

          {/* Floating Zoom Loupe over Uploaded Face Canvas */}
          {zoomEnabled && zoomPos && source !== 'none' && (
            <div
              className="pointer-events-none absolute z-30 w-36 h-36 rounded-full border-2 border-[#C83E68] shadow-2xl ring-4 ring-black/20 overflow-hidden -translate-x-1/2 -translate-y-1/2 bg-background flex items-center justify-center animate-in fade-in zoom-in-75 duration-75"
              style={{
                left: `${zoomPos.x}px`,
                top: `${zoomPos.y}px`,
              }}
            >
              <canvas
                ref={loupeRef}
                className="w-full h-full rounded-full object-cover"
                width={140}
                height={140}
              />
              {/* Target crosshair and 2.5x badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3 h-3 rounded-full border border-white/90 shadow-xs" />
                <div className="absolute w-full h-[1px] bg-white/25" />
                <div className="absolute h-full w-[1px] bg-white/25" />
              </div>
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/75 text-[9px] font-bold text-white tracking-wider">
                2.5x ZOOM
              </div>
            </div>
          )}

          {/* Flash Shutter Animation */}
          {flash && <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-300 pointer-events-none" />}

          {source === 'none' && (
            <div className="flex min-h-[380px] flex-col items-center justify-center gap-6 p-6 sm:p-8 text-center bg-card/60 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-primary shadow-sm">
                <Sparkles className="w-7 h-7 text-[#C83E68]" />
              </div>

              <div className="max-w-md">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Try Luxury Makeup on Your Face
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Upload a photo, turn on your camera, or instantly test on one of our Indian demo models below.
                </p>
              </div>

              {/* Main Upload / Camera Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Button size="lg" onClick={() => fileRef.current?.click()} className="shadow-md">
                  <Upload className="mr-2 h-4 w-4" />Upload Photo
                </Button>
                <Button size="lg" variant="outline" onClick={goLive} className="border-primary/30 hover:border-primary">
                  <Camera className="mr-2 h-4 w-4" />Use Live Camera
                </Button>
              </div>

              {/* 1-Tap Demo Models Section */}
              <div className="w-full max-w-sm pt-4 border-t border-border/60">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Or Try Instantly on Demo Models
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {DEMO_MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => loadDemoModel(m.src)}
                      className="group flex flex-col items-center p-2 rounded-2xl border border-border/70 bg-card/80 hover:border-primary/50 hover:shadow-md transition-all text-center"
                    >
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/30 group-hover:scale-105 group-hover:border-primary transition-all shadow-sm">
                        <img src={m.src} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-xs text-foreground mt-2">{m.name}</span>
                      <span className="text-[9.5px] text-muted-foreground">{m.tone}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {busy && (
            <div role="status" className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-xs text-sm">
              <Loader2 className="h-8 w-8 animate-spin text-[#C83E68]" />
              <p className="font-medium text-foreground">{status === 'loading-model' ? 'Loading AI face model…' : 'Detecting facial contours…'}</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload a photo" onChange={(e) => onFile(e.target.files?.[0])} />

        {/* Quick Demo Models Switcher strip so user can switch face anytime */}
        {source !== 'none' && (
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-card border border-border/70 shadow-xs">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Try on Model:
            </span>
            <div className="flex items-center gap-2">
              {DEMO_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => loadDemoModel(m.src)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/80 hover:border-primary/50 text-xs font-semibold bg-muted/40 hover:bg-muted transition-all"
                >
                  <img src={m.src} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div aria-live="polite" className="space-y-2">
          {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Notice</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          {cam.message && source === 'none' && <Alert><AlertTriangle className="h-4 w-4" /><AlertTitle>Camera</AlertTitle><AlertDescription>{cam.message}</AlertDescription></Alert>}
          {status === 'no-face' && <Alert><AlertTriangle className="h-4 w-4" /><AlertTitle>No face detected</AlertTitle><AlertDescription>Please choose a well-lit photo where your face is clearly visible.</AlertDescription></Alert>}
          {hairState === 'failed' && <Alert><AlertDescription>Hair color preview isn’t available for this angle.</AlertDescription></Alert>}
        </div>

        {/* Quick Toolbar (Undo, Redo, Compare, Zoom Toggle, New Photo) */}
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-card border border-border/70 shadow-xs">
          {source === 'live' && (
            <Button onClick={capture} disabled={cam.status !== 'active' || busy} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Camera className="mr-2 h-4 w-4" />Capture Photo
            </Button>
          )}
          {source !== 'none' && (
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-1.5 h-3.5 w-3.5" />New Photo
            </Button>
          )}
          <Button
            variant={zoomEnabled ? 'default' : 'outline'}
            size="sm"
            disabled={source === 'none'}
            onClick={() => setZoomEnabled(!zoomEnabled)}
            className={cn(
              'text-xs font-semibold',
              zoomEnabled && source !== 'none' ? 'bg-[#C83E68] text-white hover:bg-[#a63054]' : ''
            )}
            title="Hover photo to zoom in 2.5x on face features"
          >
            <ZoomIn className="mr-1.5 h-3.5 w-3.5" />
            {zoomEnabled && source !== 'none' ? 'Zoom: ON' : 'Zoom: OFF'}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Undo" onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Redo" onClick={redo} disabled={!canRedo}>
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={source === 'none'}
            aria-label="Hold to compare with original"
            onPointerDown={() => setShowOriginal(true)}
            onPointerUp={() => setShowOriginal(false)}
            onPointerLeave={() => setShowOriginal(false)}
            onPointerCancel={() => setShowOriginal(false)}
            onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setShowOriginal(true)}
            onKeyUp={() => setShowOriginal(false)}
            onBlur={() => setShowOriginal(false)}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />Hold: Original
          </Button>
          {source !== 'none' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto text-muted-foreground hover:text-destructive" onClick={discard} title="Discard session">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Export / Download Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="export-size">Quality:</label>
            <select
              id="export-size"
              value={sizeId}
              onChange={(e) => setSizeId(e.target.value)}
              className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs"
            >
              {SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <Button
            size="sm"
            onClick={download}
            disabled={source !== 'photo' || exporting || busy}
            className="bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-sm"
          >
            {exporting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />}
            Save Portrait
          </Button>
        </div>
      </div>

      {/* Right: Luxury Makeup Products & Shade Boutique */}
      <aside aria-label="Makeup controls" className="w-full">
        <MakeupPanels
          faceReady={faceReady}
          hairDisabledReason={source === 'live' ? 'Hair colour works on photos only. Capture a frame first.' : undefined}
        />
      </aside>
    </div>
  );
}
