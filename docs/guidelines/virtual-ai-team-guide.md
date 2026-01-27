# Virtual AI Team Guide - การใช้งาน AI แบบ "แยกร่าง" เป็นทีม

คู่มือการใช้งาน Cursor AI เพื่อจำลองการทำงานเป็นทีม 5-7 คนสำหรับโปรเจค PURA PMS

---

## 📋 สารบัญ

1. [ภาพรวม](#ภาพรวม)
2. [การตั้งค่าเบื้องต้น](#การตั้งค่าเบื้องต้น)
3. [บทบาทของแต่ละทีม](#บทบาทของแต่ละทีม)
4. [Workflow การทำงาน](#workflow-การทำงาน)
5. [Prompt Templates](#prompt-templates)
6. [Best Practices](#best-practices)

---

## 🎯 ภาพรวม

### แนวคิด

แทนที่จะให้ AI ตัวเดียวทำงานทุกอย่าง คุณสามารถ "สวมหมวก" (Persona) ให้ AI ในแต่ละขั้นตอนของการทำงาน เพื่อให้ได้ผลลัพธ์ที่มีคุณภาพและครอบคลุมทุกด้าน

### ทีมที่จำลอง

1. **Tech Lead / System Architect** - รีวิว Code และวางโครงสร้าง
2. **Project Manager / Product Owner** - แตก Task ใหญ่เป็น Task ย่อย
3. **Backend Developers (2 คน)** - เขียน Logic ที่ซับซ้อน
4. **Frontend Developers (2 คน)** - สร้าง UI Component และเชื่อมต่อ API
5. **QA / Tester** - เขียน Test Case และหา Bug

---

## ⚙️ การตั้งค่าเบื้องต้น

### 1. สร้าง Global Context (`.cursorrules`)

ไฟล์ `.cursorrules` ถูกสร้างไว้แล้วที่ root ของโปรเจค และมีกฎพื้นฐานจาก `coding_standards.md`

### 2. ตรวจสอบไฟล์ที่จำเป็น

- ✅ `.cursorrules` - กฎพื้นฐานสำหรับ AI
- ✅ `docs/guidelines/coding_standards.md` - มาตรฐานการเขียนโค้ด
- ✅ `docs/planning/prd.md` - Product Requirements Document
- ✅ `docs/planning/task.md` - Task breakdown

### 3. Keyboard Shortcuts

**สำคัญ:** จำ shortcuts หลักให้ได้

- **Chat:** Mac `Cmd+L` / Windows `Ctrl+L` - สำหรับถามคำถาม, แตก Task
- **Composer:** Mac `Cmd+I` / Windows `Ctrl+I` - สำหรับเขียนโค้ด, สร้างไฟล์

ดูรายละเอียดเพิ่มเติม: [Keyboard Shortcuts](./keyboard-shortcuts.md)

---

## 👥 บทบาทของแต่ละทีม

### 🧑‍💻 1. Tech Lead / System Architect

**หน้าที่:**

- รีวิว Code และ Schema
- ตรวจสอบความสอดคล้องกับ USALI standards
- ตรวจสอบ Data Integrity
- ประเมิน Performance และ Scalability

**เมื่อไหร่ควรใช้:**

- ก่อนเริ่มเขียน Schema ใหม่
- ก่อนแก้ไข Database Structure
- เมื่อต้องการรีวิว Architecture

**เครื่องมือ:** Cursor Chat (Mac: `Cmd+L` / Windows: `Ctrl+L`)

**Prompt Template:**

```
Act as a Senior System Architect for PURA PMS.

Review my proposed changes:
[วางโค้ดหรือ Schema ที่ต้องการรีวิว]

Check:
1. Does this comply with USALI standards?
2. Will this break data integrity for split billing?
3. Are there performance concerns with 10+ years of data?
4. Does this follow the patterns in coding_standards.md?

Suggest improvements if needed.
```

---

### 🧑‍💼 2. Project Manager / Product Owner

**หน้าที่:**

- แตก Task ใหญ่เป็น Task ย่อย
- สร้าง Checklist สำหรับ Frontend, Backend, Database
- จัดลำดับความสำคัญ
- ประมาณการเวลา

**เมื่อไหร่ควรใช้:**

- ตอนเช้าก่อนเริ่มงาน
- ก่อนเริ่มฟีเจอร์ใหม่
- เมื่อต้องการวางแผน Sprint

**เครื่องมือ:** Cursor Chat (Mac: `Cmd+L` / Windows: `Ctrl+L`)

**Prompt Template:**

```
Act as a Technical PM for PURA PMS.

I want to implement: [ชื่อฟีเจอร์ เช่น "Night Audit System"]

Based on:
- prd.md
- reports-master-list.md (if applicable)
- coding_standards.md

Break this down into:
1. Step-by-step implementation checklist
2. Separate tasks for Backend, Frontend, and Database
3. Dependencies between tasks
4. Estimated complexity (Low/Medium/High)

Save this to: docs/planning/current-sprint.md
```

---

### 👨‍💻 3. Backend Developer

**หน้าที่:**

- เขียน NestJS Services และ Controllers
- Implement Business Logic
- จัดการ Database Transactions
- Handle Error และ Validation

**เมื่อไหร่ควรใช้:**

- ตอนเขียน Backend Code
- เมื่อต้องแก้ไข API
- เมื่อต้องเพิ่ม Business Logic

**เครื่องมือ:** Cursor Composer (Mac: `Cmd+I` / Windows: `Ctrl+I`) ⚠️ **สำคัญ: ใช้ Composer ไม่ใช่ Chat**

**Prompt Template:**

```
Act as a Senior Backend Developer for PURA PMS.

Implement: [ชื่อ Task จาก PM]

Requirements:
- Use NestJS 11 with Prisma ORM
- Follow modular architecture
- Validate DTOs with class-validator
- Use Logger service (no console.log)
- Handle errors properly
- Write immutable transactions (no deletion)

Create:
1. Service: apps/api/src/[module]/[module].service.ts
2. Controller: apps/api/src/[module]/[module].controller.ts
3. DTOs: apps/api/src/[module]/dto/
4. Update module: apps/api/src/[module]/[module].module.ts

Reference:
- coding_standards.md
- prd.md (for business rules)
```

---

### 🎨 4. Frontend Developer

**หน้าที่:**

- สร้าง UI Components ด้วย shadcn/ui
- เชื่อมต่อ API
- จัดการ State ด้วย TanStack Query
- Responsive Design (Mobile-first)

**เมื่อไหร่ควรใช้:**

- ตอนเขียน Frontend Code
- เมื่อต้องสร้าง Component ใหม่
- เมื่อต้องแก้ไข UI/UX

**เครื่องมือ:** Cursor Composer (Mac: `Cmd+I` / Windows: `Ctrl+I`) ⚠️ **สำคัญ: ใช้ Composer ไม่ใช่ Chat**

**Prompt Template:**

```
Act as a Senior Frontend Developer for PURA PMS.

Create: [ชื่อ Component เช่น "Room Plan Calendar"]

Requirements:
- Use Next.js 16 App Router
- Use shadcn/ui components
- Use Tailwind CSS 4
- Mobile-first responsive design
- Connect to API: [endpoint]
- Use TanStack Query for data fetching
- Follow accessibility standards (ARIA labels, keyboard navigation)
- All images must have alt attributes
- Form inputs must have id, name, and labels with htmlFor

Create:
1. Component: apps/web/src/components/[component-name].tsx
2. Page (if needed): apps/web/src/app/[route]/page.tsx
3. API hook: apps/web/src/hooks/use-[feature].ts

Reference:
- coding_standards.md
- Lighthouse 100/100 requirements
```

---

### 🕵️ 5. QA / Tester

**หน้าที่:**

- เขียน Unit Tests และ Integration Tests
- คิดหา Edge Cases
- ตรวจสอบ Test Coverage
- หา Bug และ Security Issues

**เมื่อไหร่ควรใช้:**

- **ทันทีที่ Developer เขียนโค้ดเสร็จ** (ห้ามลืม!)
- ก่อน Commit Code
- เมื่อต้องการเพิ่ม Test Coverage

**เครื่องมือ:** Cursor Composer (Mac: `Cmd+I` / Windows: `Ctrl+I`)

**Prompt Template:**

```
Act as a QA Engineer for PURA PMS.

Review the files we just created:
[List ไฟล์ที่เพิ่งสร้าง]

Write comprehensive tests:
1. Unit Tests using Jest
2. Integration Tests (if applicable)
3. Edge Cases:
   - [ระบุเคสยากๆ เช่น Internet หลุด, ยอดเงินติดลบ, Concurrent requests]
   - Invalid input data
   - Database connection failures
   - API timeout scenarios

Requirements:
- Minimum 80% coverage for critical business logic
- Use React Testing Library for frontend components
- Use @nestjs/testing for backend services
- Do not mock the database unless necessary
- Test both success and error paths

Create test files:
- [component].test.tsx
- [service].spec.ts
```

---

## 🔄 Workflow การทำงาน

### Daily Workflow (One-Man Army)

```
┌─────────────────────────────────────────────────┐
│ 1. Planning (PM Mode)                           │
│    → เปิด Chat → สั่ง PM แตก Task               │
│    → บันทึกใน current-sprint.md                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. Architecting (Tech Lead Mode)                │
│    → เปิด Chat → สั่ง Architect รีวิว Schema   │
│    → แก้ไขตามคำแนะนำ                            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Coding (Dev Mode)                            │
│    → เปิด Composer (Mac: Cmd+I / Win: Ctrl+I)    │
│    → สั่ง Backend Dev เขียน Service/Controller  │
│    → สั่ง Frontend Dev เขียน Component         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. Testing (QA Mode)                             │
│    → เปิด Composer (Mac: Cmd+I / Win: Ctrl+I)   │
│    → สั่ง QA เขียน Test                         │
│    → รัน Test และตรวจสอบ Coverage              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. Review (Human)                                │
│    → คุณอ่าน Code และ Test Result               │
│    → ตรวจสอบ Lighthouse Score (ถ้าเป็น UI)     │
│    → Commit Code                                 │
└─────────────────────────────────────────────────┘
```

### Example: สร้างฟีเจอร์ "Night Audit System"

**Step 1: Planning**

```
[Chat] Act as a Technical PM. Break down "Night Audit System"
into tasks based on prd.md and DETAILED-WORK-PLAN.md
```

**Step 2: Architecting**

```
[Chat] Act as a Senior Architect. Review the Night Audit
schema changes. Will this work with Redis Queue (BullMQ)?
```

**Step 3: Backend Development**

```
[Composer] Act as a Senior Backend Developer. Implement
NightAuditService with Redis Queue integration.
```

**Step 4: Frontend Development**

```
[Composer] Act as a Senior Frontend Developer. Create
NightAuditDashboard component with real-time status.
```

**Step 5: Testing**

```
[Composer] Act as a QA Engineer. Write comprehensive tests
for NightAuditService. Cover edge cases like queue failure.
```

**Step 6: Review**

```
[Human] ตรวจสอบ Code, รัน Test, ตรวจสอบ Lighthouse, Commit
```

---

## 📝 Prompt Templates

### Quick Reference

| บทบาท        | เครื่องมือ | คำสั่งสั้นๆ                       |
| ------------ | ---------- | --------------------------------- |
| PM           | Chat       | `@PM break down [feature]`        |
| Architect    | Chat       | `@Architect review [schema/code]` |
| Backend Dev  | Composer   | `@Backend implement [task]`       |
| Frontend Dev | Composer   | `@Frontend create [component]`    |
| QA           | Composer   | `@QA write tests for [files]`     |

### Advanced Prompts

#### สำหรับ Complex Features

```
Act as a Senior Fullstack Developer.

I need to implement [Feature Name] which involves:
- Backend: [describe backend requirements]
- Frontend: [describe frontend requirements]
- Database: [describe schema changes]

Create a complete implementation:
1. Database migration (Prisma)
2. Backend service and controller
3. Frontend component and page
4. API integration
5. Error handling
6. Type definitions

Follow all patterns in coding_standards.md and ensure
Lighthouse 100/100 for frontend.
```

#### สำหรับ Refactoring

```
Act as a Senior System Architect.

I want to refactor [module/component] because:
[ระบุปัญหา เช่น performance, maintainability]

Review the current implementation:
[วางโค้ดปัจจุบัน]

Suggest:
1. What to refactor
2. How to refactor (step-by-step)
3. Potential risks
4. Testing strategy
```

---

## ✅ Best Practices

### 1. ใช้เครื่องมือให้ถูกต้อง

- **Chat** (Mac: `Cmd+L` / Windows: `Ctrl+L`): สำหรับถามคำถาม, แตก Task, รีวิว Architecture
- **Composer** (Mac: `Cmd+I` / Windows: `Ctrl+I`): สำหรับเขียนโค้ด, สร้างไฟล์, แก้ไขหลายไฟล์พร้อมกัน

### 2. ตรวจสอบก่อนใช้

- อ่าน `.cursorrules` ก่อนเริ่มงาน
- ตรวจสอบ `coding_standards.md` สำหรับกฎเฉพาะ
- อ้างอิง `prd.md` สำหรับ Business Rules

### 3. อย่าข้าม Testing

- **ห้ามข้าม QA Mode** - ทุกฟีเจอร์ต้องมี Test
- รัน Test ทุกครั้งก่อน Commit
- ตรวจสอบ Coverage > 80%

### 4. Review Code เสมอ

- AI เขียนโค้ดได้ แต่ **คุณต้อง Review**
- ตรวจสอบ Logic, Security, Performance
- ตรวจสอบ Lighthouse Score (ถ้าเป็น UI)

### 5. ใช้ Context Files

- เปิดไฟล์ที่เกี่ยวข้องก่อนใช้ Composer
- อ้างอิงไฟล์ที่มีอยู่แล้วใน Prompt
- ใช้ `@filename` เพื่อให้ AI อ่านไฟล์นั้น

### 6. Iterative Development

- อย่าทำทุกอย่างพร้อมกัน
- ทำทีละ Task จาก PM
- Test ทีละ Feature

---

## 🚨 คำเตือนสำคัญ

### ⚠️ AI เป็น "ผู้ช่วย" ไม่ใช่ "ผู้ตัดสินใจ"

- **Decision Making**: คุณต้องตัดสินใจเอง 100%
- **Accountability**: คุณรับผิดชอบ Code ที่ Commit
- **Review**: ตรวจสอบทุกอย่างก่อน Commit

### ⚠️ อย่าเชื่อ AI 100%

- AI อาจเขียนโค้ดผิด
- AI อาจไม่เข้าใจ Business Logic
- AI อาจไม่รู้ Context ที่ซ่อนอยู่

### ⚠️ ใช้ AI อย่างมีสติ

- อย่าให้ AI เขียนโค้ดที่คุณไม่เข้าใจ
- อย่า Commit Code ที่ยังไม่ได้ Test
- อย่าใช้ AI แทนการคิดเอง

---

## 📚 เอกสารอ้างอิง

- [Coding Standards](./coding_standards.md)
- [PRD](../planning/prd.md)
- [Task Breakdown](../planning/task.md)
- [Detailed Work Plan](../planning/DETAILED-WORK-PLAN.md)
- [Quick Start](../planning/QUICK-START.md)

---

## 💡 Tips & Tricks

### 1. สร้าง Prompt Library

สร้างไฟล์ `prompts-library.md` เก็บ Prompt ที่ใช้บ่อย:

```markdown
# PM - Break Down Feature

@PM break down [feature] based on prd.md

# Architect - Review Schema

@Architect review schema.prisma for [module]

# Backend - Implement Service

@Backend implement [service] in NestJS

# Frontend - Create Component

@Frontend create [component] with shadcn/ui

# QA - Write Tests

@QA write tests for [files] with edge cases
```

### 2. ใช้ Shortcuts

ใน Cursor สามารถสร้าง Custom Commands:

1. ไปที่ Settings → Commands
2. สร้าง Command ใหม่ เช่น:
   - `@pm` → เรียก PM Mode
   - `@qa` → เรียก QA Mode

### 3. Context Switching

เมื่อเปลี่ยนบทบาท ให้บอก AI ชัดเจน:

```
[ก่อนหน้านี้เป็น Backend Dev]
Now switch to QA Engineer mode. Write tests for the code above.
```

---

## 🎯 สรุป

Virtual AI Team คือการ **"สวมหมวก"** ให้ AI ในแต่ละขั้นตอน ไม่ใช่การให้ AI ทำงานอัตโนมัติทั้งหมด

**Workflow ที่แนะนำ:**

1. PM → แตก Task
2. Architect → รีวิว Design
3. Developer → เขียนโค้ด
4. QA → เขียน Test
5. Human → Review & Commit

**จำไว้:** AI เป็นเครื่องมือที่ช่วยให้คุณทำงานได้เร็วขึ้น แต่ **คุณยังเป็นคนที่ต้องตัดสินใจและรับผิดชอบ** ครับ

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0
