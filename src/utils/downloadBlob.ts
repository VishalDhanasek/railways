/** Triggers a browser download for an in-memory Blob without extra dependencies. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** yyyy-mm-dd for today, used in export filenames. */
export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}
