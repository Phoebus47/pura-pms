import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.test from project root (2 levels up)
config({ path: resolve(__dirname, '../../.env.test') });
