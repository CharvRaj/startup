import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Sparkles, RefreshCw, AlertCircle, Eye, Download, ShieldCheck, Check, SlidersHorizontal } from 'lucide-react';
import { MakeupState } from '@/types/beautyStudio';
import { getVisionModels, renderRealtimeMakeup, renderHairTint } from '@/lib/beautyEngine/realtimeMakeupEngine';

interface LiveARStudioProps {
  makeup: MakeupState;
  activeHairColor: string;
  hairOpacity?: number;
  customPhotoUrl?: string | null;
  onSnapshot?: (dataUrl: string) => void;
  className?: string;
}

export const LiveARStudio: React.FC<LiveARStudioProps> = ({
  makeup,
  activeHairColor,
  hairOpacity = 0.65,
  customPhotoUrl = null,
  onSnapshot,
  className = '',
}) => {
  const [mode, setMode] = useState<'camera' | 'portrait'>('portrait');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [fps, setFps] = useState(60);
  const [showOriginal, setShowOriginal] = useState(false);
  const [splitPosition, setSplitPosition] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const makeupRef = useRef(makeup);
  makeupRef.current = makeup;

  const hairColorRef = useRef(activeHairColor);
  hairColorRef.current = activeHairColor;

  const hairOpacityRef = useRef(hairOpacity);
  hairOpacityRef.current = hairOpacity;

  const showOriginalRef = useRef(showOriginal);
  showOriginalRef.current = showOriginal;

  const animationFrameIdRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  // 1. Initialize Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported in this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setMode('camera');
    } catch (err: any) {
      console.warn('Live camera error:', err);
      let msg = 'Could not access camera. Please allow camera permissions.';
      if (err.name === 'NotAllowedError') {
        msg = 'Camera permission denied. Please allow camera access in browser.';
      }
      setCameraError(msg);
      setMode('portrait');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // 2. Render Loop for Live Camera
  useEffect(() => {
    if (mode !== 'camera' || !isCameraActive) return;

    let isDisposed = false;
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    isRunningRef.current = true;

    async function runLiveAR() {
      try {
        setIsModelLoading(true);
        const { faceLandmarker, hairSegmenter } = await getVisionModels('VIDEO');
        setIsModelLoading(false);

        let lastVideoTime = -1;

        const loop = () => {
          if (isDisposed || !isRunningRef.current) return;
          animationFrameIdRef.current = requestAnimationFrame(loop);

          const video = videoRef.current;
          const outputCanvas = outputCanvasRef.current;
          const sourceCanvas = sourceCanvasRef.current;
          if (!video || !outputCanvas || !sourceCanvas) return;

          const width = video.videoWidth || 640;
          const height = video.videoHeight || 480;
          if (width === 0 || height === 0) return;

          if (sourceCanvas.width !== width) sourceCanvas.width = width;
          if (sourceCanvas.height !== height) sourceCanvas.height = height;
          if (outputCanvas.width !== width) outputCanvas.width = width;
          if (outputCanvas.height !== height) outputCanvas.height = height;

          const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
          const outCtx = outputCanvas.getContext('2d');
          if (!srcCtx || !outCtx) return;

          // Mirror video frame for natural selfie feel
          srcCtx.save();
          srcCtx.translate(width, 0);
          srcCtx.scale(-1, 1);
          srcCtx.drawImage(video, 0, 0, width, height);
          srcCtx.restore();

          if (video.currentTime === lastVideoTime) return;
          lastVideoTime = video.currentTime;

          // Base frame
          outCtx.clearRect(0, 0, width, height);
          outCtx.drawImage(sourceCanvas, 0, 0, width, height);

          // If comparing original vs makeup
          if (showOriginalRef.current) return;

          const timestamp = performance.now();

          // 1. Face Makeup
          try {
            const faceResult = faceLandmarker.detectForVideo(sourceCanvas, timestamp);
            if (faceResult && faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
              const rawLandmarks = faceResult.faceLandmarks[0];
              renderRealtimeMakeup(outCtx, rawLandmarks, makeupRef.current, width, height);
            }
          } catch (e) {
            // Frame skip tolerance
          }

          // 2. Hair Tinting (if enabled)
          if (hairColorRef.current && hairSegmenter) {
            try {
              const hairResult = hairSegmenter.segmentForVideo(sourceCanvas, timestamp);
              if (hairResult) {
                renderHairTint(outCtx, hairResult, hairColorRef.current, hairOpacityRef.current, width, height);
                hairResult.close();
              }
            } catch (e) {
              // Tolerant
            }
          }

          // FPS Calculation
          frameCount++;
          const now = performance.now();
          if (now - lastFpsUpdate >= 1000) {
            setFps(Math.round((frameCount * 1000) / (now - lastFpsUpdate)));
            frameCount = 0;
            lastFpsUpdate = now;
          }
        };

        animationFrameIdRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.warn('Vision models initialization error in loop:', err);
        setIsModelLoading(false);
      }
    }

    runLiveAR();

    return () => {
      isDisposed = true;
      isRunningRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [mode, isCameraActive]);

  // 3. Render Static Portrait Mode (Demo image or Custom Uploaded Photo)
  useEffect(() => {
    if (mode !== 'portrait') return;

    let isDisposed = false;
    const portraitSrc = customPhotoUrl || '/f.png';

    async function renderPortrait() {
      try {
        setIsModelLoading(true);
        const { faceLandmarker, hairSegmenter } = await getVisionModels('IMAGE');
        setIsModelLoading(false);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = portraitSrc;

        img.onload = () => {
          if (isDisposed) return;
          const outputCanvas = outputCanvasRef.current;
          const sourceCanvas = sourceCanvasRef.current;
          if (!outputCanvas || !sourceCanvas) return;

          const width = img.naturalWidth || 800;
          const height = img.naturalHeight || 1000;

          sourceCanvas.width = width;
          sourceCanvas.height = height;
          outputCanvas.width = width;
          outputCanvas.height = height;

          const srcCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
          const outCtx = outputCanvas.getContext('2d');
          if (!srcCtx || !outCtx) return;

          srcCtx.clearRect(0, 0, width, height);
          srcCtx.drawImage(img, 0, 0, width, height);

          outCtx.clearRect(0, 0, width, height);
          outCtx.drawImage(sourceCanvas, 0, 0, width, height);

          if (showOriginalRef.current) return;

          // 1. Detect & render face makeup
          try {
            const faceResult = faceLandmarker.detect(sourceCanvas);
            if (faceResult && faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
              const rawLandmarks = faceResult.faceLandmarks[0];
              renderRealtimeMakeup(outCtx, rawLandmarks, makeupRef.current, width, height);
            }
          } catch (e) {
            console.warn('Portrait face detection error:', e);
          }

          // 2. Hair Tinting
          if (hairColorRef.current && hairSegmenter) {
            try {
              const hairResult = hairSegmenter.segment(sourceCanvas);
              if (hairResult) {
                renderHairTint(outCtx, hairResult, hairColorRef.current, hairOpacityRef.current, width, height);
                hairResult.close();
              }
            } catch (e) {
              console.warn('Portrait hair tinting error:', e);
            }
          }
        };
      } catch (err) {
        console.warn('Portrait render error:', err);
        setIsModelLoading(false);
      }
    }

    renderPortrait();

    return () => {
      isDisposed = true;
    };
  }, [mode, customPhotoUrl, makeup, activeHairColor, hairOpacity, showOriginal]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture Snapshot
  const handleCaptureSnapshot = () => {
    if (!outputCanvasRef.current) return;
    const dataUrl = outputCanvasRef.current.toDataURL('image/jpeg', 0.95);
    if (onSnapshot) {
      onSnapshot(dataUrl);
    } else {
      // Download directly
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `satguru-virtual-makeup-${Date.now()}.jpg`;
      a.click();
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center w-full h-full select-none ${className}`}>
      {/* Hidden processing buffers */}
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas ref={sourceCanvasRef} className="hidden" />

      {/* Main Viewport Container */}
      <div className="relative w-full h-full min-h-[480px] max-h-[720px] rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border border-amber-900/20 shadow-2xl flex items-center justify-center group">
        {/* Render Canvas */}
        <canvas
          ref={outputCanvasRef}
          className="w-full h-full object-contain max-h-[700px] transition-transform duration-300"
        />

        {/* Loading Overlay */}
        {isModelLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white gap-3 animate-in fade-in">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-xs uppercase tracking-widest font-medium text-amber-200">
              Initializing MediaPipe AI Engine...
            </p>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="absolute top-4 left-4 right-4 z-40 bg-rose-950/80 border border-rose-500/40 text-rose-200 p-3 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-lg text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Top Floating Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          {/* Mode Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
            <button
              onClick={() => {
                stopCamera();
                setMode('portrait');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                mode === 'portrait'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portrait Studio</span>
            </button>

            <button
              onClick={() => {
                if (isCameraActive) {
                  stopCamera();
                  setMode('portrait');
                } else {
                  startCamera();
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                mode === 'camera'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isCameraActive ? (
                <>
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Live Webcam</span>
                </>
              )}
            </button>
          </div>

          {/* Performance Badge / Status */}
          <div className="flex items-center gap-2">
            {mode === 'camera' && isCameraActive && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{fps} FPS LIVE AR</span>
              </div>
            )}

            {/* Hold to compare Original */}
            <button
              onMouseDown={() => setShowOriginal(true)}
              onMouseUp={() => setShowOriginal(false)}
              onTouchStart={() => setShowOriginal(true)}
              onTouchEnd={() => setShowOriginal(false)}
              className={`p-2 rounded-full backdrop-blur-md border text-xs transition flex items-center gap-1.5 ${
                showOriginal
                  ? 'bg-amber-500 text-white border-amber-400'
                  : 'bg-black/60 text-neutral-300 border-white/10 hover:text-white hover:bg-black/80'
              }`}
              title="Press and hold to view without makeup"
            >
              <Eye className="w-4 h-4" />
              <span className="text-[11px] font-medium hidden md:inline">Hold for Original</span>
            </button>

            {/* Quick Snapshot */}
            <button
              onClick={handleCaptureSnapshot}
              className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md hover:from-amber-600 hover:to-rose-600 transition flex items-center gap-1"
              title="Save Snapshot"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Guide Watermark (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-[11px] text-neutral-400/90 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local 468-Mesh + Hair Segmenter</span>
        </div>
      </div>
    </div>
  );
};
