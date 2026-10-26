# Module restructure + entitlement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Tidy the repo into the target folder tree and make optional modules (`keuangan`, `absensi`, `pelanggaran`, `pembelajaran`, `tahfidz`) per-foundation selectable, enforced in sidebar, routes, and APIs.

**Architecture:** Phase 0 is a mechanical move of `app/(backend)`, `app/(frontend)`, `app/(hooks)`, `app/(types)`, plus `lib/*` service groups, with one ordered alias rewrite. Phase 1 adds a single registry (`config/modules.ts`) consulted by the menu filter, a client `ModuleGuard`, and a server `assertModuleAccess`, plus `Foundation.modules` and the create/edit UI.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 7, TanStack Query, Bun, Better Auth 1.7.

**Spec:** `docs/superpowers/specs/2026-10-24-foundation-modules-lms-restructure-design.md` (sections 5, 6, 9, 10)

## Global Constraints

- URL paths MUST NOT change. Route-group moves are URL-neutral.
- UI copy is Bahasa Indonesia; code identifiers are English.
- Prisma client imports stay `@/prisma/generated/client`.
- `bunx tsc --noEmit` and `bun run build` must pass after each phase.
- `Foundation.modules` default: all five optional modules.
- Longest-prefix module matching; core prefixes are never mapped.
- No new dependencies.

---

## Phase 0 — restructure

### Task 0.1: Move the tree

**Files:** all of `app/(backend)/api`, `app/(frontend)/*`, `app/(hooks)/hooks`, `app/(types)`, `app/(action)/createPDF/*`, `app/repository`, `app/(context)`, `app/client`, `app/(health)`, `lib/api`, `lib/errorHandler`, `lib/betterauth`, `lib/WhatsappGateway`, `lib/rabbitMQ`, `lib/exam`, `lib/development`, `lib/shadCN`.

- [ ] `git mv` every mapping from spec §6.2; `git rm` the two dead files and remove empty route groups.
- [ ] Confirm counts: `route.ts` 141, `page.tsx` 90 before and after.

### Task 0.2: Rewrite imports

- [ ] Apply the ordered replacement table from spec §6.3 across `*.ts/*.tsx/*.css`.
- [ ] Fix relative imports by `tsc` errors.
- [ ] Update `package.json` `worker`, `Dockerfile` CMD/comment, `AGENTS.md`, `README.md`, `lib/tours/tour.check.ts` paths.

### Task 0.3: Verify Phase 0

- [ ] `bunx tsc --noEmit`
- [ ] `bun run build`
- [ ] `bun run lib/tours/tour.check.ts`, `bun run lib/rabbitMQ/retry.check.ts`
- [ ] Commit.

---

## Phase 1 — module entitlement

### Task 1.1: Registry + self-check

**Files:** Create `config/modules.ts`, `config/modules.check.ts`.

- [ ] `ModuleKey`, `ALL_MODULES`, `MODULES` (label, description, pagePrefixes, apiPrefixes).
- [ ] `moduleForPath`, `moduleForApiPath` — longest prefix wins, core returns `null`.
- [ ] `config/modules.check.ts` asserts every prefix maps to exactly one module, longest-first, and `ALL_MODULES` matches the Prisma default list.

### Task 1.2: Schema + API accept modules

**Files:** `prisma/schema.prisma`, `prisma/migrations/*`, `app/api/foundation/route.ts`, `app/api/foundation/[id]/route.ts`.

- [ ] `Foundation.modules String[] @default(["keuangan","absensi","pelanggaran","pembelajaran","tahfidz"])`.
- [ ] Migration + `npx prisma generate`.
- [ ] POST: omitted → `ALL_MODULES`; explicit `[]` → core only; unknown key → 400.
- [ ] PUT: replace when present; foundation admin only.

### Task 1.3: Menu + sidebar + dead URLs

**Files:** `components/layout/appSidebar.tsx`, `config/menuGroupsSidebar.ts`, `components/navbar.tsx`, `lib/tours/tours.ts`.

- [ ] `filterMenuByModules(items, enabled)` uses `moduleForPath(item.url)`.
- [ ] Replace dead `/dashboard/attendance`, `/dashboard/recapattendance(+ /class)` with `admin/...`.
- [ ] Re-run `tour.check.ts`.

### Task 1.4: Route guard + core dashboard

**Files:** `components/layout/ModuleGuard.tsx`, `components/layout/ConditionalLayout.tsx`, dashboard page split.

- [ ] Guard replaces to `/dashboard` + toast when the current path's module is disabled.
- [ ] Dashboard renders attendance only when `absensi` enabled; otherwise core summary.

### Task 1.5: API enforcement

**Files:** `services/tenant.ts`, `services/exam/exam.guard.ts`, `services/development/development.guard.ts`, module route handlers.

- [ ] Resolvers return `modules`; `assertModuleAccess` throws 403 with Indonesian message.
- [ ] Apply to module-owned routes only; core untouched.

### Task 1.6: UI — module picker

**Files:** `components/foundation/ModulePicker.tsx`, register foundation page, `components/dialog/DialogEditFoundation.tsx`, foundation hooks.

- [ ] Checkbox cards, core shown read-only. Default all selected.
- [ ] Edit dialog resets on open via `useEffect`.
- [ ] Invalidate `["foundation"]`, `["users"]`, `["users-profile"]` after save.

### Task 1.7: Verify Phase 1

- [ ] `bunx tsc --noEmit`, `bun run build`, all check scripts.
- [ ] Smoke: create core-only foundation → sidebar/API gated; enable `keuangan` → restored.
