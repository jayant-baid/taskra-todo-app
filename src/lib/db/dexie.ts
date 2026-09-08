import Dexie, { Table } from 'dexie';
import { TaskDefinition, TaskOccurrence } from '../engine/types';

export interface SyncQueueItem {
  id: string;
  action: 'UPSERT_TASK' | 'DELETE_TASK' | 'UPSERT_OCCURRENCE' | 'REMOVE_ALL';
  payload: unknown;
  timestamp: number;
}

export class RecurringTodoDB extends Dexie {
  taskDefinitions!: Table<TaskDefinition, string>;
  taskOccurrences!: Table<TaskOccurrence, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('RecurringTodoDB');
    this.version(1).stores({
      taskDefinitions: 'id, isRecurring, status, startDate, deletedFrom, createdAt',
      taskOccurrences: 'id, taskDefinitionId, date, status, [taskDefinitionId+date]',
      syncQueue: 'id, timestamp, action',
    });
  }
}

export const db = new RecurringTodoDB();

/**
 * Clears all local task definitions, occurrences, and pending sync items.
 */
export async function clearAllLocalData(): Promise<void> {
  await db.taskDefinitions.clear();
  await db.taskOccurrences.clear();
  await db.syncQueue.clear();
}
