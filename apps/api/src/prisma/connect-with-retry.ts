const DEFAULT_DELAYS_MS = [1000, 2000, 4000, 8000, 16000];

export async function connectWithRetry(
  connect: () => Promise<void>,
  delaysMs: number[] = DEFAULT_DELAYS_MS,
  sleep: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    }),
): Promise<void> {
  let lastError: unknown;
  const maxAttempts = delaysMs.length + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await connect();
      return;
    } catch (error) {
      lastError = error;
      const delay = delaysMs[attempt];
      if (delay === undefined) {
        break;
      }
      await sleep(delay);
    }
  }

  throw lastError;
}
