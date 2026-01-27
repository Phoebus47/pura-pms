import { PrismaClient } from '@prisma/client';
import * as path from 'node:path';

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
