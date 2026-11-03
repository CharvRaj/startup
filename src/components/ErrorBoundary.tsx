import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Sparkles, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF9F3] text-[#342A29] flex items-center justify-center p-6 antialiased font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#F5DCE1] shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl mx-auto bg-gradient-to-tr from-[#FDF0F4] to-[#FFF3DC] border border-[#F5DCE1] flex items-center justify-center text-[#C83E68] shadow-sm">
              <Sparkles className="w-8 h-8 text-[#C83E68]" />
            </div>
            <div>
              <h2 className="font-serif italic text-2xl font-bold text-[#342A29]">
                Something went slightly off
              </h2>
              <p className="text-xs text-[#542337]/70 mt-1.5 leading-relaxed">
                We encountered a small hiccup loading this screen. Tap below to reload or return home safely.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-left text-[11px] text-rose-800 font-mono break-all max-h-24 overflow-y-auto">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="space-y-2.5 pt-2">
              <Button
                onClick={this.handleReload}
                className="w-full h-11 rounded-2xl bg-[#C83E68] hover:bg-[#A82E52] text-white font-bold text-xs gap-2 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="w-full h-11 rounded-2xl border-[#F5DCE1] text-[#342A29] font-semibold text-xs hover:bg-[#FDF0F4] gap-2"
              >
                <Home className="w-4 h-4 text-[#C83E68]" />
                Return to Storefront
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

