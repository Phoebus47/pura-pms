/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying seeded data...\n');

  // ==================== TRANSACTION CODES ====================
  const transactionCodes = await prisma.transactionCode.findMany({
    orderBy: { code: 'asc' },
  });

  console.log(`📝 Transaction Codes: ${transactionCodes.length} records`);
  console.log('Sample codes:');
  for (const tc of transactionCodes.slice(0, 5)) {
    console.log(`  - ${tc.code}: ${tc.description} (${tc.type}, ${tc.group})`);
  }
  console.log('');

  // Group by type
  const byType = transactionCodes.reduce(
    (acc, tc) => {
      acc[tc.type] = (acc[tc.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log('By Type:', byType);
  console.log('');

  // ==================== REASON CODES ====================
  const reasonCodes = await prisma.reasonCode.findMany({
    orderBy: { code: 'asc' },
  });

  console.log(`📝 Reason Codes: ${reasonCodes.length} records`);
  console.log('Sample codes:');
  for (const rc of reasonCodes.slice(0, 5)) {
    console.log(`  - ${rc.code}: ${rc.description} (${rc.category})`);
  }
  console.log('');

  // Group by category
  const byCategory = reasonCodes.reduce(
    (acc, rc) => {
      acc[rc.category] = (acc[rc.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log('By Category:', byCategory);
  console.log('');

  // ==================== GL ACCOUNTS ====================
  const glAccounts = await prisma.gLAccount.findMany({
    orderBy: { code: 'asc' },
  });

  console.log(`📝 GL Accounts: ${glAccounts.length} records`);
  console.log('Sample accounts:');
  for (const gl of glAccounts.slice(0, 5)) {
    console.log(`  - ${gl.code}: ${gl.name} (${gl.type})`);
  }
  console.log('');

  // Group by type
  const byAccountType = glAccounts.reduce(
    (acc, gl) => {
      acc[gl.type] = (acc[gl.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log('By Account Type:', byAccountType);
  console.log('');

  // ==================== SUMMARY ====================
  console.log('✅ Verification Summary:');
  console.log(`  - Transaction Codes: ${transactionCodes.length} ✅`);
  console.log(`  - Reason Codes: ${reasonCodes.length} ✅`);
  console.log(`  - GL Accounts: ${glAccounts.length} ✅`);
  console.log('');

  // ==================== VALIDATION ====================
  const errors: string[] = [];

  // Check required TransactionCodes
  const requiredCodes = ['1000', '2000', '4000', '5000', '9000'];
  const missingCodes = requiredCodes.filter(
    (code) => !transactionCodes.some((tc) => tc.code === code),
  );
  if (missingCodes.length > 0) {
    errors.push(`Missing TransactionCodes: ${missingCodes.join(', ')}`);
  }

  // Check required ReasonCodes
  const requiredCategories = ['VOID', 'DISCOUNT', 'ADJUSTMENT'];
  const missingCategories = requiredCategories.filter(
    (cat) => !reasonCodes.some((rc) => rc.category === cat),
  );
  if (missingCategories.length > 0) {
    errors.push(
      `Missing ReasonCode categories: ${missingCategories.join(', ')}`,
    );
  }

  // Check required GL Accounts
  const requiredGL = ['1000', '4000', '4100', '4200'];
  const missingGL = requiredGL.filter(
    (code) => !glAccounts.some((gl) => gl.code === code),
  );
  if (missingGL.length > 0) {
    errors.push(`Missing GL Accounts: ${missingGL.join(', ')}`);
  }

  if (errors.length > 0) {
    console.log('❌ Validation Errors:');
    for (const error of errors) {
      console.log(`  - ${error}`);
    }
    process.exit(1);
  } else {
    console.log('✅ All validations passed!');
  }
}

// Allow running directly (tsx supports top-level await)
if (
  require.main === module ||
  import.meta.url.endsWith(process.argv[1]?.replaceAll('\\', '/'))
) {
  try {
    await main();
  } catch (e) {
    console.error('❌ Error verifying seed data:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
