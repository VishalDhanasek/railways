import { useEffect, useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import AttachmentUploader from './AttachmentUploader';
import { addAttachment, removeAttachment } from '@/services/alterationService';
import type { AlterationRecord, AlterationStatus, AssetKind, NewAlterationRecord } from '@/types';

const STATUS_OPTIONS: AlterationStatus[] = ['Pending', 'In Progress', 'Completed', 'On Hold'];

interface AlterationFormProps {
  open: boolean;
  kind: AssetKind;
  title: string;
  record: AlterationRecord | null;
  onClose: () => void;
  onSubmit: (data: NewAlterationRecord) => Promise<void>;
  onAttachmentsChanged: () => void;
}

const EMPTY = { date: '', tlNo: '', description: '', status: 'Pending' as AlterationStatus, remarks: '' };

export default function AlterationForm({ open, kind, title, record, onClose, onSubmit, onAttachmentsChanged }: AlterationFormProps) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState(record?.attachments ?? []);

  useEffect(() => {
    if (open) {
      setForm(
        record
          ? { date: record.date, tlNo: record.tlNo, description: record.description, status: record.status, remarks: record.remarks }
          : EMPTY,
      );
      setAttachments(record?.attachments ?? []);
      setErrors({});
    }
  }, [open, record]);

  const set = <K extends keyof typeof EMPTY>(key: K) => (value: (typeof EMPTY)[K]) => setForm((prev) => ({ ...prev, [key]: value }));

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
      await onSubmit({
        date: form.date,
        tlNo: form.tlNo.trim(),
        description: form.description.trim(),
        status: form.status,
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
      title={record ? `Edit ${title} Alteration` : `Add ${title} Alteration`}
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
          <Input
            placeholder={kind === 'coach' ? 'e.g. TL/CH/2026/0101' : 'e.g. TL/WG/2026/0101'}
            value={form.tlNo}
            onChange={(e) => set('tlNo')(e.target.value)}
            invalid={!!errors.tlNo}
          />
        </FormField>
        <FormField label="Description" required error={errors.description}>
          <textarea
            value={form.description}
            onChange={(e) => set('description')(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </FormField>
        <FormField label="Status" required>
          <Select
            value={form.status}
            onChange={(e) => set('status')(e.target.value as AlterationStatus)}
            options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
          />
        </FormField>
        <FormField label="Remarks">
          <textarea
            value={form.remarks}
            onChange={(e) => set('remarks')(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </FormField>

        {record && (
          <FormField label="Supporting Documents" hint="Attachments are saved immediately">
            <AttachmentUploader
              attachments={attachments}
              onUpload={async (file) => {
                const updated = await addAttachment(kind, record.id, file);
                setAttachments(updated.attachments);
                onAttachmentsChanged();
              }}
              onRemove={async (attachmentId) => {
                const updated = await removeAttachment(kind, record.id, attachmentId);
                setAttachments(updated.attachments);
                onAttachmentsChanged();
              }}
            />
          </FormField>
        )}
        {!record && (
          <p className="rounded-md bg-slate-50 px-3 py-2 text-[12px] text-slate-500">
            Save this entry first, then reopen it to attach supporting documents.
          </p>
        )}
      </div>
    </Drawer>
  );
}
