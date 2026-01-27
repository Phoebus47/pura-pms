/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import { createRequire } from 'node:module';

// ESM compatibility: createRequire is the correct pattern for importing CommonJS modules in ESM
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Create Roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      permissions: ['ALL'],
    },
  });

  await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: {
      name: 'Staff',
      permissions: ['FRONT_DESK', 'RESERVATIONS'],
    },
  });

  // Create Super Admin User
  const password = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pura.com' },
    update: {},
    create: {
      email: 'admin@pura.com',
      password,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: superAdminRole.id,
      isActive: true,
    },
  });

  console.log({ admin });

  // Run financial seed after main seed
  console.log('\n🌱 Seeding Financial Module...');
  const seedFinancialModule = await import('./seed-financial.mjs');
  await seedFinancialModule.default();
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
