import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Camera, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConsentGate } from '@/features/studio/components/ConsentGate';
import { QuickMakeup } from '@/features/studio/components/QuickMakeup';
import { GuidedScan } from '@/features/studio/components/GuidedScan';
import BlindGlowTryOn from '@/features/studio/components/BlindGlowTryOn';

type Mode = 'quick' | '3d';

export function VirtualStudio() {
  const [mode, setMode] = useState<Mode>('quick');
  const [consent, setConsent] = useState(true); // Privacy-safe on-device processing
  const [handoff, setHandoff] = useState<ImageBitmap | null>(null);

  const scrollToStudio = () => {
    const el = document.getElementById('live-studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* 1. Animated BlindGlow AI Try-On Showcase (Shows First) */}
      <BlindGlowTryOn
        ctaLabel="Launch Live Makeup Studio"
        ctaHref="#live-studio"
        onLaunchStudio={scrollToStudio}
      />

      {/* 2. Interactive Live Studio Section */}
      <main id="live-studio" className="min-h-screen bg-background pb-16 pt-16 transition-colors duration-300 border-t border-border/60 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <header className="mx-auto mb-8 max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[#C83E68] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Augmented Beauty Technology</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              BlindGlow AI <span className="text-[#C83E68]">Live Studio</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Preview couture makeup looks on your own face — privately, in real-time on your device.
            </p>
          </header>

          {/* Studio Mode Selector Pills */}
          <div
            role="tablist"
            aria-label="Studio mode"
            className="mx-auto mb-8 flex max-w-md gap-1 rounded-full bg-muted/80 p-1.5 border border-border/70 shadow-xs"
          >
            {([
              ['quick', 'Quick Makeup', 'Live', Camera],
              ['3d', '3D Beauty Studio', '5-View Scan', Box],
            ] as const).map(([id, label, tag, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={mode === id}
                type="button"
                onClick={() => setMode(id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  mode === id
                    ? 'bg-background text-primary shadow-sm scale-102 border border-border/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <Badge
                  variant={id === 'quick' ? 'default' : 'outline'}
                  className="text-[9.5px] py-0 px-1.5"
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>

          {!consent ? (
            <ConsentGate mode={mode} onAccept={() => setConsent(true)} />
          ) : mode === 'quick' ? (
            <QuickMakeup initialBitmap={handoff} onDiscarded={() => setHandoff(null)} />
          ) : (
            <GuidedScan onUseFront={(b) => { setHandoff(b); setMode('quick'); }} />
          )}
        </div>
      </main>
    </div>
  );
}

export default VirtualStudio;
