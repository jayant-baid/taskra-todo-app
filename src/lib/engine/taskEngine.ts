import {
  TaskDefinition,
  TaskOccurrence,
  ComputedOccurrence,
  DaySummary,
  AnalyticsMetrics,
} from "./types";
import {
  getLocalDateString,
  getLocalDateFromISO,
  getDaysDifference,
  parseLocalDate,
  addDays,
  formatShortDay,
  formatShortMonth,
} from "./dateUtils";
import { doesTaskOccurOnDate } from "./recurrence";

/**
 * Computes all occurrences for a specific target date from task definitions and persisted occurrences.
 */
export function computeOccurrencesForDate(
  targetDateStr: string,
  taskDefinitions: TaskDefinition[],
  persistedOccurrences: TaskOccurrence[],
  todayStr: string = getLocalDateString(),
): ComputedOccurrence[] {
  // Index persisted occurrences by taskDefinitionId + date
  const occurrenceMap = new Map<string, TaskOccurrence>();
  for (const occ of persistedOccurrences) {
    occurrenceMap.set(`${occ.taskDefinitionId}_${occ.date}`, occ);
  }

  // Also group occurrences by taskDefinitionId to easily find completion state for non-recurring tasks
  const occurrencesByTask = new Map<string, TaskOccurrence[]>();
  for (const occ of persistedOccurrences) {
    if (!occurrencesByTask.has(occ.taskDefinitionId)) {
      occurrencesByTask.set(occ.taskDefinitionId, []);
    }
    occurrencesByTask.get(occ.taskDefinitionId)!.push(occ);
  }

  const computed: ComputedOccurrence[] = [];

  for (const task of taskDefinitions) {
    if (task.isRecurring) {
      // Recurring task handling:
      if (!doesTaskOccurOnDate(task, targetDateStr)) {
        continue;
      }

      const key = `${task.id}_${targetDateStr}`;
      const existingOcc = occurrenceMap.get(key);

      computed.push({
        id: existingOcc?.id || key,
        taskDefinitionId: task.id,
        title: task.title,
        description: task.description,
        isRecurring: true,
        recurrenceRule: task.recurrenceRule || "daily",
        date: targetDateStr,
        status: existingOcc ? existingOcc.status : "pending",
        completedAt: existingOcc?.completedAt,
        daysOld: 0,
        startDate: task.startDate,
        createdAt: task.createdAt,
        isMaterialized: Boolean(existingOcc),
      });
    } else {
      // Non-recurring task handling:
      // If deletedFrom is set and targetDateStr >= deletedFrom, it ceases to appear
      if (task.deletedFrom && targetDateStr >= task.deletedFrom) {
        continue;
      }
      if (task.status === "deleted" && !task.deletedFrom) {
        continue;
      }

      const createdDateStr = getLocalDateFromISO(task.createdAt);

      // Task cannot exist before its creation date
      if (targetDateStr < createdDateStr) {
        continue;
      }

      // Check if this non-recurring task has been completed
      const taskOccs = occurrencesByTask.get(task.id) || [];
      const completedOcc = taskOccs.find((o) => o.status === "completed");

      // If task is marked deleted and was never completed on a past day, omit it
      if (task.status === "deleted" && !completedOcc) {
        continue;
      }

      if (completedOcc) {
        // If completed:
        // - On the day it was completed: show it as completed!
        // - On days before the completion day (and >= createdDate): show as pending (historical uncompleted on that day)
        // - On days AFTER the completion day: DO NOT SHOW (does not roll forward into the future)
        if (targetDateStr > completedOcc.date) {
          continue;
        }

        const isCompletionDay = targetDateStr === completedOcc.date;
        const key = `${task.id}_${targetDateStr}`;
        const existingOcc = occurrenceMap.get(key);

        const age = Math.max(
          0,
          getDaysDifference(createdDateStr, targetDateStr),
        );

        computed.push({
          id: isCompletionDay ? completedOcc.id : key,
          taskDefinitionId: task.id,
          title: task.title,
          description: task.description,
          isRecurring: false,
          date: targetDateStr,
          status: isCompletionDay
            ? "completed"
            : existingOcc?.status || "pending",
          completedAt: isCompletionDay ? completedOcc.completedAt : undefined,
          daysOld: age,
          startDate: task.startDate,
          createdAt: task.createdAt,
          isMaterialized: isCompletionDay || Boolean(existingOcc),
        });
      } else {
        // Non-recurring, not yet completed:
        // Rolls forward to todayStr.
        // For future days (targetDateStr > todayStr), do NOT preemptively show past pending tasks
        // unless specifically scheduled for that future date.
        if (
          targetDateStr > todayStr &&
          task.startDate !== targetDateStr &&
          createdDateStr !== targetDateStr
        ) {
          continue;
        }

        const key = `${task.id}_${targetDateStr}`;
        const existingOcc = occurrenceMap.get(key);
        const age = Math.max(
          0,
          getDaysDifference(createdDateStr, targetDateStr),
        );

        computed.push({
          id: existingOcc?.id || key,
          taskDefinitionId: task.id,
          title: task.title,
          description: task.description,
          isRecurring: false,
          date: targetDateStr,
          status: existingOcc ? existingOcc.status : "pending",
          completedAt: existingOcc?.completedAt,
          daysOld: age,
          startDate: task.startDate,
          createdAt: task.createdAt,
          isMaterialized: Boolean(existingOcc),
        });
      }
    }
  }

  // Stable sort:
  // 1. Pending before completed
  // 2. Older carry-over tasks first
  // 3. Alphabetical / creation
  return computed.sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    if (b.daysOld !== a.daysOld) return b.daysOld - a.daysOld;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Computes a DaySummary for the calendar view for a given date.
 */
export function computeDaySummary(
  dateStr: string,
  taskDefinitions: TaskDefinition[],
  persistedOccurrences: TaskOccurrence[],
  todayStr: string = getLocalDateString(),
): DaySummary {
  const occurrences = computeOccurrencesForDate(
    dateStr,
    taskDefinitions,
    persistedOccurrences,
    todayStr,
  );
  const totalCount = occurrences.length;
  const completedCount = occurrences.filter(
    (o) => o.status === "completed",
  ).length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const d = parseLocalDate(dateStr);

  return {
    date: dateStr,
    dayName: formatShortDay(dateStr),
    dayNumber: d.getDate(),
    monthName: formatShortMonth(dateStr),
    isToday: dateStr === todayStr,
    isPast: dateStr < todayStr,
    isFuture: dateStr > todayStr,
    totalCount,
    completedCount,
    completionPercentage,
    occurrences,
  };
}

/**
 * Computes overall analytics metrics:
 * - Current completion streak (consecutive days with at least 50% completion)
 * - 7-day and 30-day completion rates
 * - Carry-over counts
 */
export function computeAnalytics(
  taskDefinitions: TaskDefinition[],
  persistedOccurrences: TaskOccurrence[],
  todayStr: string = getLocalDateString(),
): AnalyticsMetrics {
  const activeDefinitions = taskDefinitions.filter(
    (t) => t.status === "active",
  );
  const recurringCount = activeDefinitions.filter((t) => t.isRecurring).length;

  // Check carry-over count for today: non-recurring pending tasks with daysOld > 0
  const todayOccurrences = computeOccurrencesForDate(
    todayStr,
    taskDefinitions,
    persistedOccurrences,
    todayStr,
  );
  const carryOverCount = todayOccurrences.filter(
    (o) => !o.isRecurring && o.status === "pending" && o.daysOld > 0,
  ).length;

  // A streak day requires at least half of its scheduled tasks to be completed.
  const isDayStreakSuccessful = (dateStr: string) => {
    const summary = computeDaySummary(
      dateStr,
      taskDefinitions,
      persistedOccurrences,
      todayStr,
    );
    if (summary.totalCount === 0) return false;
    return summary.completionPercentage >= 50;
  };

  // Streak calculation (look back up to 60 days)
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  // Check today: a 50%+ completion day starts or extends the current streak.
  const todayCountsForStreak = isDayStreakSuccessful(todayStr);
  if (todayCountsForStreak) {
    currentStreak++;
  }

  // Look back up to 60 past days
  for (let i = 1; i <= 60; i++) {
    const pastDate = addDays(todayStr, -i);
    const summary = computeDaySummary(
      pastDate,
      taskDefinitions,
      persistedOccurrences,
      todayStr,
    );

    if (summary.totalCount > 0) {
      if (isDayStreakSuccessful(pastDate)) {
        if (currentStreak === i - (todayCountsForStreak ? 0 : 1)) {
          currentStreak++;
        }
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
  }
  bestStreak = Math.max(bestStreak, currentStreak);

  // 7-day completion rate
  let totalOcc7d = 0;
  let completedOcc7d = 0;
  for (let i = 0; i < 7; i++) {
    const date = addDays(todayStr, -i);
    const summary = computeDaySummary(
      date,
      taskDefinitions,
      persistedOccurrences,
      todayStr,
    );
    totalOcc7d += summary.totalCount;
    completedOcc7d += summary.completedCount;
  }
  const completionRate7d =
    totalOcc7d > 0 ? Math.round((completedOcc7d / totalOcc7d) * 100) : 0;

  // 30-day completion rate
  let totalOcc30d = 0;
  let completedOcc30d = 0;
  for (let i = 0; i < 30; i++) {
    const date = addDays(todayStr, -i);
    const summary = computeDaySummary(
      date,
      taskDefinitions,
      persistedOccurrences,
      todayStr,
    );
    totalOcc30d += summary.totalCount;
    completedOcc30d += summary.completedCount;
  }
  const completionRate30d =
    totalOcc30d > 0 ? Math.round((completedOcc30d / totalOcc30d) * 100) : 0;

  return {
    currentStreak,
    bestStreak,
    completionRate7d,
    completionRate30d,
    totalActiveTasks: activeDefinitions.length,
    recurringCount,
    carryOverCount,
  };
}

/**
 * Returns an array of DaySummary for every day in the given month (YYYY-MM).
 * Fills leading/trailing blanks so the grid always starts on Monday.
 */
export function computeMonthlyData(
  yearMonth: string, // 'YYYY-MM'
  taskDefinitions: TaskDefinition[],
  persistedOccurrences: TaskOccurrence[],
  todayStr: string = getLocalDateString(),
): (DaySummary | null)[] {
  const [year, month] = yearMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const totalDays = lastDay.getDate();

  // Monday-based week offset (0=Mon…6=Sun)
  const startDow = (firstDay.getDay() + 6) % 7;

  const cells: (DaySummary | null)[] = [];
  // Leading blanks
  for (let i = 0; i < startDow; i++) cells.push(null);

  for (let d = 1; d <= totalDays; d++) {
    const mm = String(month).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateStr = `${year}-${mm}-${dd}`;
    cells.push(
      computeDaySummary(
        dateStr,
        taskDefinitions,
        persistedOccurrences,
        todayStr,
      ),
    );
  }

  // Trailing blanks to complete the last row
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}
