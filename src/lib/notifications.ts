/**
 * Desktop Notification Service
 * Handles browser notifications with permission management
 */

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  /**
   * Show a desktop notification
   */
  async show(title: string, options?: NotificationOptions): Promise<Notification | null> {
    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return null;
      }
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  }

  /**
   * Show notification for new booking
   */
  async notifyNewBooking(bookingData: { name: string; service: string }) {
    return this.show('🔔 New Booking Request!', {
      body: `${bookingData.name} requested ${bookingData.service}`,
      tag: 'new-booking',
      requireInteraction: false,
      silent: false,
    });
  }

  /**
   * Show notification for booking confirmation
   */
  async notifyBookingConfirmed(bookingData: { service: string; date: string; time: string }) {
    return this.show('✅ Booking Confirmed!', {
      body: `Your ${bookingData.service} appointment on ${new Date(bookingData.date).toLocaleDateString()} at ${bookingData.time}`,
      tag: 'booking-confirmed',
    });
  }

  /**
   * Show notification for profile update
   */
  async notifyProfileUpdated() {
    return this.show('✨ Profile Updated!', {
      body: 'Your profile has been successfully updated',
      tag: 'profile-updated',
    });
  }

  /**
   * Play notification sound
   */
  playSound(): void {
    try {
      const audio = new Audio('data:audio/wav;base64,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');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    } catch (e) {
      // Fail silently
    }
  }
}

export const notificationService = NotificationService.getInstance();
