import { PrismaClient } from '@prisma/client';
import { prisma } from './test-client';

// Helper function for transaction-isolated tests
export async function withTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>,
): Promise<T> {
  return await prisma
    .$transaction(async (tx) => {
      await callback(tx as PrismaClient);
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
