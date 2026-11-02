import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Sparkles, Camera, Upload, RotateCcw, Box, Eye, Download,
  Sun, Moon, Flame, Check, SlidersHorizontal, Layers, Palette,
  ChevronRight, RefreshCw, Zap, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  createTrue3DStudio,
  ThreeStudioInstance,
} from '@/lib/beautyEngine/threeFaceReconstruction';
import { MakeupState } from '@/types/beautyStudio';
import { DEFAULT_MAKEUP_STATE, PRESET_LOOKS, SHADE_PALETTES } from '@/data/makeupPresets';
import { GuidedScan } from './GuidedScan';

// Animated Luxury Themes
export type StudioTheme = 'royal-gold' | 'rose-quartz' | 'cyber-glam' | 'midnight-noir';

interface ThemeDef {
  id: StudioTheme;
  name: string;
  icon: string;
  tagline: string;
  bgGrad: string;
  accent: string;
  borderGlow: string;
  particleColor: string;
  canvasBg: number;
}

const THEMES: Record<StudioTheme, ThemeDef> = {
  'royal-gold': {
    id: 'royal-gold',
    name: 'Royal 24K Gold',
    icon: '👑',
    tagline: 'Warm amber radiance with imperial gold shimmer',
    bgGrad: 'radial-gradient(ellipse at top, #2C2014 0%, #17110C 60%, #0D0907 100%)',
    accent: '#D4AF37',
    borderGlow: 'rgba(212, 175, 55, 0.35)',
    particleColor: 'rgba(234, 211, 151, 0.65)',
    canvasBg: 0x1A140F,
  },
  'rose-quartz': {
    id: 'rose-quartz',
    name: 'Rose Quartz Silk',
    icon: '🌺',
    tagline: 'Velvet berry glow with luminous rosy highlights',
    bgGrad: 'radial-gradient(ellipse at top, #2D141D 0%, #1A0D12 60%, #0F070A 100%)',
    accent: '#E55383',
    borderGlow: 'rgba(229, 83, 131, 0.35)',
    particleColor: 'rgba(255, 180, 205, 0.65)',
    canvasBg: 0x1A0F14,
  },
  'cyber-glam': {
    id: 'cyber-glam',
    name: 'Cyber Diamond',
    icon: '💎',
    tagline: 'Futuristic prism glow with holographic reflections',
    bgGrad: 'radial-gradient(ellipse at top, #14202D 0%, #0D141C 60%, #070B0F 100%)',
    accent: '#38BDF8',
    borderGlow: 'rgba(56, 189, 248, 0.35)',
    particleColor: 'rgba(165, 243, 252, 0.65)',
    canvasBg: 0x0C1217,
  },
  'midnight-noir': {
    id: 'midnight-noir',
    name: 'Midnight Velvet',
    icon: '🌙',
    tagline: 'Deep obsidian luxury with high-contrast studio spotlight',
    bgGrad: 'radial-gradient(ellipse at top, #1E1B24 0%, #110F15 60%, #08070A 100%)',
    accent: '#A855F7',
    borderGlow: 'rgba(168, 85, 247, 0.35)',
    particleColor: 'rgba(216, 180, 254, 0.65)',
    canvasBg: 0x110F14,
  },
};

const CAMERA_ANGLES = [
  { id: 'front', label: 'Front (0°)', icon: '👤' },
  { id: 'three-quarter-left', label: '3/4 Left', icon: '📐' },
  { id: 'three-quarter-right', label: '3/4 Right', icon: '📐' },
  { id: 'profile-left', label: 'Left Profile', icon: '⬅️' },
  { id: 'profile-right', label: 'Right Profile', icon: '➡️' },
  { id: 'lips', label: 'Lips Focus', icon: '💋' },
  { id: 'eyes', label: 'Eyes Focus', icon: '👁️' },
] as const;

export function ThreeDStudio({ onHandoffPhoto }: { onHandoffPhoto?: (b: ImageBitmap) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<ThreeStudioInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTheme, setActiveTheme] = useState<StudioTheme>('royal-gold');
  const [activeLighting, setActiveLighting] = useState<'studio' | 'golden-hour' | 'spotlight'>('studio');
  const [activeAngle, setActiveAngle] = useState<string>('front');
  const [hairStyle, setHairStyle] = useState<'bridal-updo' | 'sleek-waves' | 'smooth'>('bridal-updo');
  const [isWireframe, setIsWireframe] = useState(false);
  const [skinTone, setSkinTone] = useState('#EAC0A2');
  const [makeup, setMakeup] = useState<MakeupState>(DEFAULT_MAKEUP_STATE);
  const [activeCategory, setActiveCategory] = useState<'lips' | 'eyes' | 'face' | 'hair' | 'looks' | 'lighting'>('lips');
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);
  const [loadedUserPhoto, setLoadedUserPhoto] = useState<string | null>(null);

  // Initialize 3D Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const studio = createTrue3DStudio({
      container: containerRef.current,
      skinTone,
      initialMakeup: makeup,
      onReady: () => {
        // Apply initial theme background
        if (studio.scene) {
          studio.scene.background.setHex(THEMES[activeTheme].canvasBg);
        }
      },
    });

    studioRef.current = studio;

    return () => {
      studio.destroy();
      studioRef.current = null;
    };
  }, []);

  // Update Theme
  useEffect(() => {
    const s = studioRef.current;
    if (s && s.scene) {
      s.scene.background.setHex(THEMES[activeTheme].canvasBg);
    }
  }, [activeTheme]);

  // Update Makeup on 3D Mesh
  const updateMakeup = useCallback((updater: (prev: MakeupState) => MakeupState) => {
    setMakeup((prev) => {
      const next = updater(prev);
      studioRef.current?.updateMakeup(next);
      return next;
    });
  }, []);

  // Apply Camera Angle
  const setCameraAngle = (angle: typeof CAMERA_ANGLES[number]['id']) => {
    setActiveAngle(angle);
    studioRef.current?.setCameraAngle(angle);
  };

  // Reset Camera
  const resetCamera = () => {
    setActiveAngle('front');
    studioRef.current?.resetCamera();
  };

  // Switch Lighting Mood
  const setLighting = (mood: 'studio' | 'golden-hour' | 'spotlight') => {
    setActiveLighting(mood);
    studioRef.current?.setLightingMood(mood);
  };

  // Toggle Wireframe
  const toggleWireframe = (show: boolean) => {
    setIsWireframe(show);
    studioRef.current?.toggleWireframe(show);
  };

  // Switch Hairstyle
  const handleHairStyle = (style: 'bridal-updo' | 'sleek-waves' | 'smooth') => {
    setHairStyle(style);
    studioRef.current?.setHairStyle(style);
  };

  // Change Skin Tone
  const handleSkinTone = (hex: string) => {
    setSkinTone(hex);
    studioRef.current?.setSkinTone(hex);
  };

  // Export 3D Snapshot
  const exportSnapshot = () => {
    if (!studioRef.current) return;
    const dataUrl = studioRef.current.exportSnapshotPng(2);
    const link = document.createElement('a');
    link.download = `blindglow-3d-${activeTheme}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    setSnapshotSuccess(true);
    setTimeout(() => setSnapshotSuccess(false), 2400);
  };

  // Upload Photo to Project on 3D Model
  const handlePhotoUpload = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        setLoadedUserPhoto(img.src);
        studioRef.current?.applyUserPhotoTexture?.(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const themeInfo = THEMES[activeTheme];

  return (
    <div
      className="relative rounded-3xl overflow-hidden border transition-all duration-700 shadow-2xl"
      style={{
        background: themeInfo.bgGrad,
        borderColor: themeInfo.borderGlow,
      }}
    >
      {/* Ambient Floating Particle Sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              top: `${Math.sin(i * 1.5) * 45 + 50}%`,
              left: `${Math.cos(i * 2.1) * 45 + 50}%`,
              width: `${(i % 3) * 2 + 2}px`,
              height: `${(i % 3) * 2 + 2}px`,
              background: themeInfo.particleColor,
              boxShadow: `0 0 12px ${themeInfo.accent}`,
              animationDuration: `${3 + (i % 4)}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* ── Studio Top Header Bar: Themes & Status ── */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md border"
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderColor: themeInfo.borderGlow,
            }}
          >
            {themeInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
                BlindGlow 3D <span style={{ color: themeInfo.accent }}>Virtual Studio</span>
              </h2>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                Active 60fps WebGL
              </Badge>
            </div>
            <p className="text-xs text-white/60">{themeInfo.tagline}</p>
          </div>
        </div>

        {/* Animated Theme Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 px-2 hidden sm:inline">Theme:</span>
          {(Object.values(THEMES) as ThemeDef[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTheme(t.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300',
                activeTheme === t.id
                  ? 'bg-white/20 text-white shadow-md border border-white/30 scale-102'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <span>{t.icon}</span>
              <span className="hidden md:inline">{t.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Main Studio Grid ── */}
      <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_440px] p-4 sm:p-6">
        
        {/* ── Left Column: 3D Viewport & Orbit Controls ── */}
        <div className="space-y-4">
          <div
            className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-3xl overflow-hidden border shadow-2xl backdrop-blur-sm"
            style={{
              borderColor: themeInfo.borderGlow,
              boxShadow: `0 20px 50px -15px ${themeInfo.borderGlow}`,
            }}
          >
            {/* Real Three.js Canvas Container */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Orbit Instructions Pill */}
            <div className="absolute top-3 left-3 pointer-events-none px-3 py-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-[11px] text-white/80 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              <span>Drag to rotate 360° · Scroll to zoom</span>
            </div>

            {/* Snapshot Confirmation Toast */}
            {snapshotSuccess && (
              <div className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                <Check className="w-3.5 h-3.5" />
                <span>3D Snapshot Saved!</span>
              </div>
            )}

            {/* Wireframe Indicator Badge */}
            {isWireframe && (
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-semibold backdrop-blur-md">
                Wireframe Topology Active
              </div>
            )}

            {/* Floating Lighting Switcher on Bottom Right */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 p-1 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md">
              {[
                { id: 'studio', label: 'Studio', icon: Sun },
                { id: 'golden-hour', label: 'Sunset', icon: Flame },
                { id: 'spotlight', label: 'Spot', icon: Moon },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setLighting(id as any)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all',
                    activeLighting === id
                      ? 'bg-white/25 text-white font-bold shadow-sm'
                      : 'text-white/60 hover:text-white'
                  )}
                  title={`${label} lighting`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Camera Angles Ribbon (1-Tap Quick View Transitions) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-white/70 px-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-white/50">Camera Perspectives</span>
              <button onClick={resetCamera} className="hover:text-white transition-colors flex items-center gap-1 text-[11px]">
                <RotateCcw className="w-3 h-3" />
                <span>Reset (0°)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CAMERA_ANGLES.map((ang) => (
                <button
                  key={ang.id}
                  onClick={() => setCameraAngle(ang.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap border transition-all flex-shrink-0',
                    activeAngle === ang.id
                      ? 'bg-white text-black border-white shadow-md scale-102 font-bold'
                      : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span>{ang.icon}</span>
                  <span>{ang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Utility Bar: Photo Projection & Snapshot */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="border-white/20 bg-white/5 text-white hover:bg-white/15 text-xs"
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {loadedUserPhoto ? 'Change Photo Texture' : 'Project My Face on 3D'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
              />

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsScanModalOpen(true)}
                className="border-white/20 bg-white/5 text-white hover:bg-white/15 text-xs"
              >
                <Camera className="mr-1.5 h-3.5 w-3.5" />
                Guided Scan
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleWireframe(!isWireframe)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5',
                  isWireframe
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/15 bg-white/5 text-white/70 hover:text-white'
                )}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Wireframe</span>
              </button>

              <Button
                size="sm"
                onClick={exportSnapshot}
                className="bg-white text-black hover:bg-white/90 font-bold shadow-md text-xs"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Save 3D View
              </Button>
            </div>
          </div>
        </div>

        {/* ── Right Column: Interactive 3D Makeup Boutique & Presets ── */}
        <aside className="space-y-4">
          
          {/* Category Tabs */}
          <div className="flex gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md overflow-x-auto scrollbar-none">
            {[
              { id: 'lips', label: 'Lips', icon: '💄' },
              { id: 'eyes', label: 'Eyes', icon: '👁️' },
              { id: 'face', label: 'Glow', icon: '✨' },
              { id: 'hair', label: 'Hair', icon: '💇' },
              { id: 'looks', label: 'Looks', icon: '👑' },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id as any)}
                className={cn(
                  'flex items-center justify-center gap-1.5 flex-1 min-w-[64px] py-2 px-2 rounded-xl text-xs font-semibold transition-all',
                  activeCategory === id
                    ? 'bg-white text-black shadow-md font-bold scale-102'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* ── Category Panel: Lips ── */}
          {activeCategory === 'lips' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-sm text-white">3D Lip Artistry &amp; Volume</h3>
                  <p className="text-[11px] text-white/60">Specular sheen &amp; Cupid’s bow definition</p>
                </div>
                <Switch
                  checked={makeup.lips.enabled}
                  onCheckedChange={(v) => updateMakeup((m) => ({ ...m, lips: { ...m.lips, enabled: v } }))}
                />
              </div>

              {/* Finish Selector */}
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider text-[10px]">
                  Finish Style
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                  {(['matte', 'satin', 'gloss', 'shimmer'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => updateMakeup((m) => ({ ...m, lips: { ...m.lips, finish: f as any } }))}
                      className={cn(
                        'py-1.5 rounded-lg text-xs capitalize font-medium transition-all',
                        makeup.lips.finish === f
                          ? 'bg-white text-black font-bold shadow-xs'
                          : 'text-white/60 hover:text-white'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shade Selector */}
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider text-[10px]">
                  Couture Shades
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SHADE_PALETTES.lips.map((shade) => {
                    const isSel = makeup.lips.color.toLowerCase() === shade.hex.toLowerCase();
                    return (
                      <button
                        key={shade.label}
                        onClick={() => updateMakeup((m) => ({ ...m, lips: { ...m.lips, color: shade.hex, enabled: true } }))}
                        className="group flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-white/5 transition-all"
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center',
                            isSel ? 'border-white scale-110 shadow-lg ring-2 ring-white/40' : 'border-white/30 group-hover:scale-105'
                          )}
                          style={{ background: shade.hex }}
                        >
                          {isSel && <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />}
                        </div>
                        <span className="text-[9.5px] text-white/70 truncate w-full text-center">{shade.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Intensity Slider */}
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-semibold">Pigment Depth</span>
                  <span className="font-bold text-white">{Math.round(makeup.lips.intensity * 100)}%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[Math.round(makeup.lips.intensity * 100)]}
                  onValueChange={([v]) => updateMakeup((m) => ({ ...m, lips: { ...m.lips, intensity: v / 100 } }))}
                />
              </div>
            </div>
          )}

          {/* ── Category Panel: Eyes ── */}
          {activeCategory === 'eyes' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-sm text-white">3D Eye Couture</h3>
                  <p className="text-[11px] text-white/60">Winged eyeliner &amp; multi-dimensional shadows</p>
                </div>
                <Switch
                  checked={makeup.eyes.eyeliner.enabled || makeup.eyes.eyeshadow.enabled}
                  onCheckedChange={(v) =>
                    updateMakeup((m) => ({
                      ...m,
                      eyes: {
                        ...m.eyes,
                        eyeliner: { ...m.eyes.eyeliner, enabled: v },
                        eyeshadow: { ...m.eyes.eyeshadow, enabled: v },
                      },
                    }))
                  }
                />
              </div>

              {/* Eyeliner Style */}
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider text-[10px]">
                  Eyeliner Wing
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                  {(['classic', 'winged', 'cat-eye', 'bold'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => updateMakeup((m) => ({ ...m, eyes: { ...m.eyes, eyeliner: { ...m.eyes.eyeliner, style: st as any, enabled: true } } }))}
                      className={cn(
                        'py-1.5 rounded-lg text-xs capitalize font-medium transition-all',
                        makeup.eyes.eyeliner.style === st
                          ? 'bg-white text-black font-bold shadow-xs'
                          : 'text-white/60 hover:text-white'
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eyeshadow Palette */}
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider text-[10px]">
                  Eyeshadow Tone
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SHADE_PALETTES.eyes.map((shade) => {
                    const isSel = makeup.eyes.eyeshadow.primaryColor === shade.hex;
                    return (
                      <button
                        key={shade.label}
                        onClick={() =>
                          updateMakeup((m) => ({
                            ...m,
                            eyes: {
                              ...m.eyes,
                              eyeshadow: { ...m.eyes.eyeshadow, primaryColor: shade.hex, enabled: true },
                            },
                          }))
                        }
                        className="group flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-white/5 transition-all"
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center',
                            isSel ? 'border-white scale-110 shadow-lg ring-2 ring-white/40' : 'border-white/30 group-hover:scale-105'
                          )}
                          style={{ background: shade.hex }}
                        >
                          {isSel && <Check className="w-3.5 h-3.5 text-white drop-shadow stroke-[3]" />}
                        </div>
                        <span className="text-[9.5px] text-white/70 truncate w-full text-center">{shade.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Category Panel: Face & Complexion ── */}
          {activeCategory === 'face' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-sm text-white">3D Cheekbone Glow &amp; Complexion</h3>
                  <p className="text-[11px] text-white/60">Anatomical cheek sculpting &amp; stroboscopic highlight</p>
                </div>
              </div>

              {/* 3D Skin Tone Selector */}
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider text-[10px]">
                  3D Skin Undertone Match
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Ivory', hex: '#F3D7C0' },
                    { label: 'Beige', hex: '#EAC0A2' },
                    { label: 'Honey', hex: '#D2A075' },
                    { label: 'Caramel', hex: '#A06A43' },
                    { label: 'Espresso', hex: '#744A2E' },
                  ].map((sk) => (
                    <button
                      key={sk.label}
                      onClick={() => handleSkinTone(sk.hex)}
                      className="flex flex-col items-center gap-1 p-1 rounded-xl hover:bg-white/5"
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-transform flex items-center justify-center',
                          skinTone === sk.hex ? 'border-white scale-110 shadow-lg' : 'border-white/20'
                        )}
                        style={{ background: sk.hex }}
                      >
                        {skinTone === sk.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                      </div>
                      <span className="text-[9.5px] text-white/70">{sk.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Blush Palette */}
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider text-[10px]">
                  Silk Blush Shading
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SHADE_PALETTES.blush.map((bl) => {
                    const isSel = makeup.face.blush.color === bl.hex;
                    return (
                      <button
                        key={bl.label}
                        onClick={() =>
                          updateMakeup((m) => ({
                            ...m,
                            face: { ...m.face, blush: { ...m.face.blush, color: bl.hex, enabled: true } },
                          }))
                        }
                        className={cn(
                          'p-2 rounded-xl border flex items-center gap-2 transition-all',
                          isSel ? 'border-white bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                        )}
                      >
                        <span className="w-4 h-4 rounded-full border border-white/30 flex-shrink-0" style={{ background: bl.hex }} />
                        <span className="text-[10px] text-white truncate">{bl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Category Panel: Hair ── */}
          {activeCategory === 'hair' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md space-y-4">
              <div className="pb-3 border-b border-white/10">
                <h3 className="font-bold text-sm text-white">3D Hair Silhouette &amp; Crown</h3>
                <p className="text-[11px] text-white/60">3D bridal updo geometry &amp; hair sheen</p>
              </div>

              {/* Hairstyle Selector */}
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider text-[10px]">
                  3D Hairstyle Model
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bridal-updo', label: 'Bridal Crown', icon: '👑' },
                    { id: 'sleek-waves', label: 'Glamour Waves', icon: '🌊' },
                    { id: 'smooth', label: 'Smooth Silk', icon: '✨' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      onClick={() => handleHairStyle(h.id as any)}
                      className={cn(
                        'p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all',
                        hairStyle === h.id
                          ? 'border-white bg-white/20 text-white font-bold shadow-md scale-102'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      )}
                    >
                      <span className="text-xl">{h.icon}</span>
                      <span className="text-xs">{h.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider text-[10px]">
                  Hair Color Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SHADE_PALETTES.hair.map((hr) => {
                    const isSel = makeup.hair.color === hr.hex;
                    return (
                      <button
                        key={hr.label}
                        onClick={() => updateMakeup((m) => ({ ...m, hair: { ...m.hair, color: hr.hex, enabled: true } }))}
                        className={cn(
                          'p-2 rounded-xl border flex items-center gap-2 transition-all',
                          isSel ? 'border-white bg-white/20 font-bold' : 'border-white/10 bg-white/5 text-white/70'
                        )}
                      >
                        <span className="w-5 h-5 rounded-full border border-white/30 flex-shrink-0" style={{ background: hr.hex }} />
                        <span className="text-[11px] truncate">{hr.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Category Panel: Curated Looks ── */}
          {activeCategory === 'looks' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md space-y-3">
              <div className="pb-3 border-b border-white/10">
                <h3 className="font-bold text-sm text-white">1-Tap Complete 3D Makeovers</h3>
                <p className="text-[11px] text-white/60">Harmonized couture looks applied instantly in 3D</p>
              </div>

              <div className="grid gap-2.5">
                {PRESET_LOOKS.map((p) => {
                  const isActive = makeup.activePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() =>
                        updateMakeup(() => ({
                          ...p.makeup,
                          activePreset: p.id,
                        }))
                      }
                      className={cn(
                        'group p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-3',
                        isActive
                          ? 'border-white bg-white/20 shadow-md ring-1 ring-white/40'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm border border-white/20 flex-shrink-0"
                          style={{ background: p.thumbnailColor }}
                        >
                          {isActive ? <Check className="w-5 h-5" /> : <Sparkles className="w-4 h-4 text-white/80" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white leading-tight">{p.name}</h4>
                          <p className="text-[10.5px] text-white/60 line-clamp-1 mt-0.5">{p.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Optional Multi-Angle Guided Scan Modal ── */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/80 mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="font-display text-xl font-bold">Guided 5-Angle Face Scan</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsScanModalOpen(false)}>
                ✕ Close
              </Button>
            </div>

            <GuidedScan
              onUseFront={(b) => {
                setIsScanModalOpen(false);
                onHandoffPhoto?.(b);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
