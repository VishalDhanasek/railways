import type { DashboardSummary } from '@/types';
import { getAllAlterations } from './alterationService';
import { getAllStocking } from './stockingService';
import { simulateDelay } from './network';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [coaches, wagons, stocking] = await Promise.all([
    getAllAlterations('coach'),
    getAllAlterations('wagon'),
    getAllStocking(),
  ]);

  const allAlterations = [...coaches, ...wagons];
  const pendingAlterations = allAlterations.filter((r) => r.status === 'Pending' || r.status === 'In Progress' || r.status === 'On Hold').length;
  const completedAlterations = allAlterations.filter((r) => r.status === 'Completed').length;
  const pendingStockingRecords = stocking.filter((r) => r.pendingWith !== '—').length;

  const summary: DashboardSummary = {
    totalCoachAlterations: coaches.length,
    totalWagonAlterations: wagons.length,
    pendingAlterations,
    completedAlterations,
    totalStockingRecords: stocking.length,
    pendingStockingRecords,
  };

  return simulateDelay(summary, 400);
}
