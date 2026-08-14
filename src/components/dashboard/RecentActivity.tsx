import { TrainFront, Package, Boxes } from 'lucide-react';
import clsx from 'clsx';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import { timeAgo } from '@/utils/format';
import type { ActivityLogEntry } from '@/types';

const ICONS: Record<ActivityLogEntry['category'], typeof TrainFront> = {
  Coach: TrainFront,
  Wagon: Package,
  Stocking: Boxes,
};

const TONES: Record<ActivityLogEntry['category'], string> = {
  Coach: 'bg-blue-50 text-blue-600',
  Wagon: 'bg-indigo-50 text-indigo-600',
  Stocking: 'bg-violet-50 text-violet-600',
};

export default function RecentActivity({ entries, loading }: { entries: ActivityLogEntry[]; loading?: boolean }) {
  return (
    <Card className="flex flex-col">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[15px] font-semibold text-slate-800">Recent Activity</h2>
        <p className="mt-0.5 text-xs text-slate-500">Latest updates across alterations and stocking</p>
      </div>

      {loading ? (
        <div className="space-y-4 px-5 py-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200" />
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState title="No recent activity" description="Activity will appear here as records are updated." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {entries.map((entry) => {
            const Icon = ICONS[entry.category];
            return (
              <li key={entry.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className={clsx('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', TONES[entry.category])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] text-slate-700">{entry.message}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{timeAgo(entry.timestamp)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
