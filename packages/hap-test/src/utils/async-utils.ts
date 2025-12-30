/**
 * Async utilities for waiting on conditions and timeouts
 */

export async function waitFor(predicate: () => boolean | Promise<boolean>, timeoutMs: number, intervalMs = 10): Promise<void> {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    const check = async () => {
      try {
        const ok = await predicate();
        if (ok) {
          clearInterval(handle);
          resolve();
        } else if (Date.now() - start >= timeoutMs) {
          clearInterval(handle);
          reject(new Error(`waitFor timeout after ${timeoutMs}ms`));
        }
      } catch (err) {
        clearInterval(handle);
        reject(err);
      }
    };
    const handle = setInterval(check, intervalMs);
  });
}
