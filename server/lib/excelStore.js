import ExcelJS from 'exceljs';
import { put, head, BlobNotFoundError } from '@vercel/blob';

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * A tiny "table" backed by a real .xlsx file in Vercel Blob storage (not
 * local disk — serverless functions don't have one that survives between
 * invocations). `pathname` is the blob's key, e.g. "data/stocking.xlsx".
 * `columns` is an ExcelJS column-definition array: [{ header, key }, ...].
 * Every row is a plain object keyed by `columns[].key`. Nested values (e.g.
 * an `attachments` array) should be JSON-stringified by the caller before
 * writing and parsed back out after reading — Excel cells only hold
 * primitives.
 *
 * Concurrency note: each request is a separate, isolated function
 * invocation, so there's no in-process lock possible (unlike a
 * long-running server). Two writes that race can clobber one another —
 * acceptable for a small internal tool, not a substitute for a real
 * database under concurrent load.
 */
export function createExcelStore(pathname, columns) {
  async function readAll() {
    let url;
    try {
      const info = await head(pathname);
      url = info.url;
    } catch (err) {
      if (err instanceof BlobNotFoundError) return []; // table is genuinely empty
      throw err; // misconfiguration (bad/missing token, etc.) — don't hide it as "no data"
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const buffer = await res.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];
    if (!sheet) return [];
    const rows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // header
      const obj = {};
      columns.forEach((col, i) => {
        const cell = row.getCell(i + 1).value;
        obj[col.key] = cell === null || cell === undefined ? '' : cell;
      });
      rows.push(obj);
    });
    return rows;
  }

  async function writeAll(rows) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data');
    sheet.columns = columns;
    rows.forEach((r) => sheet.addRow(r));
    const buffer = await workbook.xlsx.writeBuffer();
    await put(pathname, buffer, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: XLSX_CONTENT_TYPE,
    });
  }

  return {
    /** Read every row. */
    getAll() {
      return readAll();
    },
    /**
     * Read, hand the row array to `fn` to mutate in place (push/splice/etc),
     * persist the result, then return whatever `fn` returned.
     */
    async mutate(fn) {
      const rows = await readAll();
      const result = await fn(rows);
      await writeAll(rows);
      return result;
    },
  };
}
