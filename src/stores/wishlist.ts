import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistStore {
  wishlistIds: string[];
  toggleWishlist: (id: string) => boolean; // returns true if now in wishlist
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlistIds: ['ds-hydra-glow', 'm-bridal-royal'],
      toggleWishlist: (id: string) => {
        const current = get().wishlistIds;
        const exists = current.includes(id);
        const updated = exists ? current.filter((item) => item !== id) : [...current, id];
        set({ wishlistIds: updated });
        return !exists;
      },
      isInWishlist: (id: string) => {
        return get().wishlistIds.includes(id);
      },
      clearWishlist: () => set({ wishlistIds: [] }),
    }),
    {
      name: 'satguru_wishlist_storage',
    }
  )
);
