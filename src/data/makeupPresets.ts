import { MakeupState } from '@/types/beautyStudio';

export const DEFAULT_MAKEUP_STATE: MakeupState = {
  lips: {
    enabled: true,
    color: '#B91C1C', // Royal Crimson Red
    finish: 'satin',
    intensity: 0.85,
    glossLevel: 0.4,
  },
  eyes: {
    eyeliner: {
      enabled: true,
      style: 'winged',
      color: '#0F172A',
      intensity: 0.9,
    },
    eyeshadow: {
      enabled: true,
      style: 'crease-gradient',
      primaryColor: '#D97706', // Warm Gold / Bronze
      secondaryColor: '#78350F', // Deep Terracotta
      intensity: 0.75,
      shimmer: 0.6,
    },
    lashes: {
      enabled: true,
      style: 'volume',
      intensity: 0.85,
    },
  },
  face: {
    blush: {
      enabled: true,
      style: 'apple',
      color: '#FB7185', // Rose Peach
      intensity: 0.6,
    },
    highlighter: {
      enabled: true,
      tone: 'champagne',
      intensity: 0.65,
    },
    foundation: {
      enabled: false,
      shade: '#E5C298',
      coverage: 0.5,
      undertone: 'warm',
    },
  },
  hair: {
    enabled: false,
    color: '#451A03',
    intensity: 0.5,
  },
  activePreset: 'royal-bridal',
};

export const PRESET_LOOKS = [
  {
    id: 'royal-bridal',
    name: 'Royal Indian Bridal',
    subtitle: 'Classic Crimson Lips, Gold Shimmer & Sculpted Wing',
    description: 'Luxurious crimson lips with golden shimmer eyeshadow, sculpted winged liner, and dewy champagne glow — the quintessential Indian bridal look.',
    category: 'bridal',
    previewShade: '#991B1B',
    preset: {
      lips: {
        enabled: true,
        color: '#991B1B',
        finish: 'satin',
        intensity: 0.9,
        glossLevel: 0.35,
      },
      eyes: {
        eyeliner: {
          enabled: true,
          style: 'winged',
          color: '#09090B',
          intensity: 0.95,
        },
        eyeshadow: {
          enabled: true,
          style: 'crease-gradient',
          primaryColor: '#D97706',
          secondaryColor: '#5B21B6',
          intensity: 0.8,
          shimmer: 0.75,
        },
        lashes: {
          enabled: true,
          style: 'glam',
          intensity: 0.9,
        },
      },
      face: {
        blush: {
          enabled: true,
          style: 'draped',
          color: '#F43F5E',
          intensity: 0.65,
        },
        highlighter: {
          enabled: true,
          tone: 'champagne',
          intensity: 0.75,
        },
        foundation: {
          enabled: true,
          shade: '#F3D2B5',
          coverage: 0.6,
          undertone: 'warm',
        },
      },
      hair: {
        enabled: false,
        color: '#262626',
        intensity: 0.5,
      },
      activePreset: 'royal-bridal',
    } as MakeupState,
  },
  {
    id: 'reception-glam',
    name: 'Celebrity Reception Glam',
    subtitle: 'Mauve Satin Lip, Smokey Plum Eyes & Golden Dew',
    description: 'Glamorous reception look with mauve satin lips, smokey plum eyes, and a radiant rose-gold highlighted glow for the star of the evening.',
    category: 'glamour',
    previewShade: '#831843',
    preset: {
      lips: {
        enabled: true,
        color: '#BE185D',
        finish: 'gloss',
        intensity: 0.8,
        glossLevel: 0.7,
      },
      eyes: {
        eyeliner: {
          enabled: true,
          style: 'cat-eye',
          color: '#18181B',
          intensity: 0.85,
        },
        eyeshadow: {
          enabled: true,
          style: 'smokey',
          primaryColor: '#831843',
          secondaryColor: '#1E1B4B',
          intensity: 0.75,
          shimmer: 0.5,
        },
        lashes: {
          enabled: true,
          style: 'flutter',
          intensity: 0.8,
        },
      },
      face: {
        blush: {
          enabled: true,
          style: 'sculpted',
          color: '#FB7185',
          intensity: 0.55,
        },
        highlighter: {
          enabled: true,
          tone: 'rose-gold',
          intensity: 0.8,
        },
        foundation: {
          enabled: false,
          shade: '#ECCCA2',
          coverage: 0.45,
          undertone: 'neutral',
        },
      },
      hair: {
        enabled: false,
        color: '#451A03',
        intensity: 0.4,
      },
      activePreset: 'reception-glam',
    } as MakeupState,
  },
  {
    id: 'dewy-day-glow',
    name: 'Dewy Day Glow',
    subtitle: 'Peachy Nude Lips, Clean Definition & Fresh Flush',
    description: 'Fresh, dewy complexion with peachy coral lips, soft golden wash eyeshadow, and luminous pearl highlighter — perfect for daytime events.',
    category: 'natural',
    previewShade: '#FB923C',
    preset: {
      lips: {
        enabled: true,
        color: '#E07A5F',
        finish: 'gloss',
        intensity: 0.7,
        glossLevel: 0.8,
      },
      eyes: {
        eyeliner: {
          enabled: true,
          style: 'tightline',
          color: '#422006',
          intensity: 0.6,
        },
        eyeshadow: {
          enabled: true,
          style: 'soft-wash',
          primaryColor: '#FBBF24',
          secondaryColor: '#D97706',
          intensity: 0.4,
          shimmer: 0.3,
        },
        lashes: {
          enabled: true,
          style: 'natural',
          intensity: 0.65,
        },
      },
      face: {
        blush: {
          enabled: true,
          style: 'apple',
          color: '#FDA4AF',
          intensity: 0.5,
        },
        highlighter: {
          enabled: true,
          tone: 'pearl',
          intensity: 0.6,
        },
        foundation: {
          enabled: false,
          shade: '#F8E0C9',
          coverage: 0.35,
          undertone: 'neutral',
        },
      },
      hair: {
        enabled: false,
        color: '#5C3D2E',
        intensity: 0.3,
      },
      activePreset: 'dewy-day-glow',
    } as MakeupState,
  },
  {
    id: 'cocktail-velvet',
    name: 'Cocktail Velvet Noir',
    subtitle: 'Deep Berry Matte, Bold Winged Eyes & Bronzed Glow',
    description: 'Bold velvet noir with deep berry matte lips, dramatic smokey plum eyes, and bronzed sculpted glow — made for cocktail evenings.',
    category: 'festive',
    previewShade: '#581C87',
    preset: {
      lips: {
        enabled: true,
        color: '#701A75',
        finish: 'matte',
        intensity: 0.95,
        glossLevel: 0.0,
      },
      eyes: {
        eyeliner: {
          enabled: true,
          style: 'bold',
          color: '#000000',
          intensity: 1.0,
        },
        eyeshadow: {
          enabled: true,
          style: 'smokey',
          primaryColor: '#581C87',
          secondaryColor: '#09090B',
          intensity: 0.85,
          shimmer: 0.4,
        },
        lashes: {
          enabled: true,
          style: 'glam',
          intensity: 0.95,
        },
      },
      face: {
        blush: {
          enabled: true,
          style: 'sculpted',
          color: '#E11D48',
          intensity: 0.7,
        },
        highlighter: {
          enabled: true,
          tone: 'bronze',
          intensity: 0.7,
        },
        foundation: {
          enabled: false,
          shade: '#E5C298',
          coverage: 0.5,
          undertone: 'warm',
        },
      },
      hair: {
        enabled: false,
        color: '#1C1917',
        intensity: 0.5,
      },
      activePreset: 'cocktail-velvet',
    } as MakeupState,
  },
];

export const SHADE_PALETTES = {
  lips: [
    { name: 'Royal Red', hex: '#B91C1C' },
    { name: 'Crimson Wine', hex: '#881337' },
    { name: 'Cherry Berry', hex: '#9F1239' },
    { name: 'Deep Plum', hex: '#701A75' },
    { name: 'Velvet Mauve', hex: '#9D174D' },
    { name: 'Blush Rose', hex: '#DB2777' },
    { name: 'Warm Nude', hex: '#C27C5C' },
    { name: 'Peach Coral', hex: '#E07A5F' },
    { name: 'Mocha Brown', hex: '#78350F' },
    { name: 'Toffee Caramel', hex: '#9A3412' },
  ],
  eyeshadow: [
    { name: 'Golden Radiance', hex: '#D97706' },
    { name: 'Champagne Shimmer', hex: '#FCD34D' },
    { name: 'Bronze Goddess', hex: '#B45309' },
    { name: 'Terracotta Rust', hex: '#9A3412' },
    { name: 'Royal Emerald', hex: '#047857' },
    { name: 'Midnight Plum', hex: '#581C87' },
    { name: 'Rose Gold', hex: '#F472B6' },
    { name: 'Charcoal Noir', hex: '#18181B' },
  ],
  eyeliner: [
    { name: 'Jet Black Kohl', hex: '#09090B' },
    { name: 'Deep Espresso', hex: '#3E2723' },
    { name: 'Midnight Navy', hex: '#1E1B4B' },
    { name: 'Forest Emerald', hex: '#064E3B' },
  ],
  blush: [
    { name: 'Rose Petal', hex: '#FB7185' },
    { name: 'Warm Coral', hex: '#FB923C' },
    { name: 'Sunset Terracotta', hex: '#EA580C' },
    { name: 'Dusty Berry', hex: '#BE185D' },
    { name: 'Soft Peach', hex: '#FDBA74' },
  ],
  foundation: [
    { name: 'Porcelain Ivory (Fair Warm)', hex: '#FCE7D2', undertone: 'warm' },
    { name: 'Almond Beige (Light Warm)', hex: '#F3D2B5', undertone: 'warm' },
    { name: 'Golden Sand (Medium Warm)', hex: '#E5C298', undertone: 'warm' },
    { name: 'Honey Caramel (Medium Olive)', hex: '#D7AE78', undertone: 'neutral' },
    { name: 'Warm Amber (Deep Warm)', hex: '#B88251', undertone: 'warm' },
    { name: 'Rich Chestnut (Deep Cool)', hex: '#8C5A37', undertone: 'cool' },
  ],
  hair: [
    { name: 'Espresso Black', hex: '#171717' },
    { name: 'Dark Chocolate', hex: '#3E2723' },
    { name: 'Warm Chestnut', hex: '#5C3D2E' },
    { name: 'Burgundy Wine', hex: '#4A0E17' },
    { name: 'Caramel Honey', hex: '#92400E' },
    { name: 'Auburn Copper', hex: '#9A3412' },
  ],
};
