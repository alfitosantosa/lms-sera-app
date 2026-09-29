import {
  type ReportAcademicRow,
  type ReportAggregate,
  type ReportAssignmentRow,
  type ReportCompletion,
  type ReportDevelopmentArea,
  type ReportDevelopmentIndicator,
  type ReportSnapshot,
  type ReportUpdateInput,
} from "@/app/(types)";
import { toJson, writeAudit } from "@/lib/development/audit";
import {
  DailyLogServiceError,
  unwrapClass,
  unwrapStudent,
} from "@/lib/development/daily-log.service";
import {
  assertClassAccess,
  assertStudentAccess,
  developmentError,
  type DevelopmentActor,
} from "@/lib/development/development.guard";
import { buildNarrativeDraft } from "@/lib/development/narrative";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@/prisma/generated/client";
import { type NextResponse } from "next/server";

/** Bentuk agregat juga diekspor dari sini sesuai kontrak service (sumber tunggal di `@/app/(types)`). */
export type { ReportAggregate };

/**
 * Service rapor (Phase 6): agregasi data perkembangan + akademik + presensi +
 * tugas, draft narasi, lalu workflow `DRAFT → REVIEW → APPROVED → PUBLISHED`.
 *
 * Prinsip inti (PRD §35): nilai hanya "dibekukan" saat `approveReport` menulis
 * `snapshot`. Setelah itu `publishReport` **tidak** menghitung ulang apa pun,
 * sehingga rapor yang sudah disetujui tidak berubah walau sumber datanya
 * berubah. Setiap fungsi memeriksa sendiri scope-nya (`assertStudentAccess` /
 * `assertClassAccess`).
 */
export class ReportServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ReportServiceError";
  }
}

/** Terjemahkan error service rapor (dan helper yang dipakai ulang) ke HTTP. */
export function reportErrorResponse(error: unknown): NextResponse {
  if (error instanceof ReportServiceError) {
    return developmentError(error.message, error.status);
  }
  // Helper bersama (akses kelas/siswa, validasi referensi) melempar error
  // daily-log; tanpa cabang ini status 403/404-nya berubah jadi 500.
  if (error instanceof DailyLogServiceError) {
    return developmentError(error.message, error.status);
  }
  return handlePrismaError(error);
}

/** Peringatan standar saat rapor sudah dikunci workflow. */
const LOCKED_MESSAGE = "Rapor sudah disetujui dan tidak dapat diubah";

export const reportInclude = {
  student: { select: { id: true, name: true, nisn: true, avatarUrl: true } },
  period: { select: { id: true, name: true, status: true } },
  class: { select: { id: true, name: true } },
  approvedBy: { select: { id: true, name: true } },
} satisfies Prisma.StudentReportInclude;

export type StudentReportFull = Prisma.StudentReportGetPayload<{
  include: typeof reportInclude;
}>;

/**
 * Include khusus `GET /api/reports/[id]`: menambah branding yayasan/cabang dan
 * peran penyetuju yang dibutuhkan dokumen cetak (PRD §64). Dipisahkan dari
 * `reportInclude` agar daftar rapor & respons mutasi tetap ringan.
 */
export const reportDetailInclude = {
  ...reportInclude,
  foundation: { select: { id: true, name: true, imageUrl: true } },
  branch: {
    select: { id: true, name: true, adminName: true, signatureUrl: true },
  },
  approvedBy: {
    select: { id: true, name: true, role: { select: { name: true } } },
  },
} satisfies Prisma.StudentReportInclude;

export type StudentReportDetail = Prisma.StudentReportGetPayload<{
  include: typeof reportDetailInclude;
}> & {
  /**
   * Agregat live untuk pratinjau `DRAFT`/`REVIEW`. `null` untuk status terkunci
   * (`APPROVED`/`PUBLISHED`) — status terkunci selalu memakai `snapshot`.
   */
  preview: Omit<ReportSnapshot, "version"> | null;
};

/** Status terkini di dalam transaksi — untuk pesan 409 saat penulisan bersyarat gagal. */
async function statusOr(
  tx: Prisma.TransactionClient,
  id: string,
  fallback: string,
): Promise<string> {
  const row = await tx.studentReport.findUnique({
    where: { id },
    select: { status: true },
  });
  return row?.status ?? fallback;
}

/** Status riil `attendances.status` yang dihitung (nilai lain diabaikan). */
const ATTENDANCE_STATUSES = [
  "present",
  "late",
  "sick",
  "excused",
  "absent",
] as const;

type AttendanceCounts = {
  present: number;
  late: number;
  sick: number;
  excused: number;
  absent: number;
};

/**
 * Kelengkapan rapor (PRD §71). Flag data diturunkan dari agregat; `narrative`
 * dan `review` adalah status workflow yang hanya diketahui pemanggil, jadi
 * dikirim lewat `context`. Setiap pembagian dijaga terhadap nol.
 */
export function computeCompletion(
  data: Pick<ReportAggregate, "academic" | "development" | "attendance">,
  context: { narrative: boolean; review: boolean },
): ReportCompletion {
  const flags: ReportCompletion = {
    academic: data.academic.length > 0,
    assessment: data.development.length > 0,
    attendance: data.attendance.total > 0,
    narrative: context.narrative,
    review: context.review,
    percent: 0,
  };
  const values = [
    flags.academic,
    flags.assessment,
    flags.attendance,
    flags.narrative,
    flags.review,
  ];
  flags.percent = values.length
    ? Math.round((values.filter(Boolean).length / values.length) * 100)
    : 0;
  return flags;
}

type ReportScaleRef = { code: string; label: string; value: number };

/** Akumulator satu area perkembangan selama grouping. */
type AreaBucket = {
  order: number;
  rows: ReportDevelopmentIndicator[];
  scales: Map<number, ReportScaleRef>;
};

/** Skala terdekat dari kumpulan skala yang benar-benar dipakai di satu area. */
function nearestScale(scales: Map<number, ReportScaleRef>, target: number) {
  let best: ReportScaleRef | null = null;
  for (const scale of scales.values()) {
    if (
      best === null ||
      Math.abs(scale.value - target) < Math.abs(best.value - target) ||
      (Math.abs(scale.value - target) === Math.abs(best.value - target) &&
        scale.value < best.value)
    ) {
      best = scale;
    }
  }
  return best;
}

/**
 * Skala akhir area = **modus** `scale.value` indikator di area itu; saat seri
 * (dua nilai sama-sama tersering) jatuh ke rata-rata yang dibulatkan, lalu
 * skala dengan nilai terdekat. Tidak pernah menciptakan kode skala baru —
 * seluruh kode berasal dari baris `assessment_scales` di database.
 */
function finalScaleOf(bucket: AreaBucket) {
  if (bucket.rows.length === 0) return null;
  const counts = new Map<number, number>();
  for (const row of bucket.rows) {
    counts.set(row.scaleValue, (counts.get(row.scaleValue) ?? 0) + 1);
  }
  let bestCount = -1;
  let tied: number[] = [];
  for (const [value, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      tied = [value];
    } else if (count === bestCount) {
      tied.push(value);
    }
  }
  const value =
    tied.length === 1
      ? tied[0]
      : Math.round(
          bucket.rows.reduce((sum, row) => sum + row.scaleValue, 0) /
            bucket.rows.length,
        );
  return bucket.scales.get(value) ?? nearestScale(bucket.scales, value);
}

/**
 * Agregat rapor satu siswa pada satu periode (PRD §35).
 *
 * - `development`: `StudentAssessment` pada `(studentId, periodId)` di-group per
 *   `indicator.developmentArea`; `finalScale` = modus skala indikator.
 * - `academic`: baris `ReportCard` dormant untuk `(studentId, academicYearId,
 *   semester)`. Kosong → section tidak ada (bukan diisi 0).
 * - `assignments`: `AssignmentSubmission` siswa dengan `Assignment.assignedDate`
 *   di dalam rentang periode. **Pilihan disengaja**: hanya `assignedDate` yang
 *   dipakai (bukan `dueDate`) supaya satu tugas tidak muncul di dua periode.
 * - `attendance`: `Attendance` dalam rentang periode per status riil
 *   (`present|late|sick|excused|absent`); status di luar daftar diabaikan.
 */
export async function buildReportAggregate(
  studentId: string,
  periodId: string,
  context: { narrative?: boolean; review?: boolean } = {},
): Promise<ReportAggregate> {
  const [student, period] = await Promise.all([
    prisma.userData.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        nisn: true,
        avatarUrl: true,
        foundationId: true,
        class: { select: { name: true } },
        branch: { select: { name: true } },
        foundation: { select: { name: true } },
      },
    }),
    prisma.assessmentPeriod.findUnique({
      where: { id: periodId },
      select: {
        id: true,
        name: true,
        semester: true,
        startDate: true,
        endDate: true,
        foundationId: true,
        academicYearId: true,
        academicYear: { select: { year: true } },
      },
    }),
  ]);

  if (!student) throw new ReportServiceError("Siswa tidak ditemukan", 404);
  if (!period) throw new ReportServiceError("Periode tidak ditemukan", 404);
  if (
    student.foundationId !== null &&
    period.foundationId !== student.foundationId
  ) {
    throw new ReportServiceError("Periode berada di yayasan lain", 400);
  }

  const [assessments, reportCards, submissions, attendances] = await Promise.all(
    [
      prisma.studentAssessment.findMany({
        where: { studentId, periodId },
        select: {
          note: true,
          indicator: {
            select: {
              name: true,
              developmentArea: { select: { name: true, order: true } },
            },
          },
          scale: { select: { code: true, label: true, value: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      period.academicYearId
        ? prisma.reportCard.findMany({
            where: {
              studentId,
              academicYearId: period.academicYearId,
              semester: period.semester,
            },
            select: {
              finalScore: true,
              letterGrade: true,
              predicate: true,
              subject: { select: { name: true } },
            },
            orderBy: { subject: { name: "asc" } },
          })
        : Promise.resolve([]),
      prisma.assignmentSubmission.findMany({
        where: {
          studentId,
          // Filter periode memakai `assignedDate` tugas (lihat doc komentar).
          assignment: {
            assignedDate: { gte: period.startDate, lte: period.endDate },
          },
        },
        select: {
          score: true,
          assignment: {
            select: {
              title: true,
              maxScore: true,
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.attendance.findMany({
        where: {
          studentId,
          date: { gte: period.startDate, lte: period.endDate },
        },
        select: { status: true },
      }),
    ],
  );

  // --- development: group per area perkembangan ---
  const areaBuckets = new Map<string, AreaBucket>();
  for (const assessment of assessments) {
    const areaName = assessment.indicator.developmentArea.name;
    const bucket: AreaBucket = areaBuckets.get(areaName) ?? {
      order: assessment.indicator.developmentArea.order,
      rows: [],
      scales: new Map(),
    };
    bucket.rows.push({
      indicator: assessment.indicator.name,
      scale: assessment.scale.code,
      scaleValue: assessment.scale.value,
      note: assessment.note,
    });
    bucket.scales.set(assessment.scale.value, {
      code: assessment.scale.code,
      label: assessment.scale.label,
      value: assessment.scale.value,
    });
    areaBuckets.set(areaName, bucket);
  }
  const development: ReportDevelopmentArea[] = [...areaBuckets.entries()]
    .sort(([aName, a], [bName, b]) => a.order - b.order || aName.localeCompare(bName))
    .map(([area, bucket]) => ({
      area,
      indicators: bucket.rows,
      finalScale: finalScaleOf(bucket),
    }));

  const academic: ReportAcademicRow[] = reportCards.map((row) => ({
    subject: row.subject.name,
    finalScore: Number(row.finalScore),
    letterGrade: row.letterGrade,
    predicate: row.predicate,
  }));

  const assignments: ReportAssignmentRow[] = submissions.map((row) => ({
    title: row.assignment.title,
    subject: row.assignment.subject.name,
    score: row.score === null ? null : Number(row.score),
    maxScore: Number(row.assignment.maxScore),
  }));

  const attendance: AttendanceCounts = {
    present: 0,
    late: 0,
    sick: 0,
    excused: 0,
    absent: 0,
  };
  for (const row of attendances) {
    if ((ATTENDANCE_STATUSES as readonly string[]).includes(row.status)) {
      attendance[row.status as keyof AttendanceCounts] += 1;
    }
  }
  const total =
    attendance.present +
    attendance.late +
    attendance.sick +
    attendance.excused +
    attendance.absent;
  // "Hadir" mencakup terlambat; total 0 dijaga agar tidak NaN.
  const percent =
    total === 0
      ? 0
      : Math.round(((attendance.present + attendance.late) / total) * 100);

  const aggregate: ReportAggregate = {
    student: {
      id: student.id,
      name: student.name,
      nisn: student.nisn,
      class: student.class?.name ?? "",
      branch: student.branch?.name ?? "",
      foundation: student.foundation?.name ?? "",
      avatarUrl: student.avatarUrl,
    },
    period: {
      id: period.id,
      name: period.name,
      semester: period.semester,
      startDate: period.startDate,
      endDate: period.endDate,
    },
    academicYear: period.academicYear?.year ?? null,
    development,
    academic,
    assignments,
    attendance: { ...attendance, total, percent },
    completion: computeCompletion(
      { academic, development, attendance: { ...attendance, total, percent } },
      {
        narrative: context.narrative ?? false,
        review: context.review ?? false,
      },
    ),
  };
  return aggregate;
}

/** Narasi draft dari agregat (deliberately sync-template, tapi API async). */
export async function generateNarrative(
  aggregate: ReportAggregate,
): Promise<string> {
  return buildNarrativeDraft(aggregate);
}

/** Baca satu rapor dalam scope yayasan + cek akses kelas; 404 bila di luar scope. */
export async function getReport(
  actor: DevelopmentActor,
  id: string,
): Promise<StudentReportFull> {
  const report = await prisma.studentReport.findFirst({
    where: { id, foundationId: actor.foundationId },
    include: reportInclude,
  });
  if (!report) throw new ReportServiceError("Rapor tidak ditemukan", 404);
  await unwrapClass(await assertClassAccess(actor, report.classId));
  return report;
}

/**
 * Detail rapor untuk `GET /api/reports/[id]`: menambah branding (logo yayasan,
 * tanda tangan/kepala cabang) dan peran penyetuju, plus pratinjau agregat live
 * untuk `DRAFT`/`REVIEW`.
 *
 * Jaminan dokumen beku tidak berubah: `preview` **tidak** ditulis ke `snapshot`
 * dan **tidak** dihitung untuk status terkunci (`APPROVED`/`PUBLISHED`) — di
 * sana konsumen wajib memakai `snapshot`.
 */
export async function getReportDetail(
  actor: DevelopmentActor,
  id: string,
): Promise<StudentReportDetail> {
  const report = await prisma.studentReport.findFirst({
    where: { id, foundationId: actor.foundationId },
    include: reportDetailInclude,
  });
  if (!report) throw new ReportServiceError("Rapor tidak ditemukan", 404);

  // Orang tua/siswa: hanya anak sendiri / dirinya (assertStudentAccess), dan
  // hanya rapor yang sudah terbit. Selain PUBLISHED tidak ada bentuk respons
  // lain — bukan versi tersunting, bukan pratinjau: 404.
  if (actor.isParent || actor.isStudent) {
    await unwrapStudent(await assertStudentAccess(actor, report.studentId));
    if (report.status !== "PUBLISHED") {
      throw new ReportServiceError("Rapor tidak ditemukan", 404);
    }
  } else {
    await unwrapClass(await assertClassAccess(actor, report.classId));
  }

  const locked = report.status === "APPROVED" || report.status === "PUBLISHED";
  if (locked) return { ...report, preview: null };

  // `toJson` menyamakan bentuk JSON dengan `snapshot` (tanggal → ISO string),
  // tetapi TIDAK dipersistensi — murni pratinjau baca-saja.
  const preview = toJson(
    await buildReportAggregate(report.studentId, report.periodId),
  ) as unknown as Omit<ReportSnapshot, "version">;
  return { ...report, preview };
}

/**
 * Generate/refresh draft rapor satu kelas atau satu siswa. Satu transaksi per
 * siswa (loop sequential) supaya satu siswa bermasalah tidak menggagalkan
 * seluruh batch — kegagalannya dikumpulkan di `errors`.
 */
export async function generateReportDraft(
  actor: DevelopmentActor,
  input: { classId?: string; studentId?: string; periodId: string },
): Promise<{
  created: number;
  updated: number;
  errors: { studentId: string; message: string }[];
}> {
  const students: {
    id: string;
    classId: string;
    branchId: string;
    foundationId: string;
  }[] = [];

  if (input.studentId) {
    const student = await unwrapStudent(
      await assertStudentAccess(actor, input.studentId),
    );
    students.push(student);
  } else if (input.classId) {
    await unwrapClass(await assertClassAccess(actor, input.classId));
    const roster = await prisma.userData.findMany({
      where: { classId: input.classId, foundationId: actor.foundationId },
      select: {
        id: true,
        classId: true,
        branchId: true,
        foundationId: true,
      },
      orderBy: { name: "asc" },
    });
    for (const row of roster) {
      students.push({
        id: row.id,
        classId: row.classId ?? "",
        branchId: row.branchId ?? "",
        foundationId: row.foundationId ?? actor.foundationId,
      });
    }
  }

  const period = await prisma.assessmentPeriod.findFirst({
    where: { id: input.periodId, foundationId: actor.foundationId },
    select: { id: true },
  });
  if (!period) {
    throw new ReportServiceError("Periode tidak ditemukan di yayasan ini", 404);
  }

  let created = 0;
  let updated = 0;
  const errors: { studentId: string; message: string }[] = [];

  for (const student of students) {
    try {
      if (!student.classId || !student.branchId) {
        throw new ReportServiceError(
          "Siswa belum terdaftar di kelas/cabang",
          400,
        );
      }

      const aggregate = await buildReportAggregate(student.id, period.id);
      const narrative = buildNarrativeDraft(aggregate);
      const completion = computeCompletion(aggregate, {
        narrative: narrative.length > 0,
        review: false,
      });

      const existing = await prisma.studentReport.findUnique({
        where: {
          studentId_periodId: { studentId: student.id, periodId: period.id },
        },
        select: { id: true, status: true, teacherNarrative: true },
      });

      if (
        existing &&
        (existing.status === "APPROVED" || existing.status === "PUBLISHED")
      ) {
        errors.push({ studentId: student.id, message: LOCKED_MESSAGE });
        continue;
      }

      await prisma.$transaction(async (tx) => {
        if (existing) {
          await tx.studentReport.update({
            where: { id: existing.id },
            data: {
              completion: toJson(completion),
              generatedAt: new Date(),
              // Narasi hasil suntingan guru jangan ditimpa.
              ...(existing.teacherNarrative
                ? {}
                : { teacherNarrative: narrative }),
            },
          });
          await writeAudit(tx, {
            foundationId: actor.foundationId,
            actorId: actor.userId,
            action: "report.generated",
            entity: "StudentReport",
            entityId: existing.id,
            before: { status: existing.status },
            after: { status: existing.status, completion },
          });
        } else {
          const row = await tx.studentReport.create({
            data: {
              foundationId: student.foundationId,
              branchId: student.branchId,
              classId: student.classId,
              studentId: student.id,
              periodId: period.id,
              teacherNarrative: narrative,
              completion: toJson(completion),
              generatedAt: new Date(),
              createdById: actor.userId,
            },
            select: { id: true },
          });
          await writeAudit(tx, {
            foundationId: actor.foundationId,
            actorId: actor.userId,
            action: "report.generated",
            entity: "StudentReport",
            entityId: row.id,
            after: { status: "DRAFT", completion },
          });
        }
      });

      if (existing) updated += 1;
      else created += 1;
    } catch (error) {
      errors.push({
        studentId: student.id,
        message:
          error instanceof Error ? error.message : "Gagal membuat draft rapor",
      });
    }
  }

  return { created, updated, errors };
}

/** PATCH narasi — hanya `DRAFT`/`REVIEW`; setelahnya 409. */
export async function updateReport(
  actor: DevelopmentActor,
  id: string,
  input: ReportUpdateInput,
): Promise<StudentReportFull> {
  const report = await getReport(actor, id);
  if (report.status !== "DRAFT" && report.status !== "REVIEW") {
    throw new ReportServiceError(LOCKED_MESSAGE, 409);
  }

  const before = {
    teacherNarrative: report.teacherNarrative,
    homeroomNote: report.homeroomNote,
    principalNote: report.principalNote,
  };

  return prisma.$transaction(async (tx) => {
    // Penulisan bersyarat: status diperiksa DI DALAM transaksi, sehingga PATCH
    // yang tiba saat approve berjalan tidak bisa menulis ke rapor APPROVED.
    const { count } = await tx.studentReport.updateMany({
      where: { id, status: { in: ["DRAFT", "REVIEW"] } },
      data: input,
    });
    if (count === 0) {
      throw new ReportServiceError(LOCKED_MESSAGE, 409);
    }
    const row = await tx.studentReport.findUniqueOrThrow({
      where: { id },
      include: reportInclude,
    });
    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "report.updated",
      entity: "StudentReport",
      entityId: id,
      before,
      after: input,
    });
    return row;
  });
}

/** Regenerate draft narasi dari `snapshot` (bila ada) atau agregat terbaru. */
export async function regenerateNarrative(
  actor: DevelopmentActor,
  id: string,
): Promise<StudentReportFull> {
  const report = await getReport(actor, id);
  if (report.status !== "DRAFT" && report.status !== "REVIEW") {
    throw new ReportServiceError(LOCKED_MESSAGE, 409);
  }

  // Snapshot menyimpan tanggal sebagai ISO string; template narasi tidak
  // melakukan aritmetika tanggal sehingga bentuk ini aman dipakai apa adanya.
  const aggregate = report.snapshot
    ? (report.snapshot as unknown as ReportAggregate)
    : await buildReportAggregate(report.studentId, report.periodId);
  const narrative = buildNarrativeDraft(aggregate);

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.studentReport.updateMany({
      where: { id, status: { in: ["DRAFT", "REVIEW"] } },
      data: {
        teacherNarrative: narrative,
        completion: toJson(
          computeCompletion(
            {
              academic: aggregate.academic,
              development: aggregate.development,
              attendance: aggregate.attendance,
            },
            { narrative: narrative.length > 0, review: report.status === "REVIEW" },
          ),
        ),
      },
    });
    if (count === 0) {
      throw new ReportServiceError(LOCKED_MESSAGE, 409);
    }
    const row = await tx.studentReport.findUniqueOrThrow({
      where: { id },
      include: reportInclude,
    });
    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "report.narrative_regenerated",
      entity: "StudentReport",
      entityId: id,
      before: { teacherNarrative: report.teacherNarrative },
      after: { teacherNarrative: narrative },
    });
    return row;
  });
}

/** `DRAFT → REVIEW`. */
export async function reviewReport(
  actor: DevelopmentActor,
  id: string,
): Promise<StudentReportFull> {
  const report = await getReport(actor, id);
  if (report.status !== "DRAFT") {
    throw new ReportServiceError(
      `Rapor tidak dapat ditinjau dari status ${report.status}`,
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.studentReport.updateMany({
      where: { id, status: "DRAFT" },
      data: { status: "REVIEW" },
    });
    if (count === 0) {
      throw new ReportServiceError(
        `Rapor tidak dapat ditinjau dari status ${await statusOr(tx, id, report.status)}`,
        409,
      );
    }
    const row = await tx.studentReport.findUniqueOrThrow({
      where: { id },
      include: reportInclude,
    });
    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "report.reviewed",
      entity: "StudentReport",
      entityId: id,
      before: { status: "DRAFT" },
      after: { status: "REVIEW" },
    });
    return row;
  });
}

/**
 * `REVIEW → APPROVED` + **menulis snapshot** (`{ version: 1, ...agregat }`),
 * `approvedAt`, dan `approvedById` dalam satu transaksi dengan `AuditLog`.
 * `approvedById` = `UserData.id` (kolom ini berelasi ke `user_data`); boleh
 * `null` bila admin tanpa baris `UserData`. Snapshot inilah yang membekukan
 * nilai (PRD §35).
 */
export async function approveReport(
  actor: DevelopmentActor,
  id: string,
): Promise<StudentReportFull> {
  const report = await getReport(actor, id);
  if (report.status !== "REVIEW") {
    throw new ReportServiceError(
      `Rapor tidak dapat disetujui dari status ${report.status}`,
      409,
    );
  }

  const aggregate = await buildReportAggregate(report.studentId, report.periodId, {
    narrative: report.teacherNarrative !== null,
    review: true,
  });
  const snapshot = toJson({ version: 1, ...aggregate });

  return prisma.$transaction(async (tx) => {
    // Snapshot hanya ditulis bila status masih REVIEW DI DALAM transaksi —
    // approve ganda tidak boleh menimpa snapshot yang sudah dibekukan.
    const { count } = await tx.studentReport.updateMany({
      where: { id, status: "REVIEW" },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedById: actor.userDataId,
        snapshot,
        completion: toJson(aggregate.completion),
      },
    });
    if (count === 0) {
      throw new ReportServiceError(
        `Rapor tidak dapat disetujui dari status ${await statusOr(tx, id, report.status)}`,
        409,
      );
    }
    const row = await tx.studentReport.findUniqueOrThrow({
      where: { id },
      include: reportInclude,
    });
    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "report.approved",
      entity: "StudentReport",
      entityId: id,
      before: { status: "REVIEW" },
      after: {
        status: "APPROVED",
        approvedById: actor.userDataId,
        completion: aggregate.completion,
      },
    });
    return row;
  });
}

/**
 * `APPROVED → PUBLISHED`. Snapshot **tidak** dihitung ulang — publikasi hanya
 * membuka rapor, bukan kesempatan membaca data terbaru (PRD §35).
 * Phase 9 akan menyisipkan hook notifikasi di sini.
 */
export async function publishReport(
  actor: DevelopmentActor,
  id: string,
): Promise<StudentReportFull> {
  const report = await getReport(actor, id);
  if (report.status !== "APPROVED") {
    throw new ReportServiceError(
      `Rapor tidak dapat dipublikasikan dari status ${report.status}`,
      409,
    );
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.studentReport.updateMany({
      where: { id, status: "APPROVED" },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    if (count === 0) {
      throw new ReportServiceError(
        `Rapor tidak dapat dipublikasikan dari status ${await statusOr(tx, id, report.status)}`,
        409,
      );
    }
    const row = await tx.studentReport.findUniqueOrThrow({
      where: { id },
      include: reportInclude,
    });
    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "report.published",
      entity: "StudentReport",
      entityId: id,
      before: { status: "APPROVED" },
      after: { status: "PUBLISHED" },
    });
    return row;
  });
}
