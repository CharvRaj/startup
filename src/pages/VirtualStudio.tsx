import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Box, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConsentGate } from '@/features/studio/components/ConsentGate';
import { QuickMakeup } from '@/features/studio/components/QuickMakeup';
import { GuidedScan } from '@/features/studio/components/GuidedScan';
import BlindGlowTryOn from '@/features/studio/components/BlindGlowTryOn';
import { StudioMarqueeBanner } from '@/features/studio/components/StudioMarqueeBanner';

type Mode = 'quick' | '3d';

const TYPING_PHRASES = [
  'Live Studio',
  '3D Contour Scan',
  'Couture Lip & Eye Art',
  'Neural Shade Match',
  'Royal Bridal Glow',
  'Festive Radiance',
];

interface StudioErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}
interface StudioErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
class StudioErrorBoundary extends React.Component<StudioErrorBoundaryProps, StudioErrorBoundaryState> {
  state: StudioErrorBoundaryState = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    console.warn('Studio section caught an error:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center rounded-3xl bg-card border border-rose-500/20 shadow-sm max-w-xl mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-[#C83E68] flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">Interactive Studio Ready to Resume</h3>
          <p className="text-xs text-muted-foreground mt-1.5 mb-4">
            Tap below to reinitialize the camera and makeup shaders seamlessly.
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset?.();
            }}
            className="rounded-full bg-[#C83E68] hover:bg-[#a53255] text-white text-xs px-6 py-2"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reconnect Studio
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function VirtualStudio() {
  const [mode, setMode] = useState<Mode>('quick');
  const [consent, setConsent] = useState(true); // Privacy-safe on-device processing
  const [handoff, setHandoff] = useState<ImageBitmap | null>(null);

  // Dynamic Typing Machine Effect
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: any;
    const currentPhrase = TYPING_PHRASES[phraseIdx % TYPING_PHRASES.length] || TYPING_PHRASES[0];

    if (!isDeleting) {
      if (typedText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
        }, 85);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typedText.length > 0) {
        timer = setTimeout(() => {
          setTypedText(currentPhrase.slice(0, typedText.length - 1));
        }, 40);
      } else {
        setIsDeleting(false);
        setPhraseIdx((prev) => (prev + 1) % TYPING_PHRASES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, phraseIdx]);

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

      {/* 2. Text Moving from Right to Left with Animated BG & Design Cross Effects */}
      <StudioMarqueeBanner />

      {/* 3. Interactive Live Studio Section */}
      <main id="live-studio" className="min-h-screen bg-background pb-12 sm:pb-16 pt-8 sm:pt-12 transition-colors duration-300 scroll-mt-20">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <header className="relative mx-auto mb-6 sm:mb-10 max-w-3xl text-center px-1">
            {/* Ambient Glow Aura */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-40 sm:h-48 bg-gradient-to-tr from-rose-500/20 via-amber-500/15 to-purple-500/20 blur-3xl rounded-full pointer-events-none -z-10 animate-pulse" />

            {/* Shimmering Pill Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-rose-500/15 border border-rose-500/30 text-[#C83E68] text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest mb-3 sm:mb-4 shadow-xs backdrop-blur-sm">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>AI AUGMENTED BEAUTY TECHNOLOGY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-0.5" />
            </div>

            {/* Title with Smooth Dynamic Typing Effect */}
            <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground min-h-[2.5em] xs:min-h-[1.9em] sm:min-h-[1.3em]">
              BlindGlow AI{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C83E68] via-rose-500 to-amber-600 drop-shadow-xs">
                {typedText}
              </span>
              <span className="inline-block w-[3px] h-[0.85em] bg-[#C83E68] animate-pulse ml-1.5 align-middle shadow-[0_0_10px_#C83E68]" />
            </h1>

            {/* Subtitle */}
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto px-2">
              Preview couture makeup looks on your own face — privately, in real-time on your device.
            </p>

            {/* Feature trust chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mt-4 sm:mt-5 text-[10px] sm:text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-card/80 border border-border/80 shadow-xs">
                🔒 100% On-Device Privacy
              </span>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-card/80 border border-border/80 shadow-xs">
                ⚡ Zero-Lag Live AR
              </span>
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-card/80 border border-border/80 shadow-xs">
                🎨 Indian Skin Tone Calibrated
              </span>
            </div>
          </header>

          {/* Studio Mode Selector Pills */}
          <div
            role="tablist"
            aria-label="Studio mode"
            className="mx-auto mb-6 sm:mb-8 flex max-w-md gap-1 rounded-full bg-muted/80 p-1 sm:p-1.5 border border-border/70 shadow-xs"
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
                  'flex flex-1 items-center justify-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
                  mode === id
                    ? 'bg-background text-primary shadow-sm scale-102 border border-border/60'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                )}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">{label}</span>
                <Badge
                  variant={id === 'quick' ? 'default' : 'outline'}
                  className="text-[9px] sm:text-[9.5px] py-0 px-1 sm:px-1.5 hidden xs:inline-flex"
                >
                  {tag}
                </Badge>
              </button>
            ))}
          </div>

          <StudioErrorBoundary onReset={() => setHandoff(null)}>
            {!consent ? (
              <ConsentGate mode={mode} onAccept={() => setConsent(true)} />
            ) : mode === 'quick' ? (
              <QuickMakeup initialBitmap={handoff} onDiscarded={() => setHandoff(null)} />
            ) : (
              <GuidedScan onUseFront={(b) => { setHandoff(b); setMode('quick'); }} />
            )}
          </StudioErrorBoundary>
        </div>
      </main>
    </div>
  );
}

export default VirtualStudio;
