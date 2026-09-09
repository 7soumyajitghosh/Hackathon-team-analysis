import {
  Task,
  TaskStatus,
  User,
  AppNotification,
  CreateTaskDTO,
  SubmitTaskDTO,
  ReviewTaskDTO,
} from '../types';
import { INITIAL_TASKS } from '../data/initialData';
import { storage, STORAGE_KEYS } from './storage';
import { ITaskService } from './types';

export class TaskService implements ITaskService {
  async getTasks(): Promise<Task[]> {
    return storage.getItem<Task[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.getTasks();
    return tasks.find((t) => t.id === id) || null;
  }

  async createTask(dto: CreateTaskDTO, creator: User): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: dto.title,
      description: dto.description,
      assignedToId: dto.assignedToId,
      assignedById: creator.id,
      assignedDate: new Date().toISOString(),
      deadline: dto.deadline,
      priority: dto.priority,
      status: 'pending',
      githubBranch: dto.githubBranch || undefined,
      githubIssueNumber: dto.githubIssueNumber || undefined,
      tags: dto.tags && dto.tags.length > 0 ? dto.tags : ['Sprint Task'],
    };

    const updatedTasks = [newTask, ...tasks];
    storage.setItem(STORAGE_KEYS.TASKS, updatedTasks);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const tasks = await this.getTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updatedTask = { ...tasks[index], ...updates };
    tasks[index] = updatedTask;
    storage.setItem(STORAGE_KEYS.TASKS, tasks);
    return updatedTask;
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return this.updateTask(id, { status });
  }

  async submitTask(
    taskId: string,
    dto: SubmitTaskDTO,
    member: User
  ): Promise<{ task: Task; notification: AppNotification }> {
    const tasks = await this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const submission = {
      id: `sub-${Date.now()}`,
      taskId,
      memberId: member.id,
      submittedAt: new Date().toISOString(),
      notes: dto.notes,
      githubUrl: dto.githubUrl?.trim() || undefined,
      projectUrl: dto.projectUrl?.trim() || undefined,
      attachmentName: dto.attachmentName?.trim() || undefined,
    };

    const updatedTask: Task = {
      ...task,
      status: 'submitted',
      submission,
    };

    const updatedTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));
    storage.setItem(STORAGE_KEYS.TASKS, updatedTasks);

    const notification: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: task.assignedById, // Recipient is leader
      senderName: member.name,
      senderAvatar: member.avatar,
      title: 'Work Submitted for Review',
      message: `${member.name} submitted work for "${task.title}". Score and review their work!`,
      timestamp: 'Just now',
      read: false,
      type: 'task_submitted',
      taskId: task.id,
    };

    return { task: updatedTask, notification };
  }

  async reviewTask(
    taskId: string,
    dto: ReviewTaskDTO,
    reviewer: User
  ): Promise<{ task: Task; notification: AppNotification }> {
    const tasks = await this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task with id ${taskId} not found`);
    }

    const review = {
      id: `rev-${Date.now()}`,
      taskId,
      reviewerId: reviewer.id,
      reviewedAt: new Date().toISOString(),
      score: Math.min(100, Math.max(1, dto.score)),
      feedback: dto.feedback,
      verdict: dto.verdict,
    };

    const nextStatus: TaskStatus = dto.verdict === 'approved' ? 'completed' : 'changes_requested';

    const updatedTask: Task = {
      ...task,
      status: nextStatus,
      review,
    };

    const updatedTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));
    storage.setItem(STORAGE_KEYS.TASKS, updatedTasks);

    const isApproved = dto.verdict === 'approved';
    const notification: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: task.assignedToId, // Member recipient
      senderName: reviewer.name,
      senderAvatar: reviewer.avatar,
      title: isApproved
        ? `Task Approved! Score: ${dto.score}/100`
        : `Changes Requested (Score: ${dto.score}/100)`,
      message: `${reviewer.name} reviewed your submission for "${task.title}": "${dto.feedback.slice(0, 80)}${dto.feedback.length > 80 ? '...' : ''}"`,
      timestamp: 'Just now',
      read: false,
      type: isApproved ? 'score_awarded' : 'changes_requested',
      taskId: task.id,
    };

    return { task: updatedTask, notification };
  }

  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) return false;
    storage.setItem(STORAGE_KEYS.TASKS, filtered);
    return true;
  }

  async resetTasks(): Promise<Task[]> {
    storage.removeItem(STORAGE_KEYS.TASKS);
    return INITIAL_TASKS;
  }
}

export const taskService = new TaskService();
