'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { db, clearAllLocalData } from '../db/dexie';
import { TaskDefinition, TaskOccurrence } from '../engine/types';
import { getLocalDateString, addDays, getWeekDays } from '../engine/dateUtils';
import { computeOccurrencesForDate, computeDaySummary, computeAnalytics, computeMonthlyData } from '../engine/taskEngine';
import { broadcastMutation, subscribeToMutations } from '../sync/broadcast';
import { queueSyncItem, initBackgroundSync, flushSyncQueue, pullServerState } from '../sync/syncManager';

export function useTasks() {
  const [taskDefinitions, setTaskDefinitions] = useState<TaskDefinition[]>([]);
  const [taskOccurrences, setTaskOccurrences] = useState<TaskOccurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWeekCenterDate, setActiveWeekCenterDate] = useState<string>(getLocalDateString());
  const [activeMonthStr, setActiveMonthStr] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const todayStr = useMemo(() => getLocalDateString(), []);
  const tomorrowStr = useMemo(() => addDays(todayStr, 1), [todayStr]);

  // Load all tasks & occurrences from Dexie
  const refreshFromDB = useCallback(async () => {
    try {
      const defs = await db.taskDefinitions.toArray();
      const occs = await db.taskOccurrences.toArray();
      setTaskDefinitions(defs);
      setTaskOccurrences(occs);
    } catch (err) {
      console.error('[useTasks] Error loading tasks from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync with server (pulls latest tasks if authenticated)
  const syncWithServer = useCallback(async () => {
    try {
      await flushSyncQueue();
      const pullRes = await pullServerState();
      if (pullRes.updated) {
        await refreshFromDB();
      }
    } catch (err) {
      console.warn('[useTasks] Server sync error:', err);
    }
  }, [refreshFromDB]);

  // Reset local state (called on logout or account switch)
  const clearLocalTasks = useCallback(async () => {
    await clearAllLocalData();
    setTaskDefinitions([]);
    setTaskOccurrences([]);
    broadcastMutation('TASK_MUTATED');
  }, []);

  // Initialize DB, background sync listeners, and cross-tab BroadcastChannel
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        // First try pulling latest from server (if logged in)
        await pullServerState();
        if (!isMounted) return;

        const defs = await db.taskDefinitions.toArray();
        const occs = await db.taskOccurrences.toArray();
        if (!isMounted) return;

        setTaskDefinitions(defs);
        setTaskOccurrences(occs);
      } catch (err) {
        console.error('[useTasks] Error initializing tasks from IndexedDB:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void initData();
    const cleanupSync = initBackgroundSync(() => {
      void refreshFromDB();
    });
    const cleanupBroadcast = subscribeToMutations(() => {
      void refreshFromDB();
    });

    return () => {
      isMounted = false;
      cleanupSync();
      cleanupBroadcast();
    };
  }, [refreshFromDB]);

  // Add Task
  const addTask = useCallback(
    async (params: {
      title: string;
      description?: string;
      isRecurring: boolean;
      recurrenceRule?: 'daily' | 'weekly';
      startDate?: string;
    }) => {
      const now = new Date();
      const effectiveStartDate = params.startDate || todayStr;

      const newTask: TaskDefinition = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: params.title.trim(),
        description: params.description?.trim() || undefined,
        isRecurring: params.isRecurring,
        recurrenceRule: params.isRecurring ? (params.recurrenceRule || 'daily') : undefined,
        startDate: effectiveStartDate,
        createdAt: now.toISOString(),
        status: 'active',
      };

      // Optimistic update
      setTaskDefinitions((prev) => [...prev, newTask]);

      // DB write
      await db.taskDefinitions.put(newTask);
      await queueSyncItem('UPSERT_TASK', newTask);
      broadcastMutation('TASK_MUTATED');
      void flushSyncQueue();

      return newTask;
    },
    [todayStr]
  );

  // Toggle Occurrence Completion
  const toggleOccurrence = useCallback(
    async (taskDefId: string, dateStr: string) => {
      const key = `${taskDefId}_${dateStr}`;
      const existingOcc = taskOccurrences.find(
        (o) => o.taskDefinitionId === taskDefId && o.date === dateStr
      );

      const nextStatus = existingOcc?.status === 'completed' ? 'pending' : 'completed';
      const updatedOcc: TaskOccurrence = {
        id: existingOcc?.id || key,
        taskDefinitionId: taskDefId,
        date: dateStr,
        status: nextStatus,
        completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setTaskOccurrences((prev) => {
        const index = prev.findIndex(
          (o) => o.taskDefinitionId === taskDefId && o.date === dateStr
        );
        if (index >= 0) {
          const next = [...prev];
          next[index] = updatedOcc;
          return next;
        }
        return [...prev, updatedOcc];
      });

      // DB write
      await db.taskOccurrences.put(updatedOcc);
      await queueSyncItem('UPSERT_OCCURRENCE', updatedOcc);
      broadcastMutation('TASK_MUTATED');
      void flushSyncQueue();
    },
    [taskOccurrences]
  );

  // Delete Individual Task with correct semantics (§3.3)
  const deleteTask = useCallback(
    async (taskDefId: string) => {
      const task = taskDefinitions.find((t) => t.id === taskDefId);
      if (!task) return;

      if (task.isRecurring) {
        // Recurring task delete:
        // Set deletedFrom = todayStr on definition.
        // Past occurrences (< today) remain untouched in history!
        // Future/today occurrences cease to materialize.
        const updatedTask: TaskDefinition = {
          ...task,
          deletedFrom: todayStr,
          status: 'deleted',
        };

        setTaskDefinitions((prev) =>
          prev.map((t) => (t.id === taskDefId ? updatedTask : t))
        );
        await db.taskDefinitions.put(updatedTask);
        await queueSyncItem('UPSERT_TASK', updatedTask);
      } else {
        // Non-recurring task delete:
        // Soft delete definition with deletedFrom = todayStr so past history remains preserved
        const updatedTask: TaskDefinition = {
          ...task,
          deletedFrom: todayStr,
          status: 'deleted',
        };

        setTaskDefinitions((prev) =>
          prev.map((t) => (t.id === taskDefId ? updatedTask : t))
        );
        await db.taskDefinitions.put(updatedTask);
        await queueSyncItem('DELETE_TASK', { id: taskDefId, deletedFrom: todayStr });
      }

      broadcastMutation('TASK_MUTATED');
      void flushSyncQueue();
    },
    [taskDefinitions, todayStr]
  );

  // Remove All Data (Removes all active today & upcoming tasks, preserving past records)
  const removeAllTasks = useCallback(async () => {
    // Soft delete all active definitions from today onward
    const activeTasks = taskDefinitions.filter((t) => t.status === 'active');
    if (activeTasks.length === 0) return;

    const updatedTasks = taskDefinitions.map((task) => {
      if (task.status === 'active') {
        return {
          ...task,
          deletedFrom: todayStr,
          status: 'deleted' as const,
        };
      }
      return task;
    });

    setTaskDefinitions(updatedTasks);
    await db.taskDefinitions.bulkPut(updatedTasks);
    await queueSyncItem('REMOVE_ALL', { deletedFrom: todayStr });
    broadcastMutation('TASK_MUTATED');
    void flushSyncQueue();
  }, [taskDefinitions, todayStr]);

  // Derived: Today and Tomorrow occurrences
  const todayOccurrences = useMemo(() => {
    return computeOccurrencesForDate(todayStr, taskDefinitions, taskOccurrences, todayStr);
  }, [todayStr, taskDefinitions, taskOccurrences]);

  const tomorrowOccurrences = useMemo(() => {
    return computeOccurrencesForDate(tomorrowStr, taskDefinitions, taskOccurrences, todayStr);
  }, [tomorrowStr, taskDefinitions, taskOccurrences, todayStr]);

  // Derived: Week summaries for the Calendar view
  const weekSummaries = useMemo(() => {
    const weekDates = getWeekDays(activeWeekCenterDate, true);
    return weekDates.map((dateStr) =>
      computeDaySummary(dateStr, taskDefinitions, taskOccurrences, todayStr)
    );
  }, [activeWeekCenterDate, taskDefinitions, taskOccurrences, todayStr]);

  // Derived: Overall Analytics metrics
  const analytics = useMemo(() => {
    return computeAnalytics(taskDefinitions, taskOccurrences, todayStr);
  }, [taskDefinitions, taskOccurrences, todayStr]);

  // Helper to query occurrences for any custom date (e.g. when opening past day modal)
  const getOccurrencesForDate = useCallback(
    (dateStr: string) => {
      return computeOccurrencesForDate(dateStr, taskDefinitions, taskOccurrences, todayStr);
    },
    [taskDefinitions, taskOccurrences, todayStr]
  );

  // Week navigation helpers
  const goToPreviousWeek = useCallback(() => {
    setActiveWeekCenterDate((prev) => addDays(prev, -7));
  }, []);

  const goToNextWeek = useCallback(() => {
    setActiveWeekCenterDate((prev) => addDays(prev, 7));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setActiveWeekCenterDate(todayStr);
  }, [todayStr]);

  return {
    todayStr,
    tomorrowStr,
    activeWeekCenterDate,
    todayOccurrences,
    tomorrowOccurrences,
    weekSummaries,
    analytics,
    isLoading,
    addTask,
    toggleOccurrence,
    deleteTask,
    removeAllTasks,
    syncWithServer,
    clearLocalTasks,
    refreshFromDB,
    getOccurrencesForDate,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
}
