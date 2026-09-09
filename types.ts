export type UserRole = 'leader' | 'member';

export type TaskStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'submitted' 
  | 'under_review'
  | 'completed' 
  | 'changes_requested';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  teamRole: string; // e.g. "Team Leader & Architect", "Frontend Lead"
  avatar: string;
  githubUsername?: string;
  skills: string[];
  bio: string;
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  memberId: string;
  submittedAt: string;
  notes: string;
  githubUrl?: string;
  projectUrl?: string;
  attachmentName?: string;
}

export interface TaskReview {
  id: string;
  taskId: string;
  reviewerId: string;
  reviewedAt: string;
  score: number; // 1 - 100
  feedback: string;
  verdict: 'approved' | 'changes_requested';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedById: string;
  assignedDate: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  githubBranch?: string;
  githubIssueNumber?: number;
  tags: string[];
  submission?: TaskSubmission;
  review?: TaskReview;
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  assignedToId: string;
  deadline: string;
  priority: TaskPriority;
  githubBranch?: string;
  githubIssueNumber?: number;
  tags?: string[];
}

export interface SubmitTaskDTO {
  notes: string;
  githubUrl?: string;
  projectUrl?: string;
  attachmentName?: string;
}

export interface ReviewTaskDTO {
  score: number;
  feedback: string;
  verdict: 'approved' | 'changes_requested';
}

export interface MemberStats {
  assignedCount: number;
  completedCount: number;
  pendingCount: number;
  inProgressCount: number;
  submittedCount: number;
  changesRequestedCount: number;
  completionRate: number; // 0 - 100%
  averageScore: number; // 1 - 100
  overallRating: number; // Composite performance score (0 - 100)
  ratingGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'N/A';
  reviewedCount: number;
}

export interface TeamStats {
  totalMembers: number;
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  submittedForReview: number;
  changesRequested: number;
  overallProgress: number;
  teamAverageScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  stats: MemberStats;
  medal?: 'gold' | 'silver' | 'bronze';
}

export interface AppNotification {
  id: string;
  userId: string; // recipient
  senderName: string;
  senderAvatar: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'task_assigned' | 'deadline_approaching' | 'task_submitted' | 'submission_reviewed' | 'changes_requested' | 'score_awarded';
  taskId?: string;
}

export interface ProjectDetails {
  name: string;
  tagline: string;
  hackathonName: string;
  deadlineTimestamp: string;
  githubRepoUrl: string;
  demoUrl: string;
  docsUrl: string;
  figmaUrl: string;
  description: string;
  techStack: string[];
}
