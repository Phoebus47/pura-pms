# PURA PMS - Security & Legal Compliance

## เอกสารความปลอดภัยและกฎหมายที่ต้องปฏิบัติตาม

เอกสารนี้อธิบายรายละเอียดด้าน Security และ Legal Compliance ที่ PURA PMS ต้องมี เพื่อให้ปลอดภัยระดับ Enterprise และปฏิบัติตามกฎหมายไทย

---

## 🇹🇭 หมวดที่ 1: กฎหมายไทย (Thai Legal Compliance)

### 1.1 PDPA (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)

#### Consent Management

**Requirement:**

- หน้า Check-in ต้องมีช่องให้แขกติ๊กยอมรับ (Consent)
- ระบบต้องจำค่านี้ไว้

**Consent Types:**

- ✅ Marketing Consent (ยอมรับให้ส่ง Email โปรโมชั่น)
- ✅ Third-party Sharing (ยอมรับให้แชร์ข้อมูลกับ Partner)
- ✅ Data Retention (ยอมรับให้เก็บข้อมูลตามระยะเวลาที่กำหนด)

**Implementation:**

```typescript
// Guest Consent Model
model GuestConsent {
  id            String   @id @default(cuid())
  guestId       String
  consentType   ConsentType
  isConsented   Boolean
  consentedAt   DateTime?
  revokedAt     DateTime?
  ipAddress     String?
  userAgent     String?
}

enum ConsentType {
  MARKETING
  THIRD_PARTY_SHARING
  DATA_RETENTION
}
```

**UI Requirements:**

- Checkbox ที่ชัดเจน
- Link to Privacy Policy
- Language: Thai + English

---

#### Data Anonymization (Right to be Forgotten)

**Requirement:**

- ต้องมีฟังก์ชัน "ลบข้อมูลส่วนตัวแขก" เมื่อพ้นระยะเวลาที่กำหนด
- แต่ต้อง **ไม่ลบ Transaction การเงิน** (เพื่อให้บัญชียังลงตัว)

**Implementation:**

```typescript
// Anonymization Script
async function anonymizeGuestData(
  guestId: string,
  retentionYears: number = 10,
) {
  // Mask personal data
  await prisma.guest.update({
    where: { id: guestId },
    data: {
      firstName: '[ANONYMIZED]',
      lastName: '[ANONYMIZED]',
      email: null,
      phone: null,
      address: null,
      idNumber: null,
      // Keep: totalStays, totalRevenue (aggregated data)
    },
  });

  // Log anonymization
  await prisma.auditLog.create({
    data: {
      action: 'ANONYMIZE_GUEST_DATA',
      entityType: 'Guest',
      entityId: guestId,
      userId: 'SYSTEM',
    },
  });
}
```

**Retention Policy:**

- Guest Profile: 10 years (default)
- Transaction Data: 7 years (ตามกฎหมายบัญชี)
- Audit Logs: 7 years

---

#### Data Breach Notification

**Requirement:**

- ระบบต้องแจ้งเตือนทันทีที่มีการ Export ข้อมูลแขกจำนวนมากผิดปกติ

**Implementation:**

```typescript
// Monitor data export
async function monitorDataExport(userId: string, recordCount: number) {
  const threshold = 100; // records

  if (recordCount > threshold) {
    // Alert admin
    await sendAlert({
      type: 'SUSPICIOUS_EXPORT',
      userId,
      recordCount,
      timestamp: new Date(),
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        action: 'BULK_DATA_EXPORT',
        entityType: 'Guest',
        userId,
        // Log details
      },
    });
  }
}
```

**Notification Rules:**

- Export > 100 records → Email to Admin
- Export > 1000 records → Email to Admin + GM
- Export > 10000 records → Email to Admin + GM + Owner

---

### 1.2 พ.ร.บ. คอมพิวเตอร์ฯ (Computer Crime Act)

#### Log Retention 90 Days

**Requirement:**

- กฎหมายบังคับให้เก็บ Traffic Data ไว้อย่างน้อย 90 วัน

**Implementation:**

```typescript
// Traffic Log Model
model TrafficLog {
  id            String   @id @default(cuid())
  userId        String
  ipAddress     String
  userAgent     String?
  endpoint      String
  method        String
  requestBody   Json?
  responseCode  Int
  timestamp     DateTime @default(now())

  @@index([userId, timestamp])
  @@index([ipAddress, timestamp])
}

// Auto-delete after 90 days
// Run daily cron job
async function cleanupTrafficLogs() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  await prisma.trafficLog.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate
      }
    }
  });
}
```

---

#### Identifiable Logs

**Requirement:**

- Log ต้องระบุได้ว่า IP Address นี้ คือ User คนไหน
- ห้ามใช้ Shared Account

**Implementation:**

- บังคับให้ทุก User มี Account แยก
- ห้ามใช้ Generic Account (เช่น `reception`, `frontdesk`)
- ใช้ User ID ในทุก Log

---

### 1.3 พ.ร.บ. โรงแรม & ตรวจคนเข้าเมือง

#### ร.ร. 3 / ร.ร. 4 - ทะเบียนผู้พัก

**Requirement:**

- ระบบต้องพิมพ์ "ทะเบียนผู้พัก" ตามแบบฟอร์มกรมการปกครองได้

**Format:**

- ตามแบบฟอร์มที่กรมการปกครองกำหนด
- PDF Export
- Print-ready

---

#### TM.30 (ตม.30) - รายงานผู้พักต่างชาติ

**Requirement:**

- ต้องส่งข้อมูลแขกต่างชาติให้ ตม. ภายใน 24 ชั่วโมง

**Data Points:**

- Passport Number
- Full Name
- Nationality
- Date of Birth
- Gender
- Room Number
- Check-in Date
- Check-out Date
- Address in Thailand

**Export Format:**

- Text File (ตาม Format ตม.)
- Excel (สำหรับตรวจสอบก่อนส่ง)
- Auto-upload to ตม. System (ถ้ามี API)

**Implementation:**

```typescript
// Auto-generate TM.30 report
async function generateTM30Report(checkInDate: Date) {
  const foreignGuests = await prisma.guest.findMany({
    where: {
      reservations: {
        some: {
          checkIn: checkInDate,
          guest: {
            nationality: {
              not: 'TH',
            },
          },
        },
      },
    },
  });

  // Format according to TM.30 specification
  const report = formatTM30(foreignGuests);

  // Auto-upload if API available
  if (process.env.TM30_API_ENABLED === 'true') {
    await uploadToTM30(report);
  }

  return report;
}
```

---

## 🔒 หมวดที่ 2: System Security

### 2.1 Session Management

#### Auto-Logout

**Requirement:**

- ถ้านิ่งไป 5-10 นาที ต้องดีดออกให้ Login ใหม่

**Implementation:**

```typescript
// Session timeout
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

// Middleware to check session
function sessionTimeoutMiddleware(req, res, next) {
  const lastActivity = req.session.lastActivity;
  const now = Date.now();

  if (lastActivity && now - lastActivity > SESSION_TIMEOUT) {
    req.session.destroy();
    return res.status(401).json({ error: 'Session expired' });
  }

  req.session.lastActivity = now;
  next();
}
```

---

#### Concurrent Login Control

**Requirement:**

- User 1 คน Login ได้แค่ 1 เครื่องพร้อมกัน

**Implementation:**

```typescript
// Session Model
model UserSession {
  id            String   @id @default(cuid())
  userId        String
  token         String   @unique
  ipAddress     String
  userAgent     String?
  lastActivity  DateTime @default(now())
  expiresAt     DateTime
  isActive      Boolean  @default(true)

  @@index([userId, isActive])
}

// On login, invalidate other sessions
async function login(userId: string, ipAddress: string) {
  // Invalidate existing sessions
  await prisma.userSession.updateMany({
    where: {
      userId,
      isActive: true
    },
    data: {
      isActive: false
    }
  });

  // Create new session
  const session = await prisma.userSession.create({
    data: {
      userId,
      token: generateToken(),
      ipAddress,
      expiresAt: new Date(Date.now() + SESSION_DURATION),
    }
  });

  return session;
}
```

---

### 2.2 OWASP Top 10 Protection

#### SQL Injection Prevention

**Status:** ✅ Protected by Prisma ORM

**Best Practices:**

- ใช้ Prisma Query API เท่านั้น
- ห้ามใช้ Raw SQL กับ User Input โดยตรง
- ถ้าจำเป็นใช้ Raw SQL ต้อง Sanitize Input

---

#### XSS (Cross-Site Scripting) Prevention

**Requirement:**

- ต้องระวังช่อง Input เช่น "Remark" ห้ามให้ใส่ Script ได้

**Implementation:**

```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
}

// In form submission
const remark = sanitizeInput(req.body.remark);
```

**Next.js Protection:**

- Next.js escape HTML โดยอัตโนมัติ
- แต่ต้องระวัง Rich Text Editor (ถ้ามี)

---

### 2.3 API Security

#### Rate Limiting

**Requirement:**

- ป้องกันการยิง API รัวๆ (Brute Force หรือ DDoS)

**Implementation:**

```typescript
import rateLimit from 'express-rate-limit';

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Apply to API routes
app.use('/api/', apiLimiter);
```

---

#### JWT Handling

**Requirement:**

- Access Token ต้องมีอายุสั้น (Short-lived, e.g., 15 min)
- ใช้ Refresh Token ในการต่ออายุ

**Implementation:**

```typescript
// Token configuration
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

// Generate tokens
function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );

  return { accessToken, refreshToken };
}

// Refresh token endpoint
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateTokens(decoded.userId).accessToken;

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

---

## 💳 หมวดที่ 3: Financial Data Security

### 3.1 PCI-DSS & Credit Card Handling

#### Tokenization (ห้ามเก็บเลขบัตรเครดิต)

**Requirement:**

- ห้ามเก็บเลขบัตรเครดิตลง Database เด็ดขาด
- ใช้ Payment Gateway (Tokenization)

**Implementation:**

```typescript
// Payment Gateway Integration (Omise/Stripe/2C2P)
import { Omise } from 'omise';

// Charge card (get token from gateway)
async function chargeCard(amount: number, token: string) {
  const omise = new Omise({
    publicKey: process.env.OMISE_PUBLIC_KEY,
    secretKey: process.env.OMISE_SECRET_KEY,
  });

  // Charge via gateway
  const charge = await omise.charges.create({
    amount: amount * 100, // convert to satang
    currency: 'thb',
    card: token, // token from gateway, NOT card number
  });

  // Store only charge ID (not card number)
  await prisma.payment.create({
    data: {
      amount,
      method: 'CREDIT_CARD',
      reference: charge.id, // Gateway charge ID
      cardLast4: charge.card.last_digits, // Only last 4 digits
      // DO NOT store full card number
    },
  });

  return charge;
}
```

---

#### Masking

**Requirement:**

- หน้าจอต้องโชว์แค่ XXXX-XXXX-XXXX-1234 เสมอ

**Implementation:**

```typescript
function maskCardNumber(cardNumber: string): string {
  if (!cardNumber) return '';
  const last4 = cardNumber.slice(-4);
  return `XXXX-XXXX-XXXX-${last4}`;
}

// In UI
<Text>{maskCardNumber(payment.cardNumber)}</Text>
```

---

### 3.2 Immutable Ledger (บัญชีแก้ไขไม่ได้)

**Requirement:**

- ใน Database ระดับ Row ต้องมีฟิลด์ `is_locked` ทันทีที่ผ่าน Night Audit
- ถ้าจะแก้ข้อมูลเก่า ต้องใช้วิธี "Reverse Entry"

**Implementation:**

```prisma
model FolioTransaction {
  // ... existing fields ...
  isLocked      Boolean  @default(false) // Locked after Night Audit
  nightAuditId  String?  // If set, transaction is locked
}

// Lock transactions after Night Audit
async function lockTransactionsAfterAudit(nightAuditId: string, businessDate: Date) {
  await prisma.folioTransaction.updateMany({
    where: {
      businessDate: {
        lte: businessDate
      },
      isLocked: false
    },
    data: {
      isLocked: true,
      nightAuditId
    }
  });
}

// Reverse entry (not update)
async function reverseTransaction(transactionId: string, reason: string) {
  const original = await prisma.folioTransaction.findUnique({
    where: { id: transactionId }
  });

  if (original.isLocked) {
    throw new Error('Cannot reverse locked transaction');
  }

  // Create reverse entry
  await prisma.folioTransaction.create({
    data: {
      windowId: original.windowId,
      trxCodeId: original.trxCodeId,
      businessDate: new Date(),
      amountNet: original.amountNet * -1, // Reverse sign
      amountService: original.amountService * -1,
      amountTax: original.amountTax * -1,
      amountTotal: original.amountTotal * -1,
      sign: original.sign * -1,
      relatedTrxId: original.id, // Link to original
      reasonCodeId: reason,
      remark: `Reverse of ${original.reference}`,
    }
  });
}
```

---

## 💾 หมวดที่ 4: Data Integrity & Backup

### 4.1 The 3-2-1 Backup Strategy

**Requirement:**

- 3 copies of data
- 2 different media types
- 1 off-site backup

**Implementation:**

#### Point-in-Time Recovery (PITR)

```sql
-- PostgreSQL PITR Configuration
-- postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'

-- Restore to specific time
pg_basebackup -D /backup/base -Ft -z -P
```

#### Cross-Region Backup

```typescript
// Backup to different region
async function backupToSecondaryRegion() {
  // 1. Create database dump
  const dump = await createDatabaseDump();

  // 2. Upload to S3 (different region)
  await s3.upload({
    Bucket: 'pura-backup-secondary',
    Key: `backup-${Date.now()}.sql`,
    Body: dump,
    ServerSideEncryption: 'AES256',
  });

  // 3. Verify backup
  await verifyBackup(dump);
}
```

---

### 4.2 Automated Backup Schedule

**Schedule:**

- **Hourly:** Transaction Log Backup
- **Daily:** Full Database Backup
- **Weekly:** Full Backup + Archive
- **Monthly:** Long-term Archive

**Retention:**

- Hourly: 24 hours
- Daily: 30 days
- Weekly: 12 weeks
- Monthly: 7 years

---

## 🛡️ หมวดที่ 5: Additional Security Features

### 5.1 Web Application Firewall (WAF)

**Requirement:**

- ใช้ Cloudflare หรือ AWS WAF

**Protection:**

- DDoS Protection
- SQL Injection Prevention
- XSS Prevention
- Rate Limiting

---

### 5.2 Two-Factor Authentication (2FA)

**Requirement:**

- บังคับใช้ 2FA สำหรับ Role ระดับสูง

**Roles Requiring 2FA:**

- System Admin
- General Manager
- Accounting Manager
- Night Auditor

**Implementation:**

```typescript
// 2FA using TOTP (Time-based One-Time Password)
import { authenticator } from 'otplib';

// Generate secret for user
function generate2FASecret(userId: string) {
  const secret = authenticator.generateSecret();

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret },
  });

  return secret;
}

// Verify 2FA code
function verify2FA(userId: string, token: string): boolean {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return authenticator.verify({
    token,
    secret: user.twoFactorSecret,
  });
}
```

---

### 5.3 Sensitive Data Masking

**Requirement:**

- ในหน้าจอและ Report ทั่วไป เลขบัตรเครดิตต้องโชว์แค่ 4 ตัวท้าย

**Implementation:**

```typescript
function maskSensitiveData(
  data: string,
  type: 'card' | 'phone' | 'email',
): string {
  switch (type) {
    case 'card':
      return `XXXX-XXXX-XXXX-${data.slice(-4)}`;
    case 'phone':
      return `XXX-XXX-${data.slice(-4)}`;
    case 'email':
      const [name, domain] = data.split('@');
      return `${name[0]}***@${domain}`;
    default:
      return data;
  }
}
```

---

### 5.4 Void Log (Un-delete)

**Requirement:**

- ห้ามลบข้อมูล Transaction ทิ้งจาก Database จริงๆ
- ใช้ Soft Delete

**Implementation:**

```prisma
model FolioTransaction {
  // ... existing fields ...
  isDeleted     Boolean  @default(false)
  deletedAt     DateTime?
  deletedBy     String?
}

// Soft delete
async function softDeleteTransaction(transactionId: string, userId: string) {
  await prisma.folioTransaction.update({
    where: { id: transactionId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId
    }
  });

  // Log to audit
  await prisma.auditLog.create({
    data: {
      action: 'SOFT_DELETE_TRANSACTION',
      entityType: 'FolioTransaction',
      entityId: transactionId,
      userId
    }
  });
}
```

---

## 📋 สรุป: Security Checklist

### Legal Compliance

- [ ] PDPA Consent Management
- [ ] Data Anonymization (Right to be Forgotten)
- [ ] Data Breach Notification
- [ ] Traffic Log Retention (90 days)
- [ ] TM.30 Report (Auto-generate)
- [ ] ร.ร. 3/4 Report

### System Security

- [ ] Auto-Logout (Session Timeout)
- [ ] Concurrent Login Control
- [ ] SQL Injection Prevention (Prisma)
- [ ] XSS Prevention
- [ ] Rate Limiting
- [ ] JWT with Refresh Token

### Financial Security

- [ ] PCI-DSS Compliance (Tokenization)
- [ ] Card Number Masking
- [ ] Immutable Ledger (Lock after Audit)
- [ ] Reverse Entry (not Update)

### Data Integrity

- [ ] 3-2-1 Backup Strategy
- [ ] Point-in-Time Recovery
- [ ] Cross-Region Backup
- [ ] Automated Backup Schedule

### Additional Security

- [ ] WAF (Cloudflare/AWS)
- [ ] 2FA for High-Role Users
- [ ] Sensitive Data Masking
- [ ] Soft Delete (Audit Trail)

---

**Last Updated:** 2025-01-XX
**Status:** ✅ Complete - Ready for Implementation
