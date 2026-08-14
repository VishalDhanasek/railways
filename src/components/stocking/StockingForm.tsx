import { useEffect, useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { formatCurrency } from '@/utils/format';
import { UNIT_OF_MEASURE_OPTIONS } from '@/types';
import type { NewStockingRecord, StockingAssetTag, StockingRecord, UnitOfMeasure } from '@/types';

interface StockingFormProps {
  open: boolean;
  record: StockingRecord | null;
  onClose: () => void;
  onSubmit: (data: NewStockingRecord) => Promise<void>;
}

const EMPTY_FORM = {
  dateReceived: '',
  year: String(new Date().getFullYear()),
  cw: 'Coach' as StockingAssetTag,
  yw: '',
  qForm: '',
  itemDescription: '',
  plNo: '',
  ear: '',
  unit: '',
  unitOfMeasure: 'Nos' as UnitOfMeasure,
  costPerItem: '',
  pendingWith: '',
  remarks: '',
};

type FormState = typeof EMPTY_FORM;

function toFormState(record: StockingRecord): FormState {
  return {
    dateReceived: record.dateReceived,
    year: String(record.year),
    cw: record.cw,
    yw: record.yw,
    qForm: record.qForm,
    itemDescription: record.itemDescription,
    plNo: record.plNo,
    ear: String(record.ear),
    unit: String(record.unit),
    unitOfMeasure: record.unitOfMeasure,
    costPerItem: String(record.costPerItem),
    pendingWith: record.pendingWith === '—' ? '' : record.pendingWith,
    remarks: record.remarks,
  };
}

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function StockingForm({ open, record, onClose, onSubmit }: StockingFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(record ? toFormState(record) : EMPTY_FORM);
      setErrors({});
    }
  }, [open, record]);

  const set = <K extends keyof FormState>(key: K) => (value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const earNum = Number(form.ear);
  const unitNum = Number(form.unit);
  const costNum = Number(form.costPerItem);
  const previewTotal = Number.isFinite(unitNum) && Number.isFinite(costNum) ? unitNum * costNum : 0;

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.dateReceived) next.dateReceived = 'Date received is required.';
    if (!form.year.trim()) next.year = 'Year is required.';
    else if (!/^\d{4}$/.test(form.year.trim())) next.year = 'Enter a valid 4-digit year.';
    if (!form.yw.trim()) next.yw = 'YW is required.';
    if (!form.qForm.trim()) next.qForm = 'Q-Form is required.';
    if (!form.itemDescription.trim()) next.itemDescription = 'Item description is required.';
    if (!form.plNo.trim()) next.plNo = 'PL No. is required.';
    if (!form.ear.trim()) next.ear = 'EAR is required.';
    else if (!Number.isFinite(earNum) || earNum < 0 || !Number.isInteger(earNum)) next.ear = 'EAR must be a whole number (numeric only).';
    if (!form.unit.trim()) next.unit = 'Unit is required.';
    else if (!Number.isFinite(unitNum) || unitNum <= 0) next.unit = 'Unit must be a positive number.';
    if (!form.costPerItem.trim()) next.costPerItem = 'Cost/Item is required.';
    else if (!Number.isFinite(costNum) || costNum < 0) next.costPerItem = 'Cost/Item must be a valid non-negative number.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        dateReceived: form.dateReceived,
        year: Number(form.year),
        cw: form.cw,
        yw: form.yw.trim(),
        qForm: form.qForm.trim(),
        itemDescription: form.itemDescription.trim(),
        plNo: form.plNo.trim(),
        ear: earNum,
        unit: unitNum,
        unitOfMeasure: form.unitOfMeasure,
        costPerItem: costNum,
        pendingWith: form.pendingWith.trim() || '—',
        remarks: form.remarks.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={record ? 'Edit Stocking Entry' : 'Add Stocking Entry'}
      subtitle={record ? `S.No. ${record.sNo}` : 'S.No. will be assigned automatically'}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : record ? 'Save Changes' : 'Add Entry'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date Received" required error={errors.dateReceived}>
            <Input type="date" value={form.dateReceived} onChange={(e) => set('dateReceived')(e.target.value)} invalid={!!errors.dateReceived} />
          </FormField>
          <FormField label="Year" required error={errors.year}>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="2026"
              value={form.year}
              onChange={(e) => set('year')(e.target.value)}
              invalid={!!errors.year}
            />
          </FormField>
        </div>

        <FormField label="C/W" required hint="Coach or Wagon">
          <Select
            value={form.cw}
            onChange={(e) => set('cw')(e.target.value as StockingAssetTag)}
            options={[
              { label: 'Coach', value: 'Coach' },
              { label: 'Wagon', value: 'Wagon' },
            ]}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="YW" required error={errors.yw} hint="Year-Week code">
            <Input placeholder="e.g. YW-26A" value={form.yw} onChange={(e) => set('yw')(e.target.value)} invalid={!!errors.yw} />
          </FormField>
          <FormField label="Q-Form" required error={errors.qForm}>
            <Input placeholder="e.g. Q-101" value={form.qForm} onChange={(e) => set('qForm')(e.target.value)} invalid={!!errors.qForm} />
          </FormField>
        </div>

        <FormField label="Item Description" required error={errors.itemDescription}>
          <Input
            placeholder="e.g. Air Brake Hose Coupling"
            value={form.itemDescription}
            onChange={(e) => set('itemDescription')(e.target.value)}
            invalid={!!errors.itemDescription}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="PL No." required error={errors.plNo}>
            <Input placeholder="e.g. PL-2000" value={form.plNo} onChange={(e) => set('plNo')(e.target.value)} invalid={!!errors.plNo} />
          </FormField>
          <FormField label="EAR" required error={errors.ear} hint="Numeric quantity only">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 2"
              value={form.ear}
              onChange={(e) => set('ear')(e.target.value.replace(/[^\d]/g, ''))}
              invalid={!!errors.ear}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Unit" required error={errors.unit} hint="Quantity">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 25"
              value={form.unit}
              onChange={(e) => set('unit')(e.target.value)}
              invalid={!!errors.unit}
            />
          </FormField>
          <FormField label="Measure" hint="Unit of measure">
            <Select
              value={form.unitOfMeasure}
              onChange={(e) => set('unitOfMeasure')(e.target.value as UnitOfMeasure)}
              options={UNIT_OF_MEASURE_OPTIONS.map((u) => ({ label: u, value: u }))}
            />
          </FormField>
        </div>

        <FormField label="Cost/Item" required error={errors.costPerItem} hint="In ₹">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 340"
            value={form.costPerItem}
            onChange={(e) => set('costPerItem')(e.target.value)}
            invalid={!!errors.costPerItem}
          />
        </FormField>

        <div className="rounded-lg border border-brand-100 bg-brand-50/60 px-3.5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-brand-600">Total Value (auto-calculated)</p>
          <p className="mt-0.5 text-lg font-semibold text-brand-700">{formatCurrency(previewTotal)}</p>
          <p className="mt-0.5 text-[11px] text-brand-500">Unit × Cost/Item — cannot be edited manually.</p>
        </div>

        <FormField label="Pending With" hint="Leave blank if not pending with anyone">
          <Input placeholder="e.g. Stores Depot" value={form.pendingWith} onChange={(e) => set('pendingWith')(e.target.value)} />
        </FormField>

        <FormField label="Remarks">
          <textarea
            value={form.remarks}
            onChange={(e) => set('remarks')(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </FormField>
      </div>
    </Drawer>
  );
}
