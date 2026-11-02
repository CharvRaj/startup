import { useState, Component, ErrorInfo, ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Box, Camera, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConsentGate } from '@/features/studio/components/ConsentGate';
import { QuickMakeup } from '@/features/studio/components/QuickMakeup';
import { ThreeDStudio } from '@/features/studio/components/ThreeDStudio';

type Mode = 'quick' | '3d';

interface StudioBoundaryProps {
  children: ReactNode;
  onFallbackToQuick: () => void;
}

interface StudioBoundaryState {
  hasError: boolean;
  error?: Error;
}

class StudioErrorBoundary extends Component<StudioBoundaryProps, StudioBoundaryState> {
  state: StudioBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): StudioBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('3D Studio encountered an error, offering fallback:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-3xl p-8 border border-amber-500/30 bg-card/90 backdrop-blur-md shadow-2xl text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl mx-auto bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-display text-2xl font-bold text-foreground">
            3D Studio Optimization
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your browser or device encountered an issue with WebGL 3D rendering. You can switch to Quick Makeup Live AR or try reloading 3D Studio.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onFallbackToQuick();
              }}
              className="bg-primary hover:bg-primary/90 text-white font-bold"
            >
              <Camera className="w-4 h-4 mr-2" />
              Switch to Quick Makeup Live AR
            </Button>
            <Button
              variant="outline"
              onClick={() => this.setState({ hasError: false })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry 3D Studio
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function VirtualStudio() {
  const [mode, setMode] = useState<Mode>('3d');
  const [consent, setConsent] = useState(true); // Instant access with on-device privacy
  const [handoff, setHandoff] = useState<ImageBitmap | null>(null);

  return (
    <main className="min-h-screen bg-background pb-16 pt-24 transition-colors duration-500">
      <div className="container mx-auto px-4 max-w-7xl">
        <header className="mx-auto mb-6 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Augmented Beauty Technology</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            BlindGlow AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600">Virtual Beauty Studio</span>
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Experience real-time couture makeup and volumetric 3D face sculpts — 100% private and computed live on your device.
          </p>
        </header>

        {/* Studio Mode Selector Pills */}
        <div role="tablist" aria-label="Studio mode" className="mx-auto mb-8 flex max-w-md gap-1.5 rounded-full bg-muted/80 p-1.5 border border-border/80 shadow-inner">
          {([
            ['3d', '3D Beauty Studio', 'Interactive 3D', Box],
            ['quick', 'Quick Makeup (Live AR)', 'Live Camera', Camera],
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
                  ? 'bg-background text-primary shadow-md scale-102 border border-border/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <Badge variant={id === '3d' ? 'default' : 'secondary'} className="text-[9.5px] py-0 px-1.5">
                {tag}
              </Badge>
            </button>
          ))}
        </div>

        {!consent ? (
          <ConsentGate mode={mode} onAccept={() => setConsent(true)} />
        ) : mode === '3d' ? (
          <StudioErrorBoundary onFallbackToQuick={() => setMode('quick')}>
            <ThreeDStudio onHandoffPhoto={(b) => { setHandoff(b); setMode('quick'); }} />
          </StudioErrorBoundary>
        ) : (
          <QuickMakeup initialBitmap={handoff} onDiscarded={() => setHandoff(null)} />
        )}
      </div>
    </main>
  );
}

export default VirtualStudio;
