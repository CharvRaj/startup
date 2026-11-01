import { supabase } from './supabase';
import { ALL_DOORSTEP_SERVICES, ServiceDetailItem } from '@/data/servicesData';

export interface CatalogService {
  id: string;
  name: string;
  category: string;
  displayCategory: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  durationMinutes: number;
  imageUrl: string;
  bannerUrls: string[];
  rating: number;
  reviewCount: number;
  available: boolean;
  inclusions: string[];
  steps?: { title: string; desc: string }[];
  preparationTips?: string[];
  isPopular?: boolean;
}

// Category normalization map
export const CATEGORY_MAP: Record<string, { label: string; image: string; tag: string }> = {
  'All': {
    label: 'All Services',
    image: '/images/larana-hero-portrait.png',
    tag: 'All',
  },
  'Face': {
    label: 'Facial & Clean-up',
    image: '/images/larana-facial-cleansing.png',
    tag: 'Facial & Clean-up',
  },
  'Facial & Clean-up': {
    label: 'Facial & Clean-up',
    image: '/images/larana-facial-cleansing.png',
    tag: 'Facial & Clean-up',
  },
  'Facial Rituals': {
    label: 'Facial & Clean-up',
    image: '/images/larana-facial-cleansing.png',
    tag: 'Facial & Clean-up',
  },
  'Waxing': {
    label: 'Waxing & Threading',
    image: '/images/category-waxing.jpg',
    tag: 'Waxing & Threading',
  },
  'Waxing & Threading': {
    label: 'Waxing & Threading',
    image: '/images/category-waxing.jpg',
    tag: 'Waxing & Threading',
  },
  'Hair': {
    label: 'Hair Care & Styling',
    image: '/images/service-hair.png',
    tag: 'Hair Care & Styling',
  },
  'Hair Care': {
    label: 'Hair Care & Styling',
    image: '/images/service-hair.png',
    tag: 'Hair Care & Styling',
  },
  'Hair & Styling': {
    label: 'Hair Care & Styling',
    image: '/images/service-hair.png',
    tag: 'Hair Care & Styling',
  },
  'Makeup': {
    label: 'Makeup & Bridal',
    image: '/images/category-bridal.jpg',
    tag: 'Makeup & Bridal',
  },
  'Bridal Artistry': {
    label: 'Makeup & Bridal',
    image: '/images/category-bridal.jpg',
    tag: 'Makeup & Bridal',
  },
  'Bridal Beauty': {
    label: 'Makeup & Bridal',
    image: '/images/category-bridal.jpg',
    tag: 'Makeup & Bridal',
  },
  'Nails': {
    label: 'Manicure & Pedicure',
    image: '/images/category-nails.jpg',
    tag: 'Manicure & Pedicure',
  },
  'Nail Care': {
    label: 'Manicure & Pedicure',
    image: '/images/category-nails.jpg',
    tag: 'Manicure & Pedicure',
  },
  'Massage': {
    label: 'Massage & Spa',
    image: '/images/larana-relaxing-spa.png',
    tag: 'Massage & Spa',
  },
  'Skin Care': {
    label: 'Skin Care & Detan',
    image: '/images/larana-glow-refresh.png',
    tag: 'Skin Care & Detan',
  },
  'Skin Glow & Detan': {
    label: 'Skin Care & Detan',
    image: '/images/larana-glow-refresh.png',
    tag: 'Skin Care & Detan',
  },
};

export const DISPLAY_CATEGORIES = [
  { id: 'all', label: 'All Services', image: '/images/larana-hero-flower.jpg', count: 35 },
  { id: 'facial', label: 'Facial & Clean-up', image: '/images/larana-promo-facial.jpg', filterTag: 'Facial & Clean-up' },
  { id: 'waxing', label: 'Waxing', image: '/images/larana-cat-waxing.jpg', filterTag: 'Waxing & Threading' },
  { id: 'hair-care', label: 'Hair Care', image: '/images/larana-promo-hair.jpg', filterTag: 'Hair Care & Styling' },
  { id: 'hair-styling', label: 'Hair Styling', image: '/images/service-hair.png', filterTag: 'Hair Care & Styling' },
  { id: 'makeup', label: 'Makeup', image: '/images/service-face.png', filterTag: 'Makeup & Bridal' },
  { id: 'nails', label: 'Manicure & Pedicure', image: '/images/larana-promo-nails.jpg', filterTag: 'Manicure & Pedicure' },
  { id: 'massage', label: 'Massage', image: '/images/larana-cat-massage.jpg', filterTag: 'Massage & Spa' },
  { id: 'skincare', label: 'Skin Care', image: '/images/larana-glow-refresh.png', filterTag: 'Skin Care & Detan' },
];

/**
 * Assign appropriate realistic photography based on treatment keywords
 */
export function getServiceImage(name: string, category: string): { image: string; banners: string[] } {
  const n = name.toLowerCase();
  const c = category.toLowerCase();

  if (n.includes('bridal') || n.includes('bride')) {
    return {
      image: '/images/larana-bridal-art.jpg',
      banners: ['/images/larana-bridal-art.jpg', '/images/category-bridal.jpg', '/images/larana-hero-flower.jpg'],
    };
  }
  if (n.includes('party makeup') || n.includes('engagement') || c.includes('makeup')) {
    return {
      image: '/images/service-face.png',
      banners: ['/images/service-face.png', '/images/larana-bridal-art.jpg', '/images/banner-appointment.png'],
    };
  }
  if (n.includes('threading') || n.includes('eyebrow') || n.includes('upper lip') || n.includes('forehead')) {
    return {
      image: '/images/service-face.png',
      banners: ['/images/service-face.png', '/images/larana-facial-cleansing.png', '/images/larana-hero-flower.jpg'],
    };
  }
  if (n.includes('cleanup') || n.includes('clean-up') || n.includes('fruit facial')) {
    return {
      image: '/images/larana-promo-facial.jpg',
      banners: ['/images/larana-promo-facial.jpg', '/images/larana-facial-cleansing.png', '/images/service-face.png'],
    };
  }
  if (n.includes('gold facial') || n.includes('hydra') || c.includes('facial') || n.includes('facial')) {
    return {
      image: '/images/larana-promo-facial.jpg',
      banners: ['/images/larana-promo-facial.jpg', '/images/larana-facial-cleansing.png', '/images/larana-glow-refresh.png'],
    };
  }
  if (n.includes('wax') || c.includes('waxing')) {
    return {
      image: '/images/larana-cat-waxing.jpg',
      banners: ['/images/larana-cat-waxing.jpg', '/images/category-waxing.jpg', '/images/banner-relaxing.png'],
    };
  }
  if (n.includes('keratin') || n.includes('spa') && (c.includes('hair') || n.includes('hair'))) {
    return {
      image: '/images/larana-promo-hair.jpg',
      banners: ['/images/larana-promo-hair.jpg', '/images/larana-hair-moments.png', '/images/service-hair.png'],
    };
  }
  if (c.includes('hair') || n.includes('hair') || n.includes('blow dry') || n.includes('straightening')) {
    return {
      image: '/images/service-hair.png',
      banners: ['/images/service-hair.png', '/images/larana-promo-hair.jpg', '/images/banner-service.png'],
    };
  }
  if (n.includes('pedicure') || n.includes('manicure') || n.includes('nail') || c.includes('nail')) {
    return {
      image: '/images/larana-promo-nails.jpg',
      banners: ['/images/larana-promo-nails.jpg', '/images/category-nails.jpg', '/images/banner-sunscreen.png'],
    };
  }
  if (n.includes('massage') || c.includes('massage') || n.includes('head massage') || n.includes('body')) {
    return {
      image: '/images/larana-cat-massage.jpg',
      banners: ['/images/larana-cat-massage.jpg', '/images/larana-relaxing-spa.png', '/images/larana-spa-massage.png'],
    };
  }
  if (n.includes('detan') || n.includes('de-tan') || c.includes('skin')) {
    return {
      image: '/images/larana-glow-refresh.png',
      banners: ['/images/larana-glow-refresh.png', '/images/service-skincare.png', '/images/banner-neutral.png'],
    };
  }

  return {
    image: '/images/larana-glow-refresh.png',
    banners: ['/images/larana-glow-refresh.png', '/images/service-facial.png', '/images/banner-appointment.png'],
  };
}

/**
 * Get inclusions list for service
 */
function getInclusions(name: string, category: string): string[] {
  const n = name.toLowerCase();
  if (n.includes('threading')) {
    return [
      'Organic 100% antibacterial cotton thread',
      'Gentle skin powder & oil-absorption prep',
      'High-precision brow / facial contouring',
      'Soothing mint & aloe cooling astringent',
    ];
  }
  if (n.includes('facial') || n.includes('cleanup')) {
    return [
      'Double cleanse with botanical cleansing balm',
      'Ultrasonic pore skin-scrubber extraction',
      'Antioxidant botanical face mask application',
      'Rose quartz lymphatic facial roller massage',
      'Single-use sealed sanitization toolkit guarantee',
    ];
  }
  if (n.includes('wax')) {
    return [
      'Pre-wax skin antiseptic & oil absorbing prep',
      'Single-dip disposable wooden spatula guarantee',
      'Hypoallergenic Rica or honey aloe wax',
      'Post-wax calming chamomile oil soothe',
    ];
  }
  if (n.includes('hair')) {
    return [
      'Sulfate-free scalp clarifying wash & prep',
      'Deep nourishing keratin protein restoration balm',
      'Warm ozone steam bath therapy',
      'Moroccan argan oil shine serum finish',
    ];
  }
  if (n.includes('pedicure') || n.includes('manicure') || n.includes('nail')) {
    return [
      'Single-use disposable sterilized tub liner',
      'Warm therapeutic crystal jelly aromatherapy soak',
      'Dead skin callus buffing & cuticle care',
      'Shea butter reflexology massage & nail lacquer',
    ];
  }
  if (n.includes('massage')) {
    return [
      'Pure essential aromatherapy oil blends',
      'Deep tissue & Swedish tension release techniques',
      'Acupressure point therapy for stress relief',
      'Single-use sanitised linen & disposable wipes',
    ];
  }
  if (n.includes('makeup')) {
    return [
      'Skin-prep hydrating serum & pore-blurring base',
      'International HD cosmetics (MAC / Huda / Charlotte Tilbury)',
      'Waterproof, tear-resistant 16-hour lock',
      'Complimentary touch-up kit sample',
    ];
  }
  return [
    'Certified aesthetician with sanitized toolkit',
    'Dermatologically approved salon formulation',
    'Post-treatment care & glow recommendations',
  ];
}

/**
 * Fetch and merge ALL services from Supabase doorstep_services table with fallback
 */
export async function fetchAllCatalogServices(): Promise<CatalogService[]> {
  try {
    const { data, error } = await supabase
      .from('doorstep_services')
      .select('*')
      .eq('available', true)
      .order('price', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((item: any, idx: number) => {
        const rawCat = item.category || 'Face';
        const displayCat = CATEGORY_MAP[rawCat]?.label || rawCat;
        const imgObj = item.image_url
          ? { image: item.image_url, banners: [item.image_url] }
          : getServiceImage(item.name, rawCat);

        const price = Number(item.price) || 299;
        const originalPrice = item.original_price || (price > 100 ? Math.round(price * 1.3) : undefined);
        const discountPercent = originalPrice
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : undefined;

        // Sensible popular picks
        const isPopular = [
          'Hydra-Infusion',
          'Bridal',
          'Keratin',
          'Gold Facial',
          'Full Body Massage',
          'Pedicure',
          'Full Arms Waxing',
          'Party Makeup',
        ].some(k => item.name.toLowerCase().includes(k.toLowerCase())) || idx < 6;

        return {
          id: item.id,
          name: item.name,
          category: rawCat,
          displayCategory: displayCat,
          description: item.description || `Professional ${item.name} treatment delivered with sterile tools and verified aestheticians.`,
          price,
          originalPrice,
          discountPercent,
          durationMinutes: item.duration_minutes || (price < 100 ? 15 : price < 500 ? 30 : price < 1500 ? 60 : 90),
          imageUrl: imgObj.image,
          bannerUrls: imgObj.banners,
          rating: item.rating || 4.8 + ((idx % 3) * 0.1),
          reviewCount: item.review_count || (450 + (idx * 65)),
          available: item.available !== false,
          inclusions: item.inclusions || getInclusions(item.name, rawCat),
          isPopular,
        };
      });
    }
  } catch (err) {
    console.warn('Supabase doorstep_services fetch failed, using fallback services:', err);
  }

  // Fallback from ALL_DOORSTEP_SERVICES
  return ALL_DOORSTEP_SERVICES.map((s, idx) => {
    const displayCat = CATEGORY_MAP[s.category]?.label || s.category;
    const imgObj = s.image_url
      ? { image: s.image_url, banners: s.banner_urls || [s.image_url] }
      : getServiceImage(s.name, s.category);

    return {
      id: s.id,
      name: s.name,
      category: s.category,
      displayCategory: displayCat,
      description: s.description,
      price: s.price,
      originalPrice: s.original_price,
      discountPercent: s.discount_percent,
      durationMinutes: s.duration_minutes,
      imageUrl: imgObj.image,
      bannerUrls: imgObj.banners,
      rating: s.rating,
      reviewCount: s.review_count,
      available: s.available,
      inclusions: s.inclusions || getInclusions(s.name, s.category),
      steps: s.steps,
      preparationTips: s.preparationTips,
      isPopular: idx < 6,
    };
  });
}
