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
    url: '/images/bridal-gallery/satguru-bride-1.jpg',
    title: 'Heritage Velvet Crimson Bride',
    subtitle: 'Signature Velvet Lehenga with Antique Kundan Ensemble',
    display_order: 1,
  },
  {
    id: 'satguru-b2',
    url: '/images/bridal-gallery/satguru-bride-2.jpg',
    title: 'Royal Crimson Shringar Portrait',
    subtitle: 'Handcrafted Kundan, Matha Patti & Statement Kaleere',
    display_order: 2,
  },
  {
    id: 'satguru-b3',
    url: '/images/bridal-gallery/satguru-bride-3.jpg',
    title: 'Regal Rajasthani Red Lehenga',
    subtitle: 'Royal Nath, Choker & Sculpted Airbrush Finish',
    display_order: 3,
  },
  {
    id: 'satguru-b4',
    url: '/images/bridal-gallery/satguru-bride-4.jpg',
    title: 'Rajputi Royal Saffron Poshak',
    subtitle: 'Heritage Aad, Borla & Traditional Golden Bangles',
    display_order: 4,
  },
  {
    id: 'satguru-b5',
    url: '/images/bridal-gallery/satguru-bride-5.jpg',
    title: 'Deep Wine Zardosi Splendor',
    subtitle: 'Intricate Dual Dupatta & Cascading Gold Kaleere',
    display_order: 5,
  },
  {
    id: 'satguru-b6',
    url: '/images/bridal-gallery/satguru-bride-6.jpg',
    title: 'Emerald Mala & Royal Velvet Glam',
    subtitle: 'Multi-layer Polki Choker with Luminous Studio Finish',
    display_order: 6,
  },
  {
    id: 'satguru-b7',
    url: '/images/bridal-gallery/satguru-bride-7.jpg',
    title: 'Heritage Red & Gold Embroidered Lehenga',
    subtitle: 'Royal Velvet Silhouette with Sheer Dupatta Draping',
    display_order: 7,
  },
  {
    id: 'satguru-b8',
    url: '/images/bridal-gallery/satguru-bride-8.jpg',
    title: 'Ethereal Side-Profile Velvet Veil',
    subtitle: 'Classic Rajasthani Royal Bridal Shringar',
    display_order: 8,
  },
  {
    id: 'satguru-b9',
    url: '/images/bridal-gallery/satguru-bride-9.jpg',
    title: 'Velvet Veil Heritage Portrait',
    subtitle: 'Smokey Kohl Eye Art & Antique Gold Jewelry',
    display_order: 9,
  },
  {
    id: 'satguru-b10',
    url: '/images/bridal-gallery/satguru-bride-10.jpg',
    title: 'The Royal Trio Bridal Ensembles',
    subtitle: 'Harmonious Crimson, Maroon & Pastel Grandeur',
    display_order: 10,
  },
  {
    id: 'satguru-b11',
    url: '/images/bridal-gallery/satguru-bride-11.jpg',
    title: 'Classic Rajasthani Royal Bride',
    subtitle: 'Traditional Matha Patti & Velvet Bridal Draping',
    display_order: 11,
  },
  {
    id: 'satguru-b12',
    url: '/images/bridal-gallery/satguru-bride-12.jpg',
    title: 'Dark Wine Velvet Majesty',
    subtitle: 'Hand-Embroidered Zari Border & Traditional Kaleere',
    display_order: 12,
  },
  {
    id: 'satguru-b13',
    url: '/images/bridal-gallery/satguru-bride-13.jpg',
    title: 'Sunset Crimson & Velvet Splendor',
    subtitle: 'Exquisite Dual Veil Draping & Heritage Jewelry',
    display_order: 13,
  },
  {
    id: 'satguru-b14',
    url: '/images/bridal-gallery/satguru-bride-14.jpg',
    title: 'Studio Masterpiece Trio Glam',
    subtitle: 'Salon Ready Bridal Elegance in Crimson & Antique Gold',
    display_order: 14,
  },
  {
    id: 'satguru-b15',
    url: '/images/bridal-gallery/satguru-bride-15.jpg',
    title: 'Double Royal Celebration',
    subtitle: 'Twinned in Heritage Red & Wine Bridal Grandeur',
    display_order: 15,
  },
  {
    id: 'satguru-b16',
    url: '/images/bridal-gallery/satguru-bride-16.jpg',
    title: 'Imperial Kundan Bridal Shringar',
    subtitle: 'Signature Velvet Crimson Silhouette & Polki Nath',
    display_order: 16,
  },
  {
    id: 'satguru-b17',
    url: '/images/bridal-gallery/satguru-bride-17.jpg',
    title: 'Regal Velvet Heritage Gown',
    subtitle: 'High-Definition Glamour with Traditional Kundan Ensemble',
    display_order: 17,
  },
  {
    id: 'satguru-b18',
    url: '/images/bridal-gallery/satguru-bride-18.jpg',
    title: 'Satguru Studio Royal Masterpiece',
    subtitle: 'Exquisite Dual Dupatta Draping & Heritage Jewelry',
    display_order: 18,
  },
];

const ORDERED_ITEMS_KEY = 'satguru_gallery_ordered_items_v4';
const DELETED_IDS_KEY = 'satguru_deleted_gallery_ids_v4';
const GALLERY_USER_INIT_KEY = 'satguru_gallery_user_initialized_v4';
const EVENT_NAME = 'satguru_gallery_updated';

// ── IN-MEMORY MODULE CACHE ──────────────────────────────────────────────────
// Holds the current live gallery items in memory so synchronous getters can
// immediately return high-res data without waiting for disk/db.
let inMemoryGalleryCache: GalleryImage[] | null = null;

// ── INDEXEDDB AS PRIMARY BULLETPROOF LOCAL STORE (1GB+ Quota) ───────────────
const IDB_NAME = 'SatguruGalleryDB_v4';
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
