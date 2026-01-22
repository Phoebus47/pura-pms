/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Financial Module default data...');

  // ==================== TRANSACTION CODES ====================
  console.log('📝 Creating Transaction Codes...');

  const transactionCodes = [
    // Room Revenue (1000 series)
    {
      code: '1000',
      description: 'Room Revenue',
      descriptionTh: 'รายได้ค่าห้อง',
      type: 'CHARGE' as const,
      group: 'ROOM' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4000-01',
      departmentCode: 'ROOM',
    },
    {
      code: '1001',
      description: 'Room Revenue - Single',
      descriptionTh: 'รายได้ค่าห้อง - เตียงเดี่ยว',
      type: 'CHARGE' as const,
      group: 'ROOM' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4000-01',
      departmentCode: 'ROOM',
    },
    {
      code: '1002',
      description: 'Room Revenue - Double',
      descriptionTh: 'รายได้ค่าห้อง - เตียงคู่',
      type: 'CHARGE' as const,
      group: 'ROOM' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4000-01',
      departmentCode: 'ROOM',
    },
    {
      code: '1003',
      description: 'Room Revenue - Suite',
      descriptionTh: 'รายได้ค่าห้อง - สวีท',
      type: 'CHARGE' as const,
      group: 'ROOM' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4000-01',
      departmentCode: 'ROOM',
    },
    {
      code: '1004',
      description: 'Extra Person Charge',
      descriptionTh: 'ค่าคนเพิ่ม',
      type: 'CHARGE' as const,
      group: 'ROOM' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4000-02',
      departmentCode: 'ROOM',
    },
    {
      code: '1005',
      description: 'Late Check-out Charge',
      descriptionTh: 'ค่าชำระล่าช้า',
      type: 'CHARGE' as const,
      group: 'ROOM' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4000-03',
      departmentCode: 'ROOM',
    },

    // Food & Beverage (2000 series)
    {
      code: '2000',
      description: 'Food & Beverage Revenue',
      descriptionTh: 'รายได้อาหารและเครื่องดื่ม',
      type: 'CHARGE' as const,
      group: 'FOOD' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4100-01',
      departmentCode: 'F&B',
    },
    {
      code: '2001',
      description: 'Restaurant Revenue',
      descriptionTh: 'รายได้ร้านอาหาร',
      type: 'CHARGE' as const,
      group: 'FOOD' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4100-01',
      departmentCode: 'F&B',
    },
    {
      code: '2002',
      description: 'Room Service Revenue',
      descriptionTh: 'รายได้บริการห้องพัก',
      type: 'CHARGE' as const,
      group: 'FOOD' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4100-02',
      departmentCode: 'F&B',
    },
    {
      code: '2100',
      description: 'Beverage Revenue',
      descriptionTh: 'รายได้เครื่องดื่ม',
      type: 'CHARGE' as const,
      group: 'BEVERAGE' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4100-03',
      departmentCode: 'F&B',
    },
    {
      code: '2101',
      description: 'Bar Revenue',
      descriptionTh: 'รายได้บาร์',
      type: 'CHARGE' as const,
      group: 'BEVERAGE' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4100-03',
      departmentCode: 'F&B',
    },

    // Other Revenue (3000 series)
    {
      code: '3000',
      description: 'Spa Revenue',
      descriptionTh: 'รายได้สปา',
      type: 'CHARGE' as const,
      group: 'SPA' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4200-01',
      departmentCode: 'SPA',
    },
    {
      code: '3001',
      description: 'Fitness Revenue',
      descriptionTh: 'รายได้ฟิตเนส',
      type: 'CHARGE' as const,
      group: 'FITNESS' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4200-02',
      departmentCode: 'FITNESS',
    },
    {
      code: '3002',
      description: 'Laundry Revenue',
      descriptionTh: 'รายได้ซักรีด',
      type: 'CHARGE' as const,
      group: 'LAUNDRY' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4200-03',
      departmentCode: 'LAUNDRY',
    },
    {
      code: '3003',
      description: 'Telephone Revenue',
      descriptionTh: 'รายได้โทรศัพท์',
      type: 'CHARGE' as const,
      group: 'TELEPHONE' as const,
      hasTax: true,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '4200-04',
      departmentCode: 'TEL',
    },
    {
      code: '3004',
      description: 'Internet Revenue',
      descriptionTh: 'รายได้อินเทอร์เน็ต',
      type: 'CHARGE' as const,
      group: 'INTERNET' as const,
      hasTax: true,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '4200-05',
      departmentCode: 'IT',
    },
    {
      code: '3005',
      description: 'Minibar Revenue',
      descriptionTh: 'รายได้มินิบาร์',
      type: 'CHARGE' as const,
      group: 'MINIBAR' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4200-06',
      departmentCode: 'MINIBAR',
    },
    {
      code: '3006',
      description: 'Parking Revenue',
      descriptionTh: 'รายได้ที่จอดรถ',
      type: 'CHARGE' as const,
      group: 'PARKING' as const,
      hasTax: true,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '4200-07',
      departmentCode: 'PARKING',
    },
    {
      code: '3007',
      description: 'Miscellaneous Revenue',
      descriptionTh: 'รายได้อื่นๆ',
      type: 'CHARGE' as const,
      group: 'MISC' as const,
      hasTax: true,
      hasService: true,
      serviceRate: 10,
      glAccountCode: '4200-99',
      departmentCode: 'MISC',
    },

    // Tax & Service (4000 series)
    {
      code: '4000',
      description: 'VAT (Value Added Tax)',
      descriptionTh: 'ภาษีมูลค่าเพิ่ม',
      type: 'CHARGE' as const,
      group: 'TAX' as const,
      hasTax: false,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '2300-01',
      departmentCode: 'TAX',
    },
    {
      code: '4001',
      description: 'Service Charge',
      descriptionTh: 'ค่าบริการ',
      type: 'CHARGE' as const,
      group: 'SERVICE' as const,
      hasTax: true,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '4100-99',
      departmentCode: 'SERVICE',
    },

    // Discount (5000 series)
    {
      code: '5000',
      description: 'Discount',
      descriptionTh: 'ส่วนลด',
      type: 'ADJUSTMENT' as const,
      group: 'DISCOUNT' as const,
      hasTax: false,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '5000-01',
      departmentCode: 'DISCOUNT',
    },

    // Payment Methods (9000 series)
    {
      code: '9000',
      description: 'Cash Payment',
      descriptionTh: 'ชำระเงินสด',
      type: 'PAYMENT' as const,
      group: 'MISC' as const,
      hasTax: false,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '1000-01',
      departmentCode: 'CASH',
    },
    {
      code: '9001',
      description: 'Credit Card Payment',
      descriptionTh: 'ชำระด้วยบัตรเครดิต',
      type: 'PAYMENT' as const,
      group: 'MISC' as const,
      hasTax: false,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '1000-02',
      departmentCode: 'CARD',
    },
    {
      code: '9002',
      description: 'Debit Card Payment',
      descriptionTh: 'ชำระด้วยบัตรเดบิต',
      type: 'PAYMENT' as const,
      group: 'MISC' as const,
      hasTax: false,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '1000-02',
      departmentCode: 'CARD',
    },
    {
      code: '9003',
      description: 'Bank Transfer Payment',
      descriptionTh: 'ชำระด้วยโอนเงิน',
      type: 'PAYMENT' as const,
      group: 'MISC' as const,
      hasTax: false,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '1000-03',
      departmentCode: 'BANK',
    },
    {
      code: '9004',
      description: 'QR Payment',
      descriptionTh: 'ชำระด้วย QR Code',
      type: 'PAYMENT' as const,
      group: 'MISC' as const,
      hasTax: false,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '1000-04',
      departmentCode: 'QR',
    },
    {
      code: '9005',
      description: 'Direct Bill',
      descriptionTh: 'บิลตรง',
      type: 'PAYMENT' as const,
      group: 'MISC' as const,
      hasTax: false,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '1100-01',
      departmentCode: 'AR',
    },
    {
      code: '9006',
      description: 'Voucher Payment',
      descriptionTh: 'ชำระด้วยบัตรกำนัล',
      type: 'PAYMENT' as const,
      group: 'MISC' as const,
      hasTax: false,
      hasService: false,
      serviceRate: 0,
      glAccountCode: '1000-05',
      departmentCode: 'VOUCHER',
    },
  ];

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

  const reasonCodes = [
    {
      code: 'VOID-001',
      description: 'Void - Error',
      descriptionTh: 'ยกเลิก - ผิดพลาด',
      category: 'VOID' as const,
      isActive: true,
    },
    {
      code: 'VOID-002',
      description: 'Void - Guest Request',
      descriptionTh: 'ยกเลิก - ตามคำขอของแขก',
      category: 'VOID' as const,
      isActive: true,
    },
    {
      code: 'VOID-003',
      description: 'Void - Duplicate Entry',
      descriptionTh: 'ยกเลิก - บันทึกซ้ำ',
      category: 'VOID' as const,
      isActive: true,
    },
    {
      code: 'DISC-001',
      description: 'Discount - Corporate Rate',
      descriptionTh: 'ส่วนลด - อัตราบริษัท',
      category: 'DISCOUNT' as const,
      isActive: true,
    },
    {
      code: 'DISC-002',
      description: 'Discount - VIP',
      descriptionTh: 'ส่วนลด - VIP',
      category: 'DISCOUNT' as const,
      isActive: true,
    },
    {
      code: 'DISC-003',
      description: 'Discount - Long Stay',
      descriptionTh: 'ส่วนลด - พักยาว',
      category: 'DISCOUNT' as const,
      isActive: true,
    },
    {
      code: 'DISC-004',
      description: 'Discount - Manager Approval',
      descriptionTh: 'ส่วนลด - อนุมัติโดยผู้จัดการ',
      category: 'DISCOUNT' as const,
      isActive: true,
    },
    {
      code: 'ADJ-001',
      description: 'Adjustment - Price Correction',
      descriptionTh: 'ปรับปรุง - แก้ไขราคา',
      category: 'ADJUSTMENT' as const,
      isActive: true,
    },
    {
      code: 'ADJ-002',
      description: 'Adjustment - Tax Correction',
      descriptionTh: 'ปรับปรุง - แก้ไขภาษี',
      category: 'ADJUSTMENT' as const,
      isActive: true,
    },
    {
      code: 'ADJ-003',
      description: 'Adjustment - Service Charge Correction',
      descriptionTh: 'ปรับปรุง - แก้ไขค่าบริการ',
      category: 'ADJUSTMENT' as const,
      isActive: true,
    },
    {
      code: 'TRF-001',
      description: 'Transfer - To Master Folio',
      descriptionTh: 'โอน - ไปยัง Folio หลัก',
      category: 'TRANSFER' as const,
      isActive: true,
    },
    {
      code: 'TRF-002',
      description: 'Transfer - To Company Folio',
      descriptionTh: 'โอน - ไปยัง Folio บริษัท',
      category: 'TRANSFER' as const,
      isActive: true,
    },
    {
      code: 'COMP-001',
      description: 'Complimentary - Guest Service',
      descriptionTh: 'บริการฟรี - บริการแขก',
      category: 'COMPLIMENTARY' as const,
      isActive: true,
    },
    {
      code: 'COMP-002',
      description: 'Complimentary - Manager Approval',
      descriptionTh: 'บริการฟรี - อนุมัติโดยผู้จัดการ',
      category: 'COMPLIMENTARY' as const,
      isActive: true,
    },
    {
      code: 'STAFF-001',
      description: 'Staff - Employee Rate',
      descriptionTh: 'พนักงาน - อัตราพนักงาน',
      category: 'STAFF' as const,
      isActive: true,
    },
    {
      code: 'OTHER-001',
      description: 'Other - Special Case',
      descriptionTh: 'อื่นๆ - กรณีพิเศษ',
      category: 'OTHER' as const,
      isActive: true,
    },
  ];

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

  const glAccounts = [
    // Assets (1000 series)
    {
      code: '1000',
      name: 'Cash',
      type: 'ASSET' as const,
      parentCode: null,
      isActive: true,
    },
    {
      code: '1000-01',
      name: 'Cash - Front Desk',
      type: 'ASSET' as const,
      parentCode: '1000',
      isActive: true,
    },
    {
      code: '1000-02',
      name: 'Cash - Restaurant',
      type: 'ASSET' as const,
      parentCode: '1000',
      isActive: true,
    },
    {
      code: '1100',
      name: 'Accounts Receivable',
      type: 'ASSET' as const,
      parentCode: null,
      isActive: true,
    },
    {
      code: '1100-01',
      name: 'AR - City Ledger',
      type: 'ASSET' as const,
      parentCode: '1100',
      isActive: true,
    },
    {
      code: '1100-02',
      name: 'AR - Credit Cards',
      type: 'ASSET' as const,
      parentCode: '1100',
      isActive: true,
    },

    // Liabilities (2000 series)
    {
      code: '2000',
      name: 'Accounts Payable',
      type: 'LIABILITY' as const,
      parentCode: null,
      isActive: true,
    },
    {
      code: '2300',
      name: 'Tax Payable',
      type: 'LIABILITY' as const,
      parentCode: null,
      isActive: true,
    },
    {
      code: '2300-01',
      name: 'VAT Payable',
      type: 'LIABILITY' as const,
      parentCode: '2300',
      isActive: true,
    },

    // Revenue (4000 series)
    {
      code: '4000',
      name: 'Room Revenue',
      type: 'REVENUE' as const,
      parentCode: null,
      isActive: true,
    },
    {
      code: '4000-01',
      name: 'Room Revenue - Transient',
      type: 'REVENUE' as const,
      parentCode: '4000',
      isActive: true,
    },
    {
      code: '4000-02',
      name: 'Room Revenue - Extra Person',
      type: 'REVENUE' as const,
      parentCode: '4000',
      isActive: true,
    },
    {
      code: '4000-03',
      name: 'Room Revenue - Late Check-out',
      type: 'REVENUE' as const,
      parentCode: '4000',
      isActive: true,
    },
    {
      code: '4100',
      name: 'Food & Beverage Revenue',
      type: 'REVENUE' as const,
      parentCode: null,
      isActive: true,
    },
    {
      code: '4100-01',
      name: 'F&B - Restaurant',
      type: 'REVENUE' as const,
      parentCode: '4100',
      isActive: true,
    },
    {
      code: '4100-02',
      name: 'F&B - Room Service',
      type: 'REVENUE' as const,
      parentCode: '4100',
      isActive: true,
    },
    {
      code: '4100-03',
      name: 'F&B - Bar',
      type: 'REVENUE' as const,
      parentCode: '4100',
      isActive: true,
    },
    {
      code: '4100-99',
      name: 'F&B - Service Charge',
      type: 'REVENUE' as const,
      parentCode: '4100',
      isActive: true,
    },
    {
      code: '4200',
      name: 'Other Revenue',
      type: 'REVENUE' as const,
      parentCode: null,
      isActive: true,
    },
    {
      code: '4200-01',
      name: 'Other - Spa',
      type: 'REVENUE' as const,
      parentCode: '4200',
      isActive: true,
    },
    {
      code: '4200-02',
      name: 'Other - Fitness',
      type: 'REVENUE' as const,
      parentCode: '4200',
      isActive: true,
    },
    {
      code: '4200-03',
      name: 'Other - Laundry',
      type: 'REVENUE' as const,
      parentCode: '4200',
      isActive: true,
    },
    {
      code: '4200-04',
      name: 'Other - Telephone',
      type: 'REVENUE' as const,
      parentCode: '4200',
      isActive: true,
    },
    {
      code: '4200-05',
      name: 'Other - Internet',
      type: 'REVENUE' as const,
      parentCode: '4200',
      isActive: true,
    },
    {
      code: '4200-06',
      name: 'Other - Minibar',
      type: 'REVENUE' as const,
      parentCode: '4200',
      isActive: true,
    },
    {
      code: '4200-07',
      name: 'Other - Parking',
      type: 'REVENUE' as const,
      parentCode: '4200',
      isActive: true,
    },
    {
      code: '4200-99',
      name: 'Other - Miscellaneous',
      type: 'REVENUE' as const,
      parentCode: '4200',
      isActive: true,
    },

    // Expenses (5000 series)
    {
      code: '5000',
      name: 'Discounts & Allowances',
      type: 'EXPENSE' as const,
      parentCode: null,
      isActive: true,
    },
    {
      code: '5000-01',
      name: 'Discount - General',
      type: 'EXPENSE' as const,
      parentCode: '5000',
      isActive: true,
    },
  ];

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
if (
  require.main === module ||
  import.meta.url.endsWith(process.argv[1]?.replaceAll('\\', '/'))
) {
  try {
    await main();
  } catch (e) {
    console.error('❌ Error seeding financial data:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
