import type { StockingRecord } from '@/types';

// ---------------------------------------------------------------------------
// Initial seed data for the in-memory stocking store (see
// src/services/stockingService.ts). Empty by design — no dummy/demo
// records. Populate this array (or point the service at a real API) to
// preload data.
// ---------------------------------------------------------------------------

export const stockingRecords: StockingRecord[] = [];
