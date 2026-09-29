import {
  type AssignmentGradeInput,
  type AssignmentInput,
  type AssignmentSubmissionInput,
  type AssignmentUpdateInput,
} from "@/app/(types)";
import { writeAudit } from "@/lib/development/audit";
import {
  assertReferencesInFoundation,
  unwrapClass,
} from "@/lib/development/daily-log.service";
import {
  ADMIN_ROLE_NAMES,
  assertClassAccess,
  developmentError,
  type DevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";
import { type NextResponse } from "next/server";

/**
 * Service tugas & penilaian (Phase 5). Semua fungsi memeriksa sendiri scope
 * (`assertClassAccess` / jadwal milik guru) dan melempar
 * `AssignmentServiceError`; route hanya menerjemahkannya ke HTTP.
 */
export class AssignmentServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AssignmentServiceError";
  }
}

/** Terjemahkan error service/Prisma menjadi respons HTTP modul pengembangan. */
export function assignmentErrorResponse(error: unknown): NextResponse {
  if (error instanceof AssignmentServiceError) {
    return developmentError(error.message, error.status);
  }
  return handlePrismaError(error);
}

/** Include kanonik sebuah tugas (dipakai service & route). */
export const assignmentInclude = {
  class: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true, code: true } },
  teacher: { select: { id: true, name: true } },
  schedule: {
    select: { id: true, dayOfWeek: true, startTime: true, endTime: true },
  },
  gradeType: {
    select: {
      id: true,
      name: true,
      description: true,
      code: true,
      weight: true,
      order: true,
      isActive: true,
    },
  },
  developmentArea: { select: { id: true, name: true } },
  indicator: {
    select: {
      id: true,
      name: true,
      developmentArea: { select: { id: true, name: true } },
    },
  },
  _count: { select: { submissions: true } },
} satisfies Prisma.AssignmentInclude;

export type AssignmentFull = Prisma.AssignmentGetPayload<{
  include: typeof assignmentInclude;
}>;

/** Include kanonik sebuah pengumpulan tugas. */
export const submissionInclude = {
  student: { select: { id: true, name: true, nisn: true, avatarUrl: true } },
  assignment: {
    select: {
      id: true,
      title: true,
      dueDate: true,
      maxScore: true,
      isPublished: true,
      classId: true,
      subjectId: true,
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
} satisfies Prisma.AssignmentSubmissionInclude;

export type SubmissionFull = Prisma.AssignmentSubmissionGetPayload<{
  include: typeof submissionInclude;
}>;

/** `classId`/`subjectId`/`teacherId` selalu diturunkan dari data, bukan client. */

/**
 * Jadwal harus aktif dan milik yayasan actor. Guru hanya boleh memakai
 * jadwalnya sendiri; admin/admin sekolah boleh memakai jadwal mana pun di
 * yayasan. `classId`/`subjectId`/`teacherId` tugas diambil dari sini.
 */
export async function assertScheduleOwned(
  actor: DevelopmentActor,
  scheduleId: string,
) {
  const schedule = await prisma.schedule.findFirst({
    where: {
      id: scheduleId,
      isActive: true,
      class: { branch: { foundationId: actor.foundationId } },
    },
    select: {
      id: true,
      classId: true,
      subjectId: true,
      teacherId: true,
    },
  });

  if (!schedule) {
    throw new AssignmentServiceError(
      "Jadwal tidak ditemukan di yayasan ini",
      404,
    );
  }
  if (!schedule.classId) {
    throw new AssignmentServiceError("Jadwal belum terhubung ke kelas", 400);
  }

  if (ADMIN_ROLE_NAMES[actor.roleName] === true) return schedule;

  if (actor.roleName !== "teacher" || schedule.teacherId !== actor.userDataId) {
    throw new AssignmentServiceError(
      "Anda hanya dapat membuat tugas pada jadwal Anda sendiri",
      403,
    );
  }
  return schedule;
}

/** Guru hanya boleh mengubah tugas pada jadwalnya; admin lolos scope kelas. */
async function assertStaffOwnsAssignment(
  actor: DevelopmentActor,
  assignment: { classId: string; teacherId: string },
) {
  if (ADMIN_ROLE_NAMES[actor.roleName] === true) {
    await unwrapClass(await assertClassAccess(actor, assignment.classId));
    return;
  }
  if (
    actor.roleName !== "teacher" ||
    assignment.teacherId !== actor.userDataId
  ) {
    throw new AssignmentServiceError("Anda tidak mengajar tugas ini", 403);
  }
}

/**
 * Validasi referensi tugas dalam satu tempat: mata pelajaran + indikator lewat
 * `assertReferencesInFoundation` (indikator wajib aktif), ditambah area
 * pengembangan & jenis penilaian yang tidak dicakup helper itu.
 */
async function assertAssignmentRefs(
  foundationId: string,
  refs: {
    subjectId?: string | null;
    indicatorId?: string | null;
    developmentAreaId?: string | null;
    gradeTypeId?: string | null;
  },
) {
  await assertReferencesInFoundation(foundationId, {
    subjectId: refs.subjectId,
    indicatorIds: refs.indicatorId ? [refs.indicatorId] : [],
  });

  if (refs.developmentAreaId) {
    const area = await prisma.developmentArea.findFirst({
      where: { id: refs.developmentAreaId, foundationId },
      select: { id: true },
    });
    if (!area) {
      throw new AssignmentServiceError(
        "Area pengembangan tidak ditemukan di yayasan ini",
        400,
      );
    }
  }

  if (refs.gradeTypeId) {
    const gradeType = await prisma.gradeType.findFirst({
      where: { id: refs.gradeTypeId, isActive: true },
      select: { id: true },
    });
    if (!gradeType) {
      throw new AssignmentServiceError("Jenis penilaian tidak ditemukan", 400);
    }
  }
}

/** Baca tugas dalam scope yayasan; 404 bila tidak ada / beda yayasan. */
export async function findAssignment(actor: DevelopmentActor, id: string) {
  const assignment = await prisma.assignment.findFirst({
    where: { id, class: { branch: { foundationId: actor.foundationId } } },
    include: assignmentInclude,
  });
  if (!assignment) {
    throw new AssignmentServiceError("Tugas tidak ditemukan", 404);
  }
  return assignment;
}

/**
 * Tugas hanya terlihat staf yang mengajar kelasnya, atau siswa di kelas itu
 * untuk tugas yang sudah dipublikasikan. Orang tua belum punya portal tugas.
 */
export async function assertAssignmentVisible(
  actor: DevelopmentActor,
  assignment: AssignmentFull,
) {
  if (actor.isStaff) {
    if (
      actor.roleName === "teacher" &&
      assignment.teacherId !== actor.userDataId
    ) {
      throw new AssignmentServiceError("Anda tidak mengajar tugas ini", 403);
    }
    await unwrapClass(await assertClassAccess(actor, assignment.classId));
    return;
  }

  if (actor.isStudent) {
    if (!assignment.isActive || !assignment.isPublished) {
      throw new AssignmentServiceError("Tugas tidak ditemukan", 404);
    }
    if (!actor.userDataId || actor.classId !== assignment.classId) {
      throw new AssignmentServiceError("Tugas ini bukan untuk kelas Anda", 403);
    }
    return;
  }

  throw new AssignmentServiceError("Akses ditolak", 403);
}

/** Syarat tugas boleh dikumpulkan siswa. */
async function assertSubmittable(
  actor: DevelopmentActor,
  assignment: AssignmentFull,
) {
  if (!actor.isStudent || !actor.userDataId) {
    throw new AssignmentServiceError(
      "Hanya siswa yang dapat mengirim tugas",
      403,
    );
  }
  if (!actor.classId || actor.classId !== assignment.classId) {
    throw new AssignmentServiceError("Tugas ini bukan untuk kelas Anda", 403);
  }
  if (!assignment.isActive || !assignment.isPublished) {
    throw new AssignmentServiceError("Tugas belum dipublikasikan", 403);
  }
  const now = new Date();
  const isLate = now > assignment.dueDate;
  if (isLate && !assignment.allowLateSubmission) {
    throw new AssignmentServiceError("Tenggat pengumpulan sudah lewat", 400);
  }
  return { isLate, now };
}

export async function createAssignment(
  actor: DevelopmentActor,
  input: AssignmentInput,
): Promise<AssignmentFull> {
  const actorId = actor.userDataId;
  if (!actorId) {
    throw new AssignmentServiceError(
      "Akun tidak terhubung ke data pengguna",
      400,
    );
  }
  const schedule = await assertScheduleOwned(actor, input.scheduleId);

  await assertAssignmentRefs(actor.foundationId, {
    subjectId: schedule.subjectId,
    indicatorId: input.indicatorId,
    developmentAreaId: input.developmentAreaId,
    gradeTypeId: input.gradeTypeId,
  });

  const assignedDate = input.assignedDate ?? new Date();
  if (input.dueDate <= assignedDate) {
    throw new AssignmentServiceError(
      "Tenggat harus setelah tanggal pemberian tugas",
      400,
    );
  }

  return prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.create({
      data: {
        scheduleId: schedule.id,
        classId: schedule.classId as string,
        subjectId: schedule.subjectId,
        teacherId: schedule.teacherId,
        title: input.title,
        description: input.description,
        attachments: input.attachments.length
          ? (input.attachments as unknown as Prisma.InputJsonValue)
          : undefined,
        assignedDate,
        dueDate: input.dueDate,
        allowLateSubmission: input.allowLateSubmission,
        maxScore: input.maxScore,
        gradeTypeId: input.gradeTypeId ?? null,
        developmentAreaId: input.developmentAreaId ?? null,
        indicatorId: input.indicatorId ?? null,
        isPublished: input.isPublished,
        createdBy: actorId,
      },
      include: assignmentInclude,
    });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "assignment.created",
      entity: "Assignment",
      entityId: assignment.id,
      after: assignment,
    });

    return assignment;
  });
}

export async function updateAssignment(
  actor: DevelopmentActor,
  id: string,
  input: AssignmentUpdateInput,
) {
  const existing = await findAssignment(actor, id);
  await assertStaffOwnsAssignment(actor, existing);

  // Nilai `null`/`undefined` berarti dikosongkan — tidak ada yang divalidasi.
  await assertAssignmentRefs(actor.foundationId, {
    indicatorId: input.indicatorId,
    developmentAreaId: input.developmentAreaId,
    gradeTypeId: input.gradeTypeId,
  });

  const dueDate = input.dueDate ?? existing.dueDate;
  const assignedDate = input.assignedDate ?? existing.assignedDate;
  if (dueDate <= assignedDate) {
    throw new AssignmentServiceError(
      "Tenggat harus setelah tanggal pemberian tugas",
      400,
    );
  }

  return prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.attachments !== undefined
          ? {
              attachments: input.attachments.length
                ? (input.attachments as unknown as Prisma.InputJsonValue)
                : Prisma.DbNull,
            }
          : {}),
        ...(input.assignedDate !== undefined ? { assignedDate } : {}),
        ...(input.dueDate !== undefined ? { dueDate } : {}),
        ...(input.allowLateSubmission !== undefined
          ? { allowLateSubmission: input.allowLateSubmission }
          : {}),
        ...(input.maxScore !== undefined ? { maxScore: input.maxScore } : {}),
        ...(input.gradeTypeId !== undefined
          ? { gradeTypeId: input.gradeTypeId ?? null }
          : {}),
        ...(input.developmentAreaId !== undefined
          ? { developmentAreaId: input.developmentAreaId ?? null }
          : {}),
        ...(input.indicatorId !== undefined
          ? { indicatorId: input.indicatorId ?? null }
          : {}),
        ...(input.isPublished !== undefined
          ? { isPublished: input.isPublished }
          : {}),
      },
      include: assignmentInclude,
    });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "assignment.updated",
      entity: "Assignment",
      entityId: assignment.id,
      before: existing,
      after: assignment,
    });

    return assignment;
  });
}

/**
 * Hapus lunak (`isActive: false`): nilai & evidence pengumpulan adalah catatan
 * akademik, jadi barisnya tidak boleh ikut terhapus.
 */
export async function deleteAssignment(actor: DevelopmentActor, id: string) {
  const existing = await findAssignment(actor, id);
  await assertStaffOwnsAssignment(actor, existing);

  return prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.update({
      where: { id },
      data: { isActive: false, isPublished: false },
      include: assignmentInclude,
    });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "assignment.deleted",
      entity: "Assignment",
      entityId: assignment.id,
      before: existing,
      after: assignment,
    });

    return assignment;
  });
}

/** Daftar pengumpulan: staf melihat semua, siswa hanya miliknya. */
export async function listSubmissions(
  actor: DevelopmentActor,
  assignmentId: string,
) {
  const assignment = await findAssignment(actor, assignmentId);
  await assertAssignmentVisible(actor, assignment);

  return prisma.assignmentSubmission.findMany({
    where: {
      assignmentId: assignment.id,
      ...(actor.isStudent ? { studentId: actor.userDataId ?? "" } : {}),
    },
    include: submissionInclude,
    orderBy: { submittedAt: "desc" },
  });
}

export async function createSubmission(
  actor: DevelopmentActor,
  assignmentId: string,
  input: AssignmentSubmissionInput,
) {
  const assignment = await findAssignment(actor, assignmentId);
  const { isLate, now } = await assertSubmittable(actor, assignment);
  const studentId = actor.userDataId as string;

  const existing = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    select: { id: true },
  });
  if (existing) {
    throw new AssignmentServiceError("Anda sudah mengirim tugas ini", 409);
  }

  return prisma.$transaction(async (tx) => {
    const submission = await tx.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        notes: input.notes ?? null,
        attachments: input.attachments.length
          ? (input.attachments as unknown as Prisma.InputJsonValue)
          : undefined,
        submittedAt: now,
        isLate,
        status: "submitted",
      },
      include: submissionInclude,
    });

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "submission.created",
      entity: "AssignmentSubmission",
      entityId: submission.id,
      after: submission,
    });

    return submission;
  });
}

/**
 * Nilai pengumpulan: menulis `AssignmentSubmission` DAN meng-upsert baris
 * `Grade` (kunci unik studentId+scheduleId+gradeTypeId+title) dalam satu
 * transaksi, plus menautkan `Evidence` LINK bila tugas punya indikator.
 * `StudentAssessment` sengaja tidak disentuh — guru memutuskan di matriks.
 */
export async function gradeSubmission(
  actor: DevelopmentActor,
  assignmentId: string,
  submissionId: string,
  input: AssignmentGradeInput,
) {
  const assignment = await findAssignment(actor, assignmentId);
  await assertStaffOwnsAssignment(actor, assignment);

  const graderId = actor.userDataId;
  if (!graderId) {
    throw new AssignmentServiceError(
      "Akun tidak terhubung ke data pengguna",
      400,
    );
  }
  if (!input.gradeTypeId) {
    throw new AssignmentServiceError("Jenis penilaian wajib dipilih", 400);
  }
  await assertAssignmentRefs(actor.foundationId, {
    gradeTypeId: input.gradeTypeId,
  });

  const submission = await prisma.assignmentSubmission.findFirst({
    where: { id: submissionId, assignmentId: assignment.id },
    select: { id: true, studentId: true },
  });
  if (!submission) {
    throw new AssignmentServiceError("Pengumpulan tugas tidak ditemukan", 404);
  }

  const maxScore = Number(assignment.maxScore);
  if (input.score > maxScore) {
    throw new AssignmentServiceError(
      `Nilai tidak boleh melebihi ${maxScore}`,
      400,
    );
  }

  const now = new Date();
  const gradeTypeId = input.gradeTypeId;

  return prisma.$transaction(async (tx) => {
    const graded = await tx.assignmentSubmission.update({
      where: { id: submission.id },
      data: {
        score: input.score,
        feedback: input.feedback ?? null,
        gradedAt: now,
        gradedBy: graderId,
        status: "graded",
      },
      include: submissionInclude,
    });

    const grade = await tx.grade.upsert({
      where: {
        studentId_scheduleId_gradeTypeId_title: {
          studentId: submission.studentId,
          scheduleId: assignment.scheduleId,
          gradeTypeId,
          title: assignment.title,
        },
      },
      create: {
        studentId: submission.studentId,
        scheduleId: assignment.scheduleId,
        subjectId: assignment.subjectId,
        score: input.score,
        maxScore,
        description: `Tugas: ${assignment.title}`,
        date: now,
        createdBy: graderId,
        gradeTypeId,
        title: assignment.title,
      },
      update: { score: input.score, maxScore, date: now },
      select: {
        id: true,
        studentId: true,
        scheduleId: true,
        subjectId: true,
        gradeTypeId: true,
        title: true,
        score: true,
        maxScore: true,
        date: true,
        createdBy: true,
      },
    });

    // Bukti LINK hanya dibuat bila tugas ditautkan ke indikator pengembangan.
    let evidence = null;
    if (assignment.indicatorId) {
      const url = "/dashboard/student/development/assignments";
      const title = `Tugas: ${assignment.title}`;
      const current = await tx.evidence.findFirst({
        where: { submissionId: submission.id },
        select: { id: true },
      });
      evidence = current
        ? await tx.evidence.update({
            where: { id: current.id },
            data: {
              type: "LINK",
              url,
              title,
              description: input.feedback ?? null,
            },
          })
        : await tx.evidence.create({
            data: {
              submissionId: submission.id,
              type: "LINK",
              url,
              title,
              description: input.feedback ?? null,
              uploadedById: graderId,
            },
          });
    }

    await writeAudit(tx, {
      foundationId: actor.foundationId,
      actorId: actor.userId,
      action: "submission.graded",
      entity: "AssignmentSubmission",
      entityId: graded.id,
      before: { score: null, status: "submitted" },
      after: { score: graded.score, status: graded.status, gradeId: grade.id },
    });

    return { submission: graded, grade, evidence };
  });
}
