import { prisma } from './test-client';

export { prisma } from './test-client';
export * from './test-utils';

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
