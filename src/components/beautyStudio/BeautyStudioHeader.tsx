import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, RotateCcw, Download, Eye, EyeOff, ShieldCheck,
  ChevronLeft, Camera, Box, HelpCircle
} from 'lucide-react';
import { StudioMode } from '@/types/beautyStudio';
import { BrandLogo } from '@/components/common/BrandLogo';

interface BeautyStudioHeaderProps {
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  onUndo: () => void;
  canUndo: boolean;
  onReset: () => void;
  onExport: () => void;
  isComparing: boolean;
  onCompareStart: () => void;
  onCompareEnd: () => void;
  onOpenPrivacy: () => void;
  onOpenCapture: () => void;
  is3dReady: boolean;
}

export function BeautyStudioHeader({
  mode,
  onModeChange,
  onUndo,
  canUndo,
  onReset,
  onExport,
  isComparing,
  onCompareStart,
  onCompareEnd,
  onOpenPrivacy,
  onOpenCapture,
  is3dReady,
}: BeautyStudioHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border/80 bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0 transition-colors">
      {/* Left: Back button & Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl border border-border/70 hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          title="Return to Salon Website"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <BrandLogo />
        </div>

        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-border/60">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 animate-pulse" />
            Virtual Beauty Studio
          </span>
        </div>
      </div>

      {/* Center: Mode Switcher (Quick Makeup vs 3D Studio) */}
      <div className="flex items-center bg-secondary/80 p-1 rounded-2xl border border-border/70 shadow-inner">
        <button
          onClick={() => onModeChange('quick-makeup')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            mode === 'quick-makeup'
              ? 'bg-card text-foreground shadow-sm border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-rose-500" />
          <span>Quick Makeup</span>
        </button>

        <button
          onClick={() => onModeChange('3d-studio')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
            mode === '3d-studio'
              ? 'bg-card text-foreground shadow-sm border border-border/60'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-emerald-500" />
          <span>3D Beauty Studio</span>
          {is3dReady && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute top-1 right-1" />
          )}
        </button>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Hold to Compare Original */}
        <button
          onMouseDown={onCompareStart}
          onMouseUp={onCompareEnd}
          onTouchStart={onCompareStart}
          onTouchEnd={onCompareEnd}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all select-none ${
            isComparing
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border/80 hover:bg-secondary/70 text-foreground'
          }`}
          title="Hold to see original unedited photo"
        >
          {isComparing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isComparing ? 'Original' : 'Compare'}</span>
        </button>

        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-9 h-9 rounded-xl border border-border/70 hover:bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Undo last change"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="hidden sm:flex px-2.5 py-1.5 rounded-xl border border-border/70 hover:bg-secondary/70 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
        >
          Reset
        </button>

        {/* Privacy modal trigger */}
        <button
          onClick={onOpenPrivacy}
          className="w-9 h-9 rounded-xl border border-border/70 hover:bg-secondary/70 flex items-center justify-center text-muted-foreground hover:text-emerald-500 transition-all"
          title="Privacy & Biometric Data Security"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Export PNG */}
        <button
          onClick={onExport}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
}
