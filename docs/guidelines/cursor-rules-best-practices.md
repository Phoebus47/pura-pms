# .cursorrules Best Practices - PURA PMS

**Last Updated:** February 2026  
**Purpose:** คู่มือการใช้งานและปรับปรุง `.cursorrules` สำหรับ Cursor IDE

---

## ✅ การใช้ .cursorrules ถูกต้องแล้ว

การใช้ `.cursorrules` เป็นวิธีที่ **ถูกต้องและเป็นมาตรฐาน** สำหรับ Cursor IDE ในปี 2026 เพื่อกำหนด coding standards ให้ AI agent ปฏิบัติตาม

---

## 📋 โครงสร้างที่แนะนำ

### 1. **Core Principles** (หลักการพื้นฐาน)

- KISS, DRY, YAGNI
- Separation of Concerns

### 2. **Framework-Specific Guidelines** (แนวทางเฉพาะ Framework)

- React & Next.js Best Practices
- TypeScript Guidelines
- State Management Patterns

### 3. **Quality Standards** (มาตรฐานคุณภาพ)

- Testing Requirements
- SonarQube Quality Gates
- Lighthouse Performance Requirements
- Accessibility (a11y) Standards

### 4. **Project-Specific Context** (บริบทเฉพาะโปรเจค)

- Tech Stack
- Current Phase
- Key Features
- Important Notes

### 5. **AI Agent Instructions** (คำแนะนำสำหรับ AI)

- Code Generation Guidelines
- Context Awareness
- Quality Assurance

---

## 🎯 Best Practices สำหรับปี 2026

### ✅ DO (ควรทำ)

1. **Keep it Concise but Complete**
   - ครอบคลุมทุกด้านที่สำคัญ
   - แต่ไม่ยาวเกินไป (แนะนำ < 500 บรรทัด)
   - ใช้ references ไปยังเอกสารอื่นสำหรับรายละเอียด

2. **Use Clear Structure**
   - ใช้ Markdown headers อย่างชัดเจน
   - จัดกลุ่มเนื้อหาตามหมวดหมู่
   - ใช้ code examples เมื่อจำเป็น

3. **Reference External Docs**
   - อ้างอิงไปยัง `docs/guidelines/` สำหรับรายละเอียดเพิ่มเติม
   - ใช้ `See: filename.md` เพื่อให้ agent อ่านเอกสารเพิ่มเติม

4. **Include Project Context**
   - Tech Stack
   - Current Phase
   - Key Features to Implement
   - Important Notes

5. **Define AI Roles**
   - กำหนด Virtual AI Team Roles
   - ระบุวิธีการใช้งาน (@PM, @QA, etc.)

### ❌ DON'T (ไม่ควรทำ)

1. **Don't Duplicate Information**
   - อย่า copy-paste เนื้อหาทั้งหมดจาก `coding_standards.md`
   - ใช้ references แทน

2. **Don't Make it Too Long**
   - อย่าใส่รายละเอียดทุกอย่างใน `.cursorrules`
   - เก็บรายละเอียดไว้ใน `docs/guidelines/`

3. **Don't Use Ambiguous Language**
   - ใช้คำสั่งที่ชัดเจน ("Must", "Should", "Avoid")
   - หลีกเลี่ยงคำที่คลุมเครือ

4. **Don't Ignore Updates**
   - อัปเดต `.cursorrules` เมื่อมี standards ใหม่
   - ตรวจสอบความสอดคล้องกับ `coding_standards.md`

---

## 🔄 Workflow ที่แนะนำ

### 1. **Initial Setup**

```
.cursorrules (root)
├── Core Principles
├── Framework Guidelines
├── Quality Standards
└── Project Context
```

### 2. **Detailed Documentation**

```
docs/guidelines/
├── coding_standards.md (รายละเอียดเต็ม)
├── test-structure-standard.md
├── virtual-ai-team-guide.md
└── ...
```

### 3. **Maintenance**

- อัปเดต `.cursorrules` เมื่อมี standards ใหม่
- ตรวจสอบความสอดคล้องทุก 3 เดือน
- อ้างอิงเอกสารใน `docs/guidelines/` สำหรับรายละเอียด

---

## 📊 การประเมิน .cursorrules ปัจจุบัน

### ✅ Points ที่ดี

1. **โครงสร้างชัดเจน** - แบ่งหมวดหมู่ดี
2. **ครอบคลุม** - มีทุกด้านที่สำคัญ
3. **มี Project Context** - ระบุ Tech Stack และ Current Phase
4. **มี Virtual AI Team Roles** - กำหนด roles ชัดเจน
5. **อ้างอิงเอกสารอื่น** - ใช้ `See: test-structure-standard.md`

### 🔧 Points ที่ควรปรับปรุง

1. **เพิ่ม AI Agent Instructions** - คำแนะนำเฉพาะสำหรับ AI
2. **เพิ่ม Context Awareness Guidelines** - วิธีอ่านและทำตาม existing patterns
3. **เพิ่ม Code Examples** - ตัวอย่างโค้ดที่ถูกต้องและผิด
4. **เพิ่ม Priority Guidelines** - ลำดับความสำคัญเมื่อมี conflict

---

## 🚀 แนวทางสำหรับปี 2026

### 1. **Structured Format**

````markdown
## Section Name

### Subsection

- Rule 1
- Rule 2
- Example:
  ```typescript
  // Good example
  ```
````

```

### 2. **Clear Commands**
- ใช้ "Must", "Should", "Avoid" แทน "Can", "May"
- ระบุผลลัพธ์ที่คาดหวังชัดเจน

### 3. **Context References**
- อ้างอิงไปยังเอกสารอื่น: `See: docs/guidelines/coding_standards.md`
- ระบุไฟล์ตัวอย่าง: `Example: apps/web/src/components/button.tsx`

### 4. **Version Control**
- เก็บ version history ใน Git
- ระบุวันที่อัปเดตล่าสุด

---

## 📝 Checklist สำหรับ .cursorrules

- [ ] Core Principles ครอบคลุม
- [ ] Framework Guidelines ชัดเจน
- [ ] Quality Standards ระบุเป้าหมาย
- [ ] Project Context อัปเดต
- [ ] AI Agent Instructions มี
- [ ] References ไปยังเอกสารอื่น
- [ ] Code Examples มี (เมื่อจำเป็น)
- [ ] Virtual AI Team Roles กำหนด
- [ ] Naming Conventions ระบุ
- [ ] Testing Requirements ชัดเจน

---

## 🎓 สรุป

**ใช่ครับ การใช้ `.cursorrules` แบบนี้ถูกต้องแล้ว** และเป็นวิธีที่เหมาะสมสำหรับปี 2026

### จุดเด่น:
- ✅ ครอบคลุมทุกด้านที่สำคัญ
- ✅ โครงสร้างชัดเจน
- ✅ มี Project Context
- ✅ อ้างอิงเอกสารอื่น

### แนะนำเพิ่มเติม:
- 🔧 เพิ่ม AI Agent Instructions section
- 🔧 เพิ่ม Context Awareness Guidelines
- 🔧 เพิ่ม Priority Guidelines

---

**End of Document**
```
