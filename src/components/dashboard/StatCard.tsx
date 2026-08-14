import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import Card from '@/components/ui/Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: 'blue' | 'indigo' | 'amber' | 'emerald' | 'violet' | 'rose';
  hint?: string;
  loading?: boolean;
}

const TONE_STYLES: Record<StatCardProps['tone'], { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
};

export default function StatCard({ label, value, icon: Icon, tone, hint, loading }: StatCardProps) {
  const styles = TONE_STYLES[tone];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-7 w-16 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-800">{value}</p>
          )}
          {hint && !loading && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', styles.bg)}>
          <Icon className={clsx('h-5 w-5', styles.text)} />
        </div>
      </div>
    </Card>
  );
}
