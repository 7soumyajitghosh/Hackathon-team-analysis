/**
 * Storage Service
 * Abstract storage wrapper that encapsulates localStorage with memory fallback.
 * Allows effortless transition to remote API / database adapters without touching UI components.
 */

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'omnisprint_current_user_id',
  TASKS: 'omnisprint_tasks',
  NOTIFICATIONS: 'omnisprint_notifications',
  PROJECT: 'omnisprint_project',
  USERS: 'omnisprint_users',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

class BrowserStorageAdapter {
  private memoryFallback: Map<string, string> = new Map();

  private isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = '__test_storage__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getItem<T>(key: StorageKey, fallbackValue: T): T {
    try {
      if (this.isLocalStorageAvailable()) {
        const item = window.localStorage.getItem(key);
        if (item === null) return fallbackValue;
        return JSON.parse(item) as T;
      } else {
        const item = this.memoryFallback.get(key);
        if (!item) return fallbackValue;
        return JSON.parse(item) as T;
      }
    } catch (e) {
      console.warn(`[Storage] Failed to parse key ${key}, falling back to default`, e);
      return fallbackValue;
    }
  }

  getString(key: StorageKey, fallbackValue: string): string {
    try {
      if (this.isLocalStorageAvailable()) {
        const item = window.localStorage.getItem(key);
        return item !== null ? item : fallbackValue;
      }
      return this.memoryFallback.get(key) ?? fallbackValue;
    } catch {
      return fallbackValue;
    }
  }

  setItem<T>(key: StorageKey, value: T): void {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      if (this.isLocalStorageAvailable()) {
        window.localStorage.setItem(key, serialized);
      } else {
        this.memoryFallback.set(key, serialized);
      }
    } catch (e) {
      console.warn(`[Storage] Failed to set key ${key}`, e);
    }
  }

  removeItem(key: StorageKey): void {
    try {
      if (this.isLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
      } else {
        this.memoryFallback.delete(key);
      }
    } catch (e) {
      console.warn(`[Storage] Failed to remove key ${key}`, e);
    }
  }

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((k) => this.removeItem(k));
  }
}

export const storage = new BrowserStorageAdapter();
export { STORAGE_KEYS };
