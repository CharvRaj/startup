import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight, Sparkles } from 'lucide-react';

interface ComparisonSliderProps {
  originalImage: string;
  editedCanvas: HTMLCanvasElement | null;
  className?: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalImage,
  editedCanvas,
  className = ""
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editedDataUrl, setEditedDataUrl] = useState<string | null>(null);

  // Sync canvas to image data URL whenever canvas updates
  useEffect(() => {
    if (editedCanvas) {
      try {
        setEditedDataUrl(editedCanvas.toDataURL('image/png'));
      } catch (e) {
        console.warn("Could not export canvas for comparison:", e);
      }
    }
  }, [editedCanvas]);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedPercentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(clampedPercentage);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden rounded-2xl bg-neutral-900 ${className}`}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Background Layer: Original Photo */}
      <img
        src={originalImage}
        alt="Original Face"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      
      {/* Original Label Badge */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-white tracking-wide border border-white/10 shadow-sm pointer-events-none">
        Original
      </div>

      {/* Foreground Layer: Edited Makeup Canvas (Clipped by slider position) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {editedDataUrl ? (
          <img
            src={editedDataUrl}
            alt="Virtual Makeup Result"
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
            Rendering Virtual Makeup...
          </div>
        )}

        {/* Edited Label Badge */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 backdrop-blur-md text-[11px] font-medium text-white tracking-wide shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Virtual Studio
        </div>
      </div>

      {/* Divider Curtain Line */}
      <div
        className="absolute top-0 bottom-0 z-30 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] cursor-ew-resize flex items-center justify-center"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Central Circular Knob */}
        <div className="w-8 h-8 rounded-full bg-white text-neutral-800 shadow-xl border border-neutral-200 flex items-center justify-center cursor-ew-resize active:scale-95 transition-transform">
          <ChevronsLeftRight className="w-4 h-4 text-rose-500" />
        </div>
      </div>
    </div>
  );
};
