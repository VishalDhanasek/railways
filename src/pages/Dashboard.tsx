import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrainFront, Package, Clock, CheckCircle2, Boxes, AlertTriangle, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { getDashboardSummary } from '@/services/dashboardService';
import { getRecentActivity } from '@/services/activityLogService';
import type { ActivityLogEntry, DashboardSummary } from '@/types';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activity, setActivity] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getDashboardSummary(), getRecentActivity(6)]).then(([s, a]) => {
      if (cancelled) return;
      setSummary(s);
      setActivity(a);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of coach & wagon alterations and stocking application records"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Coach Alterations"
          value={summary?.totalCoachAlterations ?? 0}
          icon={TrainFront}
          tone="blue"
          hint="All coach alteration records"
          loading={loading}
        />
        <StatCard
          label="Total Wagon Alterations"
          value={summary?.totalWagonAlterations ?? 0}
          icon={Package}
          tone="indigo"
          hint="All wagon alteration records"
          loading={loading}
        />
        <StatCard
          label="Pending Alterations"
          value={summary?.pendingAlterations ?? 0}
          icon={Clock}
          tone="amber"
          hint="Pending, in progress or on hold"
          loading={loading}
        />
        <StatCard
          label="Completed Alterations"
          value={summary?.completedAlterations ?? 0}
          icon={CheckCircle2}
          tone="emerald"
          hint="Verified and closed"
          loading={loading}
        />
        <StatCard
          label="Total Stocking Records"
          value={summary?.totalStockingRecords ?? 0}
          icon={Boxes}
          tone="violet"
          hint="Stocking application entries"
          loading={loading}
        />
        <StatCard
          label="Pending Stocking Records"
          value={summary?.pendingStockingRecords ?? 0}
          icon={AlertTriangle}
          tone="rose"
          hint="Awaiting clearance / inspection"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentActivity entries={activity} loading={loading} />
        </div>

        <Card className="p-5">
          <h2 className="text-[15px] font-semibold text-slate-800">Quick Links</h2>
          <p className="mt-0.5 text-xs text-slate-500">Jump to a section</p>
          <div className="mt-4 space-y-2">
            <QuickLink to="/alteration/coach" label="Coach Alteration" description="Nomenclature alteration register for coaches" />
            <QuickLink to="/alteration/wagon" label="Wagon Alteration" description="Nomenclature alteration register for wagons" />
            <QuickLink to="/stocking" label="Stocking Application" description="Manage stores stocking records" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickLink({ to, label, description }: { to: string; label: string; description: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
    >
      <div>
        <p className="text-[13.5px] font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-300" />
    </Link>
  );
}
