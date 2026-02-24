import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // We only test the test-setup and test-client behaviors in the default suite.
    // The actual model tests (folio-transaction.test.ts, etc.) require a real DB
    // and should be run in a separate suite or an integration pipeline.
    include: ['prisma/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['prisma/**/*.ts'],
      exclude: [
        'prisma/**/*.d.ts',
        'prisma/**/*.test.ts',
        'prisma/**/*.spec.ts',
        'prisma/__mocks__/**',
        'prisma/seed*.ts',
        'prisma/seed*.mts',
        'prisma/verify*.ts',
        'prisma/verify*.mts',
        'prisma/test-setup.ts',
      ],
    },
    setupFiles: ['./prisma/test-setup.ts'],
    testTimeout: 30000,
    fileParallelism: false,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }) as any,
    tsconfigPaths(),
  ],
});
