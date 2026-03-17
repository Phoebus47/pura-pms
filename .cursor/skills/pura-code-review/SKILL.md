---
name: pura-code-review
description: Performs strict code reviews for PURA following repo coding standards, tests conventions, and SonarQube-quality expectations. Use when reviewing PRs, before merging, when the user asks for a review, or when changes touch financial/audit logic.
---

# PURA Code Review Skill (Strict)

Review goals: **correctness**, **security**, **maintainability**, **test adequacy**, and **alignment with repo standards**.

## What to read first (when reviewing)

- `docs/guidelines/coding_standards.md` (use targeted sections)
- `docs/guidelines/test-standards.md`
- For architecture-impacting changes: `ARCHITECTURE.md` + ADRs

## Review checklist (apply in order)

### 1) Scope and intent

- [ ] PR description explains **why** (not just what)
- [ ] Changes are limited to the stated scope
- [ ] No unrelated formatting churn mixed with logic changes (unless intentional)

### 2) Correctness and edge cases

- [ ] Handles not-found, invalid input, and conflict scenarios
- [ ] Avoids N+1 queries / inefficient loops on API paths
- [ ] For async flows (jobs): handles retries safely

### 3) Security

- [ ] No secrets, tokens, or credentials committed
- [ ] Auth/guards applied to protected endpoints
- [ ] Errors don’t leak sensitive data
- [ ] CORS changes are explicit and safe

### 4) Financial & audit safety (if applicable)

If the PR touches billing/financial/night-audit:

- [ ] **No delete/update** of posted financial facts; uses void/correction patterns
- [ ] **businessDate** is explicit and treated separately from system timestamps
- [ ] Reason codes enforced for void/adjust/transfer actions
- [ ] Night audit/batch posting is **idempotent** (re-run doesn’t double-post)

### 5) Web standards (apps/web)

- [ ] No hardcoded user-facing copy (i18n-ready per repo rules)
- [ ] No hardcoded colors; uses tokens from `globals.css`
- [ ] A11y: semantic elements, labels, focus-visible, keyboard nav
- [ ] Client/server boundaries correct (server by default; `'use client'` only when needed)
- [ ] React Query hooks: stable keys, invalidation on mutations

### 6) API standards (apps/api)

- [ ] DTOs exist and validate input (`class-validator`)
- [ ] Controllers are thin; services hold business logic
- [ ] Proper status codes (400/401/403/404/409)
- [ ] No `console.log`; uses logger

### 7) Tests and quality gates

- [ ] Tests added/updated for changed behavior
  - Web: `*.test.ts(x)` co-located
  - API: `*.spec.ts` co-located
- [ ] Tests cover success + at least one meaningful failure path
- [ ] If changes are risky, add an integration/e2e test (Playwright or API e2e)

### 8) Sonar-style maintainability heuristics

- [ ] No duplicated logic (extract helpers/hooks/services)
- [ ] No dead code / unused exports
- [ ] No `any` (use `unknown` or proper types)
- [ ] Complexity kept reasonable; split large files

## How to deliver review feedback

Use three severities:

- **Blocker**: must fix before merge (bugs, security, financial immutability/idempotency)
- **Strong suggestion**: should fix soon (tests missing, poor boundaries, perf issues)
- **Nit**: optional (style, naming) if it’s low-cost

When possible, propose concrete patch-level changes or test cases.
