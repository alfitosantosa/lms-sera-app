# Foundation modules, schedule-driven LMS, credential provisioning, and folder restructure — Design

Date: 2026-10-24
Status: awaiting review
Scope owner: user selected the proposed module table, the attachment folder
structure, two LMS entities with a unified flow, and credential generation with
on-screen/CSV output.

## 1. Problem

The platform has four independent gaps that the user wants closed in one program:

1. **No tenant module entitlement.** `Foundation` has no module field. Every
   foundation sees every menu: finance, attendance, violations, LMS, tahfidz.
   A yayasan that buys only the academic core cannot hide the rest, and a newly
   created foundation is forced into the full surface.
2. **The LMS is structurally inconsistent.** `Assignment` derives
   `classId`/`subjectId`/`teacherId` from `scheduleId` and has a working
   submission + grading flow. `Exam` has no schedule relation at all: a teacher
   can create an exam for any class and subject, so the teacher, subject, and
   schedule shown to students do not reliably match reality. Essay answers are
   flagged `needsManualGrading`, but no endpoint or UI can grade them, so an
   essay exam can never be finished.
3. **User creation cannot log anyone in.** `POST /api/userdata` writes a
   `UserData` row only. The admin must first create a Better Auth account
   elsewhere and then link it. There is no generated email/password flow for
   students, teachers, or parents.
4. **The folder layout diverged from the target.** The repository uses
   `app/(backend)/api`, `app/(hooks)/hooks`, `app/(types)/types`, `lib/`, and
   `app/(frontend)`. The target in the supplied attachment uses `app/api`,
   `app/(public)`, `app/(dashboard)`, `hooks/`, `services/`, `types/`, and
   `config/`.

### Verified facts this design rests on

- `prisma/schema.prisma`: `Foundation` has no module column; `Exam` has no
  `scheduleId`; `ExamAnswer` has no feedback/grading timestamps;
  `Assignment.allowLateSubmission` exists and is honoured by
  `lib/development/assignment.service.ts`.
- `app/(backend)/api` contains **140** `route.ts` files, plus one `/health`
  route outside that group. `app/(frontend)`
  contains **90** files. `app/(hooks)/hooks` contains **63** files.
  `app/(types)/types` contains **26** files. `lib/` contains **42** files.
  `components/` contains **113** files.
- Import sites that the restructure must rewrite: `@/app/(types)` 151,
  `@/app/(hooks)` 99, `@/lib/api` 185, `@/lib/betterauth` 82,
  `@/lib/errorHandler` 120, `@/lib/exam` 14, `@/lib/development` 41,
  `@/lib/WhatsappGateway` 4, `@/lib/rabbitMQ` 2, `@/app/repository` 1.
- `components/ConditionalLayout.tsx` is the only dashboard shell; there is no
  `app/(frontend)/(dashboard)/layout.tsx`.
- `useGetUserByIdBetterAuth` returns `UserData` with `foundation` included, so
  `Foundation.modules` reaches the sidebar without a new query.
- Better Auth **1.7.2** admin plugin exposes `auth.api.createUser` (body:
  `email`, `password?`, `name`, `role?`, `data?`) and `setUserPassword`.
  `AdminOptions` supports `defaultRole` and `adminRoles`; the current
  `lib/betterauth/auth.ts` passes unsupported `teacherRole`, `studentRole`, and
  `parentRole` keys.
- `app/(action)/midtrans/midtrans.ts` is entirely commented out and is imported
  nowhere. It is dead.
- The menu contains dead URLs `/dashboard/attendance`,
  `/dashboard/recapattendance`, and `/dashboard/recapattendance/class`; the
  existing onboarding-tour spec records the same fact. The valid pages are
  under `/dashboard/admin/...`.
- `prisma/generated/**` is already modified in the working tree by the user.
  This program does not touch generated files except through
  `prisma generate` after schema changes.

## 2. Goals

1. A foundation can be created with a chosen subset of optional modules and the
   subset can be changed later by a foundation admin.
2. Core SIAKAD is always available: users/roles, schools/branches, classes,
   academic years, subjects, schedules, special schedules, calendar,
   announcements, and profile.
3. Disabled modules disappear from the sidebar, from direct dashboard URLs, and
   from their APIs. Enabling a module restores all three without a redeploy.
4. Existing foundations keep every module after the migration; no current user
   loses a feature.
5. Assignments and exams are both schedule-driven; the teacher, class, subject,
   and schedule shown to a student come from the same `Schedule` row.
6. Both activity types have a hard deadline: a submission after the deadline is
   rejected by the API and hidden by the UI.
7. An exam essay can be graded manually, and the attempt score/status are
   recomputed from the manual scores.
8. A new student, teacher, or parent can be created with a generated email and
   password in one action; the plaintext credentials are shown once and can be
   downloaded as CSV. No plaintext is stored.
9. The repository matches the target folder structure, with no route URL
   changes and no behaviour changes from the move alone.

## 3. Non-goals

- A single `Activity` table. The user chose two entities with a unified flow;
  no `Assignment`/`Exam` data migration.
- Exam scores feeding `Grade`/rapor automatically. The current assignment
  grading already upserts `Grade`; extending that to exams is a later change.
  The design adds no `Exam.gradeTypeId` in this program.
- Sending credentials by WhatsApp or email. The user chose display/download
  only.
- Retroactively provisioning login accounts for existing `UserData` rows
  without a Better Auth user.
- A module marketplace, per-branch module overrides, or billing integration.
  Modules are per foundation.
- Multi-tenant `Client` model. The attachment's `Client` wording is a folder
  example; this repository's tenant stays `Foundation`.
- Changing the payment, tahfidz, attendance, or violation domain logic beyond
  menu/API gating.
- Deleting `.old` backup files. They are excluded from the type check if they
  interfere; deletion needs separate approval.

## 4. Decisions already taken

| Decision | Value | Rationale |
|---|---|---|
| Core | Profile, Users/Roles, Schools/Branches, Classes, Academic Years, Subjects, Schedules, Special Schedules, Calendar, Announcements, core dashboard | User approved the proposed table; these are the relations every optional module needs |
| Optional modules | `keuangan`, `absensi`, `pelanggaran`, `pembelajaran`, `tahfidz` | User approved the proposed table |
| Module storage | `String[]` on `Foundation` | Keys are code-defined; a join table would be dead weight |
| Structure | Follow the attachment | User decision |
| LMS model | Two entities, unified flow | User decision |
| Deadline | Hard: no late submissions | User decision |
| Credentials | Generate now; show/download CSV | User decision |
| Generated email | `{identifier}@{foundation-slug}.{AUTH_EMAIL_DOMAIN}` with `sera.app` fallback | User accepted the default |
| “Tanggal masuk” | `Assignment.assignedDate` / `Exam.startAt` | User accepted the default |
| Execution order | Structure → modules → LMS → credentials | Avoid moving newly written code twice |

## 5. Module entitlement

### 5.1 Canonical registry

Create `config/modules.ts`:

```ts
export type ModuleKey =
  | "keuangan"
  | "absensi"
  | "pelanggaran"
  | "pembelajaran"
  | "tahfidz";

export const ALL_MODULES: ModuleKey[] = [
  "keuangan",
  "absensi",
  "pelanggaran",
  "pembelajaran",
  "tahfidz",
];

export const MODULES: Record<
  ModuleKey,
  {
    label: string;
    description: string;
    pagePrefixes: string[];
    apiPrefixes: string[];
  }
> = {
  keuangan: { /* label, description, pagePrefixes, apiPrefixes */ },
  absensi: { /* ... */ },
  pelanggaran: { /* ... */ },
  pembelajaran: { /* ... */ },
  tahfidz: { /* ... */ },
};
```

`moduleForPath(pathname)` and `moduleForApiPath(pathname)` return the owning
module or `null`. Prefixes are matched longest-first so
`/api/students/by-ids/attendance` resolves to `absensi`, not to core
`/api/students`. `pagePrefixes` covers non-menu pages and detail routes too
(`/dashboard/reports`, `/dashboard/teacher/exam`, `/dashboard/student/exam`,
`/dashboard/treasurer/*`).

### 5.2 Menu mapping

Add `module?: ModuleKey` to the `MenuItem` type in
`config/menuGroupsSidebar.ts`. Core items leave it unset.

| Module | Menu areas |
|---|---|
| core | `/dashboard/profile`; `admin/master/{betterauth,roles,users,academicyear,branchs}`; `admin/master/classes` (class list, not the tahfidz sub-page); `admin/master/subjects`; `admin/academic/{schedules,specialschedule}`; `admin/utility/*`; all schedule/calendar pages; parent information page; root `/dashboard` |
| `keuangan` | `admin/finance/*`; `treasurer/*`; `student/payment`; finance chart pages; `/dashboard/admin/finance/*/chart` |
| `absensi` | `admin/attendance*`; `admin/recapattendance*`; `teacher/attendance*`; `student/attendance`; attendance widgets on `/dashboard` |
| `pelanggaran` | `admin/discipline/*`; `teacher/violations`; `student/violations` |
| `pembelajaran` | `admin/academic/development`; `teacher/development/*`; `teacher/exam*`; `teacher/questionbank`; `student/development/*`; `student/exam*`; `parent/development*`; `dashboard/reports` |
| `tahfidz` | `admin/master/classes/tahfidz`; `admin/academic/tahfidzrecord`; `teacher/tahfidzrecord*`; `student/tahfidzrecord` |

Menu cleanup included in the same phase:

- Replace dead `/dashboard/attendance` with `/dashboard/admin/attendance`.
- Replace dead `/dashboard/recapattendance` with
  `/dashboard/admin/recapattendance`.
- Replace dead `/dashboard/recapattendance/class` with
  `/dashboard/admin/recapattendance/class`.
- Update `components/navbar.tsx` path labels for the same three URLs.
- Update `lib/tours/tours.ts` if any tour step references the old URLs; run
  `lib/tours/tour.check.ts` afterwards.

Filtering runs after the existing permission filter:

```text
filterMenuByPermissions(items)
  -> filterMenuByModules(items, enabledModules)
  -> drop groups whose items are empty
```

### 5.3 Data model

```prisma
model Foundation {
  // existing fields
  modules String[] @default(["keuangan", "absensi", "pelanggaran", "pembelajaran", "tahfidz"])
}
```

One migration adds the column with the all-modules default. Existing rows are
backfilled by the default; no separate backfill script.

### 5.4 API

`POST /api/foundation`:

- Accepts optional `modules: ModuleKey[]`.
- Omitted means `ALL_MODULES` for backward compatibility; an explicit empty
  array means “core only”.
- Unknown keys return `400` with an Indonesian message.

`PUT /api/foundation`:

- Accepts optional `modules`; when present, replaces the array.
- Only a foundation admin may edit: `session.user.role === "admin"` or the
  domain role name contains `admin`/`yayasan`. School admins may read but not
  edit module selection.
- Invalidates nothing server-side; the client invalidates
  `["users", userId]`, `["users-profile", userId]`, and `["foundation"]`.

`GET /api/foundation` and `GET /api/userdata/betterauth/id/[id]` return
`modules` through the existing include.

### 5.5 UI

- `components/foundation/ModulePicker.tsx`: checkbox cards for the five
  optional modules; core is shown as a read-only “Selalu aktif” block.
- `/landing/register/foundation`: adds the picker, default all selected.
- `components/dialog/DialogEditFoundation.tsx`: adds the picker, pre-filled
  from `foundation.modules`; admin-only. Replace the current `useState`
  initializer with a `useEffect` keyed on `open` and `foundation.id` so opening
  the dialog for a different foundation resets the form.
- Profile foundation card: shows enabled module badges; the edit button stays
  admin-only.
- The create/edit mutations accept `modules`; after success invalidate the
  three query keys above so the sidebar updates without a reload.

### 5.6 Enforcement

Three layers, one source of truth:

1. **Menu** — `appSidebar` filters disabled modules.
2. **Route** — `components/layout/ModuleGuard.tsx` is a client component inside
   `ConditionalLayout`. It maps `usePathname()` with `moduleForPath`. If the
   path belongs to a disabled module, it `router.replace("/dashboard")` and
   shows a toast: `Modul <label> tidak aktif untuk yayasan ini`. While
   `userData` is loading and the current path maps to a module, it renders a
   small loading state instead of the page.
3. **API** — `resolveFoundation` returns `foundationId` and `modules`.
   `resolveExamActor` and `resolveDevelopmentActor` return `modules` as well.
   A shared `assertModuleAccess(pathname, modules)` rejects a module-owned API
   path with `403 { success: false, message: "Modul ... tidak aktif untuk
   yayasan ini" }`. Shared/core endpoints are not mapped and stay available.

`modules` is selected in the same query that already loads the caller:
`userData.foundation.modules` or `user.foundation.modules`. No extra query per
request.

### 5.7 Core dashboard

`/dashboard` currently renders attendance analytics unconditionally. It becomes
module-aware:

- `absensi` enabled: current attendance dashboard.
- `absensi` disabled: a compact core summary (branches, classes, users) plus
  links to enabled modules.
- Split the page into `AttendanceDashboard` and `CoreDashboard` components so
  hooks are never called conditionally. The disabled branch does not mount the
  attendance component, so no 403 noise appears in the browser console.

### 5.8 Compatibility

Existing foundations receive all five modules. No menu item disappears without
the admin explicitly unchecking it. The seed/role creation path gains a
`Parent` role because provisioning needs it; existing foundations get it on
demand in the provisioning service.

The foundation creator must also become a Better Auth admin
(`User.role = "admin"`), not only the domain Admin role. Without it,
`auth.api.createUser` (admin plugin) rejects provisioning and the existing
admin route rejects the caller. `POST /api/foundation` sets the creator's
`User.role` to `admin` after assigning the domain Admin role, then refreshes
the session with `auth.api.getSession({ headers, query: { disableCookieCache:
true } })` so the admin plugin sees the new role before the client leaves
onboarding. If the cookie cache still holds the old role, provisioning returns
`403` and the UI asks the admin to sign in again. A one-time migration
backfills `user.role = 'admin'` for users whose `user_data.role.name` is
`Admin` or `Yayasan`; the `Admin School` role is not backfilled.

## 6. Folder restructure

### 6.1 Target tree

```text
app/
  api/<resource>/route.ts
  (public)/
    auth/
    landing/
    produk/
  (dashboard)/
    dashboard/
  health/route.ts
  layout.tsx
  page.tsx
  globals.css
  providers.tsx
components/
  ui/
  layout/
  entry/
  pdf/
  <feature>/
config/
  menuGroupsSidebar.ts
  modules.ts
context/
  BranchContext.tsx
hooks/<Resource>/use<Resource>.ts
lib/
  http/apiClient.ts
  pagination.ts
  errorHandlerFrontend.ts
  export/
  marketing/
  report/
  tours/
  ui/
  utils.ts
services/
  prisma.ts
  tenant.ts
  errorHandler.ts
  userdata.ts
  auth/
  whatsapp/
  rabbitmq/
  exam/
  development/
types/
worker/
  whatsappWorker.ts
```

### 6.2 Path mapping

| Current | Target |
|---|---|
| `app/(backend)/api/**` | `app/api/**` |
| `app/(frontend)/(auth)/auth/**` | `app/(public)/auth/**` |
| `app/(frontend)/(landing)/landing/**` | `app/(public)/landing/**` |
| `app/(frontend)/produk/**` | `app/(public)/produk/**` |
| `app/(frontend)/(dashboard)/dashboard/**` | `app/(dashboard)/dashboard/**` |
| `app/(hooks)/hooks/**` | `hooks/**` |
| `app/(types)/types/**` + `app/(types)/index.ts` | `types/**` + `types/index.ts` |
| `app/repository/menuGroupsSidebar.ts` | `config/menuGroupsSidebar.ts` |
| `app/(context)/BranchContext.tsx` | `context/BranchContext.tsx` |
| `app/client/providers.tsx` | `app/providers.tsx` |
| `app/(health)/health/route.ts` | `app/health/route.ts` |
| `app/(action)/createExcel/paymentItems/exportBilling.ts` | delete (dead, no imports) |
| `app/(action)/createPDF/Invoice/studentInvoice.tsx` | `components/pdf/studentInvoice.tsx` |
| `app/(action)/createPDF/ReportCard/studentReport.tsx` | `components/pdf/studentReport.tsx` |
| `app/(action)/midtrans/midtrans.ts` | delete (dead, no imports) |
| `app/(service)` | delete (empty) |
| `components/appSidebar.tsx` | `components/layout/appSidebar.tsx` |
| `components/ConditionalLayout.tsx` | `components/layout/ConditionalLayout.tsx` |
| `components/footer.tsx` | `components/layout/footer.tsx` |
| `components/installButton.tsx` | `components/layout/installButton.tsx` |
| `lib/api/apiClients.ts` | `lib/http/apiClient.ts` |
| `lib/api/pagination.ts` | `lib/pagination.ts` |
| `lib/api/prisma.ts` | `services/prisma.ts` |
| `lib/api/tenant.ts` | `services/tenant.ts` |
| `lib/errorHandler/errorHandlerBackend.ts` | `services/errorHandler.ts` |
| `lib/errorHandler/errorHandlerFrontend.ts` | `lib/errorHandlerFrontend.ts` |
| `lib/betterauth/**` | `services/auth/**` |
| `lib/WhatsappGateway/**` | `services/whatsapp/**` |
| `lib/rabbitMQ/**` | `services/rabbitmq/**` |
| `lib/exam/**` | `services/exam/**` |
| `lib/development/**` | `services/development/**` |
| `lib/shadCN/utils.ts` | `lib/utils.ts` |
| `worker/whatsapp-worker.ts` | `worker/whatsappWorker.ts` |

The move also deletes the now-empty route groups and non-route folders:
`app/(backend)`, `app/(frontend)`, `app/(hooks)`, `app/(types)`,
`app/(context)`, `app/(action)`, `app/repository`, `app/client`, and
`app/(service)`.

Stay in `lib/`: `export/`, `marketing/`, `report/`, `tours/`, `ui/`. These are
pure/generic helpers, not server domain services.

### 6.3 Import rewrite

Ordered replacements, applied by one codemod:

```text
@/app/(types)/types/X        -> @/types/X
@/app/(types)                -> @/types
@/app/(hooks)/hooks/X        -> @/hooks/X
@/app/(frontend)/(auth)      -> @/app/(public)
@/app/(frontend)/(landing)   -> @/app/(public)
@/app/(frontend)/produk      -> @/app/(public)/produk
@/app/(frontend)/(dashboard) -> @/app/(dashboard)
@/app/repository/            -> @/config/
@/app/(context)/             -> @/context/
@/app/client/providers       -> @/app/providers
# exportBilling and action/midtrans are deleted (no imports)
@/app/(action)/createPDF/Invoice/studentInvoice       -> @/components/pdf/studentInvoice
@/app/(action)/createPDF/ReportCard/studentReport     -> @/components/pdf/studentReport
@/lib/api/apiClients         -> @/lib/http/apiClient
@/lib/api/pagination         -> @/lib/pagination
@/lib/api/prisma             -> @/services/prisma
@/lib/api/tenant             -> @/services/tenant
@/lib/errorHandler/errorHandlerBackend  -> @/services/errorHandler
@/lib/errorHandler/errorHandlerFrontend -> @/lib/errorHandlerFrontend
@/lib/betterauth/            -> @/services/auth/
@/lib/WhatsappGateway/       -> @/services/whatsapp/
@/lib/rabbitMQ/              -> @/services/rabbitmq/
@/lib/exam/                  -> @/services/exam/
@/lib/development/           -> @/services/development/
@/lib/shadCN/utils           -> @/lib/utils
@/components/appSidebar      -> @/components/layout/appSidebar
@/components/ConditionalLayout -> @/components/layout/ConditionalLayout
@/components/footer          -> @/components/layout/footer
@/components/installButton   -> @/components/layout/installButton
```

Relative imports (`./client/providers`, `./ui/...`) are updated by hand where
the codemod cannot see them. `@/*` in `tsconfig.json` stays mapped to the repo
root.

### 6.4 Verification for the move

- Record baseline before moving: `find app/api -name route.ts | wc -l` must
  equal the post-move count (140); `/health` is counted separately. The
  `page.tsx` count must be unchanged (83 dashboard pages, 89 frontend pages).
- `bunx tsc --noEmit`.
- `bun run build`.
- `bun run lib/tours/tour.check.ts`, `bun run lib/rabbitMQ/retry.check.ts`,
  and `bun run lib/exam/exam.grading.check.ts` (paths updated by the move).
- Smoke: sign-in, dashboard, one master-data CRUD, one API request.
- Update `package.json` `worker` script, `Dockerfile` worker stage/CMD,
  `AGENTS.md`, and `README.md`.
- `components.json` already points `utils` to `@/lib/utils`; the move makes
  that alias real.
- Remove `.next` before the first post-move build.

## 7. LMS

### 7.1 Data model

```prisma
model Exam {
  // existing fields
  scheduleId String?
  schedule   Schedule? @relation(fields: [scheduleId], references: [id])
  @@index([scheduleId])
}

model Schedule {
  // existing fields
  exams Exam[]
}

model ExamAnswer {
  // existing fields
  feedback String?
  gradedAt DateTime?
  gradedBy String?
}

model Assignment {
  // allowLateSubmission is removed
}
```

Migration:

- `Exam.scheduleId` nullable so legacy exams remain readable.
- `ExamAnswer.feedback/gradedAt/gradedBy` nullable.
- Drop `Assignment.allowLateSubmission`; the boolean is not an academic record,
  and the user requires a hard deadline. Existing submissions are untouched.
- Run `prisma generate`; `prisma/generated` changes are expected.

### 7.2 Creation is schedule-first

`Assignment` already derives `classId`/`subjectId`/`teacherId` from
`assertScheduleOwned`. `Exam` gains the same rule:

- New exams require `scheduleId`.
- The server loads the schedule, verifies it is active and in the caller's
  foundation, and derives `classId`, `subjectId`, and the teacher from
  `schedule.teacherId`.
- Teachers may only use their own schedules; admins may use any schedule in the
  foundation.
- The exam form replaces the free class/subject selects with a schedule select
  from `useAccessibleSchedules(userData)`. The schedule label shows class,
  subject, teacher, day, and time.
- Legacy exams with `scheduleId = null` remain in lists. Their edit form keeps
  the stored class/subject read-only and asks for a schedule when one is
  available.

Student visibility:

- Assignment: class + published + active (already implemented).
- Exam: class + published, and only when `startAt` is null or `startAt <= now`.
- Both: the list shows “Tanggal masuk” and “Tenggat”.

### 7.3 Hard deadline

- Assignment: `assertSubmittable` treats the activity as open only when
  `now < dueDate`; at or after the deadline it throws `403 "Tenggat
  pengumpulan sudah lewat"`. The `allowLateSubmission` branch and input field
  are removed from the schema, types, UI, and API.
- Exam: `start` rejects before `startAt`; `submit` and `answer` reject after
  `endAt`. The server is authoritative; the UI also hides the submit button
  after the deadline and shows a closed state.
- Boundary: a submission exactly at `dueDate`/`endAt` is closed; “still open”
  is `now < dueDate`/`now < endAt`. Test equality explicitly.

### 7.4 Submission input

Assignment:

- `notes` (essay text) and `attachments` continue to use `AssignmentSubmission`.
- `EvidenceUploader` accepts images (PNG/JPG/WEBP, 2 MB) and documents
  (PDF/PPT/PPTX, 10 MB). Images render as thumbnails; documents render as a
  download link with file name and size.
- `EvidenceInput.type` is `IMAGE` for images and `DOCUMENT` for files.
- The upload still goes to `NEXT_PUBLIC_FILESERVER_URL`; no new storage service.

Exam:

- `ESSAY` answers remain `ExamAnswer.answerText`.
- `MULTIPLE_CHOICE` and `TRUE_FALSE` remain auto-graded.
- No file upload inside an exam attempt; file/photo/PPT submission belongs to
  the assignment type.

### 7.5 Manual essay grading

New endpoint, matching the existing attempt route shape:

```text
PATCH /api/exam/[id]/attempt/[attemptId]/grade
body: {
  answers: [{ questionId: string, points: number, feedback?: string | null }]
}
```

Rules:

- Staff only; the attempt must belong to the exam and the exam to the caller's
  foundation.
- Each `questionId` must be an `ESSAY` question in that exam.
- `points` is an integer in `[0, ExamQuestion.points]`.
- The endpoint updates `ExamAnswer.points`, `feedback`, `gradedAt`, and
  `gradedBy` in one transaction.
- `ExamAttempt.score` is recomputed as the sum of all non-null answer points
  (auto-graded MC/TF plus manual essay points). Missing answers are 0.
- `ExamAttempt.status` becomes `GRADED` when every answered essay has a
  non-null `points`; otherwise it stays `SUBMITTED`.
- The response returns the same result shape as `GET .../result`.

UI:

- `ExamResultsTable` rows for a `SUBMITTED` attempt with
  `needsManualGrading` show a “Nilai esai” button.
- The dialog lists each essay question, the student's answer, the maximum
  points, a score input, and a feedback textarea. Saving calls the new endpoint
  and refetches the results.
- The student result page renders the manual score and feedback once available.

### 7.6 Unified UI

- Teacher: new `app/(dashboard)/dashboard/teacher/activities/page.tsx` with
  tabs **Tugas** and **Ujian**. It lists both types, shows schedule, start date,
  deadline, publication, submission count, and actions. The create panel has a
  type toggle; both branches use a schedule select.
- Student: new `app/(dashboard)/dashboard/student/activities/page.tsx` with
  tabs **Tugas** and **Ujian**. It shows only activities whose start date has
  passed, sorted by deadline, and blocks submission after the deadline.
- Legacy routes
  `/dashboard/teacher/development/assignments`, `/dashboard/teacher/exam`,
  `/dashboard/student/development/assignments`, and `/dashboard/student/exam`
  redirect to the matching tab of the new pages.
- The menu points to the new routes. `pembelajaran` gating covers the new and
  legacy routes.

### 7.7 Grade and rapor

Assignment grading keeps its existing `Grade` upsert. Exam scoring is stored on
`ExamAttempt`/`ExamAnswer` only; no `Grade` row is created. This is a documented
non-goal for this program.

## 8. Credential provisioning

### 8.1 Route and service

- `POST /api/users/provision` (after the restructure).
- `services/auth/provision.ts` owns generation, Better Auth creation, and
  UserData creation.
- `types/provision-types.ts` owns the zod input/response schemas.

Input:

```ts
type ProvisionInput = {
  role: "student" | "teacher" | "parent";
  name: string;
  identifier?: string;        // nisn or employeeId
  email?: string;
  password?: string;
  branchId?: string;
  classId?: string;
  academicYearId?: string;
  tahfidzGroupId?: string;
  studentIds?: string[];      // parent
  relation?: string;          // parent
  parentPhone?: string;
  gender?: string;
  // remaining UserData fields follow the existing user form
};

type ProvisionRequest = { users: ProvisionInput[] };
```

The route is admin-only: the caller must be a Better Auth admin
(`session.user.role === "admin"`) and the domain role must be `Admin` or
`Yayasan`. It resolves the foundation with `resolveFoundation`, validates every
referenced row against that foundation, and validates every row in the request
before creating anything. A validation failure returns `400` and creates no
rows; only failures during creation are reported per row.

The route caps a request at 50 users; the UI chunks larger imports. This keeps
the request bounded and stays under Better Auth's default 100-calls-per-10s
rate limit for `/admin/create-user`.

Extract the existing tenant-reference validation and payload normalization
from `app/api/userdata/route.ts` into `services/userdata.ts` during the
restructure, then reuse it in both the userdata and provisioning routes.

### 8.2 Email and password generation

- `foundationSlug = foundation.foundationCode.toLowerCase()` with every
  non-alphanumeric character replaced by `-`, trimmed to 63 characters; if
  empty, use the first eight characters of `foundation.id`.
- `identifierSlug`: NISN for students, employee ID for teachers, primary
  child's NISN for parents; fallback `{role}-{random6}`.
- `domain = process.env.AUTH_EMAIL_DOMAIN ?? "sera.app"`.
- `email = "{identifierSlug}@{foundationSlug}.{domain}"`.
- If the email already exists, append `-{random4}` and retry once.
- Password: 12 characters from
  `ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789` (no `I`, `O`,
  `0`, `1`), generated with `crypto.randomBytes`.
- Passwords are never logged, persisted in plaintext, or returned by any GET.

### 8.3 Creation flow

1. Validate the admin session and tenant. The caller must be a Better Auth
   admin (`session.user.role === "admin"`), which the foundation creator and
   the backfill migration guarantee.
2. Validate every row: resolve the domain role (`Student`, `Teacher`,
   `Parent`); create `Parent` if it is missing; validate
   branch/class/academic-year/tahfidz/student references. Create nothing if
   any row is invalid.
3. For each row: call `auth.api.createUser({ body: { email, password, name,
   role: "user" }, headers: request.headers })`. Non-admin accounts keep the
   Better Auth role `user`; the domain role lives in `UserData.roleId`.
5. Create `UserData` with the returned `user.id`, `foundationId`, and the
   resolved `roleId`.
6. If step 5 fails, delete the Better Auth user (cascade) as compensation and
   return the error for that row.
7. Return `{ userDataId, userId, name, email, password, role }`.

Bulk processing is sequential with per-row results:

```text
{ created: [...], failed: [{ index, name, message }] }
```

A failed row does not roll back successful rows. The UI shows both lists.

### 8.4 UI

- `components/dialog/DialogUser.tsx`: add “Buat akses login otomatis”
  (default on). When on, hide the existing “pilih Better Auth user” selector and
  call the provisioning hook. When off, keep the current link-existing-user
  flow.
- `components/dialog/DialogUserBendahara.tsx`: same provisioning path for
  student creation by the treasurer.
- Bulk upload (admin and treasurer user imports): calls the same service and
  returns credentials for every created row.
- `components/dialog/CredentialsDialog.tsx`: table of name, role, email,
  password; “Salin semua” and “Unduh CSV” actions. CSV is generated in the
  browser; no server file is stored.
- After closing the dialog, the plaintext is gone. Reopening requires a
  password reset, which is outside this program.

### 8.5 Auth configuration cleanup

`services/auth/auth.ts` currently passes `teacherRole`, `studentRole`, and
`parentRole` to `admin()`. Those keys are not in `AdminOptions`. Replace them
with:

```ts
admin({
  defaultRole: "user",
  adminRoles: ["admin"],
})
```

Domain roles stay in `UserData.role`. This avoids granting every teacher or
student Better Auth admin access. The foundation creator and existing
foundation admins (`Admin`/`Yayasan`) are the only users with Better Auth
`role: "admin"`; the backfill migration in §5.8 covers existing rows.

Document `AUTH_EMAIL_DOMAIN` in the `README.md` environment table (default
`sera.app`).

## 9. Compatibility and migration order

1. **Structure** — mechanical move only. No schema/API/UI change. Merge after
   `tsc` and `build`.
2. **Modules** — schema column with an all-modules default; create/edit UI;
   menu, route, and API gates. Existing foundations keep every module.
3. **LMS** — nullable `Exam.scheduleId`; drop `Assignment.allowLateSubmission`;
   essay grading fields/endpoint/UI; unified activity pages.
4. **Credentials** — new provisioning route/service/UI; no change to existing
   user rows.

Each phase gets its own implementation plan. A phase must leave the app green
before the next starts.

## 10. Verification

### 10.1 Automated checks

- `bunx tsc --noEmit`.
- `bun run build`.
- `bun run lib/tours/tour.check.ts` — after the menu URL cleanup.
- `bun run lib/rabbitMQ/retry.check.ts` — after the move.
- `bun run lib/exam/exam.grading.check.ts` — after the move.
- New `config/modules.check.ts`:
  - every optional menu URL is mapped to exactly one module;
  - every mapped menu URL has a `page.tsx`;
  - every API prefix maps to exactly one module;
  - no API prefix shadows a different module (longest-first assertion);
  - core menu items have no module;
  - `ALL_MODULES` equals the Prisma default.
- New `services/exam/exam.grade.check.ts`:
  - manual points recompute the attempt total;
  - an all-graded essay attempt becomes `GRADED`;
  - a partially graded attempt stays `SUBMITTED`;
  - points outside `[0, max]` are rejected.
- New `services/development/deadline.check.ts`:
  - open before the deadline;
  - closed exactly at and after the deadline.
- New `services/auth/provision.check.ts`:
  - password length/charset and no ambiguous characters;
  - email slug normalization and collision suffix;
  - missing identifier falls back to a role-random local part.

### 10.2 Manual smoke

1. Create a foundation with `modules: []` (core only). Sidebar hides finance,
   attendance, violations, LMS, and tahfidz. Direct
   `/dashboard/admin/finance` redirects to `/dashboard`; `GET /api/payment`
   returns 403.
2. Enable `keuangan` in the edit dialog. The sidebar and API work without a
   reload. Disable it again and confirm the gate.
3. Create an assignment and an exam from the same teacher schedule. Both show
   the same teacher, class, and subject. The student sees them under
   “Aktivitas”.
4. Submit an assignment before the deadline; submit after the deadline and
   confirm the API rejects it.
5. Answer an essay exam, submit, then grade it as the teacher. The student
   result shows points/feedback and the attempt becomes `GRADED`.
6. Create a student, teacher, and parent with generated credentials. Download
   the CSV and sign in as each account. Immediately after creating a new
   foundation, provision one user to prove the session refresh made the creator
   a Better Auth admin.
7. Sign in, open the dashboard, run one master-data CRUD, and call one API
   after the folder move.

## 11. Risks and trade-offs

| Risk | Mitigation |
|---|---|
| The move touches roughly 700 import sites | One ordered codemod; route/page count parity; `tsc` + build before merge |
| Next route-group collisions after moving `(frontend)`/`(backend)` | Route groups do not change URLs; verify the route manifest and all 140 API routes plus `/health` |
| Module API prefix mistakes block core endpoints | Longest-prefix match; explicit core allow-list; `config/modules.check.ts`; smoke both directions |
| Central path gating is bypassed by a route that does not use `resolveFoundation` | Module routes must use `resolveFoundation`, `resolveExamActor`, or `resolveDevelopmentActor`; grep for `auth.api.getSession` in module route groups and add the shared check |
| Essay grading leaves a partial state | One Prisma transaction; recompute total/status server-side |
| Better Auth user created but UserData fails | Delete the Better Auth user as compensation; per-row error result |
| Provisioning caller is a domain admin but not a Better Auth admin | Foundation creation sets `User.role = "admin"`; backfill migration for existing `Admin`/`Yayasan`; provisioning checks the Better Auth role |
| 30-minute session cookie cache still holds the pre-admin role | Foundation creation refreshes the session with `disableCookieCache: true`; if it is still stale, provisioning returns 403 and the UI asks for a re-login |
| Generated email collides | Existence check plus random suffix; one retry |
| Hard deadline changes existing behaviour | Explicit user requirement; document in the release note; existing submissions remain readable |
| Dead menu URLs confuse module mapping | Fix the three known URLs in the module phase; `tour.check.ts` catches regressions |
| Generated Prisma files are already dirty in the working tree | Stage only intended files; run `prisma generate` after schema changes |

## 12. Acceptance criteria

1. Foundation create and edit accept a module subset; unknown keys are
   rejected; an omitted subset defaults to all modules; an explicit empty
   array means core only.
2. Existing foundations keep all modules after migration.
3. Sidebar, direct dashboard URLs, and module APIs all respect the subset.
4. Core SIAKAD remains reachable for every foundation.
5. `Exam` creation requires a schedule; derived teacher/class/subject match the
   schedule for new exams; legacy exams remain readable.
6. Assignment and exam submissions after the deadline are rejected by the API
   and disabled in the UI.
7. A teacher can grade essay answers; the attempt total and status recompute
   correctly; the student sees score and feedback.
8. Assignment uploads accept images and PDF/PPT/PPTX; images preview and
   documents download.
9. Creating a student/teacher/parent with generated access returns email and
   password once and offers CSV download; no plaintext is persisted.
10. The repository matches the target folder tree; all route URLs are
    unchanged; `tsc` and `build` pass; the listed checks pass.
11. No dead menu URL remains in the optional-module map.
12. The sidebar updates after a module edit without a full page reload.
13. A foundation creator and backfilled foundation admins can call the
    provisioning route; teachers, students, and parents cannot.

## 13. Implementation phases for planning

1. **Phase 0 — restructure.** Move, codemod, update docs/package/Docker, verify.
2. **Phase 1 — modules.** Schema, registry, create/edit UI, foundation creator
   Better Auth admin role, menu/route/API gates, core dashboard, menu cleanup.
3. **Phase 2 — LMS.** `Exam.scheduleId`, hard deadline, upload extension, essay
   grading, unified activity pages, legacy redirects.
4. **Phase 3 — credentials.** Provisioning service/route, admin-role backfill,
   admin/treasurer dialogs, bulk import, credentials dialog/CSV, auth option
   cleanup.

Each phase ends with the automated checks and the relevant manual smoke, and
must leave the tree green before the next phase begins.
