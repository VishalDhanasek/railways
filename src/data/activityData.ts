import type { ActivityLogEntry } from '@/types';

// ---------------------------------------------------------------------------
// Initial seed data for the in-memory activity log (see
// src/services/activityLogService.ts). Empty by design — no dummy/demo
// entries. The log fills in naturally as records are added/edited/deleted.
// ---------------------------------------------------------------------------

export const initialActivityLog: ActivityLogEntry[] = [];
