# Shift Ops UI — Implementation Brief (Multi-Agent Roles)

**Status:** Ready to implement (Phase A first)  
**Date:** 2026-08-26  
**Owners:** Virtual AI Team (@PM · @Architect · @Frontend · @Backend · @QA)  
**Product:** PURA PMS — Front Office home & shell polish  
**Do not:** Base the UI on Mews alone · Ship Framer Motion in v1 · Redesign all pages at once

---

## 1. North star

**Morning Harbor Desk** — hospitality calm in the chrome; instrument clarity in the work.

| Mode                                | Audience              | Purpose                                         |
| ----------------------------------- | --------------------- | ----------------------------------------------- |
| **Shift Ops** (default after login) | FO agent / supervisor | Clear today’s work before the lobby queue grows |
| **Property Pulse** (secondary)      | GM / Night Auditor    | OCC / ADR / forecast — not the FO landing       |

**Research base (multi-source, not Mews-only):** Cloudbeds · Opera Cloud · SORASO · RoomRaccoon · Little Hotelier · Linear/Attio/Mercury craft · Awwwards craft-only (not marketing formats).

---

## 2. Non-negotiables

### Do

- Remaining-first queues (`12 arrivals · 4 left`)
- Semantic status color ≠ brand paint
- CSS motion only (150–250ms) + `prefers-reduced-motion`
- Keep `pura-blue` / orange / Geist + Sarabun / flat (no glow)
- i18n keys for all new copy (`en.json` + `th.json`)
- Design tokens — no raw `#hex` in components
- Thai FO vocabulary (VIP, Skip/Sleep, Comp/HU, TM30, VC/VD…) as first-class where data exists

### Don’t

- Framer Motion / `motion` as default dependency
- Full-bleed heroes, parallax, oversized display type, glass/glow, purple gradients
- KPI icon-card walls that don’t deep-link to filtered work
- Mixing GM P&L / channel pies onto FO home
- Copying Mews donuts or Awwwards SOTD layouts into the app shell

---

## 3. Phased delivery

| Phase | Name                 | Goal                                                                    | Gate to next                                         |
| ----- | -------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| **A** | Shift Ops home       | Replace marketing KPI dashboard with work queues + exceptions + actions | FO can clear CI/CO from home in ≤3 clicks            |
| **B** | Harbor visual polish | Surface wash, desk panels, density, fewer nested cards (shell + home)   | Brand test passes without relying on sidebar alone   |
| **C** | Nav IA + command     | Group sidebar; make header search useful (guest/conf/room)              | Find core FO actions without scrolling 25 flat links |
| **D** | CSS motion           | 2–3 intentional transitions (commit feedback, drawer, row highlight)    | No jank on tablet; reduced-motion respected          |
| **E** | Optional Motion lib  | Only if a specific gesture needs FLIP/springs                           | Written ADR justifying bundle cost                   |

**Implement A → B → C → D. E is deferred.**

---

## 4. Phase A — Shift Ops home (spec)

### Above-the-fold contract

1. **Now strip** — business date, property name, occupancy snapshot, rooms ready-to-sell (if data available)
2. **Work queues** — Arrivals due · Departures due · Unassigned (each: remaining / total → deep link)
3. **Exceptions rail** — VIP today, dirty blocking assignment, TM30/profile incomplete, payment risk / open balance (show only when count > 0)
4. **Work list** — scannable rows (guest, room/ETA, blockers) with primary action (Check-in / Check-out / Open)
5. **Primary CTAs** — New reservation · open Calendar/Timeline

### Demote / remove from FO home

- Decorative 4-icon KPI card grid as the hero
- “Recent reservations” as the main body without filters
- Revenue/ADR charts (move to Property Pulse later)

### Data sources (prefer existing APIs)

| Need                        | Likely source                    | Owner if gap                       |
| --------------------------- | -------------------------------- | ---------------------------------- |
| Today arrivals / departures | Reservations list + date filters | @Backend if no dedicated endpoint  |
| In-house / unassigned       | Reservations + room assignment   | @Backend                           |
| Room dirty / ready          | Housekeeping / room status       | @Backend                           |
| TM30 incomplete             | TM30 module counts               | @Backend                           |
| Occupancy snapshot          | Existing dashboard stats         | @Frontend reuse / @Backend tighten |

**YAGNI:** Do not invent new BI. Compose from current domains. If a metric isn’t available, hide the widget — don’t fake it.

### Files likely touched (Phase A)

- `apps/web/src/app/[locale]/page.tsx`
- `apps/web/src/app/[locale]/dashboard-cards.tsx` (replace or split)
- New: `apps/web/src/components/dashboard/shift-ops-*.tsx` (keep files < 200 lines)
- `apps/web/src/messages/en.json` / `th.json`
- Tests co-located `*.test.tsx`

---

## 5. Role ownership matrix

### @PM — Product Manager

**Owns:** Scope, sequencing, acceptance criteria, cut list.

| Deliverable                     | Done when                                      |
| ------------------------------- | ---------------------------------------------- |
| Phase A acceptance checklist    | Written in this doc §7 and ticketable          |
| Explicit out-of-scope per phase | No agent implements Pulse/Framer/full nav in A |
| Priority of exception widgets   | Ordered by FO risk (CI blockers first)         |
| Copy tone                       | Approve EN + TH glossary for Shift Ops labels  |

**Prompt seed:**

```
@PM Using docs/planning/shift-ops-ui-brief.md, break Phase A into
implementable tasks with AC. Do not expand into Phase B–E.
```

---

### @Architect — System Architect

**Owns:** Surface contracts, API composition, tokens, ADR if needed.

| Deliverable                                                 | Done when                                                  |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| Data contract for Shift Ops widgets                         | Which endpoints/fields; no duplicate occupancy definitions |
| Token plan for Harbor (Phase B)                             | Variables in `globals.css` only; document keep vs change   |
| Decision: drawer vs full page for reservation from home     | Prefer drawer/split if pattern exists; else Link to detail |
| ADR only if new motion lib or new dashboard API aggregation | Use `pura-adr` skill                                       |

**Prompt seed:**

```
@Architect Review shift-ops-ui-brief.md Phase A. Confirm we can compose
from existing reservation/HK/TM30 APIs. List gaps only — no new tables.
```

---

### @Frontend — Frontend Developer

**Owns:** Shift Ops UI, i18n, a11y, density, CSS motion (D), Harbor polish (B).

| Phase | Responsibility                                                                |
| ----- | ----------------------------------------------------------------------------- |
| **A** | Build Shift Ops layout + queue widgets + work list + CTAs; RTL queries; tests |
| **B** | Apply Harbor surfaces (background wash, desk panels, less card chrome)        |
| **C** | Grouped nav UI + wire search results UI (depends on search API)               |
| **D** | CSS transitions only; shared utility if needed (not Framer)                   |

**Rules:** `.cursorrules` + `pura-web-feature` skill · no hardcoded strings · Lighthouse-minded · mobile bottom nav still works.

**Prompt seed:**

```
@Frontend Implement Phase A only from docs/planning/shift-ops-ui-brief.md.
Replace marketing KPI home with Shift Ops. CSS only. Tests required.
```

---

### @Backend — Backend Developer

**Owns:** Gaps that block Shift Ops accuracy (only if Frontend cannot compose).

| Deliverable                                | Done when                                        |
| ------------------------------------------ | ------------------------------------------------ |
| Optional `GET` dashboard/shift-ops summary | If and only if N+1 client calls are unacceptable |
| Document occupancy definition              | One definition reused by home + reports          |
| Ensure date filters for arrivals/deps      | Business date aware where required               |

**YAGNI:** Prefer Frontend composition in Phase A. Add aggregate endpoint only if Architect flags perf/consistency risk.

**Prompt seed:**

```
@Backend From shift-ops-ui-brief.md, list whether Phase A needs a new
aggregate endpoint. If yes, propose DTO + route; if no, say compose-only.
```

---

### @QA — QA Engineer

**Owns:** Behavior tests, FO regression, a11y smoke, motion reduced-motion.

| Deliverable             | Done when                                              |
| ----------------------- | ------------------------------------------------------ |
| Phase A RTL tests       | Queues render; empty states; CTA navigation; i18n keys |
| Manual FO script        | Peak CI path: home → arrival → check-in                |
| Visual regression notes | No Framer; no purple/glow; contrast on harbor wash     |
| AC sign-off             | §7 checklist checked                                   |

**Prompt seed:**

```
@QA Write/extend tests for Shift Ops Phase A per shift-ops-ui-brief.md §7.
Prefer getByRole. Mock API. Cover empty + blocker states.
```

---

## 6. Parallel agent workflow

```text
@PM          → finalize Phase A task list + AC
@Architect   → confirm data composition / gaps (blocking for Backend)
     ↓
@Frontend    → implement Phase A UI (main path)
@Backend     → only if Architect opened a gap ticket
@QA          → tests + AC in parallel as UI lands
     ↓
@Architect   → light review (tokens, no new deps)
@PM          → accept Phase A → unlock Phase B
```

**One PR per phase** (`feat/shift-ops-home`, `feat/harbor-polish`, …). Do not mix A+B.

Suggested branches: `cursor/feat-shift-ops-home-6a5d`, then `cursor/feat-harbor-polish-6a5d`, etc.

---

## 7. Phase A acceptance criteria

- [ ] FO home is **Shift Ops**, not 4 decorative KPI icon cards as the hero
- [ ] Arrivals and departures show **remaining / total** (or hide if zero data)
- [ ] At least one exception widget appears when applicable (VIP or HK blocker or TM30)
- [ ] Work list rows link/action to reservation or check-in flow
- [ ] New reservation CTA works via `router.push` / Link
- [ ] All new strings in `en.json` + `th.json` (hotel FO glossary)
- [ ] No `framer-motion` / `motion` dependency added
- [ ] Unit tests for home composition + empty states
- [ ] Mobile: usable above-the-fold queues; bottom nav unchanged
- [ ] `pnpm --filter web test` + type-check pass for touched packages

---

## 8. Phase B–D (brief only — detail when A ships)

### B — Harbor polish

- `--surface-harbor` page wash; `--surface-desk` panels
- Titles/numerals use brand blue; orange = signal only
- Reduce nested `bg-white border-slate-200` cards on home + shell

### C — Nav + command

- Group: Front Office · Rooms & HK · Finance · Guest · Settings
- Header search: guest name / confirmation / room → results

### D — CSS motion

1. Commit success feedback
2. Panel/drawer enter
3. Optional row highlight on status change

---

## 9. Glossary (Shift Ops labels)

| EN             | TH (nav/UI)        |
| -------------- | ------------------ |
| Shift Ops      | Shift Ops          |
| Arrivals       | Arrivals / ขาเข้า  |
| Departures     | Departures / ขาออก |
| Remaining      | คงเหลือ            |
| Unassigned     | ยังไม่กำหนดห้อง    |
| Exceptions     | ข้อยกเว้น          |
| Ready to sell  | พร้อมขาย           |
| Property Pulse | Property Pulse     |

Prefer industry EN for technical queue names where already used in FO training; Thai support line in subtitle/tooltip if needed.

---

## 10. References

- Internal research synthesis (2026-08-26): Cloudbeds, Opera, SORASO, RoomRaccoon, Little Hotelier, Linear/Attio/Mercury, Awwwards craft-only
- `docs/guidelines/coding_standards.md` § design tokens / i18n
- `docs/guidelines/virtual-ai-team-guide.md` — role prompts
- Existing shell: `apps/web/src/components/layout/*`
- Current home: `apps/web/src/app/[locale]/page.tsx`

---

**Next action:** @PM breaks Phase A into tickets → @Architect confirms compose-only → @Frontend implements → @QA gates merge.
