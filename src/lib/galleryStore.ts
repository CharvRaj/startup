import { supabase } from '@/lib/supabase';

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  storage_path?: string;
  display_order: number;
  created_at?: string;
}

export const DEFAULT_GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'satguru-b1',
    url: '/images/bridal-gallery/bridal-1.jpg',
    title: 'Royal Velvet Crimson Glam',
    subtitle: 'Handcrafted Kundan, Matha Patti & Statement Kaleere',
    display_order: 1,
  },
  {
    id: 'satguru-b2',
    url: '/images/bridal-gallery/bridal-2.jpg',
    title: 'Heritage Maroon & Pastel Zari Lehenga',
    subtitle: 'Regal Bridal Silhouette with Sheer Dupatta Draping',
    display_order: 2,
  },
  {
    id: 'satguru-b3',
    url: '/images/bridal-gallery/bridal-3.jpg',
    title: 'Vibrant Vermilion Bridal Shringar',
    subtitle: 'Mint Polki Choker & Traditional Rajasthani Gold Nath',
    display_order: 3,
  },
  {
    id: 'satguru-b4',
    url: '/images/bridal-gallery/bridal-4.jpg',
    title: 'Deep Wine Zardosi Splendor',
    subtitle: 'Intricate Dual Dupatta & Antique Kundan Craftsmanship',
    display_order: 4,
  },
  {
    id: 'satguru-b5',
    url: '/images/bridal-gallery/bridal-5.jpg',
    title: 'Regal Emerald & Kundan Fusion',
    subtitle: 'Velvet Bridal Draping with Cascading Chooda & Gold Kaleere',
    display_order: 5,
  },
  {
    id: 'satguru-b6',
    url: '/images/bridal-gallery/bridal-6.jpg',
    title: 'Classic Rajasthani Royal Bride',
    subtitle: 'Traditional Matha Patti & Velvet Bridal Draping',
    display_order: 6,
  },
  {
    id: 'satguru-b7',
    url: '/images/bridal-gallery/bridal-7.jpg',
    title: 'Ethereal Side-Profile Velvet Veil',
    subtitle: 'Delicate Floral Border & HD Airbrush Soft Glam',
    display_order: 7,
  },
  {
    id: 'satguru-b8',
    url: '/images/bridal-gallery/bridal-8.jpg',
    title: 'Traditional Red & Gold Perfection',
    subtitle: 'Embroidered Royal Waistband & Luminous Matte Finish',
    display_order: 8,
  },
  {
    id: 'satguru-b9',
    url: '/images/bridal-gallery/bridal-9.jpg',
    title: 'Grand Emerald Mala & Velvet Veil',
    subtitle: 'Luminous Glow with Sculpted Contour & Velvety Berry Lips',
    display_order: 9,
  },
  {
    id: 'satguru-b10',
    url: '/images/bridal-gallery/bridal-10.jpg',
    title: 'The Royal Trio Bridal Glam',
    subtitle: 'Harmonious Crimson, Maroon & Pastel Bridal Ensembles',
    display_order: 10,
  },
  {
    id: 'satguru-b11',
    url: '/images/bridal-gallery/bridal-11.jpg',
    title: 'Velvet Veil Heritage Portrait',
    subtitle: 'Smokey Kohl Eye Art, Gold Nath & Maang Tikka Shringar',
    display_order: 11,
  },
  {
    id: 'satguru-b12',
    url: '/images/bridal-gallery/bridal-12.jpg',
    title: 'Sunset Crimson & Peach Velvet Lehenga',
    subtitle: 'Exquisite Dual Veil Draping & Heritage Jewelry',
    display_order: 12,
  },
  {
    id: 'satguru-b13',
    url: '/images/bridal-gallery/bridal-13.jpg',
    title: 'Magenta Velvet & Baby Pink Dupatta',
    subtitle: 'Traditional Heavy Gota Patti & Handcrafted Jewelry',
    display_order: 13,
  },
  {
    id: 'satguru-b14',
    url: '/images/bridal-gallery/bridal-14.jpg',
    title: 'Double Royal Celebration',
    subtitle: 'Twinned in Heritage Red & Wine Bridal Grandeur',
    display_order: 14,
  },
  {
    id: 'satguru-b15',
    url: '/images/bridal-gallery/bridal-15.jpg',
    title: 'Floral Sanctuary Bridal Grace',
    subtitle: 'Deep Wine Lehenga with Statement Gold Nath & Chooda',
    display_order: 15,
  },
  {
    id: 'satguru-b16',
    url: '/images/bridal-gallery/bridal-16.jpg',
    title: 'Ruby Velvet Veil Shringar',
    subtitle: 'Close-Up Portrait with Layered Polki & Emerald Choker',
    display_order: 16,
  },
  {
    id: 'satguru-b17',
    url: '/images/bridal-gallery/bridal-17.jpg',
    title: 'Grand Floral Gher Royal Silhouette',
    subtitle: 'Heritage Velvet Draping with Sculpted Golden Embroidery',
    display_order: 17,
  },
  {
    id: 'satguru-b18',
    url: '/images/bridal-gallery/bridal-18.jpg',
    title: 'Deep Burgundy Velvet & Zardosi Art',
    subtitle: 'Classic Bridal Posture with Heavy Gold Border Lehenga',
    display_order: 18,
  },
  {
    id: 'satguru-b19',
    url: '/images/bridal-gallery/bridal-19.jpg',
    title: 'Luminous Bridal Contour & Kohl Eyes',
    subtitle: 'High-Definition Glamour with Traditional Kundan Ensemble',
    display_order: 19,
  },
  {
    id: 'satguru-b20',
    url: '/images/bridal-gallery/bridal-20.jpg',
    title: 'Timeless Royal Red Carpet Gown',
    subtitle: 'Flared Velvet Gher with Delicate Traditional Chooda',
    display_order: 20,
  },
  {
    id: 'satguru-b21',
    url: '/images/bridal-gallery/bridal-21.jpg',
    title: 'Satguru Studio Masterpiece',
    subtitle: 'Salon Ready Bridal Elegance in Crimson & Antique Gold',
    display_order: 21,
  },
];

const ORDERED_ITEMS_KEY = 'satguru_gallery_ordered_items';
const DELETED_IDS_KEY = 'satguru_deleted_gallery_ids';
const EVENT_NAME = 'satguru_gallery_updated';

export const getDeletedGalleryIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveDeletedGalleryId = (id: string, url?: string, storagePath?: string) => {
  try {
    const current = getDeletedGalleryIds();
    const set = new Set(current);
    if (id) set.add(id);
    if (url) set.add(url);
    if (storagePath) set.add(storagePath);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Error saving deleted gallery id:', e);
  }
};

export const getSavedGalleryItems = (): GalleryImage[] => {
  try {
    const raw = localStorage.getItem(ORDERED_ITEMS_KEY);
    if (raw) {
      const parsed: GalleryImage[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [];
};

export const saveGalleryItems = (items: GalleryImage[]) => {
  try {
    // Normalize display_order explicitly 1..N
    const normalized = items.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }));
    try {
      localStorage.setItem(ORDERED_ITEMS_KEY, JSON.stringify(normalized));
    } catch (storageErr) {
      console.warn('LocalStorage quota warning, trimming extra base64 URLs:', storageErr);
      // If quota exceeded, retain non-base64 or trim list to prevent complete breakage
      const lightweight = normalized.slice(0, 30).map(item => ({
        ...item,
        url: item.url.startsWith('data:') && item.url.length > 500000 ? '/images/bridal-gallery/bridal-1.jpg' : item.url,
      }));
      localStorage.setItem(ORDERED_ITEMS_KEY, JSON.stringify(lightweight));
    }
    window.dispatchEvent(new Event(EVENT_NAME));
    return normalized;
  } catch (e) {
    console.error('Error saving gallery items:', e);
    return items;
  }
};

let isSyncing = false;

// Fast background sync that never freezes UI or blocks page render
export const syncWithRemoteSupabase = async () => {
  if (isSyncing) return;
  isSyncing = true;
  try {
    const deletedSet = new Set(getDeletedGalleryIds());
    let currentList = getSavedGalleryItems();
    if (currentList.length === 0) {
      currentList = [...DEFAULT_GALLERY_IMAGES];
    }

    // Strict 2500ms timeout so a hanging/sleeping DB connection never delays rendering
    const fetchPromise = supabase.from('gallery_images').select('*').order('display_order');
    const timeoutPromise = new Promise<{ data: any[] | null; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 2500)
    );

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const data = result?.data;

    if (data && Array.isArray(data) && data.length > 0) {
      let changed = false;
      for (const remote of data) {
        if (!remote.url || remote.url.includes('undefined') || remote.url.includes('null')) continue;
        // Purge dead hosts that stall browser connections
        if (remote.url.includes('ritibeauty.com') || remote.url.includes('pinimg.com')) continue;
        if (deletedSet.has(remote.id) || deletedSet.has(remote.url)) continue;

        // If not already in current list, append it
        if (!currentList.some(item => item.id === remote.id || item.url === remote.url)) {
          currentList.push({
            id: remote.id,
            url: remote.url,
            title: remote.title || 'Satguru Bridal Creation',
            subtitle: remote.subtitle || '',
            storage_path: remote.storage_path,
            display_order: currentList.length + 1,
          });
          changed = true;
        }
      }
      if (changed) {
        saveGalleryItems(currentList);
      }
    }
  } catch (err) {
    console.warn('Supabase gallery background sync note:', err);
  } finally {
    isSyncing = false;
  }
};

export const loadUnifiedGallery = async (): Promise<GalleryImage[]> => {
  const deletedSet = new Set(getDeletedGalleryIds());
  let currentList = getSavedGalleryItems();

  if (currentList.length === 0) {
    currentList = [...DEFAULT_GALLERY_IMAGES];
  }

  // Filter out any deleted items and dead hosts
  currentList = currentList.filter(
    img => !deletedSet.has(img.id) && !deletedSet.has(img.url) && !img.url.includes('ritibeauty.com') && !img.url.includes('pinimg.com')
  );

  // Trigger non-blocking background sync
  syncWithRemoteSupabase();

  return currentList;
};

export const reorderGalleryItem = (id: string, direction: 'up' | 'down'): GalleryImage[] => {
  const currentList = getSavedGalleryItems();
  const list = currentList.length > 0 ? [...currentList] : [...DEFAULT_GALLERY_IMAGES];
  const idx = list.findIndex(item => item.id === id);

  if (idx === -1) return list;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= list.length) return list;

  // Swap elements
  const [removed] = list.splice(idx, 1);
  list.splice(targetIdx, 0, removed);

  // Normalize display_orders and persist
  const updated = saveGalleryItems(list);

  // Background attempt to update Supabase without blocking UI
  try {
    const a = updated[idx];
    const b = updated[targetIdx];
    if (a && b) {
      supabase.from('gallery_images').update({ display_order: a.display_order }).eq('id', a.id).then(() => {});
      supabase.from('gallery_images').update({ display_order: b.display_order }).eq('id', b.id).then(() => {});
    }
  } catch {}

  return updated;
};

export const deleteGalleryItem = async (img: GalleryImage): Promise<GalleryImage[]> => {
  // 1. Add to deleted IDs/URLs blacklist so it NEVER resurfaces
  saveDeletedGalleryId(img.id, img.url, img.storage_path);

  // 2. Remove from active saved list
  const currentList = getSavedGalleryItems();
  const base = currentList.length > 0 ? currentList : DEFAULT_GALLERY_IMAGES;
  const filtered = base.filter(item => item.id !== img.id && item.url !== img.url && item.title !== img.title);

  // 3. Save normalized list
  const updated = saveGalleryItems(filtered);

  // 4. Background cleanup on Supabase
  try {
    if (img.storage_path) {
      supabase.storage.from('gallery').remove([img.storage_path]).then(() => {});
    }
    supabase.from('gallery_images').delete().eq('id', img.id).then(() => {});
  } catch {}

  return updated;
};

export const addGalleryItem = (newImage: Omit<GalleryImage, 'display_order'>, position: 'top' | 'bottom' = 'top'): GalleryImage[] => {
  const currentList = getSavedGalleryItems();
  const base = currentList.length > 0 ? [...currentList] : [...DEFAULT_GALLERY_IMAGES];

  const fullItem: GalleryImage = {
    ...newImage,
    display_order: position === 'top' ? 1 : base.length + 1,
  };

  if (position === 'top') {
    base.unshift(fullItem);
  } else {
    base.push(fullItem);
  }

  return saveGalleryItems(base);
};

export const resetGalleryToBridalCollection = (): GalleryImage[] => {
  try {
    localStorage.removeItem(DELETED_IDS_KEY);
    localStorage.removeItem(ORDERED_ITEMS_KEY);
  } catch {}
  return saveGalleryItems([...DEFAULT_GALLERY_IMAGES]);
};
