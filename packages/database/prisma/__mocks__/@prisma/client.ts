import { vi } from 'vitest';

export class PrismaClient {
  $connect = vi.fn().mockResolvedValue(undefined);
  $disconnect = vi.fn().mockResolvedValue(undefined);
  $transaction = vi.fn(async (cb) => {
    return await cb(this);
  });
}
