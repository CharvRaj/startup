import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Check, Palette, RotateCcw, ZoomIn, X, Sparkles, SlidersHorizontal, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLookStore } from '../store/lookStore';
import { DEFAULT_LOOK, type SectionKey, type Finish, type LinerStyle, type ShadowStyle, type BlushStyle } from '../lib/types';
import * as P from '../lib/presets';

/* ═══════════════════════════════════════════════════════════════════════════
   9 BEAUTY CATEGORIES WITH REALISTIC PHOTOS & DESCRIPTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

export type CategoryId =
  | 'lips'
  | 'eyes'
  | 'eyebrows'
  | 'face'
  | 'cheeks'
  | 'nose'
  | 'contour'
  | 'hair'
  | 'looks';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  image: string;
  headline: string;
  description: string;
  areaFocus: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'lips',
    label: 'Lips',
    image: '/images/studio-categories/lips.jpg',
    headline: 'Couture Lip Artistry & Finishes',
    description: 'Precision mapping for Cupid’s bow, vermilion border and volume contours with satin, velvet matte and crystal gloss finishes.',
    areaFocus: 'Cupid’s bow, upper & lower lip contours, corner commissures',
  },
  {
    id: 'eyes',
    label: 'Eyes',
    image: '/images/studio-categories/eyes.jpg',
    headline: 'Precision Eye Shimmer & Liner',
    description: 'Winged cat-eyes, smoky gradient lids, dual-rim kajal and dramatic lash lashline enhancements.',
    areaFocus: 'Upper & lower eyelid lashlines, orbital crease, outer wing angle',
  },
  {
    id: 'eyebrows',
    label: 'Eyebrows',
    image: '/images/studio-categories/eyebrows.jpg',
    headline: 'Sculpted Brow Architecture',
    description: 'Individual micro-stroke definition, ombre powder fills and clean arch lifting calibrated to your brow bone.',
    areaFocus: 'Supraorbital ridge, brow head, arch apex and tapered tail',
  },
  {
    id: 'face',
    label: 'Face',
    image: '/images/studio-categories/face.jpg',
    headline: 'Complexion Perfecting Base',
    description: 'Skin tone balancing, pore-smoothing primers and weightless velvet foundation tailored for Indian golden and warm undertones.',
    areaFocus: 'Full facial oval, forehead, T-zone and jawline blending',
  },
  {
    id: 'cheeks',
    label: 'Cheeks',
    image: '/images/studio-categories/cheeks.jpg',
    headline: 'Radiant Silk Blush & Bloom',
    description: 'Apple-glow softness or sculpted cheekbone lifts with micro-milled peach, rose and berry pigments.',
    areaFocus: 'Zygomatic cheek apples and diagonal cheekbone elevation',
  },
  {
    id: 'nose',
    label: 'Nose',
    image: '/images/studio-categories/nose.jpg',
    headline: 'Nose Contour & Strobe Light',
    description: 'Subtle lateral bridge slimming contours and micro-dot tip highlighter for dimension and symmetry.',
    areaFocus: 'Dorsal nasal bridge, lateral sidewalls and supra-tip button',
  },
  {
    id: 'contour',
    label: 'Contour',
    image: '/images/studio-categories/contour.jpg',
    headline: 'Volumetric Sculpt & Strobe',
    description: 'Deep cheekbone hollows, jawline chiseling and radiant 24K gold temple strobing.',
    areaFocus: 'Sub-zygomatic hollow, mandibular jawline and temple peaks',
  },
  {
    id: 'hair',
    label: 'Hair',
    image: '/images/studio-categories/hair.jpg',
    headline: 'Salon Gloss & Highlights',
    description: 'Neural hair strand segmentation previewing rich chestnut, warm caramel and burgundy reflects.',
    areaFocus: 'Hairline strands, crown volume and face-framing waves',
  },
  {
    id: 'looks',
    label: 'Looks',
    image: '/images/studio-categories/looks.jpg',
    headline: 'Complete Couture Signature Sets',
    description: 'One-tap harmonized bridal, festive, cocktail and everyday glam ensembles designed by celebrity makeup artists.',
    areaFocus: 'Full face harmony across lips, eyes, cheeks and contour',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT DEFINITIONS
   ═══════════════════════════════════════════════════════════════════════════ */

export interface FinishOption {
  id: string;
  label: string;
  badge?: string;
}

export interface ProductConfig {
  id: string;
  name: string;
  engineKey: SectionKey;
  subCategory: string;
  swatches: P.Swatch[];
  finishes?: FinishOption[];
  finishKey?: string;
  defaultFinish?: { key: string; value: string };
  defaultIntensity?: number;
  note?: string;
  previewBadge?: string;
}

/* ───────────────────── Curated Swatches ───────────────────── */
const LIP_TINT_SWATCHES: P.Swatch[] = [
  { name: 'Cherry Stain', color: '#B31336' },
  { name: 'Peach Dew', color: '#F78A70' },
  { name: 'Rosewater', color: '#D45D79' },
  { name: 'Mulberry', color: '#801A45' },
  { name: 'Warm Honey', color: '#BA6D5C' },
  { name: 'Apricot Silk', color: '#EA8A6C' },
];

const LIP_LINER_SWATCHES: P.Swatch[] = [
  { name: 'Velvet Nude', color: '#A06152' },
  { name: 'Spiced Rose', color: '#B04B63' },
  { name: 'Deep Crimson', color: '#911027' },
  { name: 'Chocolate Mauve', color: '#6E3A3B' },
  { name: 'Rich Plum', color: '#4E1D3B' },
  { name: 'Chestnut', color: '#5C2D1F' },
];

const KAJAL_SWATCHES: P.Swatch[] = [
  { name: 'Midnight Kohl', color: '#0A0A0A' },
  { name: 'Smoky Charcoal', color: '#2B2B30' },
  { name: 'Espresso Brown', color: '#362118' },
  { name: 'Royal Sapphire', color: '#142045' },
];

const GLITTER_SWATCHES: P.Swatch[] = [
  { name: '24K Gold Dust', color: '#E5B842' },
  { name: 'Rose Gold Shimmer', color: '#D48882' },
  { name: 'Champagne Sparkle', color: '#E8D4B0' },
  { name: 'Bronze Glaze', color: '#B57342' },
  { name: 'Diamond Hologram', color: '#E6DEEB' },
];

const BROW_SWATCHES: P.Swatch[] = [
  { name: 'Soft Charcoal', color: '#242022' },
  { name: 'Dark Brunette', color: '#382218' },
  { name: 'Warm Chestnut', color: '#563322' },
  { name: 'Ash Brown', color: '#68584E' },
  { name: 'Golden Taupe', color: '#886E56' },
];

const CONCEALER_SWATCHES: P.Swatch[] = [
  { name: 'Fair Porcelain', color: '#F6DFCC' },
  { name: 'Light Almond', color: '#EFC9A8' },
  { name: 'Warm Wheatish', color: '#DFAC82' },
  { name: 'Rich Caramel', color: '#C08658' },
  { name: 'Deep Amber', color: '#966038' },
  { name: 'Warm Espresso', color: '#683F23' },
];

const COLOR_CORRECTOR_SWATCHES: P.Swatch[] = [
  { name: 'Peach (Dark Circles)', color: '#F8A882' },
  { name: 'Orange (Deep Pigment)', color: '#EE763B' },
  { name: 'Mint Green (Redness)', color: '#9FD4B4' },
  { name: 'Lavender (Dullness)', color: '#C8B0D8' },
];

const BRONZER_SWATCHES: P.Swatch[] = [
  { name: 'Golden Sun', color: '#C78C56' },
  { name: 'Terracotta Glow', color: '#BA6E47' },
  { name: 'Warm Cocoa', color: '#975B37' },
  { name: 'Deep Bronze', color: '#7E492B' },
];

const NOSE_CONTOUR_SWATCHES: P.Swatch[] = [
  { name: 'Cool Shadow', color: '#8F7568' },
  { name: 'Soft Clay', color: '#A58372' },
  { name: 'Warm Almond', color: '#B8927D' },
  { name: 'Deep Sculpt', color: '#735043' },
];

const CONTOUR_SWATCHES: P.Swatch[] = [
  { name: 'Cool Chisel', color: '#8A7062' },
  { name: 'Warm Mocha', color: '#7A523E' },
  { name: 'Golden Bronze', color: '#9E6845' },
  { name: 'Deep Espresso', color: '#5E3826' },
];

/* ───────────────────── Products by Category ───────────────────── */
export const CATEGORY_PRODUCTS: Record<Exclude<CategoryId, 'looks'>, ProductConfig[]> = {
  lips: [
    {
      id: 'lipstick',
      name: 'Lipstick',
      engineKey: 'lips',
      subCategory: 'Couture Pigments',
      swatches: P.LIP_SWATCHES,
      finishKey: 'finish',
      finishes: [
        { id: 'matte', label: 'Velvet Matte' },
        { id: 'satin', label: 'Silk Satin' },
        { id: 'glossy', label: 'Crystal Gloss' },
      ],
      note: 'Dermatologically tested micro-pigments with all-day comfortable wear.',
    },
    {
      id: 'lip-gloss',
      name: 'Lip Gloss',
      engineKey: 'lips',
      subCategory: 'Glass Mirror Sheen',
      defaultFinish: { key: 'finish', value: 'glossy' },
      swatches: P.LIP_SWATCHES,
      note: 'Infused with hydrating botanical oils for ultra-plumping light refraction.',
    },
    {
      id: 'lip-liner',
      name: 'Lip Liner',
      engineKey: 'lips',
      subCategory: 'Contour Precision',
      defaultFinish: { key: 'finish', value: 'matte' },
      swatches: LIP_LINER_SWATCHES,
      note: 'Defines Cupid’s bow and prevents feathering with velvety contour precision.',
    },
    {
      id: 'lip-tint',
      name: 'Lip Tint',
      engineKey: 'lips',
      subCategory: 'Water-Light Flush',
      defaultFinish: { key: 'finish', value: 'satin' },
      swatches: LIP_TINT_SWATCHES,
      defaultIntensity: 50,
      note: 'Bespoke weightless tint that stains lips with natural just-kissed freshness.',
    },
    {
      id: 'lip-balm',
      name: 'Lip Balm',
      engineKey: 'lips',
      subCategory: 'Nourishing Tint',
      defaultFinish: { key: 'finish', value: 'glossy' },
      swatches: [
        { name: 'Sheer Rose', color: '#E8A3B2' },
        { name: 'Peach Sorbet', color: '#F6B49D' },
        { name: 'Berry Glaze', color: '#C0667C' },
        { name: 'Honey Glow', color: '#D99B77' },
      ],
      defaultIntensity: 35,
      note: 'Ultra-sheer dewy hydration for everyday effortless elegance.',
    },
    {
      id: 'lip-stain',
      name: 'Lip Stain',
      engineKey: 'lips',
      subCategory: 'Transfer-Proof Color',
      defaultFinish: { key: 'finish', value: 'matte' },
      swatches: LIP_TINT_SWATCHES,
      defaultIntensity: 75,
      note: 'Long-lasting transfer-proof color that stays vivid through every celebration.',
    },
  ],

  eyes: [
    {
      id: 'eyeshadow',
      name: 'Eyeshadow',
      engineKey: 'eyeshadow',
      subCategory: 'Silky Duochrome Lid Art',
      swatches: P.SHADOW_SWATCHES,
      finishKey: 'style',
      finishes: [
        { id: 'wash', label: 'Soft Wash' },
        { id: 'smoky', label: 'Smoky Dimension' },
      ],
      note: 'Seamless blending from lid to brow bone calibrated to Indian eye contours.',
    },
    {
      id: 'eyeliner',
      name: 'Eyeliner',
      engineKey: 'eyeliner',
      subCategory: 'Graphic Definition',
      swatches: P.LINER_SWATCHES,
      finishKey: 'style',
      finishes: [
        { id: 'classic', label: 'Classic Fine' },
        { id: 'winged', label: 'Winged Drama' },
        { id: 'bold', label: 'Bold Cat Eye' },
        { id: 'smudged', label: 'Smoky Blend' },
      ],
      note: 'Precision fluid ink stroke with waterproof 24hr stay.',
    },
    {
      id: 'kajal',
      name: 'Kajal',
      engineKey: 'eyeliner',
      subCategory: 'Heritage Waterline Kohl',
      defaultFinish: { key: 'style', value: 'lower' },
      swatches: KAJAL_SWATCHES,
      defaultIntensity: 85,
      note: 'Deep mineral black kohl for the waterline, giving classic Indian bridal intensity.',
    },
    {
      id: 'mascara',
      name: 'Mascara',
      engineKey: 'eyeliner',
      subCategory: 'Panoramic Volume & Curl',
      defaultFinish: { key: 'style', value: 'bold' },
      swatches: [
        { name: 'Carbon Black', color: '#0A0A0A' },
        { name: 'Dark Chocolate', color: '#2D1E16' },
        { name: 'Midnight Blue', color: '#11182D' },
      ],
      defaultIntensity: 80,
      note: 'Lifts, separates and extends lashes for wide-awake magnetic eyes.',
    },
    {
      id: 'false-eyelashes',
      name: 'False Eyelashes',
      engineKey: 'eyeliner',
      subCategory: 'Dimensional 3D Faux Mink',
      defaultFinish: { key: 'style', value: 'winged' },
      swatches: [
        { name: 'Natural Flutter', color: '#141414' },
        { name: 'Glamour Wispy', color: '#0A0A0A' },
        { name: 'Bridal Volume', color: '#000000' },
      ],
      defaultIntensity: 90,
      note: 'Featherlight 3D lash band adding breathtaking bridal drama.',
    },
    {
      id: 'eye-glitter',
      name: 'Eye Glitter',
      engineKey: 'eyeshadow',
      subCategory: 'Prism Shimmer Dust',
      defaultFinish: { key: 'style', value: 'wash' },
      swatches: GLITTER_SWATCHES,
      defaultIntensity: 70,
      note: 'Micro-crystalline reflects catching the light with jewel-like radiance.',
    },
  ],

  eyebrows: [
    {
      id: 'brow-pencil',
      name: 'Brow Pencil',
      engineKey: 'eyebrows',
      subCategory: 'Micro-Blade Hair Strokes',
      swatches: BROW_SWATCHES,
      defaultIntensity: 65,
      note: 'Ultra-fine hair-like precision strokes to sculpt and shape the natural arch.',
    },
    {
      id: 'brow-powder',
      name: 'Brow Powder',
      engineKey: 'eyebrows',
      subCategory: 'Soft Ombre Shading',
      swatches: BROW_SWATCHES,
      defaultIntensity: 50,
      note: 'Velvety shadow fill for soft, feathered, natural-looking fullness.',
    },
    {
      id: 'brow-gel',
      name: 'Brow Gel',
      engineKey: 'eyebrows',
      subCategory: 'Lamination Tint & Hold',
      swatches: BROW_SWATCHES,
      defaultIntensity: 60,
      note: 'Tames, lifts and locks brow hairs in place with a polished feathery finish.',
    },
    {
      id: 'brow-pomade',
      name: 'Brow Pomade',
      engineKey: 'eyebrows',
      subCategory: 'Sculpted Dramatic Arch',
      swatches: BROW_SWATCHES,
      defaultIntensity: 80,
      note: 'High-pigment waterproof pomade for bold, clean-cut couture brows.',
    },
  ],

  face: [
    {
      id: 'primer',
      name: 'Primer',
      engineKey: 'foundation',
      subCategory: 'Canvas Smoothing Base',
      swatches: [
        { name: 'Silk Glow', color: '#FDF1E6' },
        { name: 'Poreless Matte', color: '#EFE1D2' },
        { name: 'Dewy Hydration', color: '#F6E6DA' },
      ],
      defaultIntensity: 25,
      note: 'Preps skin for flawless 12-hour makeup wear with velvety light diffusion.',
    },
    {
      id: 'foundation',
      name: 'Foundation',
      engineKey: 'foundation',
      subCategory: 'Second-Skin Fluid Silk',
      swatches: P.FOUNDATION_SWATCHES,
      defaultIntensity: 45,
      previewBadge: 'Tone Sync',
      note: 'Calibrated across warm, neutral and golden undertones for Indian complexions.',
    },
    {
      id: 'concealer',
      name: 'Concealer',
      engineKey: 'foundation',
      subCategory: 'High-Coverage Camouflage',
      swatches: CONCEALER_SWATCHES,
      defaultIntensity: 55,
      note: 'Brightens under-eye shadows and blurs imperfections without creasing.',
    },
    {
      id: 'color-corrector',
      name: 'Color Corrector',
      engineKey: 'foundation',
      subCategory: 'Neutralizing Pigments',
      swatches: COLOR_CORRECTOR_SWATCHES,
      defaultIntensity: 35,
      note: 'Cancels hyperpigmentation and undertone discoloration before base application.',
    },
    {
      id: 'compact-powder',
      name: 'Compact Powder',
      engineKey: 'foundation',
      subCategory: 'Velvet Soft-Focus Touchup',
      swatches: P.FOUNDATION_SWATCHES,
      defaultIntensity: 35,
      note: 'Sets foundation and controls T-zone shine while keeping skin luminous.',
    },
    {
      id: 'loose-powder',
      name: 'Loose Powder',
      engineKey: 'foundation',
      subCategory: 'Baking & Blurring Strobe',
      swatches: [
        { name: 'Translucent Light', color: '#FBF5EE' },
        { name: 'Banana Bright', color: '#F9ECC7' },
        { name: 'Warm Medium', color: '#DEC7AE' },
      ],
      defaultIntensity: 30,
      note: 'Micro-fine milling for photography-ready poreless airbrush finish.',
    },
    {
      id: 'setting-spray',
      name: 'Setting Spray',
      engineKey: 'foundation',
      subCategory: '24H Hydro-Lock Mist',
      swatches: [
        { name: 'Dewy Radiance', color: '#F4FAFE' },
        { name: 'Matte Lock', color: '#FAF4ED' },
      ],
      defaultIntensity: 20,
      note: 'Fuses makeup layers into a natural transfer-resistant skin finish.',
    },
  ],

  cheeks: [
    {
      id: 'powder-blush',
      name: 'Powder Blush',
      engineKey: 'blush',
      subCategory: 'Silk Micro-Milled Bloom',
      swatches: P.BLUSH_SWATCHES,
      finishKey: 'style',
      finishes: [
        { id: 'apple', label: 'Apple Glow' },
        { id: 'sculpt', label: 'Sculpted Lift' },
      ],
      defaultIntensity: 45,
      note: 'Soft, buildable color wash that illuminates cheek apples with fresh youth.',
    },
    {
      id: 'cream-blush',
      name: 'Cream Blush',
      engineKey: 'blush',
      subCategory: 'Dewy Melt-in Flush',
      defaultFinish: { key: 'style', value: 'apple' },
      swatches: P.BLUSH_SWATCHES,
      defaultIntensity: 50,
      note: 'Melts with body warmth for a radiant dewy flush that looks like natural blood flow.',
    },
    {
      id: 'liquid-blush',
      name: 'Liquid Blush',
      engineKey: 'blush',
      subCategory: 'Watercolour Radiance',
      defaultFinish: { key: 'style', value: 'apple' },
      swatches: [
        { name: 'Petal Pink', color: '#EE8AA0' },
        { name: 'Coral Pop', color: '#E86E58' },
        { name: 'Berry Crush', color: '#A83B58' },
        { name: 'Spiced Rose', color: '#C0596E' },
      ],
      defaultIntensity: 55,
      note: 'Ultra-pigmented serum drops for vibrant, long-lasting glass skin cheeks.',
    },
    {
      id: 'cheek-tint',
      name: 'Cheek Tint',
      engineKey: 'blush',
      subCategory: 'All-Day Stain',
      defaultFinish: { key: 'style', value: 'apple' },
      swatches: [
        { name: 'Peach Bloom', color: '#EFA086' },
        { name: 'Rose Petal', color: '#DA657F' },
        { name: 'Crimson Drop', color: '#BC2846' },
      ],
      defaultIntensity: 45,
      note: 'Weightless stain that stays put through sweat and humidity.',
    },
    {
      id: 'bronzer',
      name: 'Bronzer',
      engineKey: 'blush',
      subCategory: 'Sun-Kissed Warmth',
      defaultFinish: { key: 'style', value: 'sculpt' },
      swatches: BRONZER_SWATCHES,
      defaultIntensity: 40,
      note: 'Brings sun-bathed golden warmth to the high points of the face.',
    },
    {
      id: 'highlighter',
      name: 'Highlighter',
      engineKey: 'highlighter',
      subCategory: 'Prism Strobe Glow',
      swatches: P.HIGHLIGHT_SWATCHES,
      defaultIntensity: 50,
      note: 'Reflective pearl pigments that sculpt high cheekbones with candlelit glow.',
    },
  ],

  nose: [
    {
      id: 'nose-contour',
      name: 'Nose Contour',
      engineKey: 'nose',
      subCategory: 'Bridge Symmetry & Slimming',
      swatches: NOSE_CONTOUR_SWATCHES,
      defaultIntensity: 45,
      note: 'Shadows the lateral nasal bridge to create clean, sharp, symmetrical definition.',
    },
    {
      id: 'nose-highlight',
      name: 'Nose Highlight',
      engineKey: 'highlighter',
      subCategory: 'Dorsal Strobe Beam',
      swatches: P.HIGHLIGHT_SWATCHES,
      defaultIntensity: 45,
      note: 'Draws a fine luminous light beam down the center of the nose bridge and tip button.',
    },
    {
      id: 'nose-blush',
      name: 'Nose Blush',
      engineKey: 'blush',
      subCategory: 'Sunkissed Bridge Wash',
      defaultFinish: { key: 'style', value: 'apple' },
      swatches: [
        { name: 'Sheer Peach', color: '#F4A28A' },
        { name: 'Warm Rose', color: '#E1788E' },
        { name: 'Terracotta', color: '#C86B52' },
      ],
      defaultIntensity: 30,
      note: 'Gentle blush across the bridge for a youthful, sun-dappled festival aesthetic.',
    },
  ],

  contour: [
    {
      id: 'cheekbone-contour',
      name: 'Cheekbone Contour',
      engineKey: 'contour',
      subCategory: 'Sub-Zygomatic Sculpt',
      swatches: CONTOUR_SWATCHES,
      defaultIntensity: 55,
      note: 'Hollows the lower cheek area right under the bone for a high-fashion snatched look.',
    },
    {
      id: 'jawline-contour',
      name: 'Jawline Contour',
      engineKey: 'contour',
      subCategory: 'Mandibular Chiseling',
      swatches: CONTOUR_SWATCHES,
      defaultIntensity: 50,
      note: 'Sharpens the jawline boundary and eliminates shadows under the chin.',
    },
    {
      id: 'forehead-contour',
      name: 'Forehead Contour',
      engineKey: 'contour',
      subCategory: 'Temple & Hairline Depth',
      swatches: CONTOUR_SWATCHES,
      defaultIntensity: 40,
      note: 'Softly frames the upper forehead and temples to balance facial proportions.',
    },
    {
      id: 'nose-contour-full',
      name: 'Nose Contour',
      engineKey: 'nose',
      subCategory: 'Dorsal Slimming Lines',
      swatches: NOSE_CONTOUR_SWATCHES,
      defaultIntensity: 45,
      note: 'Dual-stripe lateral bridge sculpting for precision nose alignment.',
    },
    {
      id: 'face-highlight',
      name: 'Face Highlight',
      engineKey: 'highlighter',
      subCategory: 'High-Plane Strobe Points',
      swatches: P.HIGHLIGHT_SWATCHES,
      defaultIntensity: 50,
      note: 'Illuminates cheekbones, brow bones, Cupid’s bow, and chin tip.',
    },
  ],

  hair: [
    {
      id: 'hair-color',
      name: 'Hair Color',
      engineKey: 'hair',
      subCategory: 'Root-to-Tip Couture Shade',
      swatches: P.HAIR_SWATCHES,
      defaultIntensity: 65,
      previewBadge: 'Photo Only',
      note: 'Neural hair strand detection. Works best on clear front-facing portrait photos.',
    },
    {
      id: 'hair-highlights',
      name: 'Hair Highlights',
      engineKey: 'hair',
      subCategory: 'Balayage & Babylights',
      swatches: [
        { name: 'Honey Balayage', color: '#B98B4B' },
        { name: 'Caramel Melt', color: '#C49A6C' },
        { name: 'Mocha Highlights', color: '#6A4432' },
        { name: 'Burgundy Streaks', color: '#6A1B35' },
        { name: 'Platinum Ash', color: '#B8A88A' },
      ],
      defaultIntensity: 55,
      previewBadge: 'Photo Only',
      note: 'Multidimensional hair reflection simulating salon balayage lights.',
    },
    {
      id: 'hair-styles',
      name: 'Hair Styles',
      engineKey: 'hair',
      subCategory: 'Texture & Volume Gloss',
      swatches: P.HAIR_SWATCHES,
      defaultIntensity: 50,
      previewBadge: 'Photo Only',
      note: 'Enhances hair glossiness and shine reflection across curls and straight locks.',
    },
  ],
};

/* ───────────────────── Finish visual indicator ───────────────────── */
function getFinishBackground(engineKey: SectionKey, finishId: string, color: string) {
  if (engineKey === 'lips') {
    if (finishId === 'glossy') {
      return `radial-gradient(circle at 35% 30%, #ffffff 0%, ${color} 65%)`;
    }
    if (finishId === 'satin') {
      return `linear-gradient(135deg, ${color} 0%, #ffffff55 50%, ${color} 100%)`;
    }
    return color; // matte
  }
  if (engineKey === 'eyeshadow' && finishId === 'smoky') {
    return `radial-gradient(circle, ${color} 0%, #151515 90%)`;
  }
  return color;
}

const isSameColor = (a?: string, b?: string) =>
  a && b && a.toLowerCase() === b.toLowerCase();

/* ═══════════════════════════════════════════════════════════════════════════
   PRE-CURATED SIGNATURE LOOKS PANEL
   ═══════════════════════════════════════════════════════════════════════════ */
function SignatureLooks() {
  const apply = useLookStore((s) => s.applyLook);

  const curatedLooks = [
    {
      id: 'natural',
      name: 'Natural Everyday',
      badge: 'Soft Dewy Glow',
      icon: '🌿',
      tagline: 'Fresh peach silk blush, champagne bridge glow and satin nude lips.',
      look: {
        ...DEFAULT_LOOK,
        blush: { enabled: true, color: '#F2A08A', style: 'apple' as BlushStyle, intensity: 40 },
        highlighter: { enabled: true, color: '#F7E3C2', intensity: 35 },
        lips: { enabled: true, color: '#B77A6A', finish: 'satin' as Finish, intensity: 55 },
        eyebrows: { enabled: true, color: '#563322', intensity: 50 },
        foundation: { enabled: true, color: '#E3B894', intensity: 30 },
      },
    },
    {
      id: 'bridal',
      name: 'Royal Bridal Red',
      badge: 'Heritage Wedding',
      icon: '👑',
      tagline: 'Winged cat-eye liner, 24K gold shimmer lids, sculpted contour and classic crimson velvet lips.',
      look: {
        ...DEFAULT_LOOK,
        eyeshadow: { enabled: true, color: '#C9877A', style: 'wash' as ShadowStyle, intensity: 65 },
        eyeliner: { enabled: true, color: '#1A1416', style: 'winged' as LinerStyle, intensity: 85 },
        blush: { enabled: true, color: '#E2788C', style: 'sculpt' as BlushStyle, intensity: 55 },
        highlighter: { enabled: true, color: '#F2D08A', intensity: 55 },
        lips: { enabled: true, color: '#B3122F', finish: 'satin' as Finish, intensity: 85 },
        eyebrows: { enabled: true, color: '#382218', intensity: 75 },
        contour: { enabled: true, color: '#7A523E', intensity: 55 },
        nose: { enabled: true, color: '#8F7568', intensity: 50 },
        foundation: { enabled: true, color: '#E3B894', intensity: 45 },
      },
    },
    {
      id: 'party',
      name: 'Festive Sunset Party',
      badge: 'Evening Cocktail',
      icon: '🎉',
      tagline: 'Rosy coral cheeks, dual-rim midnight kajal and crystal gloss mauve lip artistry.',
      look: {
        ...DEFAULT_LOOK,
        eyeshadow: { enabled: true, color: '#D8B98A', style: 'wash' as ShadowStyle, intensity: 55 },
        eyeliner: { enabled: true, color: '#1A1416', style: 'classic' as LinerStyle, intensity: 70 },
        blush: { enabled: true, color: '#EE7B62', style: 'apple' as BlushStyle, intensity: 50 },
        highlighter: { enabled: true, color: '#FFF3EA', intensity: 55 },
        lips: { enabled: true, color: '#A5617B', finish: 'glossy' as Finish, intensity: 70 },
        eyebrows: { enabled: true, color: '#563322', intensity: 60 },
        contour: { enabled: true, color: '#9E6845', intensity: 45 },
      },
    },
    {
      id: 'glam',
      name: 'Midnight Runway Glam',
      badge: 'Sultry High-Fashion',
      icon: '🌙',
      tagline: 'Charcoal smoky lids, bold micro-wings, sculpted cheek hollows and velvet deep plum lips.',
      look: {
        ...DEFAULT_LOOK,
        eyeshadow: { enabled: true, color: '#3A3A40', style: 'smoky' as ShadowStyle, intensity: 80 },
        eyeliner: { enabled: true, color: '#1A1416', style: 'bold' as LinerStyle, intensity: 85 },
        blush: { enabled: true, color: '#B74A63', style: 'sculpt' as BlushStyle, intensity: 40 },
        highlighter: { enabled: true, color: '#F7E3C2', intensity: 50 },
        lips: { enabled: true, color: '#5E2B4F', finish: 'matte' as Finish, intensity: 80 },
        eyebrows: { enabled: true, color: '#242022', intensity: 75 },
        contour: { enabled: true, color: '#5E3826', intensity: 65 },
        nose: { enabled: true, color: '#735043', intensity: 50 },
      },
    },
    {
      id: 'korean',
      name: 'Korean Glass Skin',
      badge: 'K-Beauty Dew',
      icon: '🌸',
      tagline: 'Ultra-dewy highlighters, gradient water-tint strawberry lips and natural feathery brows.',
      look: {
        ...DEFAULT_LOOK,
        blush: { enabled: true, color: '#F4A7B9', style: 'apple' as BlushStyle, intensity: 35 },
        highlighter: { enabled: true, color: '#FFF3EA', intensity: 65 },
        lips: { enabled: true, color: '#E91E63', finish: 'glossy' as Finish, intensity: 50 },
        eyebrows: { enabled: true, color: '#886E56', intensity: 40 },
        foundation: { enabled: true, color: '#F3D7C0', intensity: 35 },
      },
    },
    {
      id: 'editorial',
      name: 'Avant-Garde Editorial',
      badge: 'Artistic Statement',
      icon: '📸',
      tagline: 'Navy blue shadow wash, high-voltage gold temple strobing and rich terracotta matte lips.',
      look: {
        ...DEFAULT_LOOK,
        eyeshadow: { enabled: true, color: '#243A6B', style: 'smoky' as ShadowStyle, intensity: 75 },
        eyeliner: { enabled: true, color: '#1A1416', style: 'classic' as LinerStyle, intensity: 65 },
        blush: { enabled: true, color: '#B74A63', style: 'sculpt' as BlushStyle, intensity: 45 },
        highlighter: { enabled: true, color: '#F2D08A', intensity: 60 },
        lips: { enabled: true, color: '#8E3B2E', finish: 'matte' as Finish, intensity: 85 },
        eyebrows: { enabled: true, color: '#382218', intensity: 70 },
        contour: { enabled: true, color: '#8A7062', intensity: 60 },
      },
    },
  ];

  return (
    <div className="space-y-3.5">
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/25 flex items-center gap-2.5">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-xs text-foreground/90 leading-relaxed">
          <strong>1-Tap Signature Makeovers:</strong> Tap any couture palette below to instantly apply the full harmonized look to the face, then fine-tune any individual product.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {curatedLooks.map((look) => (
          <button
            key={look.id}
            type="button"
            onClick={() => apply(look.look)}
            className="group relative flex flex-col p-4 rounded-2xl border border-border/80 bg-card/95 hover:border-[#C83E68]/50 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl group-hover:scale-110 transition-transform">{look.icon}</span>
                <span className="font-bold text-sm text-foreground">{look.name}</span>
              </div>
              <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                {look.badge}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
              {look.tagline}
            </p>

            {/* Harmonized palette dots */}
            <div className="mt-auto flex items-center gap-1.5 pt-2 border-t border-border/60">
              <span className="text-[10px] text-muted-foreground mr-1 font-medium">Palette:</span>
              {[
                look.look.lips.color,
                look.look.eyeshadow.color,
                look.look.blush.color,
                look.look.highlighter.color,
              ].map((c, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full border border-white/70 shadow-xs ring-1 ring-black/10"
                  style={{ background: c }}
                />
              ))}
              <span className="text-[10px] text-primary font-semibold ml-auto group-hover:underline">
                Apply Look →
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN MAKEUP PANELS COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export function MakeupPanels({
  hairDisabledReason,
  faceReady,
}: {
  hairDisabledReason?: string;
  faceReady: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('lips');
  const [activeProductId, setActiveProductId] = useState<string>('lipstick');

  const look = useLookStore((s) => s.look);
  const update = useLookStore((s) => s.update) as (k: SectionKey, p: any) => void;

  // Active category info
  const currentCategoryInfo = useMemo(
    () => CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0],
    [activeCategory]
  );

  // Products in current category
  const products = useMemo(() => {
    if (activeCategory === 'looks') return [];
    return CATEGORY_PRODUCTS[activeCategory] || [];
  }, [activeCategory]);

  // Active product config
  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === activeProductId) || products[0];
  }, [products, activeProductId]);

  // When switching category, ensure activeProductId points to a valid product in that category
  const handleSelectCategory = (catId: CategoryId) => {
    setActiveCategory(catId);
    if (catId !== 'looks') {
      const firstProd = CATEGORY_PRODUCTS[catId]?.[0];
      if (firstProd) {
        setActiveProductId(firstProd.id);
      }
    }
  };

  // Check if a category has active makeup applied
  const isCategoryActive = useCallback(
    (catId: CategoryId): boolean => {
      if (catId === 'looks') return false;
      const prods = CATEGORY_PRODUCTS[catId];
      if (!prods) return false;
      return prods.some((p) => {
        const sec = look[p.engineKey];
        return sec && (sec as any).enabled;
      });
    },
    [look]
  );

  // Current engine section data for the active product
  const currentSection = activeProduct ? (look[activeProduct.engineKey] as any) : null;
  const isEnabled = currentSection ? !!currentSection.enabled : false;
  const currentColor = currentSection ? currentSection.color : '#000000';
  const currentIntensity = currentSection ? currentSection.intensity : 50;

  // Swatch matching
  const currentSwatch = useMemo(() => {
    if (!activeProduct) return { name: 'Custom Shade', color: currentColor };
    return (
      activeProduct.swatches.find((s) => isSameColor(s.color, currentColor)) || {
        name: 'Custom Shade',
        color: currentColor,
      }
    );
  }, [activeProduct, currentColor]);

  // Handlers for active product customization
  const handleToggleProduct = (enabled: boolean) => {
    if (!activeProduct) return;
    const patch: any = { enabled };
    if (enabled && activeProduct.defaultFinish) {
      patch[activeProduct.defaultFinish.key] = activeProduct.defaultFinish.value;
    }
    update(activeProduct.engineKey, patch);
  };

  const handleSelectColor = (color: string) => {
    if (!activeProduct) return;
    const patch: any = { color, enabled: true };
    if (activeProduct.defaultFinish) {
      patch[activeProduct.defaultFinish.key] = activeProduct.defaultFinish.value;
    }
    update(activeProduct.engineKey, patch);
  };

  const handleSelectFinish = (finishId: string) => {
    if (!activeProduct || !activeProduct.finishKey) return;
    update(activeProduct.engineKey, {
      [activeProduct.finishKey]: finishId,
      enabled: true,
    });
  };

  const handleSetIntensity = (intensity: number) => {
    if (!activeProduct) return;
    update(activeProduct.engineKey, { intensity, enabled: true });
  };

  const handleResetProduct = () => {
    if (!activeProduct) return;
    update(activeProduct.engineKey, { enabled: false });
  };

  const isHairDisabled = activeProduct?.engineKey === 'hair' && !!hairDisabledReason;

  const categoryRowRef = useRef<HTMLDivElement>(null);

  const scrollCategoryRow = (dir: 'left' | 'right') => {
    if (categoryRowRef.current) {
      categoryRowRef.current.scrollBy({
        left: dir === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ══════════════════════════════════════════════════════════════════════
          1. CATEGORY NAVIGATION: IN-LINE ROW (NO SCROLLBAR / NO SLIDER)
          ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Select Makeup Category
          </span>
          <div className="flex items-center gap-1.5">
            {isCategoryActive(activeCategory) && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mr-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            )}
            <button
              type="button"
              onClick={() => scrollCategoryRow('left')}
              aria-label="Scroll categories left"
              className="p-1 rounded-full border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-foreground bg-card shadow-2xs hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollCategoryRow('right')}
              aria-label="Scroll categories right"
              className="p-1 rounded-full border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-foreground bg-card shadow-2xs hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* In-Line Row of Categories (Clean flex line, no scrollbar or slider) */}
        <div
          ref={categoryRowRef}
          role="tablist"
          aria-label="Makeup Categories"
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const hasApplied = isCategoryActive(cat.id);

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                id={`cat-tab-${cat.id}`}
                aria-selected={isSelected}
                aria-controls={`cat-panel-${cat.id}`}
                onClick={() => handleSelectCategory(cat.id)}
                className={cn(
                  'group flex flex-col items-center gap-1.5 p-1.5 rounded-2xl transition-all duration-200 border text-center relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary shrink-0 w-[64px] sm:w-[68px]',
                  isSelected
                    ? 'bg-card border-[#C83E68] shadow-md ring-2 ring-[#C83E68]/30 scale-105'
                    : 'bg-card/80 border-border/70 hover:border-[#C83E68]/40 hover:bg-card hover:scale-102'
                )}
              >
                {/* Photo Thumbnail */}
                <div className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-xl overflow-hidden shadow-2xs border border-border/60">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {hasApplied && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-[11px] font-semibold tracking-tight truncate w-full text-center leading-tight',
                    isSelected ? 'text-[#C83E68] font-bold' : 'text-foreground'
                  )}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. CATEGORY CONTENT & PRODUCT CUSTOMIZATION WORKFLOW
          ══════════════════════════════════════════════════════════════════════ */}
      {activeCategory === 'looks' ? (
        <SignatureLooks />
      ) : (
        <div className="space-y-4">
          {/* Category Header with Current Category Avatar & Product Count */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card/80 border border-border/70 shadow-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentCategoryInfo.image}
                alt={currentCategoryInfo.label}
                className="w-10 h-10 rounded-xl object-cover border border-primary/20 shadow-xs"
              />
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  {currentCategoryInfo.label} Artistry
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {products.length} Products Available · Choose product below to customize
                </p>
              </div>
            </div>
          </div>

          {/* Product Selector Pills */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              {currentCategoryInfo.label} Products
            </div>
            <div className="flex flex-wrap gap-2">
              {products.map((p) => {
                const isSelected = p.id === activeProductId;
                const isProdActive = (look[p.engineKey] as any)?.enabled;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveProductId(p.id)}
                    className={cn(
                      'relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border',
                      isSelected
                        ? 'border-[#C83E68] bg-[#C83E68] text-white shadow-xs font-bold'
                        : 'border-border/80 bg-card text-foreground hover:bg-muted/70 hover:border-border'
                    )}
                  >
                    <span>{p.name}</span>
                    {isProdActive && (
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full shadow-xs',
                          isSelected ? 'bg-white' : 'bg-emerald-500'
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Product Customization Card */}
          {activeProduct && currentSection && (
            <div className="rounded-2xl border border-border/80 bg-card/95 p-4 sm:p-5 shadow-sm space-y-4">
              {/* Product Header & Toggle Switch */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white dark:border-zinc-800 shadow-sm ring-1 ring-black/10 shrink-0"
                    style={{
                      background: getFinishBackground(
                        activeProduct.engineKey,
                        currentSection.finish || currentSection.style || '',
                        currentColor
                      ),
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white/50 shadow-xs" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-foreground">
                        {activeProduct.name}
                      </h4>
                      {activeProduct.previewBadge && (
                        <Badge variant="secondary" className="text-[9px] py-0 px-1.5">
                          {activeProduct.previewBadge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {activeProduct.subCategory}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isEnabled && !isHairDisabled ? 'Applied' : 'Disabled'}
                  </span>
                  <Switch
                    checked={isEnabled && !isHairDisabled}
                    disabled={isHairDisabled}
                    onCheckedChange={handleToggleProduct}
                    aria-label={`Toggle ${activeProduct.name}`}
                  />
                </div>
              </div>

              {isHairDisabled && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{hairDisabledReason}</span>
                </div>
              )}

              {/* Selected Shade Callout & Depth Summary */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-6 h-6 rounded-full border border-white shadow-xs shrink-0"
                    style={{ background: currentColor }}
                  />
                  <div>
                    <span className="font-bold text-xs text-foreground block">
                      {currentSwatch.name}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground">
                      {currentSection.finish || currentSection.style || 'Couture'} · Intensity: {currentIntensity}%
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetProduct}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-destructive px-2 py-1 rounded-lg hover:bg-destructive/5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Style & Finish Selection (If applicable) */}
              {activeProduct.finishes && activeProduct.finishKey && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Style & Finish
                  </div>
                  <div role="radiogroup" aria-label="Style and finish options" className="flex flex-wrap gap-2">
                    {activeProduct.finishes.map((f) => {
                      const isCurrent = currentSection[activeProduct.finishKey!] === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          role="radio"
                          aria-checked={isCurrent}
                          onClick={() => handleSelectFinish(f.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                            isCurrent
                              ? 'border-[#C83E68] bg-[#C83E68] text-white shadow-xs'
                              : 'border-border bg-background hover:bg-muted text-foreground'
                          )}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                            style={{
                              background: getFinishBackground(
                                activeProduct.engineKey,
                                f.id,
                                currentColor
                              ),
                            }}
                          />
                          <span>{f.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Shade Selection Color Swatches Grid */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  <span>Select Shade ({activeProduct.swatches.length} Tones)</span>
                  <span className="text-primary font-semibold">{currentSwatch.name}</span>
                </div>

                <div
                  role="radiogroup"
                  aria-label={`${activeProduct.name} shades`}
                  className="grid grid-cols-4 sm:grid-cols-6 gap-2"
                >
                  {activeProduct.swatches.map((s) => {
                    const isSelected = isSameColor(currentColor, s.color);
                    return (
                      <button
                        key={s.color}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={s.name}
                        onClick={() => handleSelectColor(s.color)}
                        className={cn(
                          'group flex flex-col items-center p-2 rounded-xl border transition-all text-center',
                          isSelected
                            ? 'border-[#C83E68] bg-rose-500/10 shadow-xs ring-2 ring-[#C83E68]/30 scale-102'
                            : 'border-border/70 bg-card hover:border-border hover:bg-muted/50'
                        )}
                      >
                        <div
                          className="relative w-8 h-8 rounded-full shadow-sm border-2 border-white dark:border-zinc-800 ring-1 ring-black/10 flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{ background: s.color }}
                        >
                          {isSelected && (
                            <Check className="w-4 h-4 text-white drop-shadow stroke-[3]" />
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-foreground mt-1.5 truncate w-full text-center">
                          {s.name}
                        </span>
                      </button>
                    );
                  })}

                  {/* Custom Color Wheel */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-border/80 hover:border-primary/50 text-center transition-colors">
                    <label
                      htmlFor={`custom-${activeProduct.id}`}
                      className="relative w-8 h-8 rounded-full cursor-pointer flex items-center justify-center bg-gradient-to-tr from-rose-500 via-amber-400 to-indigo-500 shadow-sm hover:scale-105 transition-transform"
                      title="Choose custom shade"
                    >
                      <Palette className="w-4 h-4 text-white drop-shadow" />
                      <input
                        id={`custom-${activeProduct.id}`}
                        type="color"
                        value={currentColor}
                        onChange={(e) => handleSelectColor(e.target.value)}
                        className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                      />
                    </label>
                    <span className="text-[10px] text-muted-foreground mt-1.5 truncate w-full text-center">
                      Custom
                    </span>
                  </div>
                </div>
              </div>

              {/* Intensity & Opacity Controls */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                    Intensity & Opacity
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: 'Soft', val: 30 },
                      { label: 'Natural', val: 60 },
                      { label: 'Glam', val: 90 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handleSetIntensity(chip.val)}
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors',
                          currentIntensity === chip.val
                            ? 'border-primary bg-primary text-white shadow-xs'
                            : 'border-border/70 text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {chip.label}
                      </button>
                    ))}
                    <span className="font-bold text-primary text-xs ml-1 tabular-nums">
                      {currentIntensity}%
                    </span>
                  </div>
                </div>

                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[currentIntensity]}
                  onValueChange={([v]) => handleSetIntensity(v)}
                  className="cursor-pointer"
                />
              </div>

              {activeProduct.note && (
                <p className="text-[11px] text-muted-foreground/80 italic pt-1 border-t border-border/40">
                  ✦ {activeProduct.note}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MakeupPanels;
