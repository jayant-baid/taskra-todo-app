export type RecurrenceRule = 'daily' | 'weekly' | string;

export type TaskStatus = 'active' | 'deleted';
export type OccurrenceStatus = 'pending' | 'completed' | 'skipped';

export interface TaskDefinition {
  id: string;
  title: string;
  description?: string;
  isRecurring: boolean;
  recurrenceRule?: RecurrenceRule;
  startDate: string; // ISO date string YYYY-MM-DD
  createdAt: string; // ISO timestamp string
  deletedFrom?: string; // ISO date string YYYY-MM-DD (set on soft-delete of recurring task)
  status: TaskStatus;
}

export interface TaskOccurrence {
  id: string; // `${taskDefinitionId}_${date}`
  taskDefinitionId: string;
  date: string; // ISO date string YYYY-MM-DD
  status: OccurrenceStatus;
  completedAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
}

export interface ComputedOccurrence {
  id: string;
  taskDefinitionId: string;
  title: string;
  description?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  date: string; // Target date YYYY-MM-DD
  status: OccurrenceStatus;
  completedAt?: string;
  daysOld: number; // For non-recurring: difference in calendar days between target date and createdAt
  startDate: string;
  createdAt: string;
  isMaterialized: boolean; // Whether an explicit row exists in the occurrence store
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  dayNumber: number; // 1-31
  monthName: string; // Jan, Feb, etc.
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  totalCount: number;
  completedCount: number;
  completionPercentage: number;
  occurrences: ComputedOccurrence[];
}

export interface AnalyticsMetrics {
  currentStreak: number; // Consecutive days with 100% completion (up to today or yesterday)
  bestStreak: number;
  completionRate7d: number; // % of occurrences completed over last 7 days
  completionRate30d: number; // % of occurrences completed over last 30 days
  totalActiveTasks: number;
  recurringCount: number;
  carryOverCount: number; // Non-recurring pending tasks carried over from previous days
}
