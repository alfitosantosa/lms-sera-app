import {
  type AssessmentUpdateInput,
  type AssessmentUpsertInput,
  type BulkAssessmentInput,
  type ClassMatrixDTO,
  type EvidenceInput,
  type StudentOverviewAreaDTO,
  type StudentOverviewDTO,
} from "@/app/(types)";
import { writeAudit } from "@/lib/development/audit";
import {
  DailyLogServiceError,
  assertReferencesInFoundation,
  requireTeacherId,
  unwrapClass,
  unwrapStudent,
} from "@/lib/development/daily-log.service";
import {
  assertClassAccess,
  assertStudentAccess,
  developmentError,
  type DevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@/prisma/generated/client";
import { type NextResponse } from "next/server";

/**
 * Service penilaian per indikator (Phase 4). Setiap fungsi melakukan sendiri
 * pengecekan scope (`assertStudentAccess` / `assertClassAccess`), sehingga route
 * cukup menerjemahkan error ke HTTP.
 *
 * `@@unique([studentId, periodId, indicatorId])` = satu nilai per indikator per
 * periode; penulisan selalu `upsert` dan riwayat perubahan hidup di `AuditLog`.
 */
export class AssessmentServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AssessmentServiceError";
  }
}

/** Terjemahkan error service assessment (dan helper daily-log yang dipakai ulang). */
export function assessmentErrorResponse(error: unknown): NextResponse {
  if (error instanceof AssessmentServiceError) {
    return developmentError(error.message, error.status);
  }
  // `assertReferencesInFoundation`/`requireTeacherId`/`unwrap*` memakai kelas
  // error daily-log (helper dibagi, bukan disalin).
  if (error instanceof DailyLogServiceError) {
    return developmentError(error.message, error.status);
  }
  return handlePrismaError(error);
}

export const assessmentInclude = {
  student: { select: { id: true, name: true, nisn: true, avatarUrl: true } },
  teacher: { select: { id: true, name: true } },
  indicator: {
    select: {
      id: true,
      name: true,
      developmentArea: { select: { id: true, name: true } },
    },
  },
  scale: { select: { id: true, code: true, label: true, color: true } },
  period: { select: { id: true, name: true, status: true } },
  evidences: {
    select: {
      id: true,
      type: true,
      url: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      title: true,
      description: true,
      createdAt: true,
    },
  },
} satisfies Prisma.StudentAssessmentInclude;

export type StudentAssessmentFull = Prisma.StudentAssessmentGetPayload<{
  include: typeof assessmentInclude;
}>;

/** Nilai yang diaudit — bukan seluruh baris, cukup yang bisa berubah. */
type AssessmentValues = {
  scaleId: string;
  score: number | null;
  note: string | null;
};

function valuesOf(row: {
  scaleId: string;
  score: Prisma.Decimal | null;
  note: string | null;
}): AssessmentValues {
  return {
    scaleId: row.scaleId,
    score: row.score === null ? null : Number(row.score),
    note: row.note,
  };
}

/** Metadata bukti → baris `evidences` (relasi assessmentId diisi Prisma). */
function evidenceRows(evidences: EvidenceInput[], uploadedById: string | null) {
  return evidences.map((e) => ({
    type: e.type,
    url: e.url,
    fileName: e.fileName ?? null,
    mimeType: e.mimeType ?? null,
    fileSize: e.fileSize ?? null,
    title: e.title ?? null,
    description: e.description ?? null,
    uploadedById,
  }));
}

/**
 * Aturan kunci seragam (menggantikan "DELETE hanya jika belum PUBLISHED"):
 * tidak ada mutasi saat periode `LOCKED` **atau** `PUBLISHED`.
 */
export async function assertPeriodWritable(
  foundationId: string,
  periodId: string,
): Promise<{ id: string; name: string; status: string }> {
  const period = await prisma.assessmentPeriod.findFirst({
    where: { id: periodId, foundationId },
    select: { id: true, name: true, status: true },
  });
  if (!period) {
    throw new AssessmentServiceError("Periode penilaian tidak ditemukan", 404);
  }
  if (period.status === "LOCKED" || period.status === "PUBLISHED") {
    throw new AssessmentServiceError("Periode penilaian sudah dikunci", 409);
  }
  return period;
}

/**
 * Upsert satu nilai assessment. `classId`/`branchId`/`foundationId` diturunkan
 * dari data siswa, `teacherId` dari akun staff pemanggil.
 */
export async function upsertAssessment(
  actor: DevelopmentActor,
  input: AssessmentUpsertInput,
): Promise<StudentAssessmentFull> {
  const teacherId = requireTeacherId(actor);
  const student = await unwrapStudent(
    await assertStudentAccess(actor, input.studentId),
  );
  if (!student.classId || !student.branchId) {
    throw new AssessmentServiceError("Siswa belum terdaftar di kelas", 400);
  }

  await assertReferencesInFoundation(actor.foundationId, {
    indicatorIds: [input.indicatorId],
    scaleIds: [input.scaleId],
  });
  await assertPeriodWritable(actor.foundationId, input.periodId);

  return prisma.$transaction(async (tx) => {
    const where = {
      studentId_periodId_indicatorId: {
        studentId: student.id,
        periodId: input.periodId,
        indicatorId: input.indicatorId,
      },
    };
    const existing = await tx.studentAssessment.findUnique({
      where,
      select: { id: true, scaleId: true, score: true, note: true },
    });

    // Bukti hanya diganti bila field-nya dikirim (bukan tiap update).
    const evidences = input.evidences
      ? {
          deleteMany: {},
          create: evidenceRows(input.evidences, actor.userDataId),
        }
      : {};

    const row = existing
      ? await tx.studentAssessment.update({
          where: { id: existing.id },
          data: {
            scaleId: input.scaleId,
            // Field yang tidak dikirim tidak di-null-kan (matrix hanya kirim
            // scaleId, jangan hapus catatan/nilai yang sudah ada).
            ...(input.score !== undefined ? { score: input.score ?? null } : {}),
            ...(input.note !== undefined ? { note: input.note ?? null } : {}),
            ...(input.evidences ? { evidences } : {}),
          },
          include: assessmentInclude,
        })
      : await tx.studentAssessment.create({
          data: {
            foundationId: actor.foundationId,
            branchId: student.branchId,
            classId: student.classId,
            studentId: student.id,
            teacherId,
            periodId: input.periodId,
            indicatorId: input.indicatorId,
            scaleId: input.scaleId,
            score: input.score ?? null,
            note: input.note ?? null,
            ...(input.evidences
              ? { evidences: { create: evidenceRows(input.evidences, actor.userDataId) } }
              : {}),
          },
          include: assessmentInclude,
        });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: existing ? "assessment.updated" : "assessment.created",
      entity: "StudentAssessment",
      entityId: row.id,
      before: existing ? valuesOf(existing) : null,
      after: valuesOf(row),
    });

    return row;
  });
}

/**
 * Upsert matriks kelas × satu indikator. Seluruh validasi (kelas, periode,
 * referensi, keanggotaan siswa) selesai sebelum transaksi — penolakan tidak
 * meninggalkan baris parsial.
 */
export async function bulkUpsertAssessments(
  actor: DevelopmentActor,
  input: BulkAssessmentInput,
): Promise<{ count: number }> {
  const teacherId = requireTeacherId(actor);
  await unwrapClass(await assertClassAccess(actor, input.classId));
  await assertPeriodWritable(actor.foundationId, input.periodId);
  await assertReferencesInFoundation(actor.foundationId, {
    indicatorIds: [input.indicatorId],
    scaleIds: input.entries.map((e) => e.scaleId),
  });

  const studentIds = input.entries.map((e) => e.studentId);
  if (new Set(studentIds).size !== studentIds.length) {
    throw new AssessmentServiceError("Siswa duplikat dalam satu batch", 400);
  }

  const students = await prisma.userData.findMany({
    where: {
      id: { in: studentIds },
      foundationId: actor.foundationId,
      classId: input.classId,
    },
    select: { id: true, branchId: true },
  });
  const branchId = students[0]?.branchId ?? null;
  if (students.length !== studentIds.length || !branchId) {
    throw new AssessmentServiceError("Siswa tidak berada di kelas ini", 400);
  }

  return prisma.$transaction(async (tx) => {
    // ponytail: upsert berurutan; satukan jadi satu raw upsert bila matriks kelas jadi sangat besar
    for (const entry of input.entries) {
      const where = {
        studentId_periodId_indicatorId: {
          studentId: entry.studentId,
          periodId: input.periodId,
          indicatorId: input.indicatorId,
        },
      };
      const existing = await tx.studentAssessment.findUnique({
        where,
        select: { scaleId: true, score: true, note: true },
      });

      const row = await tx.studentAssessment.upsert({
        where,
        create: {
          foundationId: actor.foundationId,
          branchId,
          classId: input.classId,
          studentId: entry.studentId,
          teacherId,
          periodId: input.periodId,
          indicatorId: input.indicatorId,
          scaleId: entry.scaleId,
          note: entry.note ?? null,
        },
        update: {
          scaleId: entry.scaleId,
          // Entri bulk tanpa `note` tidak boleh menghapus catatan lama.
          ...(entry.note !== undefined ? { note: entry.note ?? null } : {}),
        },
        select: { id: true, scaleId: true, score: true, note: true },
      });

      await writeAudit(tx, {
        foundationId: actor.foundationId,
        actorId: actor.userId,
        action: existing ? "assessment.updated" : "assessment.created",
        entity: "StudentAssessment",
        entityId: row.id,
        before: existing ? valuesOf(existing) : null,
        after: valuesOf(row),
      });
    }

    return { count: input.entries.length };
  });
}

/** Matriks siswa × indikator satu kelas pada satu periode. */
export async function getClassMatrix(
  actor: DevelopmentActor,
  filters: {
    classId: string;
    periodId: string;
    areaId?: string;
    indicatorId?: string;
  },
): Promise<ClassMatrixDTO> {
  await unwrapClass(await assertClassAccess(actor, filters.classId));

  const period = await prisma.assessmentPeriod.findFirst({
    where: { id: filters.periodId, foundationId: actor.foundationId },
    select: { id: true, name: true, status: true },
  });
  if (!period) {
    throw new AssessmentServiceError("Periode penilaian tidak ditemukan", 404);
  }

  if (filters.indicatorId) {
    await assertReferencesInFoundation(actor.foundationId, {
      indicatorIds: [filters.indicatorId],
    });
  }
  if (filters.areaId) {
    const area = await prisma.developmentArea.findFirst({
      where: { id: filters.areaId, foundationId: actor.foundationId },
      select: { id: true },
    });
    if (!area) {
      throw new AssessmentServiceError(
        "Area pengembangan tidak ditemukan",
        404,
      );
    }
  }

  const [indicators, students] = await Promise.all([
    prisma.developmentIndicator.findMany({
      where: {
        developmentArea: { foundationId: actor.foundationId },
        ...(filters.indicatorId ? { id: filters.indicatorId } : {}),
        ...(filters.areaId ? { developmentAreaId: filters.areaId } : {}),
        isActive: true,
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        order: true,
        developmentArea: { select: { id: true, name: true } },
      },
    }),
    prisma.userData.findMany({
      where: { classId: filters.classId, foundationId: actor.foundationId },
      select: { id: true, name: true, nisn: true, avatarUrl: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const assessments =
    indicators.length && students.length
      ? await prisma.studentAssessment.findMany({
          where: {
            classId: filters.classId,
            periodId: period.id,
            foundationId: actor.foundationId,
            indicatorId: { in: indicators.map((i) => i.id) },
            studentId: { in: students.map((s) => s.id) },
          },
          select: {
            id: true,
            studentId: true,
            indicatorId: true,
            scaleId: true,
            score: true,
            note: true,
            updatedAt: true,
            scale: { select: { id: true, code: true, label: true, color: true } },
          },
        })
      : [];

  const byCell = new Map(
    assessments.map(
      (a) => [`${a.studentId}:${a.indicatorId}`, a] as const,
    ),
  );

  return {
    classId: filters.classId,
    period,
    indicators: indicators.map((i) => ({
      id: i.id,
      name: i.name,
      order: i.order,
      area: i.developmentArea ?? null,
    })),
    students,
    cells: students.flatMap((student) =>
      indicators.map((indicator) => {
        const row = byCell.get(`${student.id}:${indicator.id}`);
        return {
          studentId: student.id,
          indicatorId: indicator.id,
          assessmentId: row?.id ?? null,
          scaleId: row?.scaleId ?? null,
          scale: row?.scale ?? null,
          score: row?.score == null ? null : Number(row.score),
          note: row?.note ?? null,
          updatedAt: row?.updatedAt.toISOString() ?? null,
        };
      }),
    ),
  };
}

/** Prisma Decimal → number agar bentuk JSON cocok dengan `StudentAssessmentDTO`. */
export function toAssessmentDTO(row: StudentAssessmentFull) {
  return { ...row, score: row.score === null ? null : Number(row.score) };
}

/** Baca satu assessment dalam scope yayasan; 404 bila tidak ada / di luar scope. */
export async function getAssessment(
  actor: DevelopmentActor,
  id: string,
): Promise<StudentAssessmentFull> {
  const row = await prisma.studentAssessment.findFirst({
    where: { id, foundationId: actor.foundationId },
    include: assessmentInclude,
  });
  if (!row) {
    throw new AssessmentServiceError("Penilaian tidak ditemukan", 404);
  }
  await unwrapStudent(await assertStudentAccess(actor, row.studentId));
  return row;
}

/** Ubah skala/catatan/bukti; periode terkunci diblokir (aturan seragam). */
export async function updateAssessment(
  actor: DevelopmentActor,
  id: string,
  input: AssessmentUpdateInput,
): Promise<StudentAssessmentFull> {
  const row = await getAssessment(actor, id);
  await assertPeriodWritable(actor.foundationId, row.periodId);
  if (input.scaleId) {
    await assertReferencesInFoundation(actor.foundationId, {
      scaleIds: [input.scaleId],
    });
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.studentAssessment.update({
      where: { id: row.id },
      data: {
        ...(input.scaleId ? { scaleId: input.scaleId } : {}),
        ...(input.score !== undefined ? { score: input.score ?? null } : {}),
        ...(input.note !== undefined ? { note: input.note ?? null } : {}),
        ...(input.evidences
          ? {
              evidences: {
                deleteMany: {},
                create: evidenceRows(input.evidences, actor.userDataId),
              },
            }
          : {}),
      },
      include: assessmentInclude,
    });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "assessment.updated",
      entity: "StudentAssessment",
      entityId: row.id,
      before: valuesOf(row),
      after: valuesOf(updated),
    });

    return updated;
  });
}

/** Hapus assessment; periode `LOCKED`/`PUBLISHED` diblokir. */
export async function deleteAssessment(
  actor: DevelopmentActor,
  id: string,
): Promise<void> {
  const row = await getAssessment(actor, id);
  await assertPeriodWritable(actor.foundationId, row.periodId);

  await prisma.$transaction(async (tx) => {
    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "assessment.deleted",
      entity: "StudentAssessment",
      entityId: row.id,
      before: valuesOf(row),
    });
    await tx.studentAssessment.delete({ where: { id: row.id } });
  });
}

/** Ringkasan per area: skala terakhir + skala tertinggi seorang siswa. */
export async function getStudentOverview(
  actor: DevelopmentActor,
  studentId: string,
): Promise<StudentOverviewDTO> {
  const student = await unwrapStudent(
    await assertStudentAccess(actor, studentId),
  );

  // Orang tua/siswa hanya melihat penilaian dari periode yang sudah dipublikasikan.
  const publishedOnly = actor.isParent || actor.isStudent;

  const rows = await prisma.studentAssessment.findMany({
    where: {
      studentId: student.id,
      foundationId: actor.foundationId,
      ...(publishedOnly ? { period: { status: "PUBLISHED" } } : {}),
    },
    orderBy: { updatedAt: "asc" },
    select: {
      indicatorId: true,
      updatedAt: true,
      indicator: {
        select: {
          id: true,
          name: true,
          developmentArea: { select: { id: true, name: true } },
        },
      },
      scale: {
        select: {
          id: true,
          code: true,
          label: true,
          color: true,
          value: true,
        },
      },
      period: { select: { name: true } },
    },
  });

  const scoped = await prisma.userData.findUnique({
    where: { id: student.id },
    select: { id: true, name: true, nisn: true, classId: true },
  });

  const byArea = new Map<
    string,
    {
      areaId: string;
      areaName: string;
      latest: StudentOverviewAreaDTO["latest"];
      highest: StudentOverviewAreaDTO["highest"];
      count: number;
    }
  >();

  for (const row of rows) {
    const area = row.indicator.developmentArea;
    const scale = row.scale
      ? {
          id: row.scale.id,
          code: row.scale.code,
          label: row.scale.label,
          color: row.scale.color,
        }
      : null;

    const entry = byArea.get(area.id) ?? {
      areaId: area.id,
      areaName: area.name,
      latest: null,
      highest: null,
      count: 0,
    };

    // `orderBy updatedAt asc` → baris terakhir = terbaru.
    entry.latest = {
      indicatorId: row.indicatorId,
      indicatorName: row.indicator.name,
      scale,
      periodName: row.period.name,
      updatedAt: row.updatedAt.toISOString(),
    };
    if (!entry.highest || row.scale.value >= entry.highest.value) {
      entry.highest = {
        indicatorId: row.indicatorId,
        indicatorName: row.indicator.name,
        scale: scale ? { ...scale, value: row.scale.value } : null,
        periodName: row.period.name,
        value: row.scale.value,
      };
    }
    entry.count += 1;
    byArea.set(area.id, entry);
  }

  return {
    student: {
      id: student.id,
      name: scoped?.name ?? "",
      nisn: scoped?.nisn ?? null,
      classId: student.classId || null,
    },
    areas: [...byArea.values()].map((entry) => ({
      areaId: entry.areaId,
      areaName: entry.areaName,
      count: entry.count,
      latest: entry.latest,
      highest: entry.highest,
    })),
  };
}
