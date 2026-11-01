import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Live Camera Capture",
  subtitle = "Align your face in the oval guide for accurate makeup mapping"
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setPermissionError(null);
    setCapturedImage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in this browser environment.");
      }

      let mediaStream: MediaStream | null = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false
          });
        } catch {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      let msg = "Could not access camera. Please allow camera permissions in your browser.";
      if (err.name === 'NotAllowedError') {
        msg = "Camera permission was denied. Please update browser site permissions to allow camera access.";
      } else if (err.name === 'NotFoundError') {
        msg = "No webcam device was found on this system.";
      }
      setPermissionError(msg);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setCountdown(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Snap photo logic
  const executeSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Un-mirror image on capture for realistic natural orientation or keep mirrored
    // For selfies, users prefer true natural selfie orientation:
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleStartCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          executeSnap();
          return null;
        }
        return prev - 1;
      });
    }, 900);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleAccept = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-neutral-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100/60 dark:border-neutral-800">
          <div>
            <h3 className="text-lg font-serif font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-rose-500" />
              {title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Video Area */}
        <div className="relative aspect-[4/3] w-full bg-neutral-950 flex items-center justify-center overflow-hidden">
          {flash && (
            <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-300 pointer-events-none" />
          )}

          {/* Loading */}
          {isInitializing && (
            <div className="flex flex-col items-center gap-3 text-white/80 z-20">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-400" />
              <p className="text-sm font-medium">Requesting camera access...</p>
            </div>
          )}

          {/* Error Message */}
          {permissionError && (
            <div className="flex flex-col items-center text-center p-6 text-white max-w-md z-20">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-rose-300 text-sm mb-1">Camera Unavailable</h4>
              <p className="text-xs text-neutral-300 mb-4">{permissionError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-medium hover:bg-rose-600 transition flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry Access
              </button>
            </div>
          )}

          {/* Live Video */}
          {!capturedImage && (
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          )}

          {/* Captured Preview */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured frame"
              className="w-full h-full object-cover"
            />
          )}

          {/* Face Oval Overlay Guide during live stream */}
          {!capturedImage && !permissionError && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[58%] h-[75%] rounded-[50%/55%] border-2 border-dashed border-rose-400/70 shadow-[0_0_20px_rgba(244,63,94,0.25)] relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-rose-400/60" />
                <span className="absolute -top-7 text-[11px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-black/60 text-rose-200 backdrop-blur-sm">
                  Position Face Here
                </span>
              </div>
            </div>
          )}

          {/* Countdown Indicator */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
              <div className="w-24 h-24 rounded-full bg-rose-500 text-white flex items-center justify-center text-5xl font-serif font-bold shadow-2xl animate-ping duration-700">
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/90 border-t border-rose-100/60 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Processed locally in your browser. Never uploaded without consent.</span>
          </div>

          <div className="flex items-center gap-3">
            {!capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!permissionError || isInitializing || countdown !== null}
                  onClick={handleStartCountdown}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-500/25 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Capture Photo
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/25 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Use This Photo
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
