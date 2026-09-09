import { ProjectDetails } from '../types';
import { INITIAL_PROJECT } from '../data/initialData';
import { storage, STORAGE_KEYS } from './storage';
import { IProjectService } from './types';

export class ProjectService implements IProjectService {
  async getProject(): Promise<ProjectDetails> {
    return storage.getItem<ProjectDetails>(STORAGE_KEYS.PROJECT, INITIAL_PROJECT);
  }

  async updateProject(updates: Partial<ProjectDetails>): Promise<ProjectDetails> {
    const current = await this.getProject();
    const updated = { ...current, ...updates };
    storage.setItem(STORAGE_KEYS.PROJECT, updated);
    return updated;
  }

  async resetProject(): Promise<ProjectDetails> {
    storage.removeItem(STORAGE_KEYS.PROJECT);
    return INITIAL_PROJECT;
  }
}

export const projectService = new ProjectService();
