import { useEffect, useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import type { CoachAlterationRecord, NewCoachAlterationRecord } from '@/types';

interface CoachFormProps {
  open: boolean;
  record: CoachAlterationRecord | null;
  onClose: () => void;
  onSubmit: (data: NewCoachAlterationRecord) => Promise<void>;
}

const EMPTY = { date: '', tlNo: '', description: '' };

export default function CoachForm({ open, record, onClose, onSubmit }: CoachFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(record ? { date: record.date, tlNo: record.tlNo, description: record.description } : EMPTY);
      setErrors({});
    }
  }, [open, record]);

  const set = (key: keyof typeof EMPTY) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const next: typeof errors = {};
    if (!form.date) next.date = 'Date is required.';
    if (!form.tlNo.trim()) next.tlNo = 'TL. No. is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({ date: form.date, tlNo: form.tlNo.trim(), description: form.description.trim() });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={record ? 'Edit Coach Alteration' : 'Add Coach Alteration'}
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
        <FormField label="Date" required error={errors.date}>
          <Input type="date" value={form.date} onChange={(e) => set('date')(e.target.value)} invalid={!!errors.date} />
        </FormField>
        <FormField label="TL. No." required error={errors.tlNo}>
          <Input placeholder="e.g. TL/CH/2026/0101" value={form.tlNo} onChange={(e) => set('tlNo')(e.target.value)} invalid={!!errors.tlNo} />
        </FormField>
        <FormField label="Description" required error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) => set('description')(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </FormField>
      </div>
    </Drawer>
  );
}
