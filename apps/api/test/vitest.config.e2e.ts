import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
    setupFiles: [resolve(__dirname, 'setup-e2e.ts')], // Ensure env vars are loaded if needed, or create a specific e2e setup
    environment: 'node',
  },
  plugins: [swc.vite() as any, tsconfigPaths()],
});
