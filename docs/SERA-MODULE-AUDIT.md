# SERA App Module Audit

**Date:** 2026-09-14  
**Scope:** Complete codebase audit of lms-sera-app (v0.4.0)  
**Stack:** Next.js 16 App Router, React 19, Better Auth, Prisma 7, PostgreSQL, TanStack Query, Midtrans

---

## A. Current Module Inventory

### Database Models (27 total)

| Model | Table | Domain |
|---|---|---|
| Foundation | `foundation` | Core / Tenant |
| User | `user` | Authentication |
| Session | `session` | Authentication |
| Account | `account` | Authentication |
| Verification | `verification` | Authentication |
| UserData | `user_data` | Core / Users |
| Role | `roles` | Authorization |
| AcademicYear | `academic_years` | Academic |
| Major | `majors` | Academic (Branch) |
| Class | `classes` | Academic |
| Subject | `subjects` | Academic |
| Schedule | `schedules` | Academic |
| Attendance | `attendances` | Attendance |
| TeacherAttendance | `teacher_attendances` | Attendance |
| ViolationType | `violation_types` | Discipline |
| Violation | `violations` | Discipline |
| PaymentType | `payment_types` | Finance |
| PaymentItems | `payment_items` | Finance |
| Payment | `payments` | Finance |
| PaymentTransaction | `payment_transactions` | Finance |
| AccountBank | `account_bank` | Finance |
| TahfidzGroup | `tahfidz_groups` | Tahfidz |
| TahfidzRecord | `tahfidz_records` | Tahfidz |
| SurahQuran | `surah_quran` | Tahfidz |
| CalendarEvent | `calendar_events` | Calendar |
| GradeType | `grade_types` | Grading |
| GradeConfiguration | `grade_configurations` | Grading |
| Grade | `grades` | Grading |
| GradeScale | `grade_scales` | Grading |
| ReportCard | `report_cards` | Grading |
| Assignment | `assignments` | Grading |
| AssignmentSubmission | `assignment_submissions` | Grading |
| Notification | `notifications` | Communication |
| DashboardContent | `dashboard_contents` | Dashboard |
| Announcement | `announcements` | Communication |

### Business Domains

1. **Core/Tenant**: Foundation, multi-tenant isolation
2. **Authentication**: Better Auth (User, Session, Account, Verification)
3. **Authorization**: Role-based access (Role model with permissions array)
4. **Academic**: AcademicYear, Major (=Branch), Class, Subject, Schedule
5. **Finance**: PaymentType, PaymentItems, Payment, PaymentTransaction, AccountBank
6. **Attendance**: Student Attendance, Teacher Attendance
7. **Discipline**: ViolationType, Violation
8. **Tahfidz**: TahfidzGroup, TahfidzRecord, SurahQuran
9. **Calendar**: CalendarEvent (special schedules)
10. **Grading**: GradeType, GradeConfiguration, Grade, GradeScale, ReportCard, Assignment, AssignmentSubmission (models exist but limited API/UI)
11. **Communication**: Notification, Announcement, WhatsApp bot

---

## B. Current Route Inventory (Frontend)

### Dashboard Pages (63 total)

| Route | Role | Description |
|---|---|---|
| `/dashboard` | All | Main dashboard |
| `/dashboard/profile` | All | User profile |
| `/dashboard/foundation` | Admin | Foundation management |
| `/dashboard/majors` | Admin | Majors listing |
| `/dashboard/payments` | Shared | Payments listing |
| `/dashboard/reports` | Shared | Reports |
| `/dashboard/admin/master/users` | Admin | Master - Users |
| `/dashboard/admin/master/roles` | Admin | Master - Roles |
| `/dashboard/admin/master/majors` | Admin | Master - Majors |
| `/dashboard/admin/master/classes` | Admin | Master - Classes |
| `/dashboard/admin/master/classes/tahfidz` | Admin | Master - Tahfidz Groups |
| `/dashboard/admin/master/subjects` | Admin | Master - Subjects |
| `/dashboard/admin/master/academicyear` | Admin | Master - Academic Year |
| `/dashboard/admin/master/betterauth` | Admin | Master - Auth Users |
| `/dashboard/admin/academic/schedules` | Admin | Schedules |
| `/dashboard/admin/academic/specialschedule` | Admin | Special Schedule (Calendar Events) |
| `/dashboard/admin/academic/tahfidzrecord` | Admin | Tahfidz Records |
| `/dashboard/admin/finance/billing` | Admin | Billing |
| `/dashboard/admin/finance/billing/chart` | Admin | Billing Dashboard |
| `/dashboard/admin/finance/payments` | Admin | Payments |
| `/dashboard/admin/finance/payments/chart` | Admin | Payments Dashboard |
| `/dashboard/admin/finance/paymenttypes` | Admin | Payment Types |
| `/dashboard/admin/finance/accountbank` | Admin | Account Bank |
| `/dashboard/admin/finance/accountbank/chart` | Admin | Account Bank Dashboard |
| `/dashboard/admin/finance/studentinformation` | Admin | Student Payment Info |
| `/dashboard/admin/discipline/typeviolations` | Admin | Violation Types |
| `/dashboard/admin/attendance` | Admin | Admin Attendance Backup |
| `/dashboard/admin/utility/upload/users` | Admin | Bulk Upload Users |
| `/dashboard/admin/utility/upload/schedules` | Admin | Bulk Upload Schedules |
| `/dashboard/admin/utility/botwa` | Admin | WhatsApp Bot |
| `/dashboard/teacher/schedule` | Teacher | My Schedule |
| `/dashboard/teacher/schedule/[id]` | Teacher | Schedule Detail |
| `/dashboard/teacher/attendance/[id]` | Teacher | Attendance Input |
| `/dashboard/teacher/attendance/tahfidz/[id]` | Teacher | Tahfidz Attendance |
| `/dashboard/teacher/tahfidzrecord/[idTahfidzGroup]` | Teacher | Tahfidz Records |
| `/dashboard/student/schedule` | Student | Student Schedule |
| `/dashboard/student/attendance` | Student | Student Attendance |
| `/dashboard/student/payment` | Student | Student Payment |
| `/dashboard/student/tahfidzrecord` | Student | Student Tahfidz Records |
| `/dashboard/parent` | Parent | Parent Portal |
| `/dashboard/treasurer/billing` | Treasurer | Billing |
| `/dashboard/treasurer/billing/upload` | Treasurer | Billing Upload |
| `/dashboard/treasurer/payment` | Treasurer | Payments |
| `/dashboard/treasurer/paymenttype` | Treasurer | Payment Types |
| `/dashboard/treasurer/studentinformation` | Treasurer | Student Info |
| `/dashboard/treasurer/class` | Treasurer | Classes |
| `/dashboard/treasurer/users` | Treasurer | Users |
| `/dashboard/treasurer/users/upload` | Treasurer | Users Upload |
| `/dashboard/attendance` | Shared | Attendance |
| `/dashboard/attendance/teacher` | Teacher | Teacher Attendance |
| `/dashboard/attendance/teacher/input ` | Teacher | Teacher Attendance Input (trailing space!) |
| `/dashboard/recapattendance` | Shared | Attendance Recap |
| `/dashboard/recapattendance/class` | Shared | Attendance Recap by Class |
| `/dashboard/violations` | Shared | Violations |
| `/dashboard/violations/teacher` | Teacher | Teacher Violations View |
| `/dashboard/violations/student` | Student | Student Violations View |
| `/dashboard/calender` | Shared | Calendar (MISSPELLED) |
| `/dashboard/calender/teacher` | Teacher | Teacher Calendar |
| `/dashboard/calender/student` | Student | Student Calendar |
| `/dashboard/calender/list/teacher` | Teacher | Teacher Calendar List |
| `/dashboard/calender/list/student` | Student | Student Calendar List |
| `/dashboard/middleware` | Internal | Middleware test page |
| `/dashboard/test/date` | Internal | Date test sandbox |

### Auth Pages
- `/auth/sign-in`
- `/auth/sign-up`

### Landing Pages
- `/landing`
- `/landing/register/foundation`

---

## C. Current API Inventory (88 route files)

### Authentication & Foundation
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/auth/[...all]` | GET, POST | Better Auth handler |
| `/api/foundation` | GET, POST, PUT, DELETE | Session + tenant |
| `/api/foundation/assign` | POST | Session only |

### Admin
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/admin/set-role` | POST | Admin role check |
| `/api/betterauth/admin` | POST | Admin role check |
| `/api/betterauth/users` | GET | Tenant |
| `/api/betterauth/users/withoutuserdata` | GET | Tenant |

### Academic
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/academicyear` | GET, POST, PUT, DELETE | Tenant |
| `/api/major` | GET, POST, PUT, DELETE | Tenant |
| `/api/major/[id]` | GET | Tenant |
| `/api/class` | GET, POST, PUT, DELETE | Tenant |
| `/api/class/[id]` | GET | Tenant |
| `/api/class/major/[id]` | GET | Tenant |
| `/api/class/user/[id]` | GET | Tenant |
| `/api/subjects` | GET, POST, PUT, DELETE | Tenant |
| `/api/roles` | GET, POST, PUT, DELETE | Tenant |
| `/api/roles/user/id/[id]` | GET | Tenant |

### Users
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/userdata` | GET, POST, PUT, DELETE | Tenant |
| `/api/userdata/id/[id]` | GET | Tenant |
| `/api/userdata/betterauth/id/[id]` | GET | Tenant |
| `/api/userdata/bulk/create` | POST | Tenant |
| `/api/userdata/bulk/delete` | POST | Tenant |
| `/api/students` | GET, POST, PUT, DELETE | Tenant |
| `/api/students/[id]` | GET | Tenant |
| `/api/students/by-ids` | GET | Tenant |
| `/api/students/by-ids/attendance` | GET | Tenant |
| `/api/students/by-ids/violations` | GET | Tenant |
| `/api/students/major/[id]` | GET | Tenant |
| `/api/students/major/[id]/active` | GET | Tenant |
| `/api/students/tahfidzgroup/[id]` | GET | Tenant |
| `/api/teachers` | GET, POST, PUT, DELETE | Tenant |

### Schedules
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/schedules` | GET, POST, PUT, DELETE | Tenant |
| `/api/schedules/[id]` | GET | Tenant |
| `/api/schedules/active` | GET | Tenant |
| `/api/schedules/active/teacher/[id]` | GET | Tenant |
| `/api/schedules/bulk/create` | POST | Tenant |
| `/api/schedules/class/[id]` | GET | Tenant |
| `/api/schedules/student/[id]` | GET, POST, PUT, DELETE | Tenant |
| `/api/schedules/tahfidzgroup/[id]` | GET | Tenant |
| `/api/schedules/teacher/[id]` | GET | Tenant |
| `/api/specialschedule` | GET, POST, PUT, DELETE | Tenant |

### Attendance
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/attendance` | GET, POST, PUT, DELETE | Tenant |
| `/api/attendance/bulk` | POST, PUT | Tenant |
| `/api/attendance/class` | GET | Tenant |
| `/api/attendance/class/bulk` | GET | Tenant |
| `/api/attendance/filterdate` | GET | Tenant |
| `/api/attendance/issubmited` | GET | Tenant |
| `/api/attendance/schedule/[id]` | GET | Tenant |
| `/api/attendance/student/[id]` | GET | Tenant |
| `/api/teacherattendance` | GET, POST, PUT, DELETE | Tenant |
| `/api/teacherattendance/[id]/delete` | DELETE | Tenant |
| `/api/teacherattendance/bulk` | POST | Tenant |
| `/api/teacherattendance/reports` | GET | Tenant |

### Finance
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/paymenttype` | GET, POST, PUT, DELETE | Tenant |
| `/api/paymenttype/major/[id]` | GET | Tenant |
| `/api/accountbank` | GET, POST, PUT, DELETE | Tenant |
| `/api/accountbank/chart` | GET | Tenant |
| `/api/accountbank/major/[majorId]` | GET | Tenant |
| `/api/payment` | POST, PUT, DELETE | Tenant |
| `/api/payment/chart` | GET | Tenant |
| `/api/payment/filterdate` | GET | Tenant |
| `/api/payment/generate/receiptnumber` | POST | Tenant |
| `/api/payment/major/[majorId]` | GET | Tenant |
| `/api/payment/student/[studentId]` | GET | Tenant |
| `/api/payment/student/bulk` | POST | Tenant |
| `/api/payment/success` | POST | Tenant |
| `/api/payment/transaction` | GET, POST | Tenant |
| `/api/payment/items` | GET, POST, PUT, DELETE | Tenant |
| `/api/payment/items/bulk/upload` | GET, POST | Tenant |
| `/api/payment/items/chart` | GET | Tenant |
| `/api/payment/items/filterdate` | GET | Tenant |
| `/api/payment/items/major/[majorId]` | GET | Tenant |
| `/api/payment/items/setpaid` | POST | Tenant |
| `/api/payment/items/student/[id]` | GET | Tenant |
| `/api/payment/items/student/bulk` | POST | Tenant |
| `/api/payment/items/unpaid/student/[studentId]` | GET | Tenant |
| `/api/midtrans` | POST | **NONE** |
| `/api/midtrans/status` | GET | **NONE** |

### Violations
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/typeviolations` | GET, POST, PUT, DELETE | Tenant |
| `/api/violations` | GET, POST, PUT, DELETE | Tenant |
| `/api/violations/student/[id]` | GET | Tenant |
| `/api/violations/teacher/[id]` | GET | Tenant |

### Tahfidz
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/tahfidzgroup` | GET, POST, PUT, DELETE | Tenant |
| `/api/tahfidzgroup/id/[id]` | GET | Tenant |
| `/api/tahfidzrecord` | GET, POST, PUT, DELETE | Tenant |
| `/api/tahfidzrecord/[studentId]` | GET | Tenant |
| `/api/tahfidzrecord/surah` | GET, POST | **NONE** |
| `/api/tahfidzrecord/teacher/[idTeacher]` | GET | Tenant |

### Communication
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/botwa/send` | POST | **NONE** |
| `/api/botwa/bulk/send` | GET, POST | **NONE** |

### Health
| Endpoint | Methods | Auth |
|---|---|---|
| `/api/health` | GET | **NONE** |
| `/health` | GET | **NONE** |

---

## D. Current Hook Inventory

### Hooks by Domain (51 files, ~120 exported functions)

See detailed hook listing in discovery notes. Key domains:
- AccountBank (2 files)
- AcademicYears (1 file)
- Attendances (6 files)
- BotWA (1 file)
- Classes (3 files)
- Foundation (1 file)
- Majors (1 file)
- Midtrans (1 file)
- Payments (6 files)
- Roles (2 files)
- Schedules (4 files)
- SpecialSchedules (1 file)
- Subjects (1 file)
- TahfidzGroup (2 files)
- TahfidzRecord (2 files)
- TeacherAttendance (1 file)
- Users (8 files)
- Violations (4 files)

---

## E. Current Type Inventory (22 files)

| File | Types |
|---|---|
| `academicyear-types.ts` | AcademicYearDataTypes, AcademicYearInputData, AcademicYearUpdateData |
| `accountbank-types.ts` | AccountBankTypes, AccountBankInput |
| `attendance-types.ts` | attendanceTypes, attendanceClassResponseTypes (excluded from barrel) |
| `auth-types.ts` | Auth-related types |
| `betterauth-types.ts` | betterauthUser |
| `class-types.ts` | ClassDataTypes |
| `error-types.ts` | Error response types |
| `foundation-types.ts` | foundationTypes, FoundationWithCounts, etc. |
| `majors-types.ts` | majorTypes, MajorFormValues |
| `payment-items-types.ts` | PaymentItemData, PaymentItemsInput, PaymentItemsTypes, SetPaidInput |
| `payment-types.ts` | PaymentData, PaymentInput |
| `paymenttype-types.ts` | PaymentTypeTypes, PaymentTypeInput |
| `prisma-types.ts` | Prisma utility types |
| `roles-types.ts` | RoleDataTypes, RolesInputData, RoleUpdateData |
| `schedule-types.ts` | ScheduleTypes, ScheduleInput |
| `subject-types.ts` | SubjectTypes, SubjectInput |
| `tahfidzgroup-types.ts` | tahfidzGroupTypes, TahfidzGroupData, etc. |
| `tahfidzrecord-types.ts` | Tahfidz record types |
| `teacher-attendance-types.ts` | TeacherAttendanceRecord, etc. |
| `userData-types.ts` | UserDataTypes, userDataMajorTypes |
| `violation-types.ts` | ViolationTypes, ViolationInput, ViolationTypeTypes |
| `index.ts` | Barrel re-export (excludes attendance-types) |

---

## F. Database Relationship Overview

### Academic Hierarchy

```
Foundation (tenant root)
├── AcademicYear (many) ──┐
├── Major (many) ─────────┤  ← "Major" serves as "Branch" in the handwritten notes
│   ├── Class (many) ──────── requires both majorId + academicYearId
│   ├── Subject (many)
│   ├── PaymentType (many)
│   ├── AccountBank (many)
│   └── Payment (many)
├── Role (many)
├── User (many)
│   └── UserData (0..1)
│       ├── → Foundation (optional)
│       ├── → AcademicYear (optional)
│       ├── → Major (optional)
│       ├── → Class (optional)
│       ├── → Role (optional)
│       └── → TahfidzGroup (optional)
├── CalendarEvent (many)
├── Announcement (many)
└── DashboardContent (many)
```

**Important:** There is NO separate `Branch` model. The `Major` model serves as "Branch" in the handwritten module structure. Each Major has `address`, `phone`, `adminName`, `signatureUrl` fields supporting branch-like identity.

### Finance Flow

```
PaymentType (billing template per Major)
  └── PaymentItems (individual billing line items per student)
       └── Payment (receipt grouping paid items)
            ├── PaymentTransaction (1:1 Midtrans record)
            └── AccountBank (destination account)
```

### Attendance

- `Attendance`: Per student, per schedule, per date (unique constraint)
- `TeacherAttendance`: Per teacher, per date with check-in/check-out

---

## G. Role and Permission Overview

### Authentication
- Better Auth manages User identity (email/password, Google OAuth)
- `admin` plugin provides role management with custom roles: admin, teacher, student, parent, user

### Authorization Layers
1. **Session-based**: `resolveFoundation()` in `lib/tenant.ts` extracts foundationId from session
2. **Tenant isolation**: All API routes verify data belongs to caller's foundation
3. **Admin-only routes**: `/api/admin/set-role`, `/api/betterauth/admin` check `role === "admin"`
4. **No middleware**: There is NO Next.js middleware - all auth is in individual route handlers

### Permission System
- `Role` model has `permissions: String[]` field
- Sidebar uses permissions to filter menu items
- **CRITICAL BUG**: The `getRoleMenuKey` function is broken (see Section H)

---

## H. Duplicate / Overlapping Functionality

### CRITICAL: Broken `getRoleMenuKey` in Sidebar

**File:** `components/appSidebar.tsx:97-109`

The function lowercases the role string but then compares against capitalized strings. **All comparisons always fail, making every user see the student menu.**

Additionally, the teacher case returns `"Lecturer"` instead of `"teacher"`, which doesn't match any key in `menuGroups`.

### Duplicate Hook Exports

| Function | File 1 | File 2 | Impact |
|---|---|---|---|
| `useGetUserById` | `useUsers.ts` | `useUserById.ts` | Identical - dead code |
| `useGetPaymentByStudentId` | `usePayment.ts` | `usePaymentItems.ts` | **Different query keys** - cache inconsistency |

### Broken Hook

| Hook | File | Issue |
|---|---|---|
| `useGetUserByIdTeacher` | `useGetUserByIdTeacher.ts` | Calls `/api/users/id/${id}` which does NOT exist. Always 404. |

### Duplicate/Redundant API Routes

| Route 1 | Route 2 | Issue |
|---|---|---|
| `/api/attendance/class` | `/api/attendance/class/bulk` | Appear to be functionally identical |
| `/api/teacherattendance` DELETE | `/api/teacherattendance/[id]/delete` DELETE | Two delete endpoints |
| `/api/admin/set-role` | `/api/betterauth/admin` | Both set user roles |

### Teacher CRUD Not Using Mutations

In `hooks/Users/useTeachers.ts`, `useCreateTeacher`, `useUpdateTeacher`, and `useDeleteTeacher` are plain async functions, NOT `useMutation` hooks. They don't invalidate cache.

---

## I. Naming Inconsistencies

### URL/Route Inconsistencies

| Current | Standard | Type |
|---|---|---|
| `calender` | `calendar` | Misspelling in folder/URL |
| `issubmited` | `is-submitted` | Misspelling + no kebab-case |
| `filterdate` | `filter-date` | No kebab-case |
| `academicyear` | `academic-year` | No kebab-case |
| `accountbank` | `account-bank` | No kebab-case |
| `paymenttype` | `payment-type` | No kebab-case |
| `specialschedule` | `special-schedule` | No kebab-case |
| `teacherattendance` | `teacher-attendance` | No kebab-case |
| `tahfidzgroup` | `tahfidz-group` | No kebab-case |
| `tahfidzrecord` | `tahfidz-record` | No kebab-case |
| `typeviolations` | `violation-types` | Wrong word order |
| `recapattendance` | `attendance-recap` | No kebab-case |
| `botwa` | `bot-wa` | No kebab-case |
| `betterauth` | (internal) | Exposes auth implementation detail |
| `studentinformation` | `student-information` | No kebab-case |

### File/Function Naming

| Current | Standard | Type |
|---|---|---|
| `useAttendaceByIdStudent.ts` | `useAttendanceByIdStudent.ts` | Misspelling |
| `useAttendanceByIdShcedule.ts` | `useAttendanceByIdSchedule.ts` | Misspelling |
| `useGetUserByIdTeacher.ts` | (broken - needs removal/fix) | Calls non-existent API |
| `useScheduleByIdClass.ts` | `useSchedulesByClassId.ts` | Inconsistent naming |
| `attendance/teacher/input /` | `attendance/teacher/input/` | Trailing space in folder |

### Query Key Inconsistencies

| Hook | Query Key | Expected |
|---|---|---|
| `useRolesByIdUser` | `["class", id]` | `["roles", id]` |
| `useDeletePaymentType` | invalidates `["paymentType"]` | Should be `["paymentTypes"]` |

### Data Inconsistency

| File | Issue |
|---|---|
| `repository/month.json` | Missing "februari" from month list |

---

## J. Missing Functionality

### Missing from Handwritten Structure

1. **No middleware**: No Next.js middleware for route protection
2. **Treasurer "Password" feature**: No password/security management page for treasurer (handwritten notes mention it)
3. **Parent payment visibility**: Parent page exists but is minimal
4. **Student violations view**: Page exists at `/dashboard/violations/student` but may be incomplete

### Models Without Full UI

| Model | API | Frontend |
|---|---|---|
| Grade | No API routes | No pages |
| GradeType | No API routes | No pages |
| GradeConfiguration | No API routes | No pages |
| GradeScale | No API routes | No pages |
| ReportCard | No API routes | No pages |
| Assignment | No API routes | No pages |
| AssignmentSubmission | No API routes | No pages |
| Notification | No API routes | No pages |
| DashboardContent | No API routes | No pages |
| Announcement | No API routes | No pages |

### Missing API Features

1. No pagination on most list endpoints
2. No API-level role checking (only tenant isolation)
3. No rate limiting
4. No input validation (Zod) on most API routes

---

## K. Technical Debt

### Critical (Must Fix)

1. **`getRoleMenuKey` broken** - All users see student menu (appSidebar.tsx:97-109)
2. **`useGetUserByIdTeacher` calls non-existent `/api/users/id/`** - Always 404s
3. **Duplicate `useGetPaymentByStudentId` with different query keys** - Cache inconsistency
4. **7 API routes with NO authentication**: midtrans, botwa, tahfidzrecord/surah, health endpoints
5. **No Next.js middleware** - Route protection relies entirely on individual API handlers

### High Priority

6. **Teacher hooks not using `useMutation`** - No cache invalidation on teacher CRUD
7. **`useDeletePaymentType` invalidates wrong cache key** - `["paymentType"]` vs `["paymentTypes"]`
8. **`useRolesByIdUser` uses wrong query key** - `["class", id]` instead of `["roles", id]`
9. **`calender` misspelling** - Baked into URLs
10. **Trailing space in `input ` folder** - Filesystem/deployment risk
11. **Missing "februari" in month.json** - Data completeness
12. **`accountbank/route.ts` uses `Request` instead of `request`** on lines 39 and 63 (potential bug - uppercase R is the global constructor, not the parameter)

### Medium Priority

13. **Inconsistent API response format** - Some return `{success, data}`, others return raw data
14. **Inconsistent kebab-case** - Route naming not standardized
15. **No pagination** on most list endpoints
16. **No API-level role authorization** - Only tenant isolation
17. **Many models without API/UI** - Grading, Assignment, Notification, etc.
18. **No input validation** on most API routes
19. **N+1 query risk** in chart/analytics endpoints doing JS-level aggregation
20. **Cache strategy mismatches** - Some hooks don't set stale time consistently

### Low Priority

21. **Duplicate `useGetUserById`** in useUsers.ts and useUserById.ts
22. **Duplicate attendance/class routes** - `/api/attendance/class` and `/api/attendance/class/bulk`
23. **Two teacher attendance delete endpoints**
24. **`/dashboard/middleware` and `/dashboard/test/date` test pages** in production
25. **iconMap duplicated** between menuGroupsSidebar.ts and appSidebar.tsx

---

## L. Recommended Target Structure

### Conceptual Domain Mapping

```
SERA APP
│
├── Dashboard (main landing, role-specific widgets)
│
├── Academic
│   ├── Academic Year (master data)
│   ├── Branch / Major (master data)
│   ├── Classes (master data)
│   ├── Subjects (master data)
│   ├── Schedules
│   ├── Special Schedules / Calendar Events
│   └── Tahfidz
│       ├── Groups
│       └── Records
│
├── Finance
│   ├── Payment Types (billing templates)
│   ├── Billing (payment items / tagihan)
│   ├── Payments (transactions / pembayaran)
│   ├── Account Bank
│   └── Dashboards (charts/analytics)
│
├── Attendance
│   ├── Student Attendance
│   ├── Teacher Attendance
│   └── Attendance Recap
│
├── Violations
│   ├── Violation Types
│   └── Violations
│
├── Calendar
│
├── Users & Roles (master data)
│
├── Reports
│
├── Utilities
│   ├── Bulk Upload
│   └── WhatsApp Bot
│
└── Settings / Authentication
```

### Navigation by Role (Target)

**Admin:**
- Dashboard
- Master Data (Users, Roles, Auth, Academic Year, Branch, Classes, Subjects)
- Academic (Schedules, Calendar, Tahfidz)
- Finance (Payment Types, Billing, Payments, Account Bank, Dashboards)
- Attendance (Student, Teacher, Recap)
- Violations (Types, Data)
- Utilities (Upload, BotWA)

**Treasurer:**
- Dashboard (Finance charts)
- Finance (Payments, Billing, Payment Types, Student Info)
- Data (Students, Classes)
- Upload (Billing, Users)

**Teacher:**
- Dashboard
- Schedule (My Schedule, Attendance Input)
- Calendar
- Violations (My Classes)
- Teacher Attendance

**Student:**
- Dashboard
- Schedule
- Attendance
- Payments
- Violations
- Tahfidz Records
- Calendar

**Parent:**
- Dashboard
- Child Information / Portal

---

## M. Migration Risks

1. **Renaming `calender` to `calendar`** breaks existing bookmarks/links
2. **Fixing `getRoleMenuKey`** will suddenly change what all non-student users see - must be tested carefully
3. **Moving API routes** requires updating all hook consumers
4. **Renaming route segments** to kebab-case changes URLs
5. **Adding middleware** could affect existing auth flows
6. **Fixing the trailing space** in `input ` folder requires careful filesystem handling

### Mitigation Strategy

- Fix critical bugs first (sidebar, broken hooks) without moving files
- Apply naming fixes incrementally with search-and-replace verification
- Keep old routes temporarily if changing URLs
- Test each role after sidebar fix

---

## N. Files That Should Be Preserved

All existing API route handlers (88 files) - preserve functionality even if reorganized
All existing pages (63 files) - preserve working UI
All type definitions (22 files) - preserve type safety
All existing hooks (51 files) - preserve data fetching behavior (after fixing bugs)
Prisma schema - do not modify without migration
Core libraries: lib/auth.ts, lib/prisma.ts, lib/tenant.ts, lib/apiClients.ts, lib/errorHandlerBackend.ts, lib/pagination.ts
UI components in components/ui/ - preserve shadcn/kibo primitives
Docker configuration files
Environment configuration

---

## O. Files That Can Be Safely Removed After Verification

| File | Reason |
|---|---|
| `app/(frontend)/(hooks)/hooks/Users/useUserById.ts` | Exact duplicate of `useGetUserById` in `useUsers.ts` |
| `app/(frontend)/(hooks)/hooks/Users/useGetUserByIdTeacher.ts` | Calls non-existent API `/api/users/id/` |
| `app/(frontend)/(dashboard)/dashboard/test/date/page.tsx` | Test/sandbox page |
| `app/(frontend)/(dashboard)/dashboard/middleware/page.tsx` | Internal test page |
| `eslint.config.mjs.txt` | Inactive ESLint config (renamed with .txt) |
| Duplicate menu iconMap in menuGroupsSidebar.ts | Consolidate with appSidebar.tsx |

**Note:** Verify no imports reference these files before deletion.
