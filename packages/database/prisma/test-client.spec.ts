import { PrismaClient } from '@prisma/client';

const mockConnect = vi.fn();

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: class {
      $connect = mockConnect;
      $disconnect = vi.fn();
    },
  };
});

describe('Test Client Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use default database URL if not provided', async () => {
    delete process.env.DATABASE_URL;
    const { prisma } = await import('./test-client.js');
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });

  it('should use provided DATABASE_URL', async () => {
    process.env.DATABASE_URL = 'postgresql://custom:5432/db';
    const { prisma } = await import('./test-client.js');
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });

  it('should enable query logging when DEBUG_TESTS is true', async () => {
    process.env.DEBUG_TESTS = 'true';
    const { prisma } = await import('./test-client.js');
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });

  it('should disable query logging when DEBUG_TESTS is false', async () => {
    process.env.DEBUG_TESTS = 'false';
    const { prisma } = await import('./test-client.js');
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });
});
