import type { NewStockingRecord, StockingPageResult, StockingQuery, StockingRecord } from '@/types';
import { stockingRecords } from '@/data/stockingData';
import { simulateDelay } from './network';
import { recordActivity } from './activityLogService';

let store: StockingRecord[] = [...stockingRecords];

function resequence() {
  store = store.map((r, i) => ({ ...r, sNo: i + 1 }));
}

function withTotal(data: NewStockingRecord): number {
  return Math.round(data.unit * data.costPerItem * 100) / 100;
}

export async function getAllStocking(): Promise<StockingRecord[]> {
  return simulateDelay([...store]);
}

function filterAndSort(query: StockingQuery): StockingRecord[] {
  let rows = [...store];

  if (query.search) {
    const term = query.search.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.itemDescription.toLowerCase().includes(term) ||
        r.plNo.toLowerCase().includes(term) ||
        r.remarks.toLowerCase().includes(term) ||
        r.qForm.toLowerCase().includes(term) ||
        r.yw.toLowerCase().includes(term),
    );
  }

  if (query.year && query.year !== 'All') {
    rows = rows.filter((r) => r.year === query.year);
  }
  if (query.cw && query.cw !== 'All') {
    rows = rows.filter((r) => r.cw === query.cw);
  }
  if (query.qForm && query.qForm !== 'All') {
    rows = rows.filter((r) => r.qForm === query.qForm);
  }
  if (query.yw && query.yw !== 'All') {
    rows = rows.filter((r) => r.yw === query.yw);
  }
  if (query.pendingWith && query.pendingWith !== 'All') {
    rows = rows.filter((r) => r.pendingWith === query.pendingWith);
  }
  if (query.dateFrom) {
    rows = rows.filter((r) => r.dateReceived >= query.dateFrom!);
  }
  if (query.dateTo) {
    rows = rows.filter((r) => r.dateReceived <= query.dateTo!);
  }

  if (query.sort) {
    const { key, direction } = query.sort;
    const dir = direction === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  return rows;
}

export async function queryStocking(query: StockingQuery): Promise<StockingPageResult> {
  const rows = filterAndSort(query);

  // Total value of the *filtered* result set — used for the footer summary.
  const filteredTotalValue = rows.reduce((sum, r) => sum + r.totalValue, 0);

  const total = rows.length;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return simulateDelay({ rows: pageRows, total, page, pageSize, filteredTotalValue });
}

/** All records matching the current filters, ignoring pagination — used for "Export Filtered". */
export async function getFilteredStocking(query: StockingQuery): Promise<StockingRecord[]> {
  return simulateDelay(filterAndSort(query), 150);
}

export async function createStocking(data: NewStockingRecord): Promise<StockingRecord> {
  const record: StockingRecord = {
    ...data,
    id: `stk-${crypto.randomUUID()}`,
    sNo: store.length + 1,
    totalValue: withTotal(data),
  };
  store = [record, ...store];
  resequence();
  recordActivity(`New stocking entry added for "${record.itemDescription}"`, 'Stocking');
  return simulateDelay(record);
}

export async function updateStocking(id: string, data: NewStockingRecord): Promise<StockingRecord> {
  const idx = store.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Record not found');
  const updated: StockingRecord = {
    ...store[idx],
    ...data,
    totalValue: withTotal(data),
  };
  store[idx] = updated;
  recordActivity(`Stocking entry "${updated.itemDescription}" updated`, 'Stocking');
  return simulateDelay(updated);
}

export async function deleteStocking(id: string): Promise<void> {
  const record = store.find((r) => r.id === id);
  store = store.filter((r) => r.id !== id);
  resequence();
  if (record) {
    recordActivity(`Stocking entry "${record.itemDescription}" deleted`, 'Stocking');
  }
  return simulateDelay(undefined, 250);
}

export function getDistinctYears(): number[] {
  return Array.from(new Set(store.map((r) => r.year))).sort((a, b) => b - a);
}
export function getDistinctCw() {
  return Array.from(new Set(store.map((r) => r.cw))).sort();
}
export function getDistinctQForms(): string[] {
  return Array.from(new Set(store.map((r) => r.qForm))).sort();
}
export function getDistinctYw(): string[] {
  return Array.from(new Set(store.map((r) => r.yw))).sort();
}
export function getDistinctPendingWith(): string[] {
  return Array.from(new Set(store.map((r) => r.pendingWith))).sort();
}
