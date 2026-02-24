import { PrismaClient } from '@prisma/client';
import * as path from 'node:path';

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import dotenv from 'dotenv';
// Load test environment variables
const envPath = path.resolve(__dirname, '../.env.test');
dotenv.config({ path: envPath });

// Create Prisma client for testing with explicit test database
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        // Explicitly fallback to a harmless local db or ensure we can mock this out entirely if db is unreachable down the line.
        'postgresql://postgres:postgres@localhost:5432/pura_test',
    },
  },
  log:
    process.env.DEBUG_TESTS === 'true' ? ['query', 'error', 'warn'] : ['error'],
});
