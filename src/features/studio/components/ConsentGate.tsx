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
        <li>• Your photo or camera image is processed <strong className="text-foreground">on your device</strong>. It is not uploaded to our servers{mode === '3d' ? ' in this version' : ''}.</li>
        <li>• Nothing is saved after you close or discard the session. Your downloaded image stays on your device.</li>
        <li>• The camera starts only when you press the camera button, and stops when you finish or discard.</li>
        <li>• Face-detection models run in your browser and are loaded from this website, not a third party.</li>
        {mode === '3d' && <li>• If real 3D reconstruction is enabled in future, you’ll be told <em>before</em> any upload, and asked again.</li>}
      </ul>
      <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
        <Checkbox checked={ok} onCheckedChange={(v) => setOk(v === true)} aria-label="I consent" className="mt-0.5" />
        <span>I agree to use my camera / photo for this on-device virtual makeup experience.</span>
      </label>
      <Button className="mt-4 w-full" disabled={!ok} onClick={onAccept}>Continue</Button>
    </section>
  );
}
