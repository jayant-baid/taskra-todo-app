import { db, SyncQueueItem } from "../db/dexie";
import { getClientToken } from "../hooks/useAuth";

/**
 * Sync Manager handles queueing local mutations and syncing with the server.
 * Uses navigator.sendBeacon when page is hidden/unloading, and fetch during active intervals.
 */

let isSyncing = false;

export async function queueSyncItem(
  action: SyncQueueItem["action"],
  payload: unknown,
): Promise<void> {
  const item: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    payload,
    timestamp: Date.now(),
  };
  await db.syncQueue.add(item);
}

/**
 * Downloads latest tasks and occurrences from the server and updates Dexie.
 */
export async function pullServerState(): Promise<{
  success: boolean;
  updated: boolean;
}> {
  if (typeof window === "undefined") return { success: false, updated: false };

  const token = getClientToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch("/api/sync", {
      headers,
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, updated: false };
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.tasks)) {
      await db.transaction(
        "rw",
        [db.taskDefinitions, db.taskOccurrences],
        async () => {
          // Clear and replace with server ground truth
          await db.taskDefinitions.clear();
          await db.taskOccurrences.clear();
          if (data.tasks.length > 0) {
            await db.taskDefinitions.bulkPut(data.tasks);
          }
          if (Array.isArray(data.occurrences) && data.occurrences.length > 0) {
            await db.taskOccurrences.bulkPut(data.occurrences);
          }
        },
      );
      return { success: true, updated: true };
    }

    return { success: true, updated: false };
  } catch (err) {
    console.warn("[SyncManager] Pull from server failed:", err);
    return { success: false, updated: false };
  }
}

export async function flushSyncQueue(): Promise<{
  syncedCount: number;
  success: boolean;
}> {
  if (isSyncing || typeof window === "undefined") {
    return { syncedCount: 0, success: true };
  }

  const token = getClientToken();

  try {
    isSyncing = true;
    const items = await db.syncQueue.orderBy("timestamp").toArray();
    if (items.length === 0) {
      return { syncedCount: 0, success: true };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch("/api/sync", {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ items }),
    });

    if (res.ok) {
      const ids = items.map((i) => i.id);
      await db.syncQueue.bulkDelete(ids);
      return { syncedCount: items.length, success: true };
    }
    return { syncedCount: 0, success: false };
  } catch (err) {
    console.warn(
      "[SyncManager] Background sync paused (offline or server unavailable):",
      err,
    );
    return { syncedCount: 0, success: false };
  } finally {
    isSyncing = false;
  }
}

/**
 * Initializes listeners for visibilitychange (sendBeacon), focus, online, and periodic sync.
 */
export function initBackgroundSync(onDataPulled?: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleVisibilityChange = async () => {
    if (document.visibilityState === "hidden") {
      const items = await db.syncQueue.orderBy("timestamp").toArray();
      if (items.length > 0) {
        const payload = JSON.stringify({ items, trigger: "visibility_hidden" });
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/sync", payload);
        }
      }
    } else if (document.visibilityState === "visible") {
      await flushSyncQueue();
      const pullRes = await pullServerState();
      if (pullRes.updated && onDataPulled) {
        onDataPulled();
      }
    }
  };

  const handleFocus = async () => {
    await flushSyncQueue();
    const pullRes = await pullServerState();
    if (pullRes.updated && onDataPulled) {
      onDataPulled();
    }
  };

  const handleOnline = async () => {
    await flushSyncQueue();
    const pullRes = await pullServerState();
    if (pullRes.updated && onDataPulled) {
      onDataPulled();
    }
  };

  window.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", handleFocus);
  window.addEventListener("online", handleOnline);

  // Periodic sync every 30s
  const intervalId = setInterval(async () => {
    if (document.visibilityState === "visible") {
      await flushSyncQueue();
      const pullRes = await pullServerState();
      if (pullRes.updated && onDataPulled) {
        onDataPulled();
      }
    }
  }, 30000);

  return () => {
    window.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("online", handleOnline);
    clearInterval(intervalId);
  };
}
