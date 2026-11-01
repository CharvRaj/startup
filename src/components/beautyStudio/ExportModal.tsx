import React, { useState, useEffect } from 'react';
import { Download, X, Check, Sparkles, Image as ImageIcon, ShieldCheck, Palette } from 'lucide-react';
import { MakeupState } from '../../types/beautyStudio';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasSource: HTMLCanvasElement | null;
  threeSnapshotUrl?: string | null;
  mode: 'quick' | '3d';
  makeupState: MakeupState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasSource,
  threeSnapshotUrl,
  mode,
  makeupState,
}) => {
  const [resolution, setResolution] = useState<'standard' | 'high'>('high');
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate preview image
  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
      setDownloadSuccess(false);
      return;
    }

    if (mode === '3d' && threeSnapshotUrl) {
      setPreviewUrl(threeSnapshotUrl);
    } else if (canvasSource) {
      try {
        const dataUrl = canvasSource.toDataURL('image/png');
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.warn("Failed to generate preview from canvas:", err);
      }
    }
  }, [isOpen, canvasSource, threeSnapshotUrl, mode]);

  const handleDownload = () => {
    setIsExporting(true);
    try {
      let finalDataUrl = previewUrl;

      // If watermark requested, render onto offscreen canvas
      if (includeWatermark && previewUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const offscreen = document.createElement('canvas');
          offscreen.width = img.naturalWidth || 1200;
          offscreen.height = img.naturalHeight || 1200;
          const ctx = offscreen.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);

            // Add elegant luxury salon watermark at bottom-right
            ctx.save();
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            const fontSize = Math.max(16, Math.round(offscreen.width * 0.024));
            ctx.font = `italic ${fontSize}px "Playfair Display", serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 6;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillText("Satguru Beauty Studio", offscreen.width - 24, offscreen.height - 20);
            ctx.restore();

            triggerDownload(offscreen.toDataURL('image/png'));
          } else {
            triggerDownload(previewUrl);
          }
        };
        img.src = previewUrl;
        return;
      }

      if (finalDataUrl) {
        triggerDownload(finalDataUrl);
      }
    } catch (e) {
      console.error("Export download failed:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const triggerDownload = (dataUrl: string) => {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.download = `Satguru-Beauty-Studio-${mode}-${timestamp}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-neutral-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100/60 dark:border-neutral-800">
          <div>
            <h3 className="text-lg font-serif font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-rose-500" />
              Export Studio Look
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Download your personalized virtual beauty portrait in full resolution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Image Preview Box */}
          <div className="relative aspect-square max-h-64 w-full mx-auto bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-inner">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Export preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-neutral-400 text-xs flex items-center gap-2">
                <ImageIcon className="w-4 h-4 animate-pulse" />
                Preparing image preview...
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white">
              {mode === '3d' ? '3D Render Snapshot' : 'High-Res Photo Canvas'}
            </div>
          </div>

          {/* Applied Look Breakdown */}
          <div className="p-3.5 bg-rose-50/50 dark:bg-neutral-800/50 rounded-2xl border border-rose-100/70 dark:border-neutral-700/60 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              Applied Beauty Formula
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-300">
              {makeupState.lips.enabled && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: makeupState.lips.color }} />
                  <span className="truncate">Lips: {makeupState.lips.finish} ({Math.round(makeupState.lips.intensity * 100)}%)</span>
                </div>
              )}
              {makeupState.eyes.shadowEnabled && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: makeupState.eyes.shadowColor }} />
                  <span className="truncate">Eyeshadow: {makeupState.eyes.shadowStyle}</span>
                </div>
              )}
              {makeupState.face.blushEnabled && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: makeupState.face.blushColor }} />
                  <span className="truncate">Blush: {makeupState.face.blushPlacement}</span>
                </div>
              )}
              {makeupState.hair.enabled && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: makeupState.hair.color }} />
                  <span className="truncate">Hair: {makeupState.hair.color}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resolution Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
              Resolution Quality
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResolution('standard')}
                className={`p-3 rounded-2xl border text-left transition ${
                  resolution === 'standard'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="text-xs font-semibold">Standard HD</div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  1080p — Quick sharing & web
                </div>
              </button>

              <button
                type="button"
                onClick={() => setResolution('high')}
                className={`p-3 rounded-2xl border text-left transition ${
                  resolution === 'high'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
              >
                <div className="text-xs font-semibold flex items-center gap-1">
                  Studio 2K
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-normal">Crisp</span>
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  2048px — Ultra fidelity & print
                </div>
              </button>
            </div>
          </div>

          {/* Watermark checkbox */}
          <label className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={includeWatermark}
              onChange={(e) => setIncludeWatermark(e.target.checked)}
              className="rounded text-rose-500 focus:ring-rose-400 w-4 h-4 border-neutral-300"
            />
            <span>Include discrete luxury salon watermark</span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900 border-t border-rose-100/60 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>No account required • Instant PNG download</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!previewUrl || isExporting}
              onClick={handleDownload}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-500/25 disabled:opacity-50 transition flex items-center gap-2"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Saved to Downloads!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download PNG
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
