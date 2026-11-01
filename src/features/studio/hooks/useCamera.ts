import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported' | 'no-device' | 'in-use' | 'error';
export interface CameraState { status: CameraStatus; message?: string }

const MESSAGES: Record<string, string> = {
  denied: 'Camera access was blocked. Allow the camera for this site in your browser’s address-bar settings, then try again — or upload a photo instead.',
  unsupported: 'This browser or connection doesn’t support camera access (it needs HTTPS and a modern browser). You can upload a photo instead.',
  'no-device': 'No camera was found on this device. You can upload a photo instead.',
  'in-use': 'The camera is being used by another app or tab. Close it and try again.',
};

/** Owns the MediaStream lifecycle: tracks are always stopped on stop() and unmount. */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({ status: 'idle' });

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null;
    const v = videoRef.current; if (v) { v.pause(); v.srcObject = null; }
    setState((s) => (s.status === 'active' || s.status === 'requesting' ? { status: 'idle' } : s));
  }, []);

  const start = useCallback(async (facing: 'user' | 'environment' = 'user') => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setState({ status: 'unsupported', message: MESSAGES.unsupported }); return false; }
    stop(); setState({ status: 'requesting' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } } });
      streamRef.current = stream;
      const v = videoRef.current;
      if (!v) { stream.getTracks().forEach((t) => t.stop()); streamRef.current = null; setState({ status: 'idle' }); return false; }
      v.srcObject = stream; v.muted = true; v.playsInline = true; await v.play();
      setState({ status: 'active' }); return true;
    } catch (e) {
      const name = (e as DOMException).name;
      const status: CameraStatus = name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : name === 'NotFoundError' || name === 'OverconstrainedError' ? 'no-device' : name === 'NotReadableError' || name === 'AbortError' ? 'in-use' : 'error';
      setState({ status, message: MESSAGES[status] ?? 'The camera couldn’t be started. Please try again or upload a photo.' });
      return false;
    }
  }, [stop]);

  useEffect(() => stop, [stop]);
  return { videoRef, state, start, stop };
}
