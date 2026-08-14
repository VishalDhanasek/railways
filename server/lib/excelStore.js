import ExcelJS from 'exceljs';
import { put, get } from '@vercel/blob';

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
 * Two read paths, deliberately different:
 *   - `getAll()` (plain display reads — list/page/filter loads): cached.
 *     The frontend no longer depends on these being instantly fresh after
 *     a write (it updates optimistically from the mutation's own response
 *     instead), so there's no reason to pay full origin latency on every
 *     normal page view.
 *   - the read inside `mutate()`: always `useCache: false`. This one
 *     computes the next S.No./row set, so it has to see the latest data —
 *     a stale read here risks actually losing a concurrent write, not just
 *     showing stale data for a moment.
 *
 * Concurrency note: each request is a separate, isolated function
 * invocation, so there's no in-process lock possible (unlike a
 * long-running server). Two writes that race can still clobber one another
 * — acceptable for a small internal tool, not a substitute for a real
 * database under concurrent load.
 */
export function createExcelStore(pathname, columns) {
  function parse(buffer) {
    return new Promise((resolve) => {
      const workbook = new ExcelJS.Workbook();
      workbook.xlsx.load(buffer).then(() => {
        const sheet = workbook.worksheets[0];
        if (!sheet) return resolve([]);
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
        resolve(rows);
      });
    });
  }

  async function read(useCache) {
    const result = await get(pathname, { access: 'public', useCache });
    if (!result || !result.stream) return []; // table doesn't exist yet — empty
    const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
    return parse(buffer);
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
    /** Read every row — cached, for normal display/list/filter reads. */
    getAll() {
      return read(true);
    },
    /**
     * Read (always fresh), hand the row array to `fn` to mutate in place
     * (push/splice/etc), persist the result, then return whatever `fn`
     * returned.
     */
    async mutate(fn) {
      const rows = await read(false);
      const result = await fn(rows);
      await writeAll(rows);
      return result;
    },
  };
}
