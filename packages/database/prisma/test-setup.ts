import { prisma } from './test-client';

export { prisma } from './test-client';
export * from './test-utils';

// Global test setup
beforeAll(async () => {
  try {
    // Note: We don't forcefully connect here anymore to allow unit tests
    // to run without a real database. Tests that need a real DB will connect
    // automatically on first query or can connect explicitly.
    // await prisma.$connect();
    console.log('✅ Test setup complete');
  } catch (error) {
    console.error('❌ Failed to setup tests:', error);
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
