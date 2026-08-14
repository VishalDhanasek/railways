import type { ReactNode } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { PendingWithBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import type { StockingRecord } from '@/types';

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-[13.5px] text-slate-700">{value}</p>
    </div>
  );
}

export default function StockingViewModal({ record, onClose }: { record: StockingRecord | null; onClose: () => void }) {
  if (!record) return null;

  return (
    <Modal
      open={!!record}
      onClose={onClose}
      title={`Stocking Entry — S.No. ${record.sNo}`}
      size="md"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Date Received" value={formatDate(record.dateReceived)} />
        <Field label="Year" value={record.year} />
        <Field label="C/W" value={record.cw} />
        <Field label="YW" value={record.yw} />
        <Field label="Q-Form" value={record.qForm} />
        <div className="col-span-2">
          <Field label="Item Description" value={record.itemDescription} />
        </div>
        <Field label="PL No." value={record.plNo} />
        <Field label="EAR" value={record.ear} />
        <Field label="Unit" value={`${record.unit} ${record.unitOfMeasure}`} />
        <Field label="Cost/Item" value={formatCurrency(record.costPerItem)} />
        <div className="col-span-2 rounded-lg bg-brand-50/60 px-3.5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brand-600">Total Value</p>
          <p className="mt-0.5 text-lg font-semibold text-brand-700">{formatCurrency(record.totalValue)}</p>
        </div>
        <Field label="Pending With" value={<PendingWithBadge value={record.pendingWith} />} />
        <div className="col-span-2">
          <Field label="Remarks" value={record.remarks || '—'} />
        </div>
      </div>
    </Modal>
  );
}
