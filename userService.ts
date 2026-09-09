import { User } from '../types';
import { INITIAL_USERS } from '../data/initialData';
import { storage, STORAGE_KEYS } from './storage';
import { IUserService } from './types';

export class UserService implements IUserService {
  async getUsers(): Promise<User[]> {
    return storage.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  getCurrentUserId(): string {
    return storage.getString(STORAGE_KEYS.CURRENT_USER_ID, 'user_leader');
  }

  setCurrentUserId(id: string): void {
    storage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }
    const updated = { ...users[index], ...updates };
    users[index] = updated;
    storage.setItem(STORAGE_KEYS.USERS, users);
    return updated;
  }

  async resetUsers(): Promise<User[]> {
    storage.removeItem(STORAGE_KEYS.USERS);
    storage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    return INITIAL_USERS;
  }
}

export const userService = new UserService();
