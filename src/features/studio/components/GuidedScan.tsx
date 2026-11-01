import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, CheckCircle2, Info, Loader2, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useCamera } from '../hooks/useCamera';
import { detectStill, detectVideoFrame, getFaceLandmarker } from '../lib/landmarker';
import { assessFrame, sampleGray, type Assessment, type ScanRole } from '../lib/quality';
import { hasFullMesh } from '../lib/regions';
import { loadValidatedBitmap } from '../lib/validate';
import { UnavailableProvider, createReconRunner, type ReconOutcome } from '../recon/provider';

const STEPS: { role: ScanRole; title: string; hint: string }[] = [
  { role: 'front', title: 'Front', hint: 'Look straight at the camera with a relaxed, neutral face.' },
  { role: 'left', title: 'Turn left', hint: 'Slowly turn your head slightly to YOUR left (about a quarter turn).' },
  { role: 'right', title: 'Turn right', hint: 'Slowly turn your head slightly to YOUR right (about a quarter turn).' },
  { role: 'left-profile', title: 'Left profile', hint: 'Turn fully to YOUR left so the camera sees the side of your face.' },
  { role: 'right-profile', title: 'Right profile', hint: 'Turn fully to YOUR right so the camera sees the side of your face.' },
];
const order = (r: ScanRole) => STEPS.findIndex((s) => s.role === r);

interface Frame { role: ScanRole; bitmap: ImageBitmap; thumb: string; a: Assessment }
type Phase = 'intro' | 'scan' | 'review' | 'processing' | 'result';
const recon = createReconRunner(UnavailableProvider);

export function GuidedScan({ onUseFront }: { onUseFront: (b: ImageBitmap) => void }) {
  const { videoRef, state: cam, start, stop } = useCamera();
  const fileRef = useRef<HTMLInputElement>(null);
  const framesRef = useRef<Frame[]>([]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);
  const [retakeOnly, setRetakeOnly] = useState(false);
  const [live, setLive] = useState<Assessment | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [modelBusy, setModelBusy] = useState(false);
  const [outcome, setOutcome] = useState<ReconOutcome | null>(null);
  const [progress, setProgress] = useState({ f: 0, m: '' });
  const role = STEPS[step].role;
  const roleRef = useRef(role); roleRef.current = role;

  const sync = (f: Frame[]) => { framesRef.current = f; setFrames(f); };
  const baselinePitch = (r: ScanRole) => (r === 'front' ? null : framesRef.current.find((f) => f.role === 'front')?.a.metrics.pitch ?? null);
  const sigs = (except: ScanRole) => framesRef.current.filter((f) => f.role !== except).map((f) => f.a.signature);
  const freeFrame = (f: Frame) => { f.bitmap.close(); URL.revokeObjectURL(f.thumb); };

  const begin = async () => {
    setErr(null); setModelBusy(true);
    try { await getFaceLandmarker(); } catch { setErr('The face-detection model couldn’t be loaded. Check that the model files are installed (see README).'); setModelBusy(false); return; }
    setModelBusy(false);
    if (await start('user')) { setPhase('scan'); setStep(0); }
  };

  /* live quality loop (~8 fps) */
  useEffect(() => {
    if (phase !== 'scan' || cam.status !== 'active') return;
    let stopped = false, busy = false, t = 0;
    const tick = async (now: number) => {
      if (stopped) return;
      const v = videoRef.current;
      if (v && v.readyState >= 2 && now - t > 120 && !busy) {
        busy = true; t = now;
        try {
          const r = roleRef.current;
          const lm = await detectVideoFrame(v, now); const m = hasFullMesh(lm) ? lm : null;
          const { gray, gw, gh } = sampleGray(v, v.videoWidth, v.videoHeight, m);
          setLive(assessFrame({ role: r, landmarks: m, gray, gw, gh, baselinePitch: baselinePitch(r), otherSignatures: sigs(r) }));
        } catch { /* skip */ } finally { busy = false; }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { stopped = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, cam.status]);

  const store = async (bitmap: ImageBitmap, a: Assessment, r: ScanRole) => {
    const c = document.createElement('canvas'); const s = 220 / Math.max(bitmap.width, bitmap.height);
    c.width = Math.round(bitmap.width * s); c.height = Math.round(bitmap.height * s);
    c.getContext('2d')!.drawImage(bitmap, 0, 0, c.width, c.height);
    const blob: Blob = await new Promise((res) => c.toBlob((b) => res(b!), 'image/jpeg', 0.8)); c.width = c.height = 0;
    const old = framesRef.current.find((x) => x.role === r); if (old) freeFrame(old);
    sync([...framesRef.current.filter((x) => x.role !== r), { role: r, bitmap, thumb: URL.createObjectURL(blob), a }].sort((x, y) => order(x.role) - order(y.role)));
  };

  const advance = () => {
    setLive(null);
    if (retakeOnly) { setRetakeOnly(false); stop(); setPhase('review'); return; }
    if (step < STEPS.length - 1) setStep(step + 1); else { stop(); setPhase('review'); }
  };

  const capture = async () => {
    const v = videoRef.current; if (!v || !live?.ok) return; // progress only advances on a usable frame
    const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d')!.drawImage(v, 0, 0);
    const bmp = await createImageBitmap(c); c.width = c.height = 0;
    await store(bmp, live, role); advance();
  };

  const fromFile = async (file?: File | null) => {
    if (!file) return; setErr(null);
    const r = await loadValidatedBitmap(file); if (fileRef.current) fileRef.current.value = '';
    if (r.ok === false) { setErr(r.message); return; }
    try {
      const lm = await detectStill(r.bitmap); const m = hasFullMesh(lm) ? lm : null;
      const { gray, gw, gh } = sampleGray(r.bitmap, r.bitmap.width, r.bitmap.height, m);
      const a = assessFrame({ role, landmarks: m, gray, gw, gh, baselinePitch: baselinePitch(role), otherSignatures: sigs(role) });
      if (!a.ok) { r.bitmap.close(); setErr(a.issues.filter((i) => i.severity === 'error').map((i) => i.message).join(' ')); return; }
      await store(r.bitmap, a, role); advance();
    } catch { r.bitmap.close(); setErr('That photo couldn’t be analysed. Try another.'); }
  };

  const retake = async (r: ScanRole) => { setStep(order(r)); setRetakeOnly(true); setPhase('scan'); setLive(null); await start('user'); };

  const generate = async () => {
    setPhase('processing'); setOutcome(null); setProgress({ f: 0, m: 'Starting…' });
    const out = await recon.run(frames.map((f) => ({ role: f.role, bitmap: f.bitmap, yawDeg: f.a.metrics.yaw })), (f, m) => setProgress({ f, m }));
    setOutcome(out); setPhase('result');
  };

  const discard = useCallback(() => {
    recon.cancel(); stop(); framesRef.current.forEach(freeFrame); sync([]);
    setPhase('intro'); setStep(0); setLive(null); setOutcome(null); setErr(null); setRetakeOnly(false);
  }, [stop]);
  useEffect(() => () => { recon.cancel(); framesRef.current.forEach(freeFrame); }, []);

  const handoff = async () => {
    const f = frames.find((x) => x.role === 'front'); if (!f) return;
    const copy = await createImageBitmap(f.bitmap); discard(); onUseFront(copy);
  };

  const complete = STEPS.every((s) => frames.some((f) => f.role === s.role));
  const blocking = live?.issues.filter((i) => i.severity === 'error') ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Alert><Info className="h-4 w-4" /><AlertTitle>Beta · 3D reconstruction is not enabled yet</AlertTitle>
        <AlertDescription>You can practise the guided scan now. A real 3D model is only shown once a licensed reconstruction model passes testing — until then no 3D face is created or faked. An ordinary camera sees only the surfaces facing it, so hidden areas (under the chin, behind the ears) can’t be captured directly.</AlertDescription></Alert>

      {phase !== 'intro' && <Progress value={phase === 'scan' ? (frames.length / STEPS.length) * 100 : 100} aria-label="Scan progress" />}
      <div aria-live="polite" className="sr-only">{phase === 'scan' ? `Step ${step + 1} of ${STEPS.length}: ${STEPS[step].title}` : ''}</div>
      {err && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{err}</AlertDescription></Alert>}
      {cam.message && <Alert><AlertTriangle className="h-4 w-4" /><AlertTitle>Camera unavailable</AlertTitle><AlertDescription>{cam.message}</AlertDescription></Alert>}

      {phase === 'intro' && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <h2 className="font-display text-2xl">Guided face scan</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Five quick views: front, slight left, slight right, and both profiles. Use soft, even light, tie hair back, and keep a neutral expression.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button onClick={begin} disabled={modelBusy}>{modelBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}Start camera scan</Button>
            <Button variant="outline" disabled={modelBusy} onClick={async () => { setErr(null); try { await getFaceLandmarker(); setPhase('scan'); setStep(0); } catch { setErr('The face-detection model couldn’t be loaded. Check that the model files are installed (see README).'); } }}><Upload className="mr-2 h-4 w-4" />Use photos instead</Button>
          </div>
        </div>
      )}

      {phase === 'scan' && (
        <div className="space-y-3">
          <div className="text-center"><Badge variant="secondary">Step {step + 1} of {STEPS.length}</Badge><h2 className="mt-2 font-display text-2xl">{STEPS[step].title}</h2><p className="text-sm text-muted-foreground">{STEPS[step].hint}</p></div>
          <div className={`relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-2xl bg-black ${cam.status === 'active' ? '' : 'hidden'}`}>
            <video ref={videoRef} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
            <svg viewBox="0 0 100 133" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden><ellipse cx="50" cy="62" rx="27" ry="37" fill="none" strokeWidth="1.2" strokeDasharray="3 2" stroke={live?.ok ? '#4ade80' : '#ffffffcc'} /></svg>
          </div>
          <ul aria-live="polite" className="mx-auto max-w-sm space-y-1 text-center text-sm">
            {cam.status === 'active' && blocking.slice(0, 2).map((i) => <li key={i.code} className="text-amber-700 dark:text-amber-400">{i.message}</li>)}
            {cam.status === 'active' && live?.ok && <li className="flex items-center justify-center gap-1 text-green-700 dark:text-green-400"><CheckCircle2 className="h-4 w-4" />Good — hold still and capture.</li>}
            {cam.status === 'active' && live?.issues.filter((i) => i.severity === 'warn').map((i) => <li key={i.code} className="text-xs text-muted-foreground">{i.message}</li>)}
          </ul>
          <div className="flex flex-wrap justify-center gap-3">
            {cam.status === 'active' && <Button size="lg" onClick={capture} disabled={!live?.ok}><Camera className="mr-2 h-4 w-4" />Capture</Button>}
            <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload photo for this view</Button>
            <Button variant="ghost" onClick={discard}>Cancel</Button>
          </div>
          {frames.length > 0 && !retakeOnly && <Button variant="link" className="mx-auto block" onClick={() => { stop(); setPhase('review'); }}>Skip to review ({frames.length}/{STEPS.length} captured)</Button>}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload a photo for this scan step" onChange={(e) => fromFile(e.target.files?.[0])} />

      {phase === 'review' && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Review your views</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {STEPS.map((s) => { const f = frames.find((x) => x.role === s.role); return (
              <li key={s.role} className="rounded-xl border border-border bg-card p-2">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">{f ? <img src={f.thumb} alt={`${s.title} view`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Missing</div>}</div>
                <div className="mt-2 flex items-center justify-between text-xs"><span>{s.title}</span>{f?.a.issues.some((i) => i.code === 'unverified-pose') && <Badge variant="outline">Unverified</Badge>}</div>
                <Button size="sm" variant="outline" className="mt-2 w-full" onClick={() => retake(s.role)}><RotateCcw className="mr-1 h-3 w-3" />{f ? 'Retake' : 'Capture'}</Button>
              </li>); })}
          </ul>
          <div className="flex flex-wrap gap-3">
            <Button onClick={generate} disabled={!complete}>Generate 3D face</Button>
            <Button variant="outline" onClick={handoff} disabled={!frames.some((f) => f.role === 'front')}>Try makeup on my front photo</Button>
            <Button variant="ghost" onClick={discard}>Discard session</Button>
          </div>
          {!complete && <p className="text-xs text-muted-foreground">Capture all five views to enable 3D generation.</p>}
        </div>
      )}

      {phase === 'processing' && (
        <div role="status" className="space-y-3 rounded-2xl border border-border bg-card p-6 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /><p>{progress.m || 'Processing…'}</p><Progress value={progress.f * 100} /><Button variant="outline" onClick={() => recon.cancel()}>Cancel</Button></div>
      )}

      {phase === 'result' && outcome && (
        <div className="space-y-4">
          {outcome.status === 'success'
            ? <Alert><CheckCircle2 className="h-4 w-4" /><AlertTitle>3D face data verified</AlertTitle><AlertDescription>Mesh, UVs and texture passed verification. The interactive viewer arrives in Phase D.</AlertDescription></Alert>
            : <Alert variant={outcome.status === 'failed' ? 'destructive' : 'default'}><AlertTriangle className="h-4 w-4" /><AlertTitle>{outcome.status === 'unavailable' ? '3D reconstruction unavailable' : 'Reconstruction failed'}</AlertTitle><AlertDescription>{outcome.status === 'unavailable' ? outcome.reason : outcome.error} No 3D model was created, and your photos were not uploaded anywhere.</AlertDescription></Alert>}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setPhase('review')}>Back to my views</Button>
            <Button variant="outline" onClick={handoff}>Try makeup on my front photo</Button>
            <Button variant="ghost" onClick={discard}>Start a new scan</Button>
          </div>
        </div>
      )}
    </div>
  );
}
