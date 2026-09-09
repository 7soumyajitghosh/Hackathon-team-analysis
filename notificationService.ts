import { AppNotification } from '../types';
import { INITIAL_NOTIFICATIONS } from '../data/initialData';
import { storage, STORAGE_KEYS } from './storage';
import { INotificationService } from './types';

export class NotificationService implements INotificationService {
  async getNotifications(): Promise<AppNotification[]> {
    return storage.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  async createNotification(
    notif: Omit<AppNotification, 'id' | 'timestamp'>
  ): Promise<AppNotification> {
    const notifications = await this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
    };

    const updated = [newNotif, ...notifications];
    storage.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    return newNotif;
  }

  async markAsRead(id: string): Promise<void> {
    const notifications = await this.getNotifications();
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    storage.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  async markAllAsRead(userId?: string): Promise<void> {
    const notifications = await this.getNotifications();
    const updated = notifications.map((n) => {
      if (!userId || n.userId === userId) {
        return { ...n, read: true };
      }
      return n;
    });
    storage.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  }

  async deleteNotification(id: string): Promise<boolean> {
    const notifications = await this.getNotifications();
    const filtered = notifications.filter((n) => n.id !== id);
    if (filtered.length === notifications.length) return false;
    storage.setItem(STORAGE_KEYS.NOTIFICATIONS, filtered);
    return true;
  }

  async resetNotifications(): Promise<AppNotification[]> {
    storage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    return INITIAL_NOTIFICATIONS;
  }
}

export const notificationService = new NotificationService();
