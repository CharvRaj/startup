import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported' | 'no-device' | 'in-use' | 'error';
export interface CameraState { status: CameraStatus; message?: string }

const MESSAGES: Record<string, string> = {
  denied: 'Camera permission was denied. Please allow camera access in your browser settings and try again.',
  unsupported: 'Camera access requires HTTPS or localhost in your browser. Please ensure you are on a secure connection or upload a photo instead.',
  'no-device': 'No camera detected on this device. You can upload a photo instead.',
  'in-use': 'The camera is currently in use by another application or tab. Please close it and try again.',
  error: 'Unable to start camera stream. Please try again or upload a photo.',
};

/** Owns the MediaStream lifecycle: tracks are always stopped on stop() and unmount. */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({ status: 'idle' });

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.srcObject = null;
    }
    setState((s) => (s.status === 'active' || s.status === 'requesting' ? { status: 'idle' } : s));
  }, []);

  const attachStreamToVideo = useCallback(() => {
    const v = videoRef.current;
    const stream = streamRef.current;
    if (v && stream) {
      if (v.srcObject !== stream) {
        v.srcObject = stream;
        v.muted = true;
        v.playsInline = true;
      }
      v.play().catch(() => {});
    }
  }, []);

  const start = useCallback(async (facing: 'user' | 'environment' = 'user') => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!window.isSecureContext && !isLocal) {
      setState({ status: 'unsupported', message: MESSAGES.unsupported });
      return false;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setState({ status: 'unsupported', message: MESSAGES.unsupported });
      return false;
    }

    stop();
    setState({ status: 'requesting' });

    // Multi-tier constraint fallback for mobile cameras and webcams
    const constraintTiers: MediaStreamConstraints[] = [
      { audio: false, video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } } },
      { audio: false, video: { facingMode: facing } },
      { audio: false, video: true },
    ];

    let stream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintTiers) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!stream) {
      const name = (lastError as DOMException)?.name || '';
      const status: CameraStatus =
        name === 'NotAllowedError' || name === 'SecurityError'
          ? 'denied'
          : name === 'NotFoundError' || name === 'OverconstrainedError'
          ? 'no-device'
          : name === 'NotReadableError' || name === 'AbortError'
          ? 'in-use'
          : 'error';
      setState({ status, message: MESSAGES[status] ?? MESSAGES.error });
      return false;
    }

    streamRef.current = stream;
    setState({ status: 'active' });

    // Attach stream to video immediately or as soon as mounted
    attachStreamToVideo();
    // Microtask & timeout retries to ensure connection even if React render is completing
    requestAnimationFrame(attachStreamToVideo);
    setTimeout(attachStreamToVideo, 100);

    return true;
  }, [stop, attachStreamToVideo]);

  // Ensure stream stays attached if videoRef mounts after start
  useEffect(() => {
    if (state.status === 'active' && streamRef.current) {
      attachStreamToVideo();
    }
  }, [state.status, attachStreamToVideo]);

  useEffect(() => stop, [stop]);

  return { videoRef, state, start, stop };
}
