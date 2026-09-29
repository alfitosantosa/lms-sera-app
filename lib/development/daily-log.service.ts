import {
  type BulkDailyLogInput,
  type DailyLogInput,
  type DailyLogUpdateInput,
  type DateRange,
  type TimelineEntryDTO,
} from "@/app/(types)";
import { writeAudit } from "@/lib/development/audit";
import {
  ADMIN_ROLE_NAMES,
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
 * Service buku catatan harian (Phase 2). Semua fungsi melakukan sendiri
 * pengecekan scope (`assertStudentAccess` / `assertClassAccess`) dan melempar
 * `DailyLogServiceError` — route hanya menerjemahkannya ke HTTP.
 */
export class DailyLogServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "DailyLogServiceError";
  }
}

/** Include kanonik sebuah log harian (dipakai service & route). */
export const dailyLogInclude = {
  student: { select: { id: true, name: true, nisn: true, avatarUrl: true } },
  teacher: { select: { id: true, name: true } },
  observations: {
    orderBy: { createdAt: "asc" },
    include: {
      indicator: {
        select: {
          id: true,
          name: true,
          developmentArea: { select: { id: true, name: true } },
        },
      },
      scale: { select: { id: true, code: true, label: true, color: true } },
    },
  },
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
} satisfies Prisma.DailyLogInclude;

export type DailyLogFull = Prisma.DailyLogGetPayload<{
  include: typeof dailyLogInclude;
}>;

/** Terjemahkan error service/Prisma menjadi respons HTTP modul pengembangan. */
export function dailyLogErrorResponse(error: unknown): NextResponse {
  if (error instanceof DailyLogServiceError) {
    return developmentError(error.message, error.status);
  }
  return handlePrismaError(error);
}

/** Parse query param tanggal (`fromdate`/`todate`); `undefined` bila kosong/invalid. */
export function parseDateParam(value: string | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

type StudentAccess =
  | {
      ok: true;
      student: {
        id: string;
        classId: string;
        branchId: string;
        foundationId: string;
      };
    }
  | { ok: false; response: NextResponse };

export type ClassAccess = { ok: true } | { ok: false; response: NextResponse };

/** Terjemahkan respons guard menjadi error service. */
async function fail(response: NextResponse): Promise<never> {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  throw new DailyLogServiceError(body?.message ?? "Akses ditolak", response.status);
}

/** Dipakai service assessment (Phase 4) — jangan duplikasi pesan error guard. */
export async function unwrapStudent(result: StudentAccess) {
  if (!result.ok) throw await fail(result.response);
  return result.student;
}

export async function unwrapClass(result: ClassAccess) {
  if (!result.ok) throw await fail(result.response);
}

/** teacherId wajib ada di akun staff; dipakai juga oleh service assessment. */
export function requireTeacherId(actor: DevelopmentActor): string {
  if (!actor.userDataId) {
    throw new DailyLogServiceError("Akun tidak terhubung ke data guru", 400);
  }
  return actor.userDataId;
}

/**
 * Semua referensi tenant (mata pelajaran, indikator, skala) wajib milik
 * yayasan actor — dijaga di satu tempat agar create/bulk/PATCH tidak berbeda.
 * Lookup dibatch per koleksi id (bukan per observasi).
 *
 * `isActive: true` juga disyaratkan untuk indikator & skala: baris nonaktif
 * tidak muncul di picker/`getClassMatrix`/`percentAssessment`, jadi menulis
 * dengan referensi nonaktif hanya menghasilkan baris yang tak pernah terhitung.
 * Ceiling: memperbaiki nilai yang indikatornya dinonaktifkan *setelah* dicatat
 * juga ikut ditolak — admin mengaktifkan ulang indikator untuk mengoreksi.
 */
export async function assertReferencesInFoundation(
  foundationId: string,
  refs: {
    subjectId?: string | null;
    indicatorIds?: string[];
    scaleIds?: string[];
  },
): Promise<void> {
  const subjectId = refs.subjectId ?? null;
  const indicatorIds = [...new Set(refs.indicatorIds ?? [])];
  const scaleIds = [...new Set(refs.scaleIds ?? [])];

  const [subject, indicators, scales] = await Promise.all([
    subjectId
      ? prisma.subject.findFirst({
          // Sama seperti modul exam: mata pelajaran milik yayasan atau global
          // (branchId null) — filter relasi `branch` saja akan mengecualikannya.
          where: {
            id: subjectId,
            OR: [{ branch: { foundationId } }, { branchId: null }],
          },
          select: { id: true },
        })
      : null,
    indicatorIds.length
      ? prisma.developmentIndicator.findMany({
          where: {
            id: { in: indicatorIds },
            isActive: true,
            developmentArea: { foundationId },
          },
          select: { id: true },
        })
      : [],
    scaleIds.length
      ? prisma.assessmentScale.findMany({
          where: { id: { in: scaleIds }, isActive: true, foundationId },
          select: { id: true },
        })
      : [],
  ]);

  if (subjectId && !subject) {
    throw new DailyLogServiceError(
      "Mata pelajaran tidak ditemukan di yayasan ini",
      400,
    );
  }
  if (indicators.length !== indicatorIds.length) {
    throw new DailyLogServiceError(
      "Indikator tidak ditemukan di yayasan ini",
      400,
    );
  }
  if (scales.length !== scaleIds.length) {
    throw new DailyLogServiceError("Skala tidak ditemukan di yayasan ini", 400);
  }
}

/** Log harus berada dalam periode penilaian berstatus OPEN. */
export async function assertOpenPeriod(foundationId: string, date: Date) {
  const period = await prisma.assessmentPeriod.findFirst({
    where: {
      foundationId,
      status: "OPEN",
      startDate: { lte: date },
      endDate: { gte: date },
    },
    select: { id: true },
  });
  if (!period) {
    throw new DailyLogServiceError("Periode penilaian belum dibuka", 400);
  }
}

/** Baca log dalam scope yayasan; lempar 404 bila tidak ada. */
async function findLog(actor: DevelopmentActor, id: string) {
  const log = await prisma.dailyLog.findFirst({
    where: { id, foundationId: actor.foundationId },
    select: {
      id: true,
      classId: true,
      studentId: true,
      teacherId: true,
      status: true,
      foundationId: true,
    },
  });
  if (!log) {
    throw new DailyLogServiceError("Log harian tidak ditemukan", 404);
  }
  return log;
}

export type ObservationRowInput = DailyLogInput["observations"][number];
export type EvidenceRowInput = DailyLogInput["evidences"][number];

/** Builder baris `daily_observations`/`evidences` (dipakai bulk & PATCH). */
export function observationRow(
  dailyLogId: string,
  o: ObservationRowInput,
) {
  return {
    dailyLogId,
    indicatorId: o.indicatorId,
    scaleId: o.scaleId ?? null,
    observation: o.observation,
    note: o.note ?? null,
  };
}

export function evidenceRow(
  dailyLogId: string,
  e: EvidenceRowInput,
  uploadedById: string | null,
) {
  return {
    dailyLogId,
    type: e.type,
    url: e.url,
    fileName: e.fileName ?? null,
    mimeType: e.mimeType ?? null,
    fileSize: e.fileSize ?? null,
    title: e.title ?? null,
    description: e.description ?? null,
    uploadedById,
  };
}

export async function createDailyLog(
  actor: DevelopmentActor,
  input: DailyLogInput,
): Promise<DailyLogFull> {
  const teacherId = requireTeacherId(actor);
  const student = await unwrapStudent(
    await assertStudentAccess(actor, input.studentId),
  );

  // foundationId/branchId/classId selalu diturunkan dari data siswa; nilai
  // kiriman client hanya dipakai sebagai validasi, bukan sumber kebenaran.
  const outOfScope =
    !student.classId ||
    !student.branchId ||
    (input.classId !== undefined && input.classId !== student.classId) ||
    (input.branchId !== undefined && input.branchId !== student.branchId);
  if (outOfScope) {
    throw new DailyLogServiceError("Siswa tidak berada di kelas ini", 400);
  }

  await unwrapClass(await assertClassAccess(actor, student.classId));
  await assertOpenPeriod(actor.foundationId, input.date);
  await assertReferencesInFoundation(actor.foundationId, {
    subjectId: input.subjectId,
    indicatorIds: input.observations.map((o) => o.indicatorId),
    scaleIds: input.observations.flatMap((o) => (o.scaleId ? [o.scaleId] : [])),
  });

  return prisma.$transaction(async (tx) => {
    const log = await tx.dailyLog.create({
      data: {
        foundationId: actor.foundationId,
        branchId: student.branchId,
        classId: student.classId,
        studentId: student.id,
        teacherId,
        subjectId: input.subjectId ?? null,
        date: input.date,
        activity: input.activity,
        achievement: input.achievement ?? null,
        challenge: input.challenge ?? null,
        teacherNote: input.teacherNote ?? null,
        parentVisible: input.parentVisible,
        observations: {
          create: input.observations.map((o) => ({
            indicatorId: o.indicatorId,
            scaleId: o.scaleId ?? null,
            observation: o.observation,
            note: o.note ?? null,
          })),
        },
        evidences: {
          create: input.evidences.map((e) => ({
            type: e.type,
            url: e.url,
            fileName: e.fileName ?? null,
            mimeType: e.mimeType ?? null,
            fileSize: e.fileSize ?? null,
            title: e.title ?? null,
            description: e.description ?? null,
            uploadedById: actor.userDataId,
          })),
        },
      },
      include: dailyLogInclude,
    });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "dailyLog.created",
      entity: "DailyLog",
      entityId: log.id,
      after: log,
    });

    return log;
  });
}

export async function bulkCreateDailyLogs(
  actor: DevelopmentActor,
  input: BulkDailyLogInput,
): Promise<{ count: number }> {
  const teacherId = requireTeacherId(actor);
  await unwrapClass(await assertClassAccess(actor, input.classId));
  await assertOpenPeriod(actor.foundationId, input.date);
  await assertReferencesInFoundation(actor.foundationId, {
    subjectId: input.subjectId,
    indicatorIds: input.entries.map((e) => e.indicatorId),
    scaleIds: input.entries.flatMap((e) => (e.scaleId ? [e.scaleId] : [])),
  });

  const studentIds = input.entries.map((e) => e.studentId);
  if (new Set(studentIds).size !== studentIds.length) {
    throw new DailyLogServiceError("Siswa duplikat dalam satu batch", 400);
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
    throw new DailyLogServiceError("Siswa tidak berada di kelas ini", 400);
  }

  return prisma.$transaction(async (tx) => {
    const logs = await tx.dailyLog.createManyAndReturn({
      data: input.entries.map((entry) => ({
        foundationId: actor.foundationId,
        branchId,
        classId: input.classId,
        studentId: entry.studentId,
        teacherId,
        subjectId: input.subjectId ?? null,
        date: input.date,
        activity: entry.activity,
        parentVisible: input.parentVisible,
      })),
    });

    const logIdByStudent = new Map(logs.map((l) => [l.studentId, l.id]));
    const observations = input.entries.map((entry) => {
      const dailyLogId = logIdByStudent.get(entry.studentId);
      if (!dailyLogId) {
        // Tidak mungkin terjadi: duplikat siswa sudah ditolak sebelum transaksi.
        throw new DailyLogServiceError(
          "Gagal menyimpan observasi log harian",
          500,
        );
      }
      return observationRow(dailyLogId, {
        indicatorId: entry.indicatorId,
        scaleId: entry.scaleId ?? null,
        observation: entry.observation,
      });
    });
    await tx.dailyObservation.createMany({ data: observations });

    for (const log of logs) {
      await writeAudit(tx, {
        foundationId: actor.foundationId,
        actorId: actor.userId,
        action: "dailyLog.created",
        entity: "DailyLog",
        entityId: log.id,
        after: log,
      });
    }

    return { count: logs.length };
  });
}

export async function getStudentTimeline(
  actor: DevelopmentActor,
  studentId: string,
  range: DateRange,
): Promise<TimelineEntryDTO[]> {
  const student = await unwrapStudent(
    await assertStudentAccess(actor, studentId),
  );

  // Halaman/timeline orang tua & siswa hanya menerima entri yang dipublikasikan.
  const publishedOnly = actor.isParent || actor.isStudent;
  const dateFilter =
    range.fromDate || range.toDate
      ? {
          date: {
            ...(range.fromDate ? { gte: range.fromDate } : {}),
            ...(range.toDate ? { lte: range.toDate } : {}),
          },
        }
      : {};

  const logs = await prisma.dailyLog.findMany({
    where: {
      foundationId: actor.foundationId,
      studentId: student.id,
      ...dateFilter,
      ...(publishedOnly ? { parentVisible: true } : {}),
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: dailyLogInclude,
  });

  return logs.map((log) => ({
    kind: "log" as const,
    id: log.id,
    date: log.date.toISOString(),
    activity: log.activity,
    teacherNote: log.teacherNote,
    parentVisible: log.parentVisible,
    teacher: log.teacher
      ? { id: log.teacher.id, name: log.teacher.name }
      : null,
    observations: log.observations.map((o) => ({
      indicator: o.indicator.name,
      area: o.indicator.developmentArea?.name ?? null,
      scale: o.scale
        ? {
            id: o.scale.id,
            code: o.scale.code,
            label: o.scale.label,
            color: o.scale.color,
          }
        : null,
      observation: o.observation,
    })),
    evidences: log.evidences.map((e) => ({ type: e.type, url: e.url })),
  }));
}

export async function submitDailyLog(
  actor: DevelopmentActor,
  id: string,
): Promise<DailyLogFull> {
  const log = await findLog(actor, id);
  await unwrapStudent(await assertStudentAccess(actor, log.studentId));

  if (
    log.teacherId !== actor.userDataId &&
    ADMIN_ROLE_NAMES[actor.roleName] !== true
  ) {
    throw new DailyLogServiceError("Anda tidak berhak mengirim log ini", 403);
  }
  if (log.status !== "DRAFT") {
    throw new DailyLogServiceError(
      "Hanya log berstatus draft yang dapat dikirim",
      400,
    );
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.dailyLog.update({
      where: { id: log.id },
      data: { status: "SUBMITTED" },
      include: dailyLogInclude,
    });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "dailyLog.submitted",
      entity: "DailyLog",
      entityId: log.id,
      before: { status: log.status },
      after: { status: updated.status },
    });

    return updated;
  });
}

export async function reviewDailyLog(
  actor: DevelopmentActor,
  id: string,
): Promise<DailyLogFull> {
  if (!actor.isStaff) {
    throw new DailyLogServiceError(
      "Hanya guru atau admin yang dapat mengakses data ini",
      403,
    );
  }

  const log = await findLog(actor, id);
  await unwrapStudent(await assertStudentAccess(actor, log.studentId));

  if (log.status !== "SUBMITTED") {
    throw new DailyLogServiceError(
      "Hanya log berstatus submitted yang dapat ditinjau",
      400,
    );
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.dailyLog.update({
      where: { id: log.id },
      data: { status: "REVIEWED" },
      include: dailyLogInclude,
    });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "dailyLog.reviewed",
      entity: "DailyLog",
      entityId: log.id,
      before: { status: log.status },
      after: { status: updated.status },
    });

    return updated;
  });
}

/** Dipakai route `[id]` (PATCH/DELETE) — baca log lengkap dalam scope yayasan. */
export async function getOwnedDailyLog(actor: DevelopmentActor, id: string) {
  const log = await prisma.dailyLog.findFirst({
    where: { id, foundationId: actor.foundationId },
    include: dailyLogInclude,
  });
  if (!log) {
    throw new DailyLogServiceError("Log harian tidak ditemukan", 404);
  }
  await unwrapStudent(await assertStudentAccess(actor, log.studentId));
  return log;
}

export async function updateDailyLog(
  actor: DevelopmentActor,
  id: string,
  input: DailyLogUpdateInput,
): Promise<DailyLogFull> {
  const log = await getOwnedDailyLog(actor, id);
  assertLogWritable(actor, log, "update");
  if (input.date) await assertOpenPeriod(actor.foundationId, input.date);
  await assertReferencesInFoundation(actor.foundationId, {
    subjectId: input.subjectId,
    indicatorIds: input.observations?.map((o) => o.indicatorId) ?? [],
    scaleIds:
      input.observations?.flatMap((o) => (o.scaleId ? [o.scaleId] : [])) ?? [],
  });

  return prisma.$transaction(async (tx) => {
    if (input.observations) {
      await tx.dailyObservation.deleteMany({ where: { dailyLogId: log.id } });
      await tx.dailyObservation.createMany({
        data: input.observations.map((o) => observationRow(log.id, o)),
      });
    }
    if (input.evidences) {
      await tx.evidence.deleteMany({ where: { dailyLogId: log.id } });
      await tx.evidence.createMany({
        data: input.evidences.map((e) => evidenceRow(log.id, e, actor.userDataId)),
      });
    }

    const row = await tx.dailyLog.update({
      where: { id: log.id },
      data: {
        ...(input.date !== undefined ? { date: input.date } : {}),
        ...(input.subjectId !== undefined
          ? { subjectId: input.subjectId ?? null }
          : {}),
        ...(input.activity !== undefined ? { activity: input.activity } : {}),
        ...(input.achievement !== undefined
          ? { achievement: input.achievement ?? null }
          : {}),
        ...(input.challenge !== undefined
          ? { challenge: input.challenge ?? null }
          : {}),
        ...(input.teacherNote !== undefined
          ? { teacherNote: input.teacherNote ?? null }
          : {}),
        ...(input.parentVisible !== undefined
          ? { parentVisible: input.parentVisible }
          : {}),
      },
      include: dailyLogInclude,
    });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "dailyLog.updated",
      entity: "DailyLog",
      entityId: log.id,
      before: log,
      after: row,
    });

    return row;
  });
}

/**
 * Helper route PATCH/DELETE: cek hak ubah/hapus log.
 * Rule §2.3.5 — log `DRAFT` boleh diubah guru pemilik; log yang sudah dikirim
 * (SUBMITTED/REVIEWED) hanya boleh diubah admin (`admin`/`admin school`),
 * bukan guru, karena guru juga terhitung staff pada guard.
 */
export function assertLogWritable(
  actor: DevelopmentActor,
  log: { status: string; teacherId: string },
  mode: "update" | "delete",
) {
  const isAdmin = ADMIN_ROLE_NAMES[actor.roleName] === true;
  const isOwner = log.teacherId === actor.userDataId;

  if (log.status !== "DRAFT") {
    if (mode === "delete") {
      throw new DailyLogServiceError(
        "Hanya log berstatus draft yang dapat dihapus",
        403,
      );
    }
    if (!isAdmin) {
      throw new DailyLogServiceError(
        "Log yang sudah dikirim hanya dapat diubah oleh admin",
        403,
      );
    }
    return;
  }

  if (!isOwner && !isAdmin) {
    throw new DailyLogServiceError(
      `Anda tidak berhak ${mode === "delete" ? "menghapus" : "mengubah"} log ini`,
      403,
    );
  }
}
