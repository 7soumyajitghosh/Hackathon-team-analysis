import {
  Task,
  User,
  MemberStats,
  TeamStats,
  LeaderboardEntry,
} from '../types';
import { IStatsService } from './types';

export class StatsService implements IStatsService {
  calculateMemberStats(memberId: string, tasks: Task[]): MemberStats {
    const memberTasks = tasks.filter((t) => t.assignedToId === memberId);
    const assignedCount = memberTasks.length;

    const completedTasks = memberTasks.filter((t) => t.status === 'completed');
    const completedCount = completedTasks.length;

    const pendingCount = memberTasks.filter((t) => t.status === 'pending').length;
    const inProgressCount = memberTasks.filter((t) => t.status === 'in_progress').length;
    const submittedCount = memberTasks.filter(
      (t) => t.status === 'submitted' || t.status === 'under_review'
    ).length;
    const changesRequestedCount = memberTasks.filter((t) => t.status === 'changes_requested').length;

    const completionRate =
      assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;

    // Calculate average score from graded reviews
    const gradedTasks = memberTasks.filter(
      (t) => t.review && typeof t.review.score === 'number' && t.review.score > 0
    );
    const reviewedCount = gradedTasks.length;

    const scoreSum = gradedTasks.reduce((sum, t) => sum + (t.review?.score || 0), 0);
    const averageScore = reviewedCount > 0 ? Math.round(scoreSum / reviewedCount) : 0;

    // Composite Rating calculation (1-100)
    // Formula: 50% average review score + 35% completion rate + 15% active engagement
    let overallRating = 0;
    if (assignedCount === 0) {
      overallRating = 0;
    } else if (reviewedCount === 0) {
      // If tasks exist but not graded yet, base on progress
      overallRating = Math.round(completionRate * 0.7 + (inProgressCount > 0 ? 15 : 0));
    } else {
      const activeBonus = inProgressCount > 0 || submittedCount > 0 ? 10 : 0;
      overallRating = Math.min(
        100,
        Math.round(averageScore * 0.55 + completionRate * 0.35 + activeBonus)
      );
    }

    let ratingGrade: MemberStats['ratingGrade'] = 'N/A';
    if (assignedCount === 0) {
      ratingGrade = 'N/A';
    } else if (overallRating >= 94) {
      ratingGrade = 'A+';
    } else if (overallRating >= 85) {
      ratingGrade = 'A';
    } else if (overallRating >= 75) {
      ratingGrade = 'B+';
    } else if (overallRating >= 60) {
      ratingGrade = 'B';
    } else {
      ratingGrade = 'C';
    }

    return {
      assignedCount,
      completedCount,
      pendingCount,
      inProgressCount,
      submittedCount,
      changesRequestedCount,
      completionRate,
      averageScore,
      overallRating,
      ratingGrade,
      reviewedCount,
    };
  }

  calculateTeamStats(tasks: Task[], memberCount: number = 5): TeamStats {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const submittedForReview = tasks.filter(
      (t) => t.status === 'submitted' || t.status === 'under_review'
    ).length;
    const changesRequested = tasks.filter((t) => t.status === 'changes_requested').length;

    const overallProgress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const gradedTasks = tasks.filter(
      (t) => t.review && typeof t.review.score === 'number' && t.review.score > 0
    );
    const scoreSum = gradedTasks.reduce((sum, t) => sum + (t.review?.score || 0), 0);
    const teamAverageScore =
      gradedTasks.length > 0 ? Math.round(scoreSum / gradedTasks.length) : 0;

    return {
      totalMembers: memberCount + 1, // 5 members + 1 leader = 6 users total
      memberCount,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      submittedForReview,
      changesRequested,
      overallProgress,
      teamAverageScore,
    };
  }

  getLeaderboard(users: User[], tasks: Task[]): LeaderboardEntry[] {
    const membersOnly = users.filter((u) => u.role === 'member');

    const leaderboardWithStats = membersOnly.map((user) => {
      const stats = this.calculateMemberStats(user.id, tasks);
      return { user, stats };
    });

    // Sort by overallRating desc, then averageScore desc, then completionRate desc
    leaderboardWithStats.sort((a, b) => {
      if (b.stats.overallRating !== a.stats.overallRating) {
        return b.stats.overallRating - a.stats.overallRating;
      }
      if (b.stats.averageScore !== a.stats.averageScore) {
        return b.stats.averageScore - a.stats.averageScore;
      }
      return b.stats.completionRate - a.stats.completionRate;
    });

    return leaderboardWithStats.map((item, index) => {
      const rank = index + 1;
      let medal: 'gold' | 'silver' | 'bronze' | undefined;
      if (rank === 1) medal = 'gold';
      else if (rank === 2) medal = 'silver';
      else if (rank === 3) medal = 'bronze';

      return {
        rank,
        user: item.user,
        stats: item.stats,
        medal,
      };
    });
  }
}

export const statsService = new StatsService();
