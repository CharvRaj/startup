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
const GALLERY_MIGRATION_KEY = 'satguru_gallery_migrated_v2';
const EVENT_NAME = 'satguru_gallery_updated';

// ── One-Time Startup Migration ──────────────────────────────────────────────
// Runs once per browser session: wipes corrupted localStorage data where all
// images were saved as the placeholder '/images/luxury-hero-girl-hd.jpg' or
// as empty-string URLs with no matching IndexedDB entry.
// After migration, the gallery reloads cleanly from defaults or stays empty.
function runGalleryMigrationIfNeeded(): void {
  if (typeof window === 'undefined') return;
  try {
    // Only run once per install
    if (localStorage.getItem(GALLERY_MIGRATION_KEY) === 'true') return;

    const raw = localStorage.getItem(ORDERED_ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(GALLERY_MIGRATION_KEY, 'true');
      return;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(GALLERY_MIGRATION_KEY, 'true');
      return;
    }

    // Check how many items are corrupted (placeholder or empty URL)
    const PLACEHOLDER = '/images/luxury-hero-girl-hd.jpg';
    const badCount = parsed.filter(
      (item: any) => !item.url || item.url === PLACEHOLDER || item.url === ''
    ).length;

    // If more than half the items are corrupted → wipe and reset gallery
    if (badCount > 0 && badCount >= Math.ceil(parsed.length / 2)) {
      console.info(`[GalleryStore] Migration v2: detected ${badCount}/${parsed.length} corrupted items. Resetting gallery.`);
      // Remove the corrupted localStorage data
      localStorage.removeItem(ORDERED_ITEMS_KEY);
      // Reset user-init flag so defaults load fresh on next gallery open
      localStorage.removeItem(GALLERY_USER_INIT_KEY);
      // Clear deleted IDs too so defaults can show up again
      localStorage.removeItem(DELETED_IDS_KEY);
    } else if (badCount > 0) {
      // Partial corruption: strip out only the bad items
      const clean = parsed.filter(
        (item: any) => item.url && item.url !== PLACEHOLDER && item.url !== ''
      );
      console.info(`[GalleryStore] Migration v2: removed ${badCount} corrupted items, keeping ${clean.length} good ones.`);
      try {
        localStorage.setItem(ORDERED_ITEMS_KEY, JSON.stringify(clean));
      } catch {}
    }

    localStorage.setItem(GALLERY_MIGRATION_KEY, 'true');
  } catch {}
}

// Run immediately when this module loads
runGalleryMigrationIfNeeded();

// Robust client IndexedDB store for high-res images to bypass 5MB localStorage limits
const IDB_NAME = 'SatguruGalleryDB';
const IDB_VERSION = 1;
const IDB_STORE = 'gallery_blobs';

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

export async function saveImagesToIndexedDB(items: GalleryImage[]): Promise<void> {
  const db = await openGalleryDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      for (const item of items) {
        if (item.url && item.url.startsWith('data:')) {
          store.put({ id: item.id, url: item.url });
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadImagesFromIndexedDB(): Promise<Record<string, string>> {
  const db = await openGalleryDB();
  if (!db) return {};
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const result: Record<string, string> = {};
        for (const entry of request.result || []) {
          if (entry.id && entry.url) {
            result[entry.id] = entry.url;
          }
        }
        resolve(result);
      };
      request.onerror = () => resolve({});
    } catch {
      resolve({});
    }
  });
}

export async function removeImageFromIndexedDB(id: string): Promise<void> {
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

export async function clearIndexedDBImages(): Promise<void> {
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

export const getSavedGalleryItems = (): GalleryImage[] => {
  try {
    const raw = localStorage.getItem(ORDERED_ITEMS_KEY);
    if (raw !== null) {
      const parsed: GalleryImage[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Strip out any placeholder copies of luxury-hero-girl-hd.jpg
        return parsed.filter(item => item.url !== '/images/luxury-hero-girl-hd.jpg');
      }
    }
  } catch {}
  // Only before user has ever interacted with or deleted from the gallery
  if (!isGalleryUserInitialized()) {
    return [...DEFAULT_GALLERY_IMAGES];
  }
  return [];
};

export const saveGalleryItems = (items: GalleryImage[]) => {
  try {
    // Mark as user-managed so old default photos NEVER respawn automatically
    localStorage.setItem(GALLERY_USER_INIT_KEY, 'true');

    // Never save or allow the placeholder image into gallery
    const cleaned = items.filter(it => it.url !== '/images/luxury-hero-girl-hd.jpg');

    // Normalize display_order explicitly 1..N
    const normalized = cleaned.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }));

    // Save full image data to IndexedDB (which has hundreds of megabytes of quota)
    saveImagesToIndexedDB(normalized);

    // Save metadata to localStorage without risk of QuotaExceededError
    try {
      localStorage.setItem(ORDERED_ITEMS_KEY, JSON.stringify(normalized));
    } catch (storageErr) {
      console.warn('LocalStorage quota limit reached, saving metadata only and keeping full data in IndexedDB:', storageErr);
      // Strip large data URLs from localStorage so it never fails
      const metaOnly = normalized.map(item => ({
        ...item,
        url: item.url.startsWith('data:') ? '' : item.url,
      }));
      try {
        localStorage.setItem(ORDERED_ITEMS_KEY, JSON.stringify(metaOnly));
      } catch {}
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

  // Filter out any deleted items, dead hosts, and the old placeholder
  currentList = currentList.filter(
    img => !deletedSet.has(img.id) &&
           !deletedSet.has(img.url) &&
           img.url !== '/images/luxury-hero-girl-hd.jpg' &&
           !img.url.includes('ritibeauty.com') &&
           !img.url.includes('pinimg.com')
  );

  // Restore high-res data URLs from IndexedDB if url was stripped in localStorage
  try {
    const idbMap = await loadImagesFromIndexedDB();
    currentList = currentList.map(item => {
      if ((!item.url || item.url === '') && idbMap[item.id]) {
        return { ...item, url: idbMap[item.id] };
      }
      return item;
    });
  } catch {}

  // Trigger non-blocking background sync
  syncWithRemoteSupabase();

  return currentList;
};

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

  // Remove from IndexedDB
  removeImageFromIndexedDB(img.id);

  // 2. Remove from active saved list
  const currentList = getSavedGalleryItems();
  const filtered = currentList.filter(item => item.id !== img.id && item.url !== img.url && item.title !== img.title);

  // 3. Save normalized list (marks gallery as user-managed so defaults never return)
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

export const deleteAllGalleryItems = async (): Promise<GalleryImage[]> => {
  // 1. Mark as user-managed so defaults NEVER come back
  try {
    localStorage.setItem(GALLERY_USER_INIT_KEY, 'true');
  } catch {}

  // 2. Blacklist all existing items so remote sync never resurrects them
  const currentList = getSavedGalleryItems();
  currentList.forEach(img => {
    saveDeletedGalleryId(img.id, img.url, img.storage_path);
  });

  // Also blacklist all default images so they never respawn on reload
  DEFAULT_GALLERY_IMAGES.forEach(img => {
    saveDeletedGalleryId(img.id, img.url);
  });

  // Clear IndexedDB completely
  await clearIndexedDBImages();

  // 3. Save empty array
  saveGalleryItems([]);

  // 4. Background delete in Supabase
  try {
    supabase.from('gallery_images').delete().neq('id', 'placeholder_never_matches').then(() => {});
  } catch {}

  return [];
};

export const addGalleryItem = (newImage: Omit<GalleryImage, 'display_order'>, position: 'top' | 'bottom' = 'top'): GalleryImage[] => {
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
