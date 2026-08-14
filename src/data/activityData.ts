import type { ActivityLogEntry } from '@/types';
import { coachAlterations, wagonAlterations } from './alterationData';
import { stockingRecords } from './stockingData';

function isoDateTime(hoursAgo: number): string {
  const d = new Date('2026-08-13T09:30:00Z');
  d.setUTCHours(d.getUTCHours() - hoursAgo);
  return d.toISOString();
}

/** Seed a handful of recent activity entries derived from the sample data. */
export const initialActivityLog: ActivityLogEntry[] = [
  {
    id: 'act-1',
    message: `Coach alteration ${coachAlterations[0].tlNo} recorded`,
    category: 'Coach',
    timestamp: isoDateTime(1),
  },
  {
    id: 'act-2',
    message: `New stocking entry added for "${stockingRecords[0].itemDescription}"`,
    category: 'Stocking',
    timestamp: isoDateTime(3),
  },
  {
    id: 'act-3',
    message: `Wagon alteration ${wagonAlterations[1].tlNo} status updated to "${wagonAlterations[1].status}"`,
    category: 'Wagon',
    timestamp: isoDateTime(6),
  },
  {
    id: 'act-4',
    message: `Stocking record "${stockingRecords[2].itemDescription}" pending with ${stockingRecords[2].pendingWith}`,
    category: 'Stocking',
    timestamp: isoDateTime(10),
  },
  {
    id: 'act-5',
    message: `Coach alteration ${coachAlterations[3].tlNo} description updated`,
    category: 'Coach',
    timestamp: isoDateTime(18),
  },
  {
    id: 'act-6',
    message: `Wagon alteration ${wagonAlterations[4].tlNo} marked Completed with supporting document attached`,
    category: 'Wagon',
    timestamp: isoDateTime(26),
  },
];
