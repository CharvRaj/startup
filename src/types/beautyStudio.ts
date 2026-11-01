// Type definitions for the 3D Virtual Beauty Studio

export type StudioMode = 'quick-makeup' | '3d-studio';

export type LipFinish = 'matte' | 'satin' | 'gloss' | 'shimmer';
export type EyelinerStyle = 'none' | 'classic' | 'cat-eye' | 'winged' | 'tightline' | 'bold';
export type EyeshadowStyle = 'none' | 'soft-wash' | 'crease-gradient' | 'smokey' | 'halo';
export type BlushStyle = 'apple' | 'draped' | 'sculpted';
export type HighlighterTone = 'champagne' | 'rose-gold' | 'pearl' | 'bronze';

export interface LipsState {
  enabled: boolean;
  color: string;
  finish: LipFinish;
  intensity: number; // 0 to 1
  glossLevel: number; // 0 to 1
}

export interface EyesState {
  eyeliner: {
    enabled: boolean;
    style: EyelinerStyle;
    color: string;
    intensity: number;
  };
  eyeshadow: {
    enabled: boolean;
    style: EyeshadowStyle;
    primaryColor: string;
    secondaryColor: string;
    intensity: number;
    shimmer: number;
  };
  lashes: {
    enabled: boolean;
    style: 'natural' | 'volume' | 'flutter' | 'glam';
    intensity: number;
  };
}

export interface FaceState {
  blush: {
    enabled: boolean;
    style: BlushStyle;
    color: string;
    intensity: number;
  };
  highlighter: {
    enabled: boolean;
    tone: HighlighterTone;
    intensity: number;
  };
  foundation: {
    enabled: boolean;
    shade: string;
    coverage: number; // 0 to 1
    undertone: 'warm' | 'cool' | 'neutral';
  };
}

export interface HairState {
  enabled: boolean;
  color: string;
  intensity: number;
}

export interface MakeupState {
  lips: LipsState;
  eyes: EyesState;
  face: FaceState;
  hair: HairState;
  activePreset: string | null;
}

export interface PresetLook {
  id: string;
  name: string;
  subtitle: string;
  category: 'bridal' | 'festive' | 'natural' | 'glamour';
  thumbnailColor: string;
  makeup: MakeupState;
}

export type ScanAngle = 'front' | 'slight-left' | 'slight-right' | 'left-profile' | 'right-profile';

export interface CapturedFrame {
  angle: ScanAngle;
  label?: string;
  instructions?: string;
  imageDataUrl: string;
  timestamp: number;
  yawDegrees?: number;
  pitchDegrees?: number;
  isAcceptable?: boolean;
  qualityScore?: number;
}

export interface ReconstructionJob {
  jobId: string;
  status: 'idle' | 'capturing' | 'validating' | 'meshing' | 'texturing' | 'ready' | 'error';
  progress: number; // 0 - 100
  message: string;
  diagnosticNotes: string[];
  backendMode: 'client-landmarks-3d' | 'remote-fastapi-cuda';
  backendOnline: boolean;
  meshUrl?: string;
  textureUrl?: string;
  error?: string;
}

export interface FaceLandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface FaceDetectionResult {
  landmarks: FaceLandmarkPoint[];
  yaw: number;
  pitch: number;
  roll: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
