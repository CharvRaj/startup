import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export function ConsentGate({ mode, onAccept }: { mode: 'quick' | '3d'; onAccept: () => void }) {
  const [ok, setOk] = useState(false);
  return (
    <section aria-labelledby="consent-title" className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-primary"><ShieldCheck className="h-5 w-5" aria-hidden /><h2 id="consent-title" className="font-display text-xl">Your privacy first</h2></div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li>• Your photo or camera image is processed <strong className="text-foreground">100% on your device</strong>. It is never uploaded or shared.</li>
        <li>• Nothing is stored once you exit or discard the session. Your downloaded portraits remain solely on your device.</li>
        <li>• The camera starts only when you tap Start Camera, and stops immediately when you pause or discard.</li>
        <li>• Real-time 3D facial mesh modeling and WebGL physics run entirely in your local browser for maximum privacy and speed.</li>
      </ul>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
        <Checkbox checked={ok} onCheckedChange={(v) => setOk(v === true)} aria-label="I consent" className="mt-0.5" />
        <span>I agree to use my camera / photo for this on-device virtual makeup experience.</span>
      </label>
      <Button className="mt-4 w-full" disabled={!ok} onClick={onAccept}>Continue</Button>
    </section>
  );
}
