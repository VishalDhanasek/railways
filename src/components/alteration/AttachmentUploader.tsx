import { useRef, useState } from 'react';
import { FileSpreadsheet, FileText, FileType2, Image as ImageIcon, Paperclip, X, UploadCloud } from 'lucide-react';
import { detectAttachmentType } from '@/services/alterationService';
import { useToast } from '@/context/ToastContext';
import type { Attachment, AttachmentFileType } from '@/types';

const ACCEPT = '.pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ICONS: Record<AttachmentFileType, typeof FileText> = {
  pdf: FileText,
  excel: FileSpreadsheet,
  word: FileType2,
  image: ImageIcon,
};

const ICON_TONE: Record<AttachmentFileType, string> = {
  pdf: 'text-red-500',
  excel: 'text-emerald-600',
  word: 'text-blue-600',
  image: 'text-violet-500',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentUploaderProps {
  attachments: Attachment[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (attachmentId: string) => Promise<void>;
  disabled?: boolean;
}

export default function AttachmentUploader({ attachments, onUpload, onRemove, disabled }: AttachmentUploaderProps) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!detectAttachmentType(file.name)) {
      showToast('Unsupported file format. Allowed: Excel, PDF, Word, Images.', 'error');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      showToast('File is too large. Maximum allowed size is 10 MB.', 'error');
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
      showToast(`"${file.name}" uploaded successfully.`, 'success');
    } catch {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="space-y-1.5">
        {attachments.map((att) => {
          const Icon = ICONS[att.type];
          return (
            <div key={att.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
              <Icon className={`h-3.5 w-3.5 shrink-0 ${ICON_TONE[att.type]}`} />
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-[12.5px] text-slate-600 hover:text-brand-600 hover:underline"
                title={att.name}
              >
                {att.name}
              </a>
              <span className="shrink-0 text-[11px] text-slate-400">{formatSize(att.size)}</span>
              <button
                type="button"
                aria-label={`Remove ${att.name}`}
                onClick={() => onRemove(att.id)}
                disabled={disabled}
                className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-red-500 disabled:opacity-40"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-slate-300 py-2 text-[12.5px] font-medium text-slate-500 hover:border-brand-300 hover:bg-brand-50/40 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? <UploadCloud className="h-3.5 w-3.5 animate-pulse" /> : <Paperclip className="h-3.5 w-3.5" />}
        {uploading ? 'Uploading…' : 'Upload supporting file'}
      </button>
      <p className="mt-1 text-[11px] text-slate-400">Excel, PDF, Word or Images — up to 10 MB.</p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
