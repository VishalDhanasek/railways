import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { put } from '@vercel/blob';
import { createExcelStore } from './lib/excelStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// Excel-backed tables (stored in Vercel Blob — see lib/excelStore.js)
// ---------------------------------------------------------------------------

const ALTERATION_COLUMNS = [
  { header: 'ID', key: 'id' },
  { header: 'S.No.', key: 'sNo' },
  { header: 'Date', key: 'date' },
  { header: 'TL. No.', key: 'tlNo' },
  { header: 'Description', key: 'description' },
  { header: 'Status', key: 'status' },
  { header: 'Remarks', key: 'remarks' },
  { header: 'Attachments', key: 'attachments' },
];

const STOCKING_COLUMNS = [
  { header: 'ID', key: 'id' },
  { header: 'S.No.', key: 'sNo' },
  { header: 'Date Received', key: 'dateReceived' },
  { header: 'Year', key: 'year' },
  { header: 'C/W', key: 'cw' },
  { header: 'YW', key: 'yw' },
  { header: 'Q-Form', key: 'qForm' },
  { header: 'Item Description', key: 'itemDescription' },
  { header: 'PL No.', key: 'plNo' },
  { header: 'EAR', key: 'ear' },
  { header: 'Unit', key: 'unit' },
  { header: 'Unit of Measure', key: 'unitOfMeasure' },
  { header: 'Cost/Item', key: 'costPerItem' },
  { header: 'Total Value', key: 'totalValue' },
  { header: 'Pending With', key: 'pendingWith' },
  { header: 'Remarks', key: 'remarks' },
];

const alterationStores = {
  coach: createExcelStore('data/coach-alterations.xlsx', ALTERATION_COLUMNS),
  wagon: createExcelStore('data/wagon-alterations.xlsx', ALTERATION_COLUMNS),
};
const stockingStore = createExcelStore('data/stocking.xlsx', STOCKING_COLUMNS);

function toAlterationRecord(row) {
  return { ...row, attachments: row.attachments ? JSON.parse(row.attachments) : [] };
}
function fromAlterationRecord(record) {
  return { ...record, attachments: JSON.stringify(record.attachments ?? []) };
}
function resequence(rows) {
  rows.forEach((r, i) => {
    r.sNo = i + 1;
  });
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function requireKind(req, res, next) {
  if (req.params.kind !== 'coach' && req.params.kind !== 'wagon') {
    return res.status(400).json({ error: 'kind must be "coach" or "wagon"' });
  }
  next();
}

// --- Alterations -----------------------------------------------------------

app.get('/api/alterations/:kind', requireKind, async (req, res) => {
  const rows = await alterationStores[req.params.kind].getAll();
  res.json(rows.map(toAlterationRecord));
});

app.post('/api/alterations/:kind', requireKind, async (req, res) => {
  const { date, tlNo, description, status, remarks } = req.body;
  if (!date || !tlNo || !description) {
    return res.status(400).json({ error: 'date, tlNo and description are required' });
  }
  const record = await alterationStores[req.params.kind].mutate((rows) => {
    const newRecord = {
      id: randomUUID(),
      sNo: rows.length + 1,
      date,
      tlNo,
      description,
      status: status || 'Pending',
      remarks: remarks || '',
      attachments: [],
    };
    rows.unshift(fromAlterationRecord(newRecord));
    resequence(rows);
    return newRecord;
  });
  res.status(201).json(record);
});

app.put('/api/alterations/:kind/:id', requireKind, async (req, res) => {
  const { date, tlNo, description, status, remarks } = req.body;
  const result = await alterationStores[req.params.kind].mutate((rows) => {
    const idx = rows.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return null;
    const existing = toAlterationRecord(rows[idx]);
    const updated = { ...existing, date, tlNo, description, status, remarks };
    rows[idx] = fromAlterationRecord(updated);
    return updated;
  });
  if (!result) return res.status(404).json({ error: 'Record not found' });
  res.json(result);
});

app.delete('/api/alterations/:kind/:id', requireKind, async (req, res) => {
  const result = await alterationStores[req.params.kind].mutate((rows) => {
    const idx = rows.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return false;
    rows.splice(idx, 1);
    resequence(rows);
    return true;
  });
  if (!result) return res.status(404).json({ error: 'Record not found' });
  res.status(204).end();
});

const ATTACHMENT_TYPE_BY_EXT = {
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

app.post('/api/alterations/:kind/:id/attachments', requireKind, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const ext = path.extname(req.file.originalname).slice(1).toLowerCase();
  const type = ATTACHMENT_TYPE_BY_EXT[ext];
  if (!type) return res.status(400).json({ error: 'Unsupported file format' });

  const attachmentId = randomUUID();
  // Blob storage is content-addressed by pathname, not by record — a
  // random suffix keeps re-uploads of the same filename from colliding.
  const blob = await put(`uploads/${req.params.kind}/${req.params.id}/${attachmentId}-${req.file.originalname}`, req.file.buffer, {
    access: 'public',
    addRandomSuffix: false,
  });

  const result = await alterationStores[req.params.kind].mutate((rows) => {
    const idx = rows.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return null;
    const existing = toAlterationRecord(rows[idx]);
    const attachment = {
      id: attachmentId,
      name: req.file.originalname,
      type,
      size: req.file.size,
      url: blob.url,
      uploadedAt: new Date().toISOString(),
    };
    const updated = { ...existing, attachments: [...existing.attachments, attachment] };
    rows[idx] = fromAlterationRecord(updated);
    return updated;
  });
  if (!result) return res.status(404).json({ error: 'Record not found' });
  res.status(201).json(result);
});

app.delete('/api/alterations/:kind/:id/attachments/:attachmentId', requireKind, async (req, res) => {
  const result = await alterationStores[req.params.kind].mutate((rows) => {
    const idx = rows.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return null;
    const existing = toAlterationRecord(rows[idx]);
    const updated = { ...existing, attachments: existing.attachments.filter((a) => a.id !== req.params.attachmentId) };
    rows[idx] = fromAlterationRecord(updated);
    return updated;
  });
  if (!result) return res.status(404).json({ error: 'Record not found' });
  res.json(result);
});

// --- Stocking ----------------------------------------------------------

app.get('/api/stocking', async (_req, res) => {
  res.json(await stockingStore.getAll());
});

app.post('/api/stocking', async (req, res) => {
  const data = req.body;
  if (!data.dateReceived || !data.itemDescription) {
    return res.status(400).json({ error: 'dateReceived and itemDescription are required' });
  }
  const record = await stockingStore.mutate((rows) => {
    const newRecord = {
      ...data,
      id: randomUUID(),
      sNo: rows.length + 1,
      totalValue: Math.round(Number(data.unit) * Number(data.costPerItem) * 100) / 100,
    };
    rows.unshift(newRecord);
    resequence(rows);
    return newRecord;
  });
  res.status(201).json(record);
});

app.put('/api/stocking/:id', async (req, res) => {
  const data = req.body;
  const result = await stockingStore.mutate((rows) => {
    const idx = rows.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return null;
    const updated = {
      ...rows[idx],
      ...data,
      totalValue: Math.round(Number(data.unit) * Number(data.costPerItem) * 100) / 100,
    };
    rows[idx] = updated;
    return updated;
  });
  if (!result) return res.status(404).json({ error: 'Record not found' });
  res.json(result);
});

app.delete('/api/stocking/:id', async (req, res) => {
  const result = await stockingStore.mutate((rows) => {
    const idx = rows.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return false;
    rows.splice(idx, 1);
    resequence(rows);
    return true;
  });
  if (!result) return res.status(404).json({ error: 'Record not found' });
  res.status(204).end();
});

// --- Error handling ------------------------------------------------------
// Express 5 forwards rejected async handlers here automatically. Without
// this, an uncaught error (e.g. a missing Blob token) would fall through to
// Express's default HTML error page, which the frontend can't parse into a
// useful toast message.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// --- Serve the built frontend when self-hosting (not needed on Vercel — --
// --- its CDN serves the static build directly) -----------------------

const distDir = path.join(__dirname, '..', 'dist');
if (!process.env.VERCEL && fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Vercel imports this module and calls the exported handler per-request —
// it must NOT also bind a port itself.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`NOMENCLATURE API server listening on http://localhost:${PORT}`);
  });
}

export default app;
