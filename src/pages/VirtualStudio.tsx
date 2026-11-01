import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ConsentGate } from '@/features/studio/components/ConsentGate';
import { QuickMakeup } from '@/features/studio/components/QuickMakeup';
import { GuidedScan } from '@/features/studio/components/GuidedScan';

type Mode = 'quick' | '3d';

export function VirtualStudio() {
  const [mode, setMode] = useState<Mode>('quick');
  const [consent, setConsent] = useState(false); // session-only; never persisted
  const [handoff, setHandoff] = useState<ImageBitmap | null>(null);

  return (
    <main className="min-h-screen bg-background pb-16 pt-24">
      <div className="container mx-auto px-4">
        <header className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="font-display text-3xl md:text-4xl text-gray-900 font-bold">
            BlindGlow AI <span className="text-[#C83E68]">Virtual Studio</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Preview couture makeup looks on your own face — privately, in real-time on your device.
          </p>
        </header>

        <div role="tablist" aria-label="Studio mode" className="mx-auto mb-6 flex max-w-md gap-1 rounded-full bg-muted p-1">
          {([['quick', 'Quick Makeup', 'Live'], ['3d', '3D Beauty Studio', 'Beta']] as const).map(([id, label, tag]) => (
            <button key={id} role="tab" aria-selected={mode === id} type="button" onClick={() => setMode(id)}
              className={cn('flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary', mode === id ? 'bg-background text-primary shadow' : 'text-muted-foreground')}>
              {label}<Badge variant={id === 'quick' ? 'default' : 'outline'} className="text-[10px]">{tag}</Badge>
            </button>
          ))}
        </div>

        {!consent ? <ConsentGate mode={mode} onAccept={() => setConsent(true)} />
          : mode === 'quick' ? <QuickMakeup initialBitmap={handoff} onDiscarded={() => setHandoff(null)} />
          : <GuidedScan onUseFront={(b) => { setHandoff(b); setMode('quick'); }} />}
      </div>
    </main>
  );
}
