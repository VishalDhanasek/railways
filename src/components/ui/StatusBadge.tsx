import clsx from 'clsx';
import type { AlterationStatus } from '@/types';

const STATUS_STYLES: Record<AlterationStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'On Hold': 'bg-slate-100 text-slate-600 ring-slate-200',
};

const STATUS_DOT: Record<AlterationStatus, string> = {
  Pending: 'bg-amber-500',
  'In Progress': 'bg-blue-500',
  Completed: 'bg-emerald-500',
  'On Hold': 'bg-slate-400',
};

export function StatusBadge({ status }: { status: AlterationStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        STATUS_STYLES[status],
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', STATUS_DOT[status])} />
      {status}
    </span>
  );
}

/** Generic badge for "Pending With" style fields — neutral vs. active officer. */
export function PendingWithBadge({ value }: { value: string }) {
  const isClear = value === '—' || value.trim() === '';
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap',
        isClear ? 'bg-slate-50 text-slate-400 ring-slate-200' : 'bg-violet-50 text-violet-700 ring-violet-200',
      )}
    >
      {value}
    </span>
  );
}
