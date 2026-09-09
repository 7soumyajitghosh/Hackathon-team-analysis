import { Task, MemberStats } from '../types';
import { statsService } from '../services';

export function calculateMemberStats(memberId: string, allTasks: Task[]): MemberStats {
  return statsService.calculateMemberStats(memberId, allTasks);
}

export function calculateTeamStats(allTasks: Task[], memberCount: number = 5) {
  return statsService.calculateTeamStats(allTasks, memberCount);
}

export function getLeaderboard(users: Parameters<typeof statsService.getLeaderboard>[0], tasks: Task[]) {
  return statsService.getLeaderboard(users, tasks);
}
