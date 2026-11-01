import { supabase } from './supabase';

export interface LatestStory {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  expires_at: string;
  active: boolean;
  created_at?: string;
}

export const PRESET_LATEST_STORY_IMAGES = [
  { label: 'Royal Bridal', url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80' },
  { label: '24K Gold Facial', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80' },
  { label: 'Marwari Henna', url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80' },
  { label: 'Hair Keratin Spa', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80' },
  { label: 'VIP Doorstep Van', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80' },
  { label: 'Festive Nail Art', url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80' },
];

export const DEFAULT_LATEST_STORIES: LatestStory[] = [
  {
    id: 'ls-default-1',
    title: 'Bridal Suite 30% OFF',
    image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
    link_url: '/#services',
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ls-default-2',
    title: '24K Gold Facial',
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=80',
    link_url: '/#services',
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ls-default-3',
    title: 'Marwari Henna',
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
    link_url: '/mehndi',
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ls-default-4',
    title: 'VIP Doorstep Salon',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    link_url: '/doorstep-services',
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ls-default-5',
    title: 'Hair Keratin Spa',
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
    link_url: '/#services',
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ls-default-6',
    title: 'Festive Nail Art',
    image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80',
    link_url: '/#services',
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  },
];

const LOCAL_STORAGE_LATEST_KEY = 'satguru_latest_stories_custom';

export function getLocalLatestStories(): LatestStory[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LATEST_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalLatestStories(stories: LatestStory[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_LATEST_KEY, JSON.stringify(stories));
    window.dispatchEvent(new CustomEvent('satguru-latest-stories-updated'));
  } catch (e) {
    console.error('Failed to save latest stories locally', e);
  }
}

export async function fetchLatestStories(): Promise<LatestStory[]> {
  const localStories = getLocalLatestStories().filter(s => s.active && new Date(s.expires_at) > new Date());
  const map = new Map<string, LatestStory>();

  // Add default stories
  DEFAULT_LATEST_STORIES.forEach(d => map.set(d.id, d));
  // Add local stories (overriding or appending)
  localStories.forEach(s => map.set(s.id, s));

  // Also clean up any disabled defaults
  const disabledIds = new Set(getLocalLatestStories().filter(s => !s.active).map(s => s.id));
  return Array.from(map.values()).filter(s => s.active && !disabledIds.has(s.id));
}

export async function fetchAllAdminLatestStories(): Promise<LatestStory[]> {
  const localStories = getLocalLatestStories();
  const map = new Map<string, LatestStory>();

  // Defaults
  DEFAULT_LATEST_STORIES.forEach(d => map.set(d.id, d));
  // Local custom stories
  localStories.forEach(s => map.set(s.id, s));

  return Array.from(map.values());
}

export async function addLatestStory(newStory: {
  title: string;
  image_url: string;
  link_url?: string;
  expires_days?: string;
}): Promise<LatestStory> {
  const expiresAt = new Date();
  const days = parseInt(newStory.expires_days || '7');
  if (days >= 999) {
    expiresAt.setFullYear(expiresAt.getFullYear() + 10);
  } else {
    expiresAt.setDate(expiresAt.getDate() + days);
  }

  const storyItem: LatestStory = {
    id: `ls-${Date.now()}`,
    title: newStory.title,
    image_url: newStory.image_url,
    link_url: newStory.link_url || undefined,
    expires_at: expiresAt.toISOString(),
    active: true,
    created_at: new Date().toISOString(),
  };

  const currentLocal = getLocalLatestStories();
  saveLocalLatestStories([storyItem, ...currentLocal]);

  return storyItem;
}

export async function deleteLatestStory(id: string): Promise<void> {
  const currentLocal = getLocalLatestStories().filter(s => s.id !== id);
  if (id.startsWith('ls-default-')) {
    // Save tombstone to keep default hidden
    saveLocalLatestStories([...currentLocal, {
      id,
      title: '',
      image_url: '',
      expires_at: new Date(0).toISOString(),
      active: false,
    }]);
  } else {
    saveLocalLatestStories(currentLocal);
  }
}

export async function toggleLatestStory(id: string, currentActive: boolean): Promise<void> {
  const currentLocal = getLocalLatestStories();
  const existingIndex = currentLocal.findIndex(s => s.id === id);
  if (existingIndex >= 0) {
    currentLocal[existingIndex].active = !currentActive;
    saveLocalLatestStories([...currentLocal]);
  } else {
    const def = DEFAULT_LATEST_STORIES.find(d => d.id === id);
    if (def) {
      saveLocalLatestStories([...currentLocal, { ...def, active: !currentActive }]);
    }
  }
}
