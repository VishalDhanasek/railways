import type {
  AlterationQuery,
  AlterationRecord,
  Attachment,
  AttachmentFileType,
  AssetKind,
  NewAlterationRecord,
  PaginatedResult,
} from '@/types';
import { coachAlterations, wagonAlterations } from '@/data/alterationData';
import { simulateDelay } from './network';
import { recordActivity } from './activityLogService';

// In-memory stores standing in for real database tables. Each function below
// is async so a future implementation can swap the body for a fetch() call
// against a real API without touching any calling component.
const store: Record<AssetKind, AlterationRecord[]> = {
  coach: [...coachAlterations],
  wagon: [...wagonAlterations],
};

function resequence(kind: AssetKind) {
  store[kind] = store[kind].map((r, i) => ({ ...r, sNo: i + 1 }));
}

function label(kind: AssetKind): 'Coach' | 'Wagon' {
  return kind === 'coach' ? 'Coach' : 'Wagon';
}

export async function getAllAlterations(kind: AssetKind): Promise<AlterationRecord[]> {
  return simulateDelay([...store[kind]]);
}

export async function queryAlterations(kind: AssetKind, query: AlterationQuery): Promise<PaginatedResult<AlterationRecord>> {
  let rows = [...store[kind]];

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
  return simulateDelay({ rows: rows.slice(start, start + pageSize), total, page, pageSize });
}

export async function createAlteration(kind: AssetKind, data: NewAlterationRecord): Promise<AlterationRecord> {
  const record: AlterationRecord = { ...data, id: `${kind}-${crypto.randomUUID()}`, sNo: store[kind].length + 1, kind, attachments: [] };
  store[kind] = [record, ...store[kind]];
  resequence(kind);
  recordActivity(`${label(kind)} alteration ${record.tlNo} added`, label(kind));
  return simulateDelay(record);
}

export async function updateAlteration(kind: AssetKind, id: string, data: NewAlterationRecord): Promise<AlterationRecord> {
  const idx = store[kind].findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Record not found');
  const updated: AlterationRecord = { ...store[kind][idx], ...data };
  store[kind][idx] = updated;
  recordActivity(`${label(kind)} alteration ${updated.tlNo} updated`, label(kind));
  return simulateDelay(updated);
}

export async function deleteAlteration(kind: AssetKind, id: string): Promise<void> {
  const record = store[kind].find((r) => r.id === id);
  store[kind] = store[kind].filter((r) => r.id !== id);
  resequence(kind);
  if (record) recordActivity(`${label(kind)} alteration ${record.tlNo} deleted`, label(kind));
  return simulateDelay(undefined, 250);
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

export function detectAttachmentType(filename: string): AttachmentFileType | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return EXTENSION_TYPE_MAP[ext] ?? null;
}

export async function addAttachment(kind: AssetKind, id: string, file: File): Promise<AlterationRecord> {
  const idx = store[kind].findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Record not found');
  const type = detectAttachmentType(file.name);
  if (!type) throw new Error('Unsupported file format');

  const attachment: Attachment = {
    id: `att-${crypto.randomUUID()}`,
    name: file.name,
    type,
    size: file.size,
    url: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
  };
  const updated: AlterationRecord = { ...store[kind][idx], attachments: [...store[kind][idx].attachments, attachment] };
  store[kind][idx] = updated;
  recordActivity(`Supporting document "${file.name}" uploaded for ${label(kind).toLowerCase()} alteration ${updated.tlNo}`, label(kind));
  return simulateDelay(updated, 300);
}

export async function removeAttachment(kind: AssetKind, id: string, attachmentId: string): Promise<AlterationRecord> {
  const idx = store[kind].findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Record not found');
  const updated: AlterationRecord = { ...store[kind][idx], attachments: store[kind][idx].attachments.filter((a) => a.id !== attachmentId) };
  store[kind][idx] = updated;
  return simulateDelay(updated, 200);
}
