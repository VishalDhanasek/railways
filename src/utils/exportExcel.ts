import ExcelJS from 'exceljs';
import type { StockingRecord } from '@/types';
import { downloadBlob, todayStamp } from './downloadBlob';

const HEADER_FILL = 'FF1D4ED8'; // brand-700
const BAND_FILL = 'FFF1F5F9'; // slate-100
const BORDER_COLOR = 'FFD9DEE7';

const thinBorder = {
  top: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
  left: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
  bottom: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
  right: { style: 'thin' as const, color: { argb: BORDER_COLOR } },
};

const CURRENCY_FMT = '"₹"#,##0.00';
const DATE_FMT = 'dd-mmm-yyyy';

/**
 * Builds a formatted .xlsx workbook for the given Stocking Application
 * records and triggers a browser download.
 */
export async function exportStockingToExcel(records: StockingRecord[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NOMENCLATURE';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Stocking Application', {
    views: [{ state: 'frozen', ySplit: 1 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  });

  sheet.columns = [
    { header: 'S.No.', key: 'sNo', width: 8 },
    { header: 'Date Received', key: 'dateReceived', width: 15 },
    { header: 'Year', key: 'year', width: 8 },
    { header: 'C/W', key: 'cw', width: 9 },
    { header: 'YW', key: 'yw', width: 10 },
    { header: 'Q-Form', key: 'qForm', width: 10 },
    { header: 'Item Description', key: 'itemDescription', width: 34 },
    { header: 'PL No.', key: 'plNo', width: 12 },
    { header: 'EAR', key: 'ear', width: 8 },
    { header: 'Unit', key: 'unit', width: 9 },
    { header: 'UOM', key: 'unitOfMeasure', width: 12 },
    { header: 'Cost/Item', key: 'costPerItem', width: 14 },
    { header: 'Total Value', key: 'totalValue', width: 16 },
    { header: 'Pending With', key: 'pendingWith', width: 18 },
    { header: 'Remarks', key: 'remarks', width: 30 },
  ];

  // --- Header row formatting -------------------------------------------------
  const headerRow = sheet.getRow(1);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder;
  });

  // --- Data rows ---------------------------------------------------------
  records.forEach((record, i) => {
    const row = sheet.addRow({
      sNo: record.sNo,
      dateReceived: new Date(`${record.dateReceived}T00:00:00`),
      year: record.year,
      cw: record.cw,
      yw: record.yw,
      qForm: record.qForm,
      itemDescription: record.itemDescription,
      plNo: record.plNo,
      ear: record.ear,
      unit: record.unit,
      unitOfMeasure: record.unitOfMeasure,
      costPerItem: record.costPerItem,
      totalValue: record.totalValue,
      pendingWith: record.pendingWith,
      remarks: record.remarks,
    });

    row.getCell('dateReceived').numFmt = DATE_FMT;
    row.getCell('costPerItem').numFmt = CURRENCY_FMT;
    row.getCell('totalValue').numFmt = CURRENCY_FMT;
    row.getCell('ear').alignment = { horizontal: 'right' };
    row.getCell('unit').alignment = { horizontal: 'right' };
    row.getCell('sNo').alignment = { horizontal: 'center' };
    row.getCell('cw').alignment = { horizontal: 'center' };
    row.getCell('remarks').alignment = { wrapText: true };
    row.getCell('itemDescription').alignment = { wrapText: true };

    row.eachCell((cell) => {
      cell.border = thinBorder;
      if (i % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BAND_FILL } };
      }
    });
  });

  // --- Total row -----------------------------------------------------------
  const grandTotal = records.reduce((sum, r) => sum + r.totalValue, 0);
  const totalRow = sheet.addRow({ itemDescription: 'TOTAL VALUE', totalValue: grandTotal });
  sheet.mergeCells(totalRow.number, 1, totalRow.number, 12);
  totalRow.getCell(1).value = 'TOTAL VALUE';
  totalRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.font = { bold: true };
    cell.border = { top: { style: 'double', color: { argb: 'FF1D4ED8' } } };
    if (colNumber === 13) {
      cell.numFmt = CURRENCY_FMT;
    }
  });
  totalRow.height = 22;

  // --- Auto filter on header row, spanning all data --------------------------
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, `Nomenclature_Stocking_Application_${todayStamp()}.xlsx`);
}
