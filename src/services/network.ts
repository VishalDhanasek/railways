/**
 * Simulated network latency for the mock data layer so loading states are
 * exercised in the UI. Replace the body of `simulateDelay` with real
 * fetch/axios calls when a backend becomes available — every function in
 * `src/services` is already async and returns plain data, so callers in
 * pages/components require no changes.
 */
export function simulateDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
