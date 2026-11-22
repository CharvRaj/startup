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
const GALLERY_USER_INIT_KEY = 'satguru_gallery_user_initialized';
const EVENT_NAME = 'satguru_gallery_updated';

// ── IN-MEMORY MODULE CACHE ──────────────────────────────────────────────────
// Holds the current live gallery items in memory so synchronous getters can
// immediately return high-res data without waiting for disk/db.
let inMemoryGalleryCache: GalleryImage[] | null = null;

// ── INDEXEDDB AS PRIMARY BULLETPROOF LOCAL STORE (1GB+ Quota) ───────────────
const IDB_NAME = 'SatguruGalleryDB_v2';
const IDB_VERSION = 1;
const IDB_STORE = 'gallery_records';

function openGalleryDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Saves all full gallery items directly to IndexedDB (no 5MB size limit).
 */
export async function saveAllToIndexedDB(items: GalleryImage[]): Promise<void> {
  const db = await openGalleryDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      // Clear existing records and rewrite with normalized order
      store.clear();
      for (const item of items) {
        if (item.url && item.url !== '/images/luxury-hero-girl-hd.jpg') {
          store.put(item);
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * Reads all full gallery items from IndexedDB.
 */
export async function loadAllFromIndexedDB(): Promise<GalleryImage[]> {
  const db = await openGalleryDB();
  if (!db) return [];
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const items: GalleryImage[] = request.result || [];
        items.sort((a, b) => a.display_order - b.display_order);
        resolve(items);
      };
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function clearAllIndexedDB(): Promise<void> {
  const db = await openGalleryDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function removeSingleFromIndexedDB(id: string): Promise<void> {
  const db = await openGalleryDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ── USER INITIALIZED & DELETED BLACKLIST ─────────────────────────────────────
export const isGalleryUserInitialized = (): boolean => {
  try {
    return localStorage.getItem(GALLERY_USER_INIT_KEY) === 'true';
  } catch {
    return false;
  }
};

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

// ── SYNCHRONOUS GETTER ──────────────────────────────────────────────────────
export const getSavedGalleryItems = (): GalleryImage[] => {
  if (inMemoryGalleryCache !== null) {
    return inMemoryGalleryCache;
  }

  try {
    const raw = localStorage.getItem(ORDERED_ITEMS_KEY);
    if (raw !== null) {
      const parsed: GalleryImage[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter(item => item.url && item.url !== '/images/luxury-hero-girl-hd.jpg');
        if (filtered.length > 0) {
          inMemoryGalleryCache = filtered;
          return filtered;
        }
      }
    }
  } catch {}

  // If user has ever initialized / deleted / uploaded, do NOT bring back defaults
  if (isGalleryUserInitialized()) {
    return [];
  }

  // Brand new session: return defaults
  return [...DEFAULT_GALLERY_IMAGES];
};

// ── PERSISTENCE ENGINE ──────────────────────────────────────────────────────
export const saveGalleryItems = (items: GalleryImage[]): GalleryImage[] => {
  try {
    // 1. Mark as permanently user-managed so default photos NEVER automatically respawn
    localStorage.setItem(GALLERY_USER_INIT_KEY, 'true');

    // 2. Strip out invalid/placeholder items
    const cleaned = items.filter(it => it.url && it.url !== '/images/luxury-hero-girl-hd.jpg');

    // 3. Normalize display orders (1..N)
    const normalized: GalleryImage[] = cleaned.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }));

    // 4. Update in-memory cache immediately
    inMemoryGalleryCache = normalized;

    // 5. Save FULL high-res data to IndexedDB asynchronously
    saveAllToIndexedDB(normalized).catch(() => {});

    // 6. Save metadata to localStorage (safely handles QuotaExceededError without crashing)
    try {
      localStorage.setItem(ORDERED_ITEMS_KEY, JSON.stringify(normalized));
    } catch {
      // If base64 URLs overflow 5MB localStorage, strip only data URLs from localStorage
      // while keeping the full image in IndexedDB
      try {
        const metaOnly = normalized.map(item => ({
          ...item,
          url: item.url.startsWith('data:') ? '' : item.url,
        }));
        localStorage.setItem(ORDERED_ITEMS_KEY, JSON.stringify(metaOnly));
      } catch {}
    }

    // 7. Notify all active tabs & components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(EVENT_NAME));
    }

    return normalized;
  } catch (e) {
    console.error('Error in saveGalleryItems:', e);
    return items;
  }
};

// ── UNIFIED GALLERY LOADER (PRIMARY SOURCE OF TRUTH ON RELOAD) ──────────────
export const loadUnifiedGallery = async (): Promise<GalleryImage[]> => {
  const deletedSet = new Set(getDeletedGalleryIds());

  // 1. First, attempt to load all full images from IndexedDB
  try {
    const idbItems = await loadAllFromIndexedDB();
    if (idbItems && idbItems.length > 0) {
      const valid = idbItems.filter(
        img => !deletedSet.has(img.id) &&
               !deletedSet.has(img.url) &&
               img.url &&
               img.url !== '/images/luxury-hero-girl-hd.jpg'
      );
      if (valid.length > 0) {
        inMemoryGalleryCache = valid;
        // Keep localStorage metadata in sync
        try {
          localStorage.setItem(ORDERED_ITEMS_KEY, JSON.stringify(valid));
        } catch {}
        return valid;
      }
    }
  } catch (err) {
    console.warn('IndexedDB read note:', err);
  }

  // 2. Fallback to localStorage / in-memory cache
  let currentList = getSavedGalleryItems();

  // Filter out deleted items and placeholders
  currentList = currentList.filter(
    img => !deletedSet.has(img.id) &&
           !deletedSet.has(img.url) &&
           img.url &&
           img.url !== '/images/luxury-hero-girl-hd.jpg'
  );

  // If user never touched the gallery at all, seed IndexedDB with defaults
  if (!isGalleryUserInitialized() && currentList.length === 0) {
    currentList = [...DEFAULT_GALLERY_IMAGES];
    saveAllToIndexedDB(currentList).catch(() => {});
  }

  inMemoryGalleryCache = currentList;
  return currentList;
};

// ── REORDER ITEM ────────────────────────────────────────────────────────────
export const reorderGalleryItem = (id: string, direction: 'up' | 'down'): GalleryImage[] => {
  const currentList = getSavedGalleryItems();
  const list = [...currentList];
  const idx = list.findIndex(item => item.id === id);

  if (idx === -1) return list;

  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= list.length) return list;

  // Swap elements
  const [removed] = list.splice(idx, 1);
  list.splice(targetIdx, 0, removed);

  // Persist updated order
  return saveGalleryItems(list);
};

// ── DELETE SINGLE ITEM ──────────────────────────────────────────────────────
export const deleteGalleryItem = async (img: GalleryImage): Promise<GalleryImage[]> => {
  // 1. Blacklist the ID and URL permanently so it NEVER respawns
  saveDeletedGalleryId(img.id, img.url, img.storage_path);

  // 2. Remove from IndexedDB
  await removeSingleFromIndexedDB(img.id);

  // 3. Remove from active list
  const currentList = getSavedGalleryItems();
  const filtered = currentList.filter(
    item => item.id !== img.id && item.url !== img.url && item.title !== img.title
  );

  // 4. Save and return updated list
  const updated = saveGalleryItems(filtered);

  // 5. Background cleanup on Supabase storage if storage_path exists
  try {
    if (img.storage_path) {
      supabase.storage.from('gallery').remove([img.storage_path]).then(() => {});
    }
    supabase.from('gallery_images').delete().eq('id', img.id).then(() => {});
  } catch {}

  return updated;
};

// ── DELETE ALL ITEMS ────────────────────────────────────────────────────────
export const deleteAllGalleryItems = async (): Promise<GalleryImage[]> => {
  // 1. Mark as user-managed so defaults NEVER come back
  try {
    localStorage.setItem(GALLERY_USER_INIT_KEY, 'true');
  } catch {}

  // 2. Blacklist all existing items and all default items
  const currentList = getSavedGalleryItems();
  currentList.forEach(img => {
    saveDeletedGalleryId(img.id, img.url, img.storage_path);
  });
  DEFAULT_GALLERY_IMAGES.forEach(img => {
    saveDeletedGalleryId(img.id, img.url);
  });

  // 3. Clear IndexedDB completely
  await clearAllIndexedDB();

  // 4. Clear in-memory cache and localStorage
  inMemoryGalleryCache = [];
  try {
    localStorage.setItem(ORDERED_ITEMS_KEY, JSON.stringify([]));
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }

  // 5. Background delete in Supabase
  try {
    supabase.from('gallery_images').delete().neq('id', 'placeholder_never_matches').then(() => {});
  } catch {}

  return [];
};

// ── ADD SINGLE ITEM ─────────────────────────────────────────────────────────
export const addGalleryItem = (
  newImage: Omit<GalleryImage, 'display_order'>,
  position: 'top' | 'bottom' = 'top'
): GalleryImage[] => {
  const currentList = getSavedGalleryItems();
  const base = [...currentList];

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

// ── ADD MULTIPLE ITEMS (GROUP / BULK UPLOAD) ────────────────────────────────
export const addMultipleGalleryItems = (
  newImages: Array<Omit<GalleryImage, 'display_order'>>,
  position: 'top' | 'bottom' = 'top'
): GalleryImage[] => {
  const currentList = getSavedGalleryItems();
  const base = [...currentList];

  const fullItems: GalleryImage[] = newImages.map((img, idx) => ({
    ...img,
    display_order: position === 'top' ? idx + 1 : base.length + idx + 1,
  }));

  if (position === 'top') {
    base.unshift(...fullItems);
  } else {
    base.push(...fullItems);
  }

  return saveGalleryItems(base);
};
