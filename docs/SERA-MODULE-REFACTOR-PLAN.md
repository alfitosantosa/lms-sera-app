# SERA App Module Refactor Plan

**Date:** 2026-09-14  
**Based on:** SERA-MODULE-AUDIT.md  
**Approach:** Incremental, backwards-compatible, critical-bugs-first

---

## Phase 3 — Foundation Cleanup (Critical Bug Fixes)

### 3.1 Fix `getRoleMenuKey` (CRITICAL)

**File:** `components/appSidebar.tsx:97-109`  
**Problem:** All `.includes()` checks use capitalized strings against an already-lowercased value. Function always returns `"student"`. Teacher case returns `"Lecturer"` instead of `"teacher"`.  
**Fix:** Lowercase all comparison strings; change `"Lecturer"` to `"teacher"`.  
**Risk:** Low - this is a pure bug fix that will RESTORE intended behavior.

### 3.2 Fix `useGetPaymentByStudentId` duplicate

**Files:** `hooks/Payments/usePayment.ts`, `hooks/Payments/usePaymentItems.ts`  
**Problem:** Same function name, different query keys.  
**Fix:** Remove duplicate from `usePaymentItems.ts`, ensure all consumers import from `usePayment.ts`. Standardize query key.

### 3.3 Remove broken `useGetUserByIdTeacher`

**File:** `hooks/Users/useGetUserByIdTeacher.ts`  
**Problem:** Calls non-existent `/api/users/id/${id}`.  
**Fix:** Check if any page imports it. If used, redirect to call `/api/userdata/id/${id}` instead. If not used, remove.

### 3.4 Remove duplicate `useGetUserById` in `useUserById.ts`

**File:** `hooks/Users/useUserById.ts`  
**Problem:** Identical to export in `useUsers.ts`.  
**Fix:** Check imports, redirect to `useUsers.ts`, remove file.

### 3.5 Fix `useRolesByIdUser` query key

**File:** `hooks/Roles/useRolesByIdUser.ts`  
**Problem:** Uses `["class", id]` instead of `["roles", id]`.  
**Fix:** Change to `["roles", "user", id]`.

### 3.6 Fix `useDeletePaymentType` invalidation

**File:** `hooks/Payments/usePaymentType.ts`  
**Problem:** Invalidates `["paymentType"]` (singular) instead of `["paymentTypes"]` (plural).  
**Fix:** Change to `["paymentTypes"]`.

### 3.7 Fix teacher hooks to use `useMutation`

**File:** `hooks/Users/useTeachers.ts`  
**Problem:** CRUD functions are plain async functions, not `useMutation`.  
**Fix:** Convert to proper `useMutation` hooks with cache invalidation.

### 3.8 Fix `calender` to `calendar`

**Folder:** `app/(frontend)/(dashboard)/dashboard/calender/`  
**Problem:** Misspelling baked into URLs.  
**Fix:** Rename folder, update all sidebar references and internal links.

### 3.9 Fix trailing space in `input ` folder

**Folder:** `app/(frontend)/(dashboard)/dashboard/attendance/teacher/input /`  
**Fix:** Rename to `input` (no trailing space).

### 3.10 Fix `month.json`

**File:** `repository/month.json`  
**Fix:** Add "februari" to the month list.

### 3.11 Fix `accountbank/route.ts` capitalization bug

**File:** `app/(backend)/api/accountbank/route.ts`  
**Problem:** Uses `Request` (global constructor) instead of `request` (parameter) on PUT/DELETE handlers.  
**Fix:** Change to lowercase `request`.

---

## Phase 4 — Hook & API Consistency Improvements

### 4.1 File naming fixes (misspellings)

- `useAttendaceByIdStudent.ts` -> `useAttendanceByIdStudent.ts`
- `useAttendanceByIdShcedule.ts` -> `useAttendanceByIdSchedule.ts`

### 4.2 Query key standardization

Establish pattern: `[domain, ...identifiers]`

- `["users", id]` for user queries
- `["students", id]` for student queries
- `["roles", "user", id]` for role-by-user
- `["payments", majorId]` for payments by major
- etc.

### 4.3 Consolidate duplicate attendance API

- Verify `/api/attendance/class` vs `/api/attendance/class/bulk` are truly identical
- Remove one if confirmed

### 4.4 Consolidate teacher attendance delete

- Keep `/api/teacherattendance` DELETE
- Deprecate `/api/teacherattendance/[id]/delete`

---

## Phase 5 — Sidebar & Navigation Alignment

### 5.1 Verify sidebar matches handwritten structure

After fixing `getRoleMenuKey`, verify each role sees appropriate menus:

**Admin sidebar** - Already well-organized. Minor adjustments:

- Rename "Branch" to "Branch / Jurusan" for clarity (it currently says "Branch" for `/dashboard/admin/master/majors`)

**Treasurer sidebar** - Already well-organized. May need:

- Add password/security management if it exists

**Teacher sidebar** - Needs review:

- Currently missing direct "Schedule Attendance" item
- "Absensi Kepala Sekolah" (Head of School Attendance) label is confusing for regular teachers

**Student sidebar** - Already well-organized per handwritten spec

**Parent sidebar** - Minimal but correct for current functionality

---

## Phase 6 — Security Improvements

### 6.1 Add auth to unprotected API routes

- `/api/midtrans` (POST) - should require tenant auth (creates payment transactions)
- `/api/midtrans/status` (GET) - should require tenant auth
- `/api/botwa/send` (POST) - should require tenant auth
- `/api/botwa/bulk/send` (GET, POST) - should require tenant auth
- `/api/tahfidzrecord/surah` (POST) - should require admin auth (seeds data)

### 6.2 Keep unprotected

- `/api/health` - health check is expected to be open
- `/health` - same
- `/api/tahfidzrecord/surah` (GET) - reading surah data is safe

---

## Implementation Order

1. **Phase 3.1** - Fix getRoleMenuKey (highest impact critical bug)
2. **Phase 3.2-3.7** - Fix hook bugs (data integrity)
3. **Phase 3.8-3.11** - Fix naming/data issues
4. **Phase 4** - Consistency improvements
5. **Phase 5** - Sidebar alignment
6. **Phase 6** - Security

---

## Files to Modify

| File                                     | Change                                    |
| ---------------------------------------- | ----------------------------------------- |
| `components/appSidebar.tsx`              | Fix getRoleMenuKey                        |
| `hooks/Payments/usePaymentItems.ts`      | Remove duplicate useGetPaymentByStudentId |
| `hooks/Users/useGetUserByIdTeacher.ts`   | Fix or remove                             |
| `hooks/Users/useUserById.ts`             | Remove after verifying imports            |
| `hooks/Roles/useRolesByIdUser.ts`        | Fix query key                             |
| `hooks/Payments/usePaymentType.ts`       | Fix invalidation key                      |
| `hooks/Users/useTeachers.ts`             | Convert to useMutation                    |
| `app/repository/menuGroupsSidebar.ts`    | Update calender -> calendar URLs          |
| `repository/month.json`                  | Add februari                              |
| `app/(backend)/api/accountbank/route.ts` | Fix Request -> request                    |

## Folders to Rename

| From                                   | To                                    |
| -------------------------------------- | ------------------------------------- |
| `dashboard/calender/`                  | `dashboard/calendar/`                 |
| `dashboard/attendance/teacher/input /` | `dashboard/attendance/teacher/input/` |

## Files to Delete (after import verification)

| File                                   | Reason                          |
| -------------------------------------- | ------------------------------- |
| `hooks/Users/useUserById.ts`           | Exact duplicate                 |
| `hooks/Users/useGetUserByIdTeacher.ts` | Broken (calls non-existent API) |
