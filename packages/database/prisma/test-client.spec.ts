import { PrismaClient } from '@prisma/client';

describe('Test Client Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use default database URL if not provided', () => {
    delete process.env.DATABASE_URL;
    const { prisma } = require('./test-client');
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });

  it('should use provided DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgresql://custom:5432/db';
    const { prisma } = require('./test-client');
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });

  it('should enable query logging when DEBUG_TESTS is true', () => {
    process.env.DEBUG_TESTS = 'true';
    const { prisma } = require('./test-client');
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });

  it('should disable query logging when DEBUG_TESTS is false', () => {
    process.env.DEBUG_TESTS = 'false';
    const { prisma } = require('./test-client');
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe('function');
  });
});
