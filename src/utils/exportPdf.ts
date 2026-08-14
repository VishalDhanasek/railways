import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { StockingRecord } from '@/types';
import { formatCurrency, formatDate } from './format';
import { todayStamp } from './downloadBlob';

const BRAND = [29, 78, 216] as const; // brand-700
const SLATE = [71, 85, 105] as const;

/**
 * Builds an A4-landscape PDF report of the given Stocking Application
 * records — with repeating headers, page numbers and a grand total — and
 * triggers a browser download.
 */
export function exportStockingToPdf(records: StockingRecord[]): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Title block -----------------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...BRAND);
  doc.text('NOMENCLATURE', pageWidth / 2, 36, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(...SLATE);
  doc.text('STOCKING APPLICATION REPORT', pageWidth / 2, 54, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} · ${records.length} record(s)`,
    pageWidth / 2,
    70,
    { align: 'center' },
  );

  const grandTotal = records.reduce((sum, r) => sum + r.totalValue, 0);

  const head = [
    [
      'S.No.',
      'Date Received',
      'Year',
      'C/W',
      'YW',
      'Q-Form',
      'Item Description',
      'PL No.',
      'EAR',
      'Unit',
      'Cost/Item',
      'Total Value',
      'Pending With',
      'Remarks',
    ],
  ];

  const body = records.map((r) => [
    String(r.sNo),
    formatDate(r.dateReceived),
    String(r.year),
    r.cw,
    r.yw,
    r.qForm,
    r.itemDescription,
    r.plNo,
    String(r.ear),
    `${r.unit} ${r.unitOfMeasure}`,
    formatCurrency(r.costPerItem),
    formatCurrency(r.totalValue),
    r.pendingWith,
    r.remarks,
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 82,
    margin: { left: 24, right: 24, bottom: 34 },
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 5,
      overflow: 'linebreak',
      valign: 'middle',
      lineColor: [217, 222, 231],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: BRAND as unknown as [number, number, number],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [244, 246, 249] },
    columnStyles: {
      0: { cellWidth: 30, halign: 'center' }, // S.No.
      1: { cellWidth: 58 }, // Date Received
      2: { cellWidth: 32, halign: 'center' }, // Year
      3: { cellWidth: 34, halign: 'center' }, // C/W
      4: { cellWidth: 40 }, // YW
      5: { cellWidth: 40 }, // Q-Form
      6: { cellWidth: 120 }, // Item Description
      7: { cellWidth: 46 }, // PL No.
      8: { cellWidth: 28, halign: 'right' }, // EAR
      9: { cellWidth: 56, halign: 'right' }, // Unit
      10: { cellWidth: 56, halign: 'right' }, // Cost/Item
      11: { cellWidth: 60, halign: 'right' }, // Total Value
      12: { cellWidth: 64 }, // Pending With
      13: { cellWidth: 'auto' }, // Remarks
    },
    showHead: 'everyPage',
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      const currentPage = doc.getCurrentPageInfo().pageNumber;
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(...SLATE);
      doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth - 24, h - 16, { align: 'right' });
      doc.text('NOMENCLATURE · Stocking Application Report', 24, h - 16);
    },
  });

  // --- Grand total footer ------------------------------------------------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? 90;
  const pageHeight = doc.internal.pageSize.getHeight();
  let totalY = finalY + 24;
  if (totalY > pageHeight - 40) {
    doc.addPage();
    totalY = 50;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text(`TOTAL VALUE: ${formatCurrency(grandTotal)}`, pageWidth - 24, totalY, { align: 'right' });

  doc.save(`Nomenclature_Stocking_Application_${todayStamp()}.pdf`);
}
