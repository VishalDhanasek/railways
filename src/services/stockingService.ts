import type { NewStockingRecord, StockingPageResult, StockingQuery, StockingRecord } from '@/types';
import { recordActivity } from './activityLogService';

// ---------------------------------------------------------------------------
// Talks to the Express + Excel backend in server/index.js — see that file
// for the actual persistence (server/data/stocking.xlsx). Filtering/sorting/
// pagination stay client-side against the full list returned by the API,
// same as when this was an in-memory mock.
// ---------------------------------------------------------------------------

async function parseOrThrow(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? undefined : res.json();
}

export async function getAllStocking(): Promise<StockingRecord[]> {
  return parseOrThrow(await fetch('/api/stocking'));
}

function filterAndSort(rows: StockingRecord[], query: StockingQuery): StockingRecord[] {
  let result = [...rows];

  if (query.search) {
    const term = query.search.trim().toLowerCase();
    result = result.filter(
      (r) =>
        r.itemDescription.toLowerCase().includes(term) ||
        r.plNo.toLowerCase().includes(term) ||
        r.remarks.toLowerCase().includes(term) ||
        r.qForm.toLowerCase().includes(term) ||
        r.yw.toLowerCase().includes(term),
    );
  }

  if (query.year && query.year !== 'All') {
    result = result.filter((r) => r.year === query.year);
  }
  if (query.cw && query.cw !== 'All') {
    result = result.filter((r) => r.cw === query.cw);
  }
  if (query.qForm && query.qForm !== 'All') {
    result = result.filter((r) => r.qForm === query.qForm);
  }
  if (query.yw && query.yw !== 'All') {
    result = result.filter((r) => r.yw === query.yw);
  }
  if (query.pendingWith && query.pendingWith !== 'All') {
    result = result.filter((r) => r.pendingWith === query.pendingWith);
  }
  if (query.dateFrom) {
    result = result.filter((r) => r.dateReceived >= query.dateFrom!);
  }
  if (query.dateTo) {
    result = result.filter((r) => r.dateReceived <= query.dateTo!);
  }

  if (query.sort) {
    const { key, direction } = query.sort;
    const dir = direction === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }

  return result;
}

export async function queryStocking(query: StockingQuery): Promise<StockingPageResult> {
  const all = await getAllStocking();
  const rows = filterAndSort(all, query);

  // Total value of the *filtered* result set — used for the footer summary.
  const filteredTotalValue = rows.reduce((sum, r) => sum + r.totalValue, 0);

  const total = rows.length;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return { rows: pageRows, total, page, pageSize, filteredTotalValue };
}

/** All records matching the current filters, ignoring pagination — used for "Export Filtered". */
export async function getFilteredStocking(query: StockingQuery): Promise<StockingRecord[]> {
  return filterAndSort(await getAllStocking(), query);
}

export async function createStocking(data: NewStockingRecord): Promise<StockingRecord> {
  const record = await parseOrThrow(
    await fetch('/api/stocking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
  recordActivity(`New stocking entry added for "${record.itemDescription}"`, 'Stocking');
  return record;
}

export async function updateStocking(id: string, data: NewStockingRecord): Promise<StockingRecord> {
  const record = await parseOrThrow(
    await fetch(`/api/stocking/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
  recordActivity(`Stocking entry "${record.itemDescription}" updated`, 'Stocking');
  return record;
}

export async function deleteStocking(id: string): Promise<void> {
  await parseOrThrow(await fetch(`/api/stocking/${id}`, { method: 'DELETE' }));
  recordActivity('Stocking entry deleted', 'Stocking');
}

export interface StockingFilterOptions {
  years: number[];
  cws: string[];
  qForms: string[];
  yws: string[];
  pendingWiths: string[];
}

/** One fetch, all the distinct dropdown option sets — used to populate the filter bar. */
export async function getStockingFilterOptions(): Promise<StockingFilterOptions> {
  const rows = await getAllStocking();
  const distinct = <T,>(values: T[]) => Array.from(new Set(values));
  return {
    years: distinct(rows.map((r) => r.year)).sort((a, b) => b - a),
    cws: distinct(rows.map((r) => r.cw)).sort(),
    qForms: distinct(rows.map((r) => r.qForm)).sort(),
    yws: distinct(rows.map((r) => r.yw)).sort(),
    pendingWiths: distinct(rows.map((r) => r.pendingWith)).sort(),
  };
}
