/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
// @ts-ignore - Import JSON with assertion
import seedData from './seed-data.json' with { type: 'json' };

const {
  transactionCodes: transactionCodesData,
  reasonCodes: reasonCodesData,
  glAccounts: glAccountsData,
} = seedData;

const prisma = new PrismaClient();

// Helper functions to transform data arrays into objects
function createTransactionCode([
  code,
  description,
  descriptionTh,
  type,
  group,
  hasTax,
  hasService,
  serviceRate,
  glAccountCode,
  departmentCode,
]: readonly [
  string,
  string,
  string,
  string,
  string,
  boolean,
  boolean,
  number,
  string,
  string,
]) {
  return {
    code,
    description,
    descriptionTh,
    type: type as 'CHARGE' | 'PAYMENT' | 'ADJUSTMENT',
    group: group as
      | 'ROOM'
      | 'FOOD'
      | 'BEVERAGE'
      | 'SPA'
      | 'FITNESS'
      | 'LAUNDRY'
      | 'TELEPHONE'
      | 'INTERNET'
      | 'MINIBAR'
      | 'PARKING'
      | 'MISC'
      | 'TAX'
      | 'SERVICE'
      | 'DISCOUNT',
    hasTax,
    hasService,
    serviceRate,
    glAccountCode,
    departmentCode,
  };
}

function createReasonCode([
  code,
  description,
  descriptionTh,
  category,
  isActive,
]: readonly [string, string, string, string, boolean]) {
  return {
    code,
    description,
    descriptionTh,
    category: category as
      | 'VOID'
      | 'DISCOUNT'
      | 'ADJUSTMENT'
      | 'TRANSFER'
      | 'COMPLIMENTARY'
      | 'STAFF'
      | 'OTHER',
    isActive,
  };
}

function createGLAccount([code, name, type, parentCode, isActive]: readonly [
  string,
  string,
  string,
  string | null,
  boolean,
]) {
  return {
    code,
    name,
    type: type as 'ASSET' | 'LIABILITY' | 'REVENUE' | 'EXPENSE',
    parentCode,
    isActive,
  };
}

async function main() {
  console.log('🌱 Seeding Financial Module default data...');

  // ==================== TRANSACTION CODES ====================
  console.log('📝 Creating Transaction Codes...');

  const transactionCodes = transactionCodesData.map((data) =>
    createTransactionCode(data as any),
  );

  for (const trxCode of transactionCodes) {
    await prisma.transactionCode.upsert({
      where: { code: trxCode.code },
      update: {},
      create: trxCode,
    });
  }

  console.log(`✅ Created ${transactionCodes.length} Transaction Codes`);

  // ==================== REASON CODES ====================
  console.log('📝 Creating Reason Codes...');

  const reasonCodes = reasonCodesData.map((data) =>
    createReasonCode(data as any),
  );

  for (const reasonCode of reasonCodes) {
    await prisma.reasonCode.upsert({
      where: { code: reasonCode.code },
      update: {},
      create: reasonCode,
    });
  }

  console.log(`✅ Created ${reasonCodes.length} Reason Codes`);

  // ==================== GL ACCOUNTS (USALI Structure) ====================
  console.log('📝 Creating GL Accounts (USALI Structure)...');

  const glAccounts = glAccountsData.map((data) => createGLAccount(data as any));

  for (const account of glAccounts) {
    await prisma.gLAccount.upsert({
      where: { code: account.code },
      update: {},
      create: account,
    });
  }

  console.log(`✅ Created ${glAccounts.length} GL Accounts`);

  console.log('✅ Financial Module seeding completed!');
}

export default async function seedFinancial() {
  await main();
}

// Allow running directly (tsx supports top-level await)
import { pathToFileURL } from 'node:url';

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (e) {
    console.error('❌ Error seeding financial data:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
