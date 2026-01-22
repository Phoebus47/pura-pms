/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

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

  const staffRole = await prisma.role.upsert({
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
  const { default: seedFinancial } = await import('./seed-financial');
  await seedFinancial();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
