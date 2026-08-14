/**
 * Runs `fn` and ensures at least `ms` elapses before resolving/rejecting —
 * so a deliberately-visible loading animation isn't skipped when the
 * underlying operation finishes too quickly to be perceived.
 */
export async function withMinDuration<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  const start = Date.now();
  const finish = () => {
    const remaining = ms - (Date.now() - start);
    return remaining > 0 ? new Promise((resolve) => setTimeout(resolve, remaining)) : Promise.resolve();
  };

  try {
    const result = await fn();
    await finish();
    return result;
  } catch (err) {
    await finish();
    throw err;
  }
}
