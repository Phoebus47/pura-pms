# AI Prompts Library - คลัง Prompt สำหรับ Virtual AI Team

Prompt templates ที่ใช้บ่อยสำหรับการทำงานกับ Cursor AI ในโปรเจค PURA PMS

---

## 📋 สารบัญ

1. [Project Manager Prompts](#project-manager-prompts)
2. [System Architect Prompts](#system-architect-prompts)
3. [Backend Developer Prompts](#backend-developer-prompts)
4. [Frontend Developer Prompts](#frontend-developer-prompts)
5. [QA Engineer Prompts](#qa-engineer-prompts)
6. [Quick Commands](#quick-commands)

---

## 🧑‍💼 Project Manager Prompts

### Break Down Feature

```
Act as a Technical PM for PURA PMS.

I want to implement: [ชื่อฟีเจอร์]

Based on:
- docs/planning/prd.md
- docs/planning/roadmap.md
- docs/planning/reports-master-list.md (if applicable)

Break this down into:
1. Step-by-step implementation checklist
2. Separate tasks for Backend, Frontend, and Database
3. Dependencies between tasks
4. Estimated complexity (Low/Medium/High)
5. Acceptance criteria for each task

Save this to: docs/planning/current-sprint.md
```

### Create Sprint Plan

```
Act as a Technical PM for PURA PMS.

Create a 2-week sprint plan for Phase 3: Financial & Audit Module.

Based on:
- docs/planning/roadmap.md
- docs/planning/prd.md

Include:
1. Sprint goals
2. User stories
3. Task breakdown with estimates
4. Dependencies
5. Risk assessment

Save to: docs/planning/sprint-[number].md
```

### Review Progress

```
Act as a Technical PM for PURA PMS.

Review the current sprint progress:
- Completed tasks: [list]
- In progress: [list]
- Blocked: [list]

Provide:
1. Status summary
2. Risk assessment
3. Recommendations for next sprint
4. Updated timeline
```

---

## 🧑‍💻 System Architect Prompts

### Review Schema

```
Act as a Senior System Architect for PURA PMS.

Review my proposed Prisma schema changes:

[วาง schema.prisma หรือส่วนที่แก้ไข]

Check:
1. Does this comply with USALI standards?
2. Will this break data integrity for split billing?
3. Are there performance concerns with 10+ years of data?
4. Does this follow immutable transaction principles?
5. Are indexes properly defined?
6. Will this cause migration issues?

Suggest improvements if needed.
```

### Review Architecture

```
Act as a Senior System Architect for PURA PMS.

Review the architecture for [module/feature]:

[อธิบายหรือวางโค้ด]

Evaluate:
1. Scalability (can handle 1000+ concurrent users?)
2. Maintainability (easy to modify/extend?)
3. Performance (response time, database queries)
4. Security (authentication, authorization, data protection)
5. Compliance (USALI, PDPA, PCI-DSS)

Suggest architectural improvements.
```

### Database Design Review

```
Act as a Senior System Architect for PURA PMS.

Review the database design for [feature]:

[วาง schema หรือ ER diagram]

Check:
1. Normalization (3NF compliance)
2. Relationships (one-to-many, many-to-many)
3. Indexes (for frequently queried fields)
4. Constraints (foreign keys, unique, check)
5. Data types (Decimal for money, proper date types)
6. Migration strategy

Reference: docs/planning/prd.md
```

---

## 👨‍💻 Backend Developer Prompts

### Implement Service

```
Act as a Senior Backend Developer for PURA PMS.

Implement: [Service Name] for [Module]

Requirements:
- Use NestJS 11 with Prisma ORM
- Follow modular architecture
- Validate DTOs with class-validator
- Use Logger service (no console.log)
- Handle errors properly (try-catch, proper HTTP status)
- Write immutable transactions (no deletion, use isVoid flag)
- Use Decimal for all monetary values

Create:
1. Service: apps/api/src/[module]/[module].service.ts
2. Controller: apps/api/src/[module]/[module].controller.ts
3. DTOs: apps/api/src/[module]/dto/
   - create-[module].dto.ts
   - update-[module].dto.ts
   - [module]-response.dto.ts
4. Update module: apps/api/src/[module]/[module].module.ts

Business Rules:
[ระบุ business rules จาก prd.md]

Reference:
- docs/guidelines/coding_standards.md
- docs/planning/prd.md
```

### Implement API Endpoint

```
Act as a Senior Backend Developer for PURA PMS.

Create API endpoint: [HTTP Method] /api/[route]

Requirements:
- Use NestJS decorators (@Get, @Post, etc.)
- Validate request body with DTOs
- Handle authentication (JWT Guard)
- Return proper HTTP status codes
- Use Swagger decorators for documentation
- Error handling with proper error messages

Example:
GET /api/reservations?propertyId=xxx&status=CONFIRMED

Create:
1. Controller method
2. Service method
3. DTOs (if needed)
4. Update Swagger documentation
```

### Implement Queue Job

```
Act as a Senior Backend Developer for PURA PMS.

Implement a queue job for [task] using Redis (BullMQ).

Requirements:
- Use @nestjs/bull for queue management
- Create processor in apps/api/src/[module]/processors/
- Handle job retries (max 3 attempts)
- Log job progress
- Handle job failures gracefully
- Clean up completed jobs

Create:
1. Queue module configuration
2. Job processor
3. Service to add jobs to queue
4. Error handling
```

---

## 🎨 Frontend Developer Prompts

### Create Component

```
Act as a Senior Frontend Developer for PURA PMS.

Create: [Component Name] component

Requirements:
- Use Next.js 16 App Router
- Use shadcn/ui components
- Use Tailwind CSS 4
- Mobile-first responsive design
- Connect to API: [endpoint]
- Use TanStack Query for data fetching
- Follow accessibility standards:
  - ARIA labels for interactive elements
  - Keyboard navigation
  - Form inputs with id, name, and labels with htmlFor
- All images must have alt attributes
- Lighthouse 100/100 requirements

Create:
1. Component: apps/web/src/components/[component-name].tsx
2. Page (if needed): apps/web/src/app/[route]/page.tsx
3. API hook: apps/web/src/hooks/use-[feature].ts
4. Types: apps/web/src/types/[feature].ts

Reference:
- docs/guidelines/coding_standards.md
- Existing components for patterns
```

### Create Form Component

```
Act as a Senior Frontend Developer for PURA PMS.

Create a form component for [feature]:

Requirements:
- Use react-hook-form for form management
- Validate with zod schema
- Show validation errors inline
- Disable submit button while submitting
- Show loading state
- Success/error toast notifications
- All inputs must have:
  - id attribute
  - name attribute
  - Associated label with htmlFor
- Mobile-friendly (touch targets 44x44px)

Fields:
[List fields]

Create:
1. Form component: apps/web/src/components/[form-name].tsx
2. Zod schema: apps/web/src/lib/validations/[schema].ts
3. API integration hook
```

### Create Data Table

```
Act as a Senior Frontend Developer for PURA PMS.

Create a data table component for [feature]:

Requirements:
- Use shadcn/ui Table component
- Server-side pagination
- Sorting (multiple columns)
- Filtering
- Search functionality
- Responsive (mobile: card view, desktop: table view)
- Loading states
- Empty states
- Export to CSV/Excel (optional)

Columns:
[List columns]

API: [endpoint]

Create:
1. Table component: apps/web/src/components/[table-name].tsx
2. API hook with pagination/sorting/filtering
3. Types for table data
```

---

## 🕵️ QA Engineer Prompts

### Write Unit Tests

```
Act as a QA Engineer for PURA PMS.

Write comprehensive unit tests for:

Files:
[List files ที่เพิ่งสร้าง]

Requirements:
- Use Vitest for testing
- Minimum 80% coverage for critical business logic
- Test both success and error paths
- Include edge cases:
  - [ระบุ edge cases เช่น invalid input, null values, boundary conditions]
  - Network failures
  - Database connection errors
  - Concurrent requests
  - Invalid permissions

For Backend:
- Use @nestjs/testing
- Mock external dependencies (API calls, database)
- Test DTO validation
- Test error handling

For Frontend:
- Use React Testing Library
- Use @testing-library/jest-dom
- Test user interactions
- Test accessibility

Create test files:
- [component].test.tsx
- [service].spec.ts
```

### Write Integration Tests

```
Act as a QA Engineer for PURA PMS.

Write integration tests for [feature]:

Requirements:
- Test complete user flow
- Test API endpoints with Supertest
- Test database operations
- Test authentication/authorization
- Test error scenarios
- Clean up test data after tests

Scenarios:
1. [Scenario 1]
2. [Scenario 2]
3. [Scenario 3]

Create:
- apps/api/test/[feature].e2e-spec.ts
```

### Find Edge Cases

```
Act as a QA Engineer for PURA PMS.

Review the following code and identify edge cases:

[วางโค้ด]

Find:
1. Boundary conditions
2. Invalid input scenarios
3. Error handling gaps
4. Race conditions
5. Security vulnerabilities
6. Performance issues

Suggest test cases for each edge case.
```

---

## ⚡ Quick Commands

### Shortcuts (ใช้ใน Cursor Chat)

```
@PM break down [feature]
@PM create sprint plan
@PM review progress

@Architect review schema [file]
@Architect review architecture [module]
@Architect database design [feature]

@Backend implement [service]
@Backend create API [endpoint]
@Backend queue job [task]

@Frontend create component [name]
@Frontend create form [feature]
@Frontend create table [feature]

@QA write tests for [files]
@QA integration tests [feature]
@QA find edge cases [code]
```

### Context Switching

```
[เปลี่ยนบทบาท]
Now switch to [Role] mode. [Task]

Example:
Now switch to QA Engineer mode. Write tests for the
NightAuditService we just created.
```

### Multi-file Operations

```
[Composer Mode]
Act as a Senior Fullstack Developer.

Implement [feature] which requires changes to:
1. Database schema (Prisma)
2. Backend service and controller
3. Frontend component
4. API integration
5. Types

Create all necessary files following coding_standards.md
```

---

## 📝 Tips

1. **Save Prompts**: เก็บ Prompt ที่ใช้บ่อยไว้ในไฟล์นี้
2. **Customize**: ปรับแต่ง Prompt ให้เหมาะกับงานของคุณ
3. **Be Specific**: ยิ่งระบุรายละเอียดมาก AI จะตอบได้ดีขึ้น
4. **Reference Files**: อ้างอิงไฟล์ที่มีอยู่แล้วใน Prompt
5. **Iterate**: ปรับ Prompt ตามผลลัพธ์ที่ได้

---

**Last Updated:** February 2026  
**Version:** 2.0.0
