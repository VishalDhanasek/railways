/** Waits `ms` milliseconds. Used to give Vercel Blob's CDN a moment to
 * propagate a write before we refetch — see server/lib/excelStore.js for
 * the full explanation of why a fresh read can otherwise return stale data. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
