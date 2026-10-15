/**
 * Cross-Tab Synchronization Service
 * Syncs data across multiple browser tabs in real-time using BroadcastChannel
 */

interface SyncMessage {
  type: 'booking_update' | 'profile_update' | 'gallery_update' | 'review_update';
  data: any;
  timestamp: number;
}

class CrossTabSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('satguru_sync');
      this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        this.handleMessage(event.data);
      };
    }
  }

  /**
   * Broadcast a sync message to all tabs
   */
  broadcast(type: SyncMessage['type'], data: any) {
    if (!this.channel) return;
    
    const message: SyncMessage = {
      type,
      data,
      timestamp: Date.now(),
    };
    
    this.channel.postMessage(message);
  }

  /**
   * Listen for specific sync events
   */
  on(type: SyncMessage['type'], callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  /**
   * Remove listener
   */
  off(type: SyncMessage['type'], callback: (data: any) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Handle incoming sync messages
   */
  private handleMessage(message: SyncMessage) {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => callback(message.data));
    }
  }

  /**
   * Close the sync channel
   */
  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const crossTabSync = new CrossTabSync();
