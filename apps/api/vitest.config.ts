import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    passWithNoTests: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.module.ts',
        'src/**/*.dto.ts',
        'src/**/*.entity.ts',
        'src/main.ts',
        'src/utils/errors.ts',
      ],
    },
    // Using unplugin-swc for fast compilation
  },
  plugins: [
    // This is required to build NestJS applications properly
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: {
          syntax: 'typescript',
          decorators: true,
          dynamicImport: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true, // Required for NestJS DI
        },
      },
    }) as any,
  ],
});
