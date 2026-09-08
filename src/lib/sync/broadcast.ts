/**
 * Cross-tab synchronization via BroadcastChannel API.
 */

export interface BroadcastMessage {
  type: 'TASK_MUTATED' | 'SAMPLE_DATA_LOADED';
  timestamp: number;
  originTabId: string;
}

const TAB_ID = Math.random().toString(36).substring(2, 9);

let channel: BroadcastChannel | null = null;

export function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel('recurring_todo_channel');
  }
  return channel;
}

export function broadcastMutation(type: BroadcastMessage['type'] = 'TASK_MUTATED') {
  const ch = getBroadcastChannel();
  if (ch) {
    ch.postMessage({
      type,
      timestamp: Date.now(),
      originTabId: TAB_ID,
    } as BroadcastMessage);
  }
}

export function subscribeToMutations(callback: (msg: BroadcastMessage) => void): () => void {
  const ch = getBroadcastChannel();
  if (!ch) return () => {};

  const handler = (event: MessageEvent<BroadcastMessage>) => {
    // Ignore messages from this own tab
    if (event.data && event.data.originTabId !== TAB_ID) {
      callback(event.data);
    }
  };

  ch.addEventListener('message', handler);
  return () => {
    ch.removeEventListener('message', handler);
  };
}
