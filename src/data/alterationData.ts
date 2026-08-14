import type { AlterationRecord } from '@/types';

// ---------------------------------------------------------------------------
// Initial seed data for the in-memory alteration stores (see
// src/services/alterationService.ts). Empty by design — no dummy/demo
// records. Populate these arrays (or point the service at a real API) to
// preload data.
// ---------------------------------------------------------------------------

export const coachAlterations: AlterationRecord[] = [];
export const wagonAlterations: AlterationRecord[] = [];
