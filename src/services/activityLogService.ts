import type { ActivityLogEntry } from '@/types';
import { initialActivityLog } from '@/data/activityData';
import { simulateDelay } from './network';

// In-memory store standing in for a real activity/audit-log table.
let log: ActivityLogEntry[] = [...initialActivityLog];
let nextId = log.length + 1;

export function recordActivity(message: string, category: ActivityLogEntry['category']): void {
  const entry: ActivityLogEntry = {
    id: `act-${nextId++}`,
    message,
    category,
    timestamp: new Date().toISOString(),
  };
  log = [entry, ...log];
}

export async function getRecentActivity(limit = 8): Promise<ActivityLogEntry[]> {
  return simulateDelay(log.slice(0, limit), 300);
}
