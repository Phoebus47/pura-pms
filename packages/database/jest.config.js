module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/prisma'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/prisma/$1',
  },
  rootDir: '.',
  collectCoverageFrom: [
    '<rootDir>/prisma/**/*.ts',
    '!<rootDir>/prisma/**/*.d.ts',
    '!<rootDir>/prisma/seed*.ts',
    '!<rootDir>/prisma/seed*.mts',
    '!<rootDir>/prisma/verify*.ts',
    '!<rootDir>/prisma/verify*.mts',
    '!<rootDir>/prisma/test-setup.ts',
    '!**/node_modules/**',
    '!**/.prisma/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/prisma/test-setup.ts'],
  // Test timeout for performance tests
  testTimeout: 30000,
  // Run tests in sequence to avoid database conflicts
  maxWorkers: 1,
  // Verbose output
  verbose: true,
};
