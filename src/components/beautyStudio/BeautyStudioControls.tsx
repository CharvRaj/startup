import React from 'react';
import {
  Sparkles, Sliders, Palette, Check, RotateCcw,
  Eye, Heart, Shield, Box, Sun, Moon, Scissors, Smile
} from 'lucide-react';
import {
  MakeupState, LipFinish, EyelinerStyle, EyeshadowStyle,
  BlushStyle, HighlighterTone, StudioMode
} from '@/types/beautyStudio';
import { SHADE_PALETTES, PRESET_LOOKS } from '@/data/makeupPresets';

export type ActiveCategory = 'lips' | 'eyes' | 'face' | 'hair' | 'looks' | '3d';

interface BeautyStudioControlsProps {
  mode: StudioMode;
  activeCategory: ActiveCategory;
  onSelectCategory: (cat: ActiveCategory) => void;
  makeup: MakeupState;
  onChangeMakeup: (updater: (prev: MakeupState) => MakeupState) => void;
  onResetCategory: (cat: ActiveCategory) => void;
  onSet3dAngle?: (angle: 'front' | 'three-quarter-left' | 'three-quarter-right' | 'profile-left' | 'profile-right') => void;
  onReset3dCamera?: () => void;
  onToggleWireframe?: (wireframe: boolean) => void;
  isWireframe?: boolean;
}

export function BeautyStudioControls({
  mode,
  activeCategory,
  onSelectCategory,
  makeup,
  onChangeMakeup,
  onResetCategory,
  onSet3dAngle,
  onReset3dCamera,
  onToggleWireframe,
  isWireframe,
}: BeautyStudioControlsProps) {

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-card border-t md:border-t-0 md:border-r border-border/80 transition-colors">
      
      {/* ── 1. Vertical Category Icons Sidebar ── */}
      <div className="flex md:flex-col items-center justify-around md:justify-start gap-1 p-2 md:py-4 md:w-20 border-b md:border-b-0 md:border-r border-border/70 bg-secondary/30 flex-shrink-0">
        
        <button
          onClick={() => onSelectCategory('lips')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-[10px] font-semibold gap-1 transition-all ${
            activeCategory === 'lips'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
              : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
          }`}
        >
          <Palette className="w-4 h-4 text-rose-500" />
          <span>Lips</span>
        </button>

        <button
          onClick={() => onSelectCategory('eyes')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-[10px] font-semibold gap-1 transition-all ${
            activeCategory === 'eyes'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
              : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
          }`}
        >
          <Eye className="w-4 h-4 text-violet-500" />
          <span>Eyes</span>
        </button>

        <button
          onClick={() => onSelectCategory('face')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-[10px] font-semibold gap-1 transition-all ${
            activeCategory === 'face'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
              : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
          }`}
        >
          <Smile className="w-4 h-4 text-pink-500" />
          <span>Face</span>
        </button>

        <button
          onClick={() => onSelectCategory('hair')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-[10px] font-semibold gap-1 transition-all ${
            activeCategory === 'hair'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
              : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
          }`}
        >
          <Scissors className="w-4 h-4 text-amber-600" />
          <span>Hair</span>
        </button>

        <button
          onClick={() => onSelectCategory('looks')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-[10px] font-semibold gap-1 transition-all ${
            activeCategory === 'looks'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
              : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Looks</span>
        </button>

        {mode === '3d-studio' && (
          <button
            onClick={() => onSelectCategory('3d')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-[10px] font-semibold gap-1 transition-all ${
              activeCategory === '3d'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-105'
                : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
            }`}
          >
            <Box className="w-4 h-4 text-emerald-400" />
            <span>3D Angle</span>
          </button>
        )}
      </div>

      {/* ── 2. Category Adjustment Drawer (Right/Sub-panel) ── */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto max-h-[45vh] md:max-h-full scrollbar-thin">

        {/* ── LIPS CATEGORY ── */}
        {activeCategory === 'lips' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Lip Artistry</span>
                  <span className="w-2 h-2 rounded-full" style={{ background: makeup.lips.color }} />
                </h4>
                <p className="text-[11px] text-muted-foreground">Boundary-aware blending & custom finishes</p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={makeup.lips.enabled}
                    onChange={(e) =>
                      onChangeMakeup(m => ({ ...m, lips: { ...m.lips, enabled: e.target.checked } }))
                    }
                    className="w-4 h-4 rounded text-primary focus:ring-primary/30"
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            {/* Finish Selector */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Finish Style</label>
              <div className="grid grid-cols-4 gap-1.5 bg-secondary/60 p-1 rounded-xl border border-border/60 text-xs">
                {(['matte', 'satin', 'gloss', 'shimmer'] as LipFinish[]).map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      onChangeMakeup(m => ({ ...m, lips: { ...m.lips, finish: f } }))
                    }
                    className={`py-1.5 rounded-lg capitalize font-medium transition-all ${
                      makeup.lips.finish === f
                        ? 'bg-card text-foreground shadow-xs font-bold border border-border/50'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Lip Shade Swatches */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Lipstick Shades</label>
              <div className="grid grid-cols-5 gap-2">
                {SHADE_PALETTES.lips.map((shade) => {
                  const isSelected = makeup.lips.color.toLowerCase() === shade.hex.toLowerCase();
                  return (
                    <button
                      key={shade.label}
                      onClick={() =>
                        onChangeMakeup(m => ({ ...m, lips: { ...m.lips, color: shade.hex, enabled: true } }))
                      }
                      className="group relative flex flex-col items-center gap-1"
                      title={shade.label}
                    >
                      <div
                        className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center border-2 ${
                          isSelected
                            ? 'ring-2 ring-primary ring-offset-2 scale-110 border-white'
                            : 'border-white/40 hover:scale-105'
                        }`}
                        style={{ background: shade.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                      </div>
                      <span className="text-[9px] text-muted-foreground truncate w-full text-center leading-tight">
                        {shade.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Hex Color Picker */}
              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground font-medium">Custom Color:</span>
                <input
                  type="color"
                  value={makeup.lips.color}
                  onChange={(e) =>
                    onChangeMakeup(m => ({ ...m, lips: { ...m.lips, color: e.target.value, enabled: true } }))
                  }
                  className="w-7 h-7 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono text-muted-foreground uppercase">{makeup.lips.color}</span>
              </div>
            </div>

            {/* Lip Intensity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-muted-foreground">Color Intensity</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {Math.round(makeup.lips.intensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={makeup.lips.intensity}
                onChange={(e) =>
                  onChangeMakeup(m => ({ ...m, lips: { ...m.lips, intensity: parseFloat(e.target.value) } }))
                }
                className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Gloss Level Slider (if satin or gloss) */}
            {(makeup.lips.finish === 'gloss' || makeup.lips.finish === 'satin') && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-muted-foreground">Gloss Highlights</span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {Math.round(makeup.lips.glossLevel * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={makeup.lips.glossLevel}
                  onChange={(e) =>
                    onChangeMakeup(m => ({ ...m, lips: { ...m.lips, glossLevel: parseFloat(e.target.value) } }))
                  }
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>
        )}

        {/* ── EYES CATEGORY ── */}
        {activeCategory === 'eyes' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-border/70">
              <h4 className="text-sm font-bold text-foreground">Eye Makeup & Definition</h4>
              <p className="text-[11px] text-muted-foreground">Winged eyeliner, dual-tone eyeshadow & lashes</p>
            </div>

            {/* 1. Eyeliner Sub-section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Eyeliner Style</label>
                <input
                  type="checkbox"
                  checked={makeup.eyes.eyeliner.enabled}
                  onChange={(e) =>
                    onChangeMakeup(m => ({
                      ...m,
                      eyes: { ...m.eyes, eyeliner: { ...m.eyes.eyeliner, enabled: e.target.checked } },
                    }))
                  }
                  className="w-4 h-4 rounded text-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['none', 'classic', 'winged', 'cat-eye', 'tightline', 'bold'] as EyelinerStyle[]).map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      onChangeMakeup(m => ({
                        ...m,
                        eyes: { ...m.eyes, eyeliner: { ...m.eyes.eyeliner, style: s, enabled: s !== 'none' } },
                      }))
                    }
                    className={`py-1.5 px-2 rounded-xl capitalize font-medium transition-all text-center border ${
                      makeup.eyes.eyeliner.style === s
                        ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                        : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Eyeliner Shades */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Pigment:</span>
                {SHADE_PALETTES.eyeliner.map((sh) => (
                  <button
                    key={sh.label}
                    onClick={() =>
                      onChangeMakeup(m => ({
                        ...m,
                        eyes: { ...m.eyes, eyeliner: { ...m.eyes.eyeliner, color: sh.hex, enabled: true } },
                      }))
                    }
                    className={`w-6 h-6 rounded-full border ${
                      makeup.eyes.eyeliner.color === sh.hex ? 'ring-2 ring-primary ring-offset-1' : ''
                    }`}
                    style={{ background: sh.hex }}
                    title={sh.label}
                  />
                ))}
              </div>
            </div>

            {/* 2. Eyeshadow Sub-section */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Eyeshadow Shimmer & Crease</label>
                <input
                  type="checkbox"
                  checked={makeup.eyes.eyeshadow.enabled}
                  onChange={(e) =>
                    onChangeMakeup(m => ({
                      ...m,
                      eyes: { ...m.eyes, eyeshadow: { ...m.eyes.eyeshadow, enabled: e.target.checked } },
                    }))
                  }
                  className="w-4 h-4 rounded text-primary"
                />
              </div>

              {/* Eyeshadow Shades */}
              <div className="grid grid-cols-4 gap-2">
                {SHADE_PALETTES.eyeshadow.map((sh) => {
                  const isSelected = makeup.eyes.eyeshadow.primaryColor === sh.hex;
                  return (
                    <button
                      key={sh.label}
                      onClick={() =>
                        onChangeMakeup(m => ({
                          ...m,
                          eyes: {
                            ...m.eyes,
                            eyeshadow: { ...m.eyes.eyeshadow, primaryColor: sh.hex, enabled: true },
                          },
                        }))
                      }
                      className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        isSelected ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full" style={{ background: sh.hex }} />
                      <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                        {sh.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Eyeshadow Intensity Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Crease Opacity</span>
                  <span className="font-mono text-xs">{Math.round(makeup.eyes.eyeshadow.intensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={makeup.eyes.eyeshadow.intensity}
                  onChange={(e) =>
                    onChangeMakeup(m => ({
                      ...m,
                      eyes: { ...m.eyes, eyeshadow: { ...m.eyes.eyeshadow, intensity: parseFloat(e.target.value) } },
                    }))
                  }
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── FACE CATEGORY (Blush, Highlighter, Foundation) ── */}
        {activeCategory === 'face' && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-border/70">
              <h4 className="text-sm font-bold text-foreground">Cheeks, Highlighting & Complexion</h4>
              <p className="text-[11px] text-muted-foreground">Gaussian skin blending & luminance highlights</p>
            </div>

            {/* Blush */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Blush Tone & Contour</label>
                <input
                  type="checkbox"
                  checked={makeup.face.blush.enabled}
                  onChange={(e) =>
                    onChangeMakeup(m => ({
                      ...m,
                      face: { ...m.face, blush: { ...m.face.blush, enabled: e.target.checked } },
                    }))
                  }
                  className="w-4 h-4 rounded text-primary"
                />
              </div>

              {/* Blush Style */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {(['apple', 'draped', 'sculpted'] as BlushStyle[]).map((st) => (
                  <button
                    key={st}
                    onClick={() =>
                      onChangeMakeup(m => ({
                        ...m,
                        face: { ...m.face, blush: { ...m.face.blush, style: st, enabled: true } },
                      }))
                    }
                    className={`py-1.5 rounded-xl capitalize font-medium border ${
                      makeup.face.blush.style === st
                        ? 'bg-primary text-primary-foreground border-primary font-bold'
                        : 'bg-card text-muted-foreground border-border'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Blush Palette */}
              <div className="flex items-center gap-2">
                {SHADE_PALETTES.blush.map((bl) => (
                  <button
                    key={bl.label}
                    onClick={() =>
                      onChangeMakeup(m => ({
                        ...m,
                        face: { ...m.face, blush: { ...m.face.blush, color: bl.hex, enabled: true } },
                      }))
                    }
                    className={`w-7 h-7 rounded-full border-2 ${
                      makeup.face.blush.color === bl.hex ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'border-white/50'
                    }`}
                    style={{ background: bl.hex }}
                    title={bl.label}
                  />
                ))}
              </div>

              {/* Blush Intensity */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Blush Intensity</span>
                  <span className="font-mono text-xs">{Math.round(makeup.face.blush.intensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={makeup.face.blush.intensity}
                  onChange={(e) =>
                    onChangeMakeup(m => ({
                      ...m,
                      face: { ...m.face, blush: { ...m.face.blush, intensity: parseFloat(e.target.value) } },
                    }))
                  }
                  className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Highlighter */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">Cheekbone & Nose Highlighter</label>
                <input
                  type="checkbox"
                  checked={makeup.face.highlighter.enabled}
                  onChange={(e) =>
                    onChangeMakeup(m => ({
                      ...m,
                      face: { ...m.face, highlighter: { ...m.face.highlighter, enabled: e.target.checked } },
                    }))
                  }
                  className="w-4 h-4 rounded text-primary"
                />
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['champagne', 'rose-gold', 'pearl', 'bronze'] as HighlighterTone[]).map((tone) => (
                  <button
                    key={tone}
                    onClick={() =>
                      onChangeMakeup(m => ({
                        ...m,
                        face: { ...m.face, highlighter: { ...m.face.highlighter, tone, enabled: true } },
                      }))
                    }
                    className={`py-1.5 rounded-xl capitalize font-medium border ${
                      makeup.face.highlighter.tone === tone
                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                        : 'bg-card text-muted-foreground border-border'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HAIR TINT CATEGORY ── */}
        {activeCategory === 'hair' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div>
                <h4 className="text-sm font-bold text-foreground">Hair Color Tint Preview</h4>
                <p className="text-[11px] text-muted-foreground">Natural hair tone preview</p>
              </div>

              <input
                type="checkbox"
                checked={makeup.hair.enabled}
                onChange={(e) =>
                  onChangeMakeup(m => ({ ...m, hair: { ...m.hair, enabled: e.target.checked } }))
                }
                className="w-4 h-4 rounded text-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SHADE_PALETTES.hair.map((hr) => {
                const isSelected = makeup.hair.color === hr.hex;
                return (
                  <button
                    key={hr.label}
                    onClick={() =>
                      onChangeMakeup(m => ({ ...m, hair: { ...m.hair, color: hr.hex, enabled: true } }))
                    }
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 ${
                      isSelected ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full border border-white/30" style={{ background: hr.hex }} />
                    <span className="text-[10px] text-center font-medium leading-tight">{hr.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PRESET SIGNATURE LOOKS ── */}
        {activeCategory === 'looks' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-border/70">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Signature Beauty Looks</span>
              </h4>
              <p className="text-[11px] text-muted-foreground">Curated one-click bridal & party makeovers</p>
            </div>

            <div className="space-y-3">
              {PRESET_LOOKS.map((preset) => {
                const isActive = makeup.activePreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => onChangeMakeup(() => ({ ...preset.makeup, activePreset: preset.id }))}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 ${
                      isActive
                        ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/40'
                        : 'border-border/80 bg-card hover:bg-secondary/60 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-white/20 text-white font-bold"
                        style={{ background: preset.thumbnailColor }}
                      >
                        {isActive ? <Check className="w-5 h-5 text-white" /> : <Sparkles className="w-4 h-4 text-white/80" />}
                      </div>

                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                          {preset.name}
                        </h5>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {preset.subtitle}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-secondary text-foreground/80">
                      {preset.category}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 3D CAMERA & ANGLE SHORTCUTS (Only when in 3D Mode) ── */}
        {activeCategory === '3d' && mode === '3d-studio' && (
          <div className="space-y-5">
            <div className="pb-3 border-b border-border/70">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-500" />
                <span>3D Camera Views & Inspect</span>
              </h4>
              <p className="text-[11px] text-muted-foreground">Interactive OrbitControls view angles</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onSet3dAngle?.('front')}
                className="py-2 px-3 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                Front Portrait (0°)
              </button>

              <button
                onClick={() => onSet3dAngle?.('three-quarter-left')}
                className="py-2 px-3 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                3/4 Left (20°)
              </button>

              <button
                onClick={() => onSet3dAngle?.('three-quarter-right')}
                className="py-2 px-3 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                3/4 Right (20°)
              </button>

              <button
                onClick={() => onSet3dAngle?.('profile-left')}
                className="py-2 px-3 rounded-xl border border-border bg-card hover:bg-secondary text-foreground font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                Left Profile (45°)
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border/60">
              <button
                onClick={onReset3dCamera}
                className="px-3 py-2 rounded-xl border border-border/80 bg-secondary/80 hover:bg-secondary text-xs font-semibold flex items-center gap-1.5 text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Camera</span>
              </button>

              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWireframe}
                  onChange={(e) => onToggleWireframe?.(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span>Wireframe Mesh</span>
              </label>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
