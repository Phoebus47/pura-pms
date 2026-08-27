# Harbor Design System v2 — Redesign Plan

**Status:** Ready to implement
**Base branch:** `cursor/feat-harbor-ds-v2-6a5d` (on top of Shift Ops PR #135)
**Scope:** `apps/web` only. No API/database changes. No new runtime dependencies.
**Goal:** Make PURA feel like a tool an FO agent _wants_ to use for an 8-hour shift — predictable rhythm, readable density, one visual language.

---

## 1. Why v2

Harbor v1 introduced surfaces (`--surface-harbor` / `--surface-desk` / `--rule-mist`) and removed most `bg-white` / `border-slate-*` debt. The audit shows the remaining problems are **systemic, not cosmetic**:

| Problem                 | Evidence (audit)                                                           |
| ----------------------- | -------------------------------------------------------------------------- |
| No spacing rhythm       | Same panel role uses `p-6` (87×), `p-4` (55×), `p-5` (6×)                  |
| No radius rhythm        | `rounded-xl` 102× · `rounded-lg` 44× · `rounded-md` 54× for similar roles  |
| Page headers duplicated | ~35 routes; two syntaxes (`text-pura-blue` vs `text-(--pura-blue)`)        |
| Status colors scattered | 320 raw palette utilities; 8 badge files each own a private palette        |
| Patterns re-implemented | 13 inline spinners, 6+ ad-hoc empty states, 6+ hand-rolled tables          |
| Dead tokens             | `chart-1..5`, `sidebar-*`, `rounded-2xl..4xl`, `surface-panel` unused      |
| Touch target below spec | `ui/button` default is `h-10` (40px) while 125 call sites patch `min-h-11` |

v2 fixes the **middle tier**: a real semantic token layer plus a small set of layout primitives, so pages stop inventing spacing and color.

## 2. Research basis

- **Three-tier tokens (primitive → semantic → component)** is the 2026 industry standard (Material 3 `ref`/`sys`/`comp`, IBM Carbon, SLDS). Components must never reference primitives directly; theming happens only at the semantic tier.
- **Purpose-based naming** (`surface.raised`, `text.subtle`) outlives appearance names (`blue-500`, `slate-200`).
- **Tailwind 4 `@theme`** makes every token a real CSS custom property, so the namespace prefix (`--color-*`, `--spacing-*`, `--text-*`, `--radius-*`, `--shadow-*`) is load-bearing — a token without a known prefix generates no utility.
- **Dense admin tables**: compact rows 32–40px, comfortable 48–56px; sticky header; anchor column first and visually distinct; avoid hover-only actions; offload secondary metadata to expandable rows or a detail panel; user-controllable density.
- **Type scale should carry line-height** via Tailwind's `--text-*--line-height` sub-property so vertical rhythm is not re-guessed per page.

## 3. Non-negotiables

### Do

- Three tiers; components read **semantic** tokens only.
- One page-header component, one empty-state, one table shell, one status-color map.
- Spacing/type/radius come from tokens — no new arbitrary values (`p-[13px]`, `text-[11px]`).
- Keep brand: pura-blue primary, orange = signal only, Geist + Sarabun, flat (no glow).
- All copy through i18n (`en.json` + `th.json`).
- Keep `min-h-11` (44px) as the interactive floor.
- CSS-only motion, 150–250ms, `prefers-reduced-motion` respected.

### Don't

- No Framer Motion / animation libraries.
- No dark-mode rollout in v2 (tokens stay dark-ready; UI stays light).
- No component tokens except where a component genuinely needs an override.
- No renaming `--pura-blue` / `--pura-orange` (brand primitives stay).
- Don't touch `login`, `portal`, `kiosk`, `mobile-check-in`, or `*print*` routes in v2 — guest-facing and print surfaces are a later wave.

---

## 4. Token architecture

### 4.1 Tier 1 — Primitives (raw values; never used in components)

Keep the existing brand primitives, add a Harbor neutral ramp and a status ramp. All in `oklch` for perceptual evenness.

```css
:root {
  /* Brand (existing — do not rename) */
  --pura-blue: #1e4b8e;
  --pura-blue-dark: #153a6e;
  --pura-blue-light: #2563eb;
  --pura-orange: #f5a623;
  --pura-orange-dark: #d4850f;
  --pura-orange-light: #fbbf24;
  --pura-sky: #3b82f6;

  /* Harbor neutrals — cool blue-tinted ramp (hue 247) */
  --harbor-25: oklch(0.995 0.004 247);
  --harbor-50: oklch(0.985 0.008 247);
  --harbor-100: oklch(0.975 0.012 247);
  --harbor-200: oklch(0.96 0.012 247);
  --harbor-300: oklch(0.9 0.015 247);
  --harbor-400: oklch(0.8 0.018 247);
  --harbor-500: oklch(0.62 0.022 247);
  --harbor-600: oklch(0.52 0.024 247);
  --harbor-700: oklch(0.38 0.026 247);
  --harbor-800: oklch(0.28 0.026 247);
  --harbor-900: oklch(0.2 0.02 247);

  /* Status ramps — 100 = tint, 500 = solid, 700 = ink */
  --status-positive-100: oklch(0.95 0.05 155);
  --status-positive-500: oklch(0.63 0.15 155);
  --status-positive-700: oklch(0.45 0.13 155);
  --status-caution-100: oklch(0.96 0.06 85);
  --status-caution-500: oklch(0.74 0.15 75);
  --status-caution-700: oklch(0.52 0.13 70);
  --status-critical-100: oklch(0.95 0.04 25);
  --status-critical-500: oklch(0.6 0.2 25);
  --status-critical-700: oklch(0.45 0.17 25);
  --status-info-100: oklch(0.95 0.04 250);
  --status-info-500: oklch(0.58 0.16 255);
  --status-info-700: oklch(0.42 0.14 255);
  --status-neutral-100: var(--harbor-200);
  --status-neutral-500: var(--harbor-500);
  --status-neutral-700: var(--harbor-700);
}
```

### 4.2 Tier 2 — Semantic (the only tier components may read)

Names describe **role**, not appearance. Existing shadcn-style names are kept so `ui/*` keeps working; the Harbor names are added alongside and become the preferred vocabulary.

| Semantic token     | Maps to        | Use for                                     |
| ------------------ | -------------- | ------------------------------------------- |
| `--surface-harbor` | `--harbor-100` | Page wash (`body`)                          |
| `--surface-desk`   | `--harbor-25`  | Raised panels, cards, header, popovers      |
| `--surface-inset`  | `--harbor-200` | Table headers, wells, inset rows            |
| `--surface-sunken` | `--harbor-50`  | Hover row / zebra                           |
| `--rule-mist`      | `--harbor-300` | Hairline dividers and panel borders         |
| `--rule-strong`    | `--harbor-400` | Emphasis dividers (table foot, section end) |
| `--ink-strong`     | `--harbor-900` | Headings, table anchor column               |
| `--ink-default`    | `--harbor-800` | Body                                        |
| `--ink-subtle`     | `--harbor-600` | Labels, secondary metadata                  |
| `--ink-disabled`   | `--harbor-500` | Disabled, placeholder                       |
| `--ink-onbrand`    | `--harbor-25`  | Text on pura-blue / orange                  |

> Text colors are named `--ink-*`, **not** `--text-*`: in Tailwind 4 the `--text-*`
> namespace is reserved for font sizes, so `--text-subtle` would emit a bogus
> `text-subtle` font-size utility. Utilities are `text-ink-subtle`, `bg-ink-strong`, …
> | `--action-primary` | `--pura-blue` | Primary buttons, links, focus ring |
> | `--action-primary-alt` | `--pura-blue-dark`| Primary hover/active |
> | `--signal` | `--pura-orange` | Attention only (never large fills) |
> | `--signal-ink` | `--pura-orange-dark` | Text/number on signal tint |

Existing aliases (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--input`, `--ring`, `--popover`, `--primary`, `--destructive`, …) must be **re-pointed at the Harbor semantics above** rather than holding their own values. `.dark` overrides stay but remain unshipped.

### 4.3 Tier 3 — Component tokens (use sparingly)

Only where a pattern needs its own knob:

```css
:root {
  --table-row-h-compact: 2.25rem; /* 36px */
  --table-row-h-default: 3rem; /* 48px */
  --panel-pad: var(--space-5); /* 20px */
  --panel-pad-lg: var(--space-6); /* 24px */
  --field-h: 2.75rem; /* 44px — interactive floor */
}
```

### 4.4 Status token map (single source of truth)

New file `apps/web/src/lib/design/status-tone.ts`:

```ts
export type StatusTone =
  | 'positive'
  | 'caution'
  | 'critical'
  | 'info'
  | 'neutral'
  | 'brand';

export const statusToneClass: Record<StatusTone, string> = {
  positive:
    'bg-status-positive-tint text-status-positive-ink ring-status-positive-line',
  caution:
    'bg-status-caution-tint text-status-caution-ink ring-status-caution-line',
  critical:
    'bg-status-critical-tint text-status-critical-ink ring-status-critical-line',
  info: 'bg-status-info-tint text-status-info-ink ring-status-info-line',
  neutral: 'bg-surface-inset text-ink-subtle ring-rule-mist',
  brand: 'bg-pura-blue/10 text-pura-blue ring-pura-blue/20',
};
```

Every domain badge (`reservation-status-badge`, `room-status-badge`, `stay-purpose-badge`, `split-stay-badge`, `day-use-badge`, `tax-exempt-badge`, `room-lock-badge`, `billing-cycle-badge`) maps its domain value → `StatusTone` and renders through the shared `<StatusBadge>`. No badge file may contain a raw Tailwind palette color after v2.

---

## 5. Spacing scale

Tailwind's base unit stays `0.25rem`, so numeric utilities keep working. v2 **restricts which steps are legal** and names the layout ones.

| Token             | Value        | Legal use                            |
| ----------------- | ------------ | ------------------------------------ |
| `space-1` (4px)   | icon gaps    | inline icon↔text                     |
| `space-2` (8px)   | tight        | chip padding, badge gaps             |
| `space-3` (12px)  | compact      | table cell y-padding, dense stacks   |
| `space-4` (16px)  | default      | field gaps, list row padding         |
| `space-5` (20px)  | **panel**    | panel padding (`--panel-pad`)        |
| `space-6` (24px)  | **panel-lg** | large panel padding, section gap     |
| `space-8` (32px)  | section      | between major page sections          |
| `space-12` (48px) | page         | page top/bottom breathing on desktop |

**Rules**

- Panels use `p-5` (mobile) → `sm:p-6`. `p-4` is only for compact tiles; `p-6` alone is no longer the default.
- Vertical stacks use `space-y-4` inside a panel, `space-y-6` between panels, `space-y-8` between page sections.
- Page shell padding is owned by `AppLayout` (`p-4` mobile / `lg:p-8`) — pages must not add their own outer padding.
- Banned: `p-5` mixed arbitrarily, `space-y-3` for panel groups, any arbitrary `[13px]`-style value.

## 6. Typography scale

Declared in `@theme` with paired line-heights so pages stop tuning leading.

| Token       | Size / line-height | Role                                                        |
| ----------- | ------------------ | ----------------------------------------------------------- |
| `text-2xs`  | 11px / 14px        | Table micro-labels, nav group caps (replaces `text-[10px]`) |
| `text-xs`   | 12px / 16px        | Badges, metadata                                            |
| `text-sm`   | 14px / 20px        | **Body default** (already dominant, 325×)                   |
| `text-base` | 16px / 24px        | Long-form / dialog body                                     |
| `text-lg`   | 18px / 26px        | Panel titles                                                |
| `text-xl`   | 20px / 28px        | Section titles                                              |
| `text-2xl`  | 24px / 32px        | Page title (mobile)                                         |
| `text-3xl`  | 30px / 38px        | Page title (desktop)                                        |

**Rules**

- Page H1: `text-2xl sm:text-3xl font-bold text-pura-blue` — emitted only by `<PageHeader>`, never inline.
- Panel H2: `text-lg font-semibold text-ink-strong`.
- Numerals in metrics use `tabular-nums`.
- Uppercase micro-labels: `text-2xs font-semibold uppercase tracking-wide text-ink-subtle`.
- `text-[10px]` and `text-4xl`/`font-black` are removed.

## 7. Radius, elevation, motion, density

**Radius** — three legal steps, role-bound:

| Token          | Value | Role                             |
| -------------- | ----- | -------------------------------- |
| `rounded-md`   | 8px   | Controls: inputs, selects, chips |
| `rounded-lg`   | 10px  | Buttons, menu items              |
| `rounded-xl`   | 14px  | Panels, cards, dialogs           |
| `rounded-full` | —     | Avatars, dots, pills only        |

`rounded-2xl`/`3xl`/`4xl` tokens are deleted.

**Elevation** — flat-first; only two shadows:

```css
--shadow-panel: 0 1px 2px oklch(0.2 0.02 247 / 0.05);
--shadow-overlay: 0 12px 32px -12px oklch(0.2 0.02 247 / 0.28);
```

Panels use `--shadow-panel` + hairline border. Dialogs/menus use `--shadow-overlay`. No other shadows.

**Motion** — reuse v1's `.motion-enter` (180ms) + delays; add nothing new except an optional `.motion-row-flash` for post-mutation row confirmation. All disabled under `prefers-reduced-motion`.

**Density** — tables ship two densities driven by `--table-row-h-*`: `default` (48px) and `compact` (36px). Density is a prop on the shared table; the persisted user preference is out of scope for v2.

---

## 8. Shared components to build

All go under `apps/web/src/components/shared/` unless noted, each with a co-located `*.test.tsx`, each under 200 lines, all copy via i18n keys passed in as props (components take strings, not keys, to stay dumb).

| Component        | Replaces                                     | Required props                                                            |
| ---------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| `PageHeader`     | ~35 inline page headers + `DetailPageHeader` | `title`, `subtitle?`, `actions?`, `backHref?`                             |
| `Panel`          | ad-hoc `surface-desk border ...` wrappers    | `title?`, `actions?`, `padding?: 'default' \| 'lg' \| 'none'`, `children` |
| `StatTile`       | dashboard-cards / rooms tiles / night-audit  | `label`, `value`, `hint?`, `tone?: StatusTone`, `href?`                   |
| `EmptyState`     | 6+ ad-hoc empty states                       | `icon`, `title`, `description?`, `action?`                                |
| `DataTable`      | 6+ hand-rolled tables                        | `columns`, `rows`, `density?`, `stickyHeader?`, `emptyState?`, `caption`  |
| `Toolbar`        | ad-hoc search/filter rows                    | `search?`, `filters?`, `actions?`                                         |
| `StatusBadge`    | 8 domain badge internals                     | `tone: StatusTone`, `label`, `size?: 'sm' \| 'md'`                        |
| `SectionHeading` | repeated `text-sm uppercase` section labels  | `title`, `actions?`                                                       |

`DataTable` requirements (from research): semantic `<table>` with `<caption class="sr-only">`, `<th scope="col">`, sticky header, first column is the anchor (stronger weight/color), actions column always visible (never hover-only), keyboard-reachable row actions, density prop mapped to `--table-row-h-*`.

`LoadingSpinner` already exists — the job is adoption (13 inline copies), not a rewrite.

---

## 9. Work packages

Each package is independently reviewable. **File ownership is disjoint per wave** so packages in the same wave can run in parallel without conflicts.

### Wave 0 — Foundation (blocking; must land first)

**W1 — Tokens & scales**
Owner files: `apps/web/src/app/globals.css`, new `apps/web/src/lib/design/status-tone.ts` (+ test).

- Add primitives (§4.1), re-point semantics (§4.2), add component tokens (§4.3).
- Declare `--text-2xs` … `--text-3xl` with line-heights, `--shadow-panel`, `--shadow-overlay` in `@theme`.
- Expose status tints as `--color-status-*-tint|ink|line` so utilities exist.
- Delete dead tokens: `chart-1..5`, `sidebar-*`, `--radius-2xl/3xl/4xl`, `.surface-panel`.
- Keep `.dark` block re-pointed but unshipped.

AC: `pnpm --filter web build` passes; no visual regression on Shift Ops home; `rg 'chart-[1-5]|sidebar-primary'` returns nothing in `apps/web/src`.

### Wave 1 — Primitives & patterns (parallel; disjoint dirs)

**W2 — UI primitives** — owns `apps/web/src/components/ui/**` only.

- `button`: default height → `--field-h` (44px); `sm` stays 36px; add `tone` support for destructive/secondary via semantics; radius `rounded-lg`.
- `input` / `textarea` / `select`: height `--field-h`, radius `rounded-md`, one shared focus ring (`focus-visible:ring-2 ring-ring ring-offset-2`).
- `card`: padding via `--panel-pad`, `--shadow-panel`, `rounded-xl`.
- `dialog`: `--shadow-overlay`, `rounded-xl`, consistent header/footer spacing.
- `badge`: rebuilt on `StatusTone`; `focus:` → `focus-visible:`.
- `dropdown-menu` / `select` content: `--shadow-overlay`, item radius `rounded-lg`.
- Update the co-located tests in the same directory.

AC: `pnpm --filter web test -- src/components/ui` green; no raw palette utility left in `components/ui/**`.

**W3 — Shared layout components** — owns `apps/web/src/components/shared/**` (new files + `detail-page-header.tsx`).

- Build `PageHeader`, `Panel`, `StatTile`, `EmptyState`, `SectionHeading`, `Toolbar`, `DataTable` per §8, each with tests.
- Re-implement `DetailPageHeader` as a thin wrapper over `PageHeader` (keep its export so detail pages keep compiling).
- No page edits in this package.

AC: every new component has a test asserting role-based queries (`getByRole('table')`, `getByRole('heading')`), density prop changes row height class, `DataTable` renders `caption` + `th[scope=col]`.

**W4 — Status color system** — owns `apps/web/src/components/*-badge.tsx` + `folio-detail.tsx` + `shared/error-display.tsx`.

- Map each domain value to a `StatusTone`; render via `StatusBadge` from W3 (import allowed; do not edit W3 files).
- Remove every raw `red-*` / `emerald-*` / `amber-*` / `slate-*` utility in owned files.
- Update the badge tests to assert tone classes instead of raw palette classes.

AC: `rg 'emerald-|amber-|red-[0-9]|slate-[0-9]' apps/web/src/components` returns nothing in owned files.

### Wave 2 — Adoption (after Wave 1)

**W5a — FO core pages** — `guests/**`, `reservations/**`, `rooms/**`, `room-types/**`, `properties/**`.
**W5b — Finance & ops pages** — `billing/**`, `reports/**`, `ar-accounts/**`, `tax-invoices/**`, `card-preauths/**`, `exchange-rates/**`, `shifts/**`, `night-audit/**`.
**W5c — Guest-service pages** — `messages/**`, `feedback/**`, `complaints/**`, `lost-found/**`, `tm30/**`, `wake-up-calls/**`, `digital-keys/**`, `housekeeping/**`, `rates/**`, `yield/**`, `blocks/**`, `partner-hotels/**`, `hardware-bridge/**`, `settings/**`.

Each adoption package must, for its own routes only:

1. Replace the inline page header with `<PageHeader>`.
2. Replace ad-hoc panels with `<Panel>`, tiles with `<StatTile>`, empty states with `<EmptyState>`, tables with `<DataTable>`, search/filter rows with `<Toolbar>`.
3. Replace inline spinners with `LoadingSpinner`.
4. Normalize spacing/radius/type to §5–§7. Remove leftover raw palette utilities.
5. Update that route's tests; add i18n keys to **both** `en.json` and `th.json` if any new copy appears.

AC per package: `pnpm --filter web test -- <its routes>` green; `pnpm --filter web type-check` green; no raw palette utilities remain in owned routes.

### Wave 3 — Close-out (me)

**W6 —** Full-suite run, `build`, visual check of home + one list + one detail, docs update (`docs/guidelines/coding_standards.md` design-token section + this file's status), single PR to `main`.

---

## 10. Guardrails for every package

- Read `.cursorrules` and `docs/guidelines/coding_standards.md` before editing.
- **Do not run any git command.** Leave changes in the working tree; the coordinating agent commits.
- Stay strictly inside your package's owned files. If you believe you must edit a file another package owns, stop and report it instead.
- Never introduce a dependency.
- No `console.log` / `console.error` in app code.
- No hardcoded user-facing copy — i18n keys in `en.json` + `th.json`.
- Every touched file must keep `pnpm --filter web type-check` green.
- Components stay under 200 lines; files under 300.
- Prefer `getByRole` / `getByLabelText` in tests; avoid asserting on presentational classes unless the class _is_ the contract (e.g. density row height).

## 11. Acceptance criteria (v2 done)

- [ ] Three-tier tokens in place; no component references a Tier-1 primitive except brand blue/orange.
- [ ] `rg 'bg-white|border-slate-|text-slate-|bg-slate-'` → 0 hits outside `login` / guest-facing / print routes.
- [ ] `rg 'emerald-|amber-|red-[0-9]|green-[0-9]|purple-'` → 0 hits in `apps/web/src/components` and adopted routes.
- [ ] Exactly one page-header implementation; every adopted route uses it.
- [ ] Exactly one table implementation for list routes; sticky header + anchor column + density prop.
- [ ] No inline `animate-spin` spinner outside `LoadingSpinner`.
- [ ] No `text-[10px]`; `text-2xs` used instead.
- [ ] Interactive floor 44px holds without per-call-site `min-h-11` patches on buttons/fields.
- [ ] `pnpm --filter web test` and `pnpm type-check` green; `pnpm --filter web build` green.
- [ ] Lighthouse a11y unchanged or better on home, one list page, one detail page.

## 12. Out of scope for v2

- Dark-mode rollout (tokens remain dark-ready).
- Guest-facing (`portal`, `kiosk`, `mobile-check-in`), `login`, and print routes.
- Property Pulse / charts (no `chart-*` tokens are re-introduced until a charting decision exists).
- Persisted per-user density preference.
- Framer Motion (still requires an ADR).

## 13. References

- `docs/planning/shift-ops-ui-brief.md` — Shift Ops (v1) brief and phases A–D
- `docs/guidelines/coding_standards.md` — i18n + design-token rules
- Audit basis: read-only scan of `apps/web/src` (2026-08-27)
- Research: three-tier token architecture (Material 3 / Carbon / SLDS lineage), Tailwind 4 `@theme` token namespaces, enterprise data-table density & accessibility patterns
