import { supabase } from './supabase';

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaLink?: string;
  status: 'active' | 'inactive';
  startAt?: string;
  endAt?: string;
  displayOrder: number;
  badge?: string;
  createdAt: string;
  updatedAt: string;
}

export const PRESET_BANNER_IMAGES = [
  { label: '✨ Glow & Refresh Facial', url: '/images/larana-glow-refresh.png' },
  { label: '💇 Hair Care Moments', url: '/images/larana-hair-moments.png' },
  { label: '💅 Nail Art & Care', url: '/images/larana-nail-art.png' },
  { label: '🌿 Relaxing Spa & Stones', url: '/images/larana-relaxing-spa.png' },
  { label: '🕯️ Swedish Massage & Care', url: '/images/larana-spa-massage.png' },
  { label: '🧖‍♀️ Deep Pore Cleansing', url: '/images/larana-facial-cleansing.png' },
  { label: '👰 Luxe Bridal Glow', url: '/images/category-bridal.jpg' },
  { label: '🌸 Radiant Natural Beauty', url: '/images/larana-hero-portrait.png' },
];

export const DEFAULT_PROMOTIONAL_BANNERS: PromotionalBanner[] = [
  {
    id: 'banner-glow-refresh',
    title: 'Glow & Refresh Ritual',
    subtitle: 'Deep pore hydra-infusion & calming rose quartz massage by certified aestheticians.',
    badge: 'Glow & Refresh',
    imageUrl: '/images/larana-glow-refresh.png',
    ctaLabel: 'Explore Facials',
    ctaLink: '/doorstep-service?category=Face',
    status: 'active',
    displayOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'banner-hair-moments',
    title: 'Hair Care Moments',
    subtitle: 'Organic keratin nourishment mask, warm ozone steam bath & mirror-shine blowout.',
    badge: 'Hair Care Moments',
    imageUrl: '/images/larana-hair-moments.png',
    ctaLabel: 'Book Hair Spa',
    ctaLink: '/doorstep-service?category=Hair',
    status: 'active',
    displayOrder: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'banner-nail-care',
    title: 'Nail Art & Care',
    subtitle: 'Therapeutic lavender jelly pedicure, callus peel treatment & chip-resistant lacquer.',
    badge: 'Nail Art & Care',
    imageUrl: '/images/larana-nail-art.png',
    ctaLabel: 'View Nail Services',
    ctaLink: '/doorstep-service?category=Nails',
    status: 'active',
    displayOrder: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const LOCAL_STORAGE_KEY = 'larana_promotional_banners_v2';

export function getLocalBanners(): PromotionalBanner[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_PROMOTIONAL_BANNERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_PROMOTIONAL_BANNERS;
  } catch {
    return DEFAULT_PROMOTIONAL_BANNERS;
  }
}

export function saveLocalBanners(banners: PromotionalBanner[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(banners));
    window.dispatchEvent(new CustomEvent('larana-banners-updated'));
  } catch (e) {
    console.error('Failed to save banners locally:', e);
  }
}

/**
 * Customer facing: fetch active banners within validity dates sorted by displayOrder
 */
export async function fetchActivePromotionalBanners(): Promise<PromotionalBanner[]> {
  try {
    // Attempt Supabase fetch if table exists
    const { data, error } = await supabase
      .from('promotional_banners')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      const now = new Date();
      return data
        .map((row: any) => ({
          id: row.id,
          title: row.title,
          subtitle: row.subtitle || row.description || '',
          imageUrl: row.image_url || row.imageUrl,
          ctaLabel: row.cta_label || row.ctaLabel,
          ctaLink: row.cta_link || row.ctaLink,
          status: row.status,
          startAt: row.start_at || row.startAt,
          endAt: row.end_at || row.endAt,
          displayOrder: row.display_order ?? row.displayOrder ?? 1,
          badge: row.badge,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }))
        .filter((b: PromotionalBanner) => {
          if (b.status !== 'active') return false;
          if (b.startAt && new Date(b.startAt) > now) return false;
          if (b.endAt && new Date(b.endAt) < now) return false;
          return true;
        });
    }
  } catch {
    // fallback to local storage
  }

  const all = getLocalBanners();
  const now = new Date();
  return all
    .filter(b => {
      if (b.status !== 'active') return false;
      if (b.startAt && new Date(b.startAt) > now) return false;
      if (b.endAt && new Date(b.endAt) < now) return false;
      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Admin facing: fetch all banners
 */
export async function fetchAllAdminBanners(): Promise<PromotionalBanner[]> {
  try {
    const { data, error } = await supabase
      .from('promotional_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((row: any) => ({
        id: row.id,
        title: row.title,
        subtitle: row.subtitle || row.description || '',
        imageUrl: row.image_url || row.imageUrl,
        ctaLabel: row.cta_label || row.ctaLabel,
        ctaLink: row.cta_link || row.ctaLink,
        status: row.status,
        startAt: row.start_at || row.startAt,
        endAt: row.end_at || row.endAt,
        displayOrder: row.display_order ?? row.displayOrder ?? 1,
        badge: row.badge,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    }
  } catch {
    // fallback
  }

  return getLocalBanners().sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Admin: Add new promotional banner
 */
export async function createPromotionalBanner(data: {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaLink?: string;
  status: 'active' | 'inactive';
  startAt?: string;
  endAt?: string;
  displayOrder?: number;
  badge?: string;
}): Promise<PromotionalBanner> {
  const all = getLocalBanners();
  const maxOrder = all.reduce((max, b) => Math.max(max, b.displayOrder || 0), 0);
  const nowIso = new Date().toISOString();

  const newBanner: PromotionalBanner = {
    id: `banner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: data.title.trim(),
    subtitle: data.subtitle.trim(),
    imageUrl: data.imageUrl.trim() || '/images/larana-glow-refresh.png',
    ctaLabel: data.ctaLabel?.trim() || 'Book Now',
    ctaLink: data.ctaLink?.trim() || '/doorstep-service',
    status: data.status,
    startAt: data.startAt || undefined,
    endAt: data.endAt || undefined,
    displayOrder: data.displayOrder ?? maxOrder + 1,
    badge: data.badge?.trim() || 'Special Offer',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const updated = [...all, newBanner];
  saveLocalBanners(updated);

  try {
    await supabase.from('promotional_banners').insert([{
      id: newBanner.id,
      title: newBanner.title,
      subtitle: newBanner.subtitle,
      image_url: newBanner.imageUrl,
      cta_label: newBanner.ctaLabel,
      cta_link: newBanner.ctaLink,
      status: newBanner.status,
      start_at: newBanner.startAt,
      end_at: newBanner.endAt,
      display_order: newBanner.displayOrder,
      badge: newBanner.badge,
    }]);
  } catch {
    // local already saved
  }

  return newBanner;
}

/**
 * Admin: Edit an existing banner
 */
export async function updatePromotionalBanner(
  id: string,
  updates: Partial<Omit<PromotionalBanner, 'id' | 'createdAt'>>
): Promise<PromotionalBanner> {
  const all = getLocalBanners();
  const idx = all.findIndex(b => b.id === id);
  if (idx === -1) throw new Error('Banner not found');

  const updatedBanner: PromotionalBanner = {
    ...all[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  all[idx] = updatedBanner;
  saveLocalBanners(all);

  try {
    await supabase.from('promotional_banners').update({
      title: updatedBanner.title,
      subtitle: updatedBanner.subtitle,
      image_url: updatedBanner.imageUrl,
      cta_label: updatedBanner.ctaLabel,
      cta_link: updatedBanner.ctaLink,
      status: updatedBanner.status,
      start_at: updatedBanner.startAt,
      end_at: updatedBanner.endAt,
      display_order: updatedBanner.displayOrder,
      badge: updatedBanner.badge,
      updated_at: updatedBanner.updatedAt,
    }).eq('id', id);
  } catch {
    // fallback
  }

  return updatedBanner;
}

/**
 * Admin: Delete banner
 */
export async function deletePromotionalBanner(id: string): Promise<void> {
  const all = getLocalBanners();
  const filtered = all.filter(b => b.id !== id);
  saveLocalBanners(filtered);

  try {
    await supabase.from('promotional_banners').delete().eq('id', id);
  } catch {
    // fallback
  }
}

/**
 * Admin: Toggle active/inactive
 */
export async function toggleBannerStatus(id: string): Promise<PromotionalBanner> {
  const all = getLocalBanners();
  const idx = all.findIndex(b => b.id === id);
  if (idx === -1) throw new Error('Banner not found');

  const newStatus = all[idx].status === 'active' ? 'inactive' : 'active';
  return updatePromotionalBanner(id, { status: newStatus });
}

/**
 * Admin: Move banner order up or down
 */
export async function moveBannerOrder(id: string, direction: 'up' | 'down'): Promise<PromotionalBanner[]> {
  const all = getLocalBanners().sort((a, b) => a.displayOrder - b.displayOrder);
  const idx = all.findIndex(b => b.id === id);
  if (idx === -1) return all;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= all.length) return all;

  const temp = all[idx].displayOrder;
  all[idx].displayOrder = all[targetIdx].displayOrder;
  all[targetIdx].displayOrder = temp;

  saveLocalBanners(all);
  return all.sort((a, b) => a.displayOrder - b.displayOrder);
}
