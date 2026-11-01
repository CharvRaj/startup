import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Check, RefreshCw, X, ArrowLeft, ArrowRight, Compass, ShieldCheck, Sparkles, AlertCircle, Info } from 'lucide-react';
import { CapturedFrame } from '../../types/beautyStudio';

interface MultiAngleCaptureGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (frames: CapturedFrame[]) => void;
}

const REQUIRED_STEPS: Array<{
  angle: CapturedFrame['angle'];
  label: string;
  shortDesc: string;
  instruction: string;
  targetYaw: number;
  iconDirection: 'center' | 'left' | 'right' | 'far-left' | 'far-right';
}> = [
  {
    angle: 'front',
    label: 'Frontal Portrait',
    shortDesc: 'Looking straight forward',
    instruction: 'Look directly at the camera lens with a relaxed, neutral facial expression.',
    targetYaw: 0,
    iconDirection: 'center'
  },
  {
    angle: 'slight_left',
    label: 'Slight Left Angle',
    shortDesc: 'Turn ~20° to your left',
    instruction: 'Gently turn your head slightly to your left so we can map facial depth.',
    targetYaw: -20,
    iconDirection: 'left'
  },
  {
    angle: 'slight_right',
    label: 'Slight Right Angle',
    shortDesc: 'Turn ~20° to your right',
    instruction: 'Now turn your head slightly to your right to balance symmetry mapping.',
    targetYaw: 20,
    iconDirection: 'right'
  },
  {
    angle: 'left_profile',
    label: 'Left Jawline & Profile',
    shortDesc: 'Turn ~45° to your left',
    instruction: 'Turn further left to capture your cheekbone, jawline curve, and ear line.',
    targetYaw: -45,
    iconDirection: 'far-left'
  },
  {
    angle: 'right_profile',
    label: 'Right Jawline & Profile',
    shortDesc: 'Turn ~45° to your right',
    instruction: 'Turn to your right to complete the 3D lateral contour reconstruction.',
    targetYaw: 45,
    iconDirection: 'far-right'
  }
];

export const MultiAngleCaptureGuide: React.FC<MultiAngleCaptureGuideProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedFrames, setCapturedFrames] = useState<Record<string, CapturedFrame>>({});
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentStep = REQUIRED_STEPS[currentStepIndex];

  // Start webcam
  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam is not supported in this browser.");
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
      console.warn("Camera failed in multi-angle scanner:", err);
      setCameraError(err.message || "Failed to connect to webcam.");
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setCurrentStepIndex(0);
      setCapturedFrames({});
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const snapCurrentAngle = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Natural orientation
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const newFrame: CapturedFrame = {
      angle: currentStep.angle,
      imageDataUrl: dataUrl,
      timestamp: Date.now(),
      qualityScore: 0.92
    };

    setCapturedFrames(prev => ({
      ...prev,
      [currentStep.angle]: newFrame
    }));

    // Auto advance to next uncaptured step
    if (currentStepIndex < REQUIRED_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          snapCurrentAngle();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  const handleFinishScan = () => {
    const framesArray = REQUIRED_STEPS
      .map(step => capturedFrames[step.angle])
      .filter(Boolean) as CapturedFrame[];

    if (framesArray.length > 0) {
      stopCamera();
      onComplete(framesArray);
      onClose();
    }
  };

  const totalCaptured = Object.keys(capturedFrames).length;
  const isComplete = totalCaptured === REQUIRED_STEPS.length;
  const hasMinimum = totalCaptured >= 3; // Front + at least 2 angles

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-neutral-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100/60 dark:border-neutral-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-[11px] font-semibold tracking-wide border border-rose-200/50">
                Mode B: 3D Studio Scanner
              </span>
              <span className="text-xs text-neutral-400">Step {currentStepIndex + 1} of 5</span>
            </div>
            <h3 className="text-lg font-serif font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
              Multi-Angle Head Capture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Progress Pills */}
        <div className="px-6 py-2.5 bg-neutral-50/80 dark:bg-neutral-900/40 border-b border-rose-100/40 dark:border-neutral-800/60 flex items-center justify-between gap-1 overflow-x-auto shrink-0">
          {REQUIRED_STEPS.map((step, idx) => {
            const isCaptured = !!capturedFrames[step.angle];
            const isCurrent = idx === currentStepIndex;

            return (
              <button
                key={step.angle}
                onClick={() => setCurrentStepIndex(idx)}
                className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-xl text-left border transition text-xs flex items-center gap-2 ${
                  isCurrent
                    ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                    : isCaptured
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200/70 dark:border-neutral-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isCurrent
                    ? 'bg-white/20 text-white'
                    : isCaptured
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500'
                }`}>
                  {isCaptured ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <div className="truncate">
                  <p className="font-medium text-[11px] leading-tight truncate">{step.label}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scanner Viewport */}
        <div className="relative flex-1 min-h-[320px] bg-neutral-950 flex items-center justify-center overflow-hidden">
          {flash && (
            <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-300 pointer-events-none" />
          )}

          {/* Camera Loading */}
          {isInitializing && (
            <div className="flex flex-col items-center gap-2 text-white/80 z-20">
              <RefreshCw className="w-7 h-7 animate-spin text-rose-400" />
              <p className="text-xs">Preparing multi-angle scanner...</p>
            </div>
          )}

          {/* Camera Error */}
          {cameraError && (
            <div className="flex flex-col items-center text-center p-6 text-white max-w-sm z-20">
              <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
              <p className="text-xs text-rose-200">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-3 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs hover:bg-rose-600 transition"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* Live Video */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />

          {/* Dynamic Visual Pose Overlay Guide */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            {/* Guide Head Outline */}
            <div className="relative w-56 h-72 rounded-[50%/55%] border-2 border-dashed border-rose-400/60 shadow-[0_0_24px_rgba(244,63,94,0.3)] flex items-center justify-center">
              {/* Center Crosshair */}
              <div className="w-3 h-3 rounded-full bg-rose-400/40" />

              {/* Dynamic Turn Arrow Indicators */}
              {(currentStep.iconDirection === 'left' || currentStep.iconDirection === 'far-left') && (
                <div className="absolute left-[-42px] flex items-center gap-1 bg-black/60 backdrop-blur-sm text-rose-300 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                  <ArrowLeft className="w-4 h-4" /> Turn Left
                </div>
              )}

              {(currentStep.iconDirection === 'right' || currentStep.iconDirection === 'far-right') && (
                <div className="absolute right-[-42px] flex items-center gap-1 bg-black/60 backdrop-blur-sm text-rose-300 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                  Turn Right <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Instruction Banner at top inside preview */}
            <div className="absolute top-4 inset-x-6 flex justify-center">
              <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-2xl border border-white/10 max-w-md text-center shadow-lg">
                <span className="text-[11px] font-semibold tracking-wider text-rose-300 uppercase block">
                  {currentStep.label}
                </span>
                <p className="text-xs text-neutral-200 mt-0.5 font-light">
                  {currentStep.instruction}
                </p>
              </div>
            </div>
          </div>

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
              <div className="w-20 h-20 rounded-full bg-rose-500 text-white flex items-center justify-center text-4xl font-serif font-bold shadow-2xl animate-ping duration-700">
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Filmstrip & Controls Footer */}
        <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-900 border-t border-rose-100/60 dark:border-neutral-800 flex flex-col gap-3 shrink-0">
          {/* Thumbnails Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {REQUIRED_STEPS.map((step, idx) => {
              const frame = capturedFrames[step.angle];
              const isSelected = idx === currentStepIndex;

              return (
                <div
                  key={step.angle}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition shrink-0 ${
                    isSelected
                      ? 'border-rose-500 shadow-md ring-2 ring-rose-200 dark:ring-rose-900'
                      : frame
                      ? 'border-emerald-400'
                      : 'border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/50'
                  }`}
                >
                  {frame ? (
                    <>
                      <img
                        src={frame.imageDataUrl}
                        alt={step.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-neutral-400">
                      <Camera className="w-4 h-4 mb-1 opacity-60" />
                      <span>{step.angle.split('_')[0]}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate text-center">
                    {step.label.split(' ')[0]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Info className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                {totalCaptured} of 5 angles captured.
                {hasMinimum && !isComplete && " (Minimum 3 captured — you can generate now or finish all 5 for max fidelity)"}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                disabled={countdown !== null || isInitializing}
                onClick={startCountdown}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200/70 transition flex items-center gap-2"
              >
                <Camera className="w-3.5 h-3.5" />
                {capturedFrames[currentStep.angle] ? "Retake Current Angle" : "Snap Angle"}
              </button>

              <button
                type="button"
                disabled={!hasMinimum}
                onClick={handleFinishScan}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 shadow-md shadow-rose-500/25 disabled:opacity-40 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate 3D Head ({totalCaptured}/5)
              </button>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};
