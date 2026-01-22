import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';

// Load test environment variables
const envPath = path.resolve(__dirname, '../.env.test');
require('dotenv').config({ path: envPath });

// Create Prisma client for testing with explicit test database
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        'postgresql://user:password@localhost:5432/pura_test',
    },
  },
  log:
    process.env.DEBUG_TESTS === 'true' ? ['query', 'error', 'warn'] : ['error'],
});

// Global test setup
beforeAll(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Test database disconnected');
  } catch (error) {
    console.error('❌ Failed to disconnect from test database:', error);
  }
});

// Helper function for transaction-isolated tests
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  return await prisma
    .$transaction(async (tx) => {
      const result = await callback(tx as PrismaClient);
      // Force rollback by throwing an error
      throw new Error('ROLLBACK_FOR_TEST');
    })
    .catch((error) => {
      // If it's our rollback error, the test passed
      if (error.message === 'ROLLBACK_FOR_TEST') {
        // Return undefined or a default value since we rolled back
        return undefined as T;
      }
      // Otherwise, re-throw the error
      throw error;
    });
}

// Helper function for isolated test execution
export async function runInTransaction<T>(
  testFn: (prisma: PrismaClient) => Promise<T>,
): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      await testFn(tx as PrismaClient);
      // Always rollback after test
      throw new Error('TEST_ROLLBACK');
    });
  } catch (error: any) {
    // Ignore rollback errors
    if (error.message !== 'TEST_ROLLBACK') {
      throw error;
    }
  }
}
