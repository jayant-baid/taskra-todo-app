import { TaskDefinition } from './types';
import { parseLocalDate } from './dateUtils';

/**
 * Checks if a task definition should generate an occurrence on targetDateStr.
 */
export function doesTaskOccurOnDate(task: TaskDefinition, targetDateStr: string): boolean {
  // Soft-deleted check for recurring tasks:
  // If deletedFrom is set and targetDateStr >= deletedFrom, it ceases to occur
  if (task.deletedFrom && targetDateStr >= task.deletedFrom) {
    return false;
  }

  // Non-recurring tasks are handled via roll-forward logic in taskEngine.ts
  if (!task.isRecurring) {
    return false;
  }

  // Task cannot occur before its startDate
  if (targetDateStr < task.startDate) {
    return false;
  }

  const rule = (task.recurrenceRule || 'daily').toLowerCase();

  if (rule === 'daily') {
    return true;
  }

  if (rule === 'weekly') {
    const startDayOfWeek = parseLocalDate(task.startDate).getDay();
    const targetDayOfWeek = parseLocalDate(targetDateStr).getDay();
    return startDayOfWeek === targetDayOfWeek;
  }

  if (rule === 'weekdays') {
    const targetDayOfWeek = parseLocalDate(targetDateStr).getDay();
    // 0 is Sunday, 6 is Saturday
    return targetDayOfWeek !== 0 && targetDayOfWeek !== 6;
  }

  // Custom or fallback to daily if unknown
  return true;
}
