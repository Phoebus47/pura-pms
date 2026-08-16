import { describe, expect, it, vi } from 'vitest';
import { connectWithRetry } from './connect-with-retry';

describe('connectWithRetry', () => {
  it('returns on the first successful connect', async () => {
    const connect = vi.fn().mockResolvedValue(undefined);
    const sleep = vi.fn();

    await connectWithRetry(connect, [10, 20], sleep);

    expect(connect).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('retries after failures then connects', async () => {
    const connect = vi
      .fn()
      .mockRejectedValueOnce(new Error('paused'))
      .mockResolvedValueOnce(undefined);
    const sleep = vi.fn().mockResolvedValue(undefined);

    await connectWithRetry(connect, [5], sleep);

    expect(connect).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledWith(5);
  });

  it('throws the last error after all attempts fail', async () => {
    const lastError = new Error('tenant not found');
    const connect = vi
      .fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(lastError);
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(connectWithRetry(connect, [1], sleep)).rejects.toThrow(
      lastError,
    );
    expect(connect).toHaveBeenCalledTimes(2);
  });
});
