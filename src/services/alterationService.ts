import type {
  AlterationQuery,
  AlterationRecord,
  AttachmentFileType,
  AssetKind,
  NewAlterationRecord,
  PaginatedResult,
} from '@/types';
import { recordActivity } from './activityLogService';

// ---------------------------------------------------------------------------
// Talks to the Express + Excel backend in server/index.js — see that file
// for the actual persistence (server/data/{coach,wagon}-alterations.xlsx).
// Filtering/sorting/pagination stay client-side against the full list
// returned by the API, same as when this was an in-memory mock.
// ---------------------------------------------------------------------------

async function parseOrThrow(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? undefined : res.json();
}

function withKind(kind: AssetKind, row: Omit<AlterationRecord, 'kind'>): AlterationRecord {
  return { ...row, kind };
}

function label(kind: AssetKind): 'Coach' | 'Wagon' {
  return kind === 'coach' ? 'Coach' : 'Wagon';
}

export async function getAllAlterations(kind: AssetKind): Promise<AlterationRecord[]> {
  const rows = await parseOrThrow(await fetch(`/api/alterations/${kind}`));
  return rows.map((r: Omit<AlterationRecord, 'kind'>) => withKind(kind, r));
}

export async function queryAlterations(kind: AssetKind, query: AlterationQuery): Promise<PaginatedResult<AlterationRecord>> {
  let rows = await getAllAlterations(kind);

  if (query.search) {
    const term = query.search.trim().toLowerCase();
    rows = rows.filter(
      (r) => r.tlNo.toLowerCase().includes(term) || r.description.toLowerCase().includes(term) || r.remarks.toLowerCase().includes(term),
    );
  }
  if (query.status && query.status !== 'All') rows = rows.filter((r) => r.status === query.status);
  if (query.dateFrom) rows = rows.filter((r) => r.date >= query.dateFrom!);
  if (query.dateTo) rows = rows.filter((r) => r.date <= query.dateTo!);

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

  const total = rows.length;
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total, page, pageSize };
}

export async function createAlteration(kind: AssetKind, data: NewAlterationRecord): Promise<AlterationRecord> {
  const row = await parseOrThrow(
    await fetch(`/api/alterations/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
  recordActivity(`${label(kind)} alteration ${row.tlNo} added`, label(kind));
  return withKind(kind, row);
}

export async function updateAlteration(kind: AssetKind, id: string, data: NewAlterationRecord): Promise<AlterationRecord> {
  const row = await parseOrThrow(
    await fetch(`/api/alterations/${kind}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  );
  recordActivity(`${label(kind)} alteration ${row.tlNo} updated`, label(kind));
  return withKind(kind, row);
}

export async function deleteAlteration(kind: AssetKind, id: string): Promise<void> {
  await parseOrThrow(await fetch(`/api/alterations/${kind}/${id}`, { method: 'DELETE' }));
  recordActivity(`${label(kind)} alteration deleted`, label(kind));
}

const EXTENSION_TYPE_MAP: Record<string, AttachmentFileType> = {
  pdf: 'pdf',
  xls: 'excel',
  xlsx: 'excel',
  doc: 'word',
  docx: 'word',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
};

/** Client-side pre-check only — the server validates again on upload. */
export function detectAttachmentType(filename: string): AttachmentFileType | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_TYPE_MAP[ext] ?? null;
}

export async function addAttachment(kind: AssetKind, id: string, file: File): Promise<AlterationRecord> {
  const formData = new FormData();
  formData.append('file', file);
  const row = await parseOrThrow(await fetch(`/api/alterations/${kind}/${id}/attachments`, { method: 'POST', body: formData }));
  recordActivity(`Supporting document "${file.name}" uploaded for ${label(kind).toLowerCase()} alteration ${row.tlNo}`, label(kind));
  return withKind(kind, row);
}

export async function removeAttachment(kind: AssetKind, id: string, attachmentId: string): Promise<AlterationRecord> {
  const row = await parseOrThrow(await fetch(`/api/alterations/${kind}/${id}/attachments/${attachmentId}`, { method: 'DELETE' }));
  return withKind(kind, row);
}
