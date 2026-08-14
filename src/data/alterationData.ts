import type { AlterationRecord, AlterationStatus, AssetKind } from '@/types';

// ---------------------------------------------------------------------------
// Deterministic sample data generators. No Math.random() is used so the demo
// data is stable across reloads — swap these generators for real API calls
// once a backend is available (see src/services).
// ---------------------------------------------------------------------------

const STATUSES: AlterationStatus[] = ['Pending', 'In Progress', 'Completed', 'On Hold'];

const COACH_ALTERATIONS = [
  'Toilet system conversion to bio-vacuum',
  'Berth modification – upper to side-lower',
  'Fire retardant panel replacement',
  'CCTV camera fitment',
  'Charging point (USB) installation',
  'Window glass upgrade to safety glass',
  'Pantry equipment modification',
  'Flooring replacement – vinyl to FRP',
  'Wheelchair ramp fitment',
  'Emergency lighting upgrade',
];

const WAGON_ALTERATIONS = [
  'Brake system upgrade to air-brake',
  'CBC coupler retrofitting',
  'Body corrosion repair & repainting',
  'Bogie modification – ICF to LHB type',
  'Door mechanism replacement',
  'Load sensing device fitment',
  'Underframe reinforcement',
  'Roller bearing conversion',
  'Discharge chute modification',
  'Buffer replacement',
];

const REMARKS_BY_STATUS: Record<AlterationStatus, string> = {
  Completed: 'Work completed and verified by inspection.',
  'On Hold': 'Awaiting spare part availability.',
  'In Progress': 'Fitment in progress at workshop.',
  Pending: 'Awaiting sanction from competent authority.',
};

function isoDate(daysAgo: number): string {
  const d = new Date('2026-08-13T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function tlNo(prefix: string, i: number): string {
  return `TL/${prefix}/${2024 + (i % 3)}/${String(100 + i).padStart(4, '0')}`;
}

function buildRecords(kind: AssetKind, count: number): AlterationRecord[] {
  const prefix = kind === 'coach' ? 'CH' : 'WG';
  const descriptions = kind === 'coach' ? COACH_ALTERATIONS : WAGON_ALTERATIONS;

  return Array.from({ length: count }, (_, i) => {
    const status = STATUSES[i % STATUSES.length];
    return {
      id: `${kind}-${i + 1}`,
      sNo: i + 1,
      kind,
      date: isoDate(10 + ((i * 7) % 180)),
      tlNo: tlNo(prefix, i),
      description: descriptions[i % descriptions.length],
      status,
      remarks: REMARKS_BY_STATUS[status],
      attachments: [],
    } satisfies AlterationRecord;
  });
}

export const coachAlterations: AlterationRecord[] = buildRecords('coach', 42);
export const wagonAlterations: AlterationRecord[] = buildRecords('wagon', 38);
