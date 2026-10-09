import { examUpdateSchema } from "@/app/(types)/types/exam-types";
import {
  examError,
  findExamInTenant,
  requireStaff,
  requireStudent,
  resolveExamActor,
} from "@/lib/exam/exam.guard";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import type { Prisma } from "@/prisma/generated/client";
import { type NextRequest, NextResponse } from "next/server";
import { loadExamDetail } from "../examService";

/**
 * GET /api/exam/[id] — detail ujian (staff) atau soal tanpa kunci (siswa).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const actorResult = await resolveExamActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const { id } = await params;

  try {
    if (actor.isStudent) {
      const denied = requireStudent(actor);
      if (denied) return denied;
      if (!actor.userDataId) {
        return examError("Akun belum terhubung ke data sekolah", 403);
      }

      const [userData, detail] = await Promise.all([
        prisma.userData.findUnique({
          where: { id: actor.userDataId },
          select: { classId: true },
        }),
        loadExamDetail(id, actor.foundationId, true),
      ]);

      if (
        !detail ||
        detail.status !== "PUBLISHED" ||
        detail.classId !== userData?.classId
      ) {
        return examError("Ujian tidak ditemukan", 404);
      }

      return NextResponse.json(detail);
    }

    const denied = requireStaff(actor);
    if (denied) return denied;

    const detail = await loadExamDetail(id, actor.foundationId);
    if (!detail) return examError("Ujian tidak ditemukan", 404);
    return NextResponse.json(detail);
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** PUT /api/exam/[id] — ubah data ujian (staff). Status tidak dapat diubah di sini. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const actorResult = await resolveExamActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return examError("Body request tidak valid", 400);
  }

  const parsed = examUpdateSchema.safeParse(body);
  if (!parsed.success) return examError(parsed.error.issues[0].message, 400);
  const payload = parsed.data;

  let startAt: Date | null | undefined;
  if (payload.startAt !== undefined) {
    if (payload.startAt === null) {
      startAt = null;
    } else {
      const value = new Date(payload.startAt);
      if (Number.isNaN(value.getTime())) {
        return examError("Tanggal mulai tidak valid", 400);
      }
      startAt = value;
    }
  }

  let endAt: Date | null | undefined;
  if (payload.endAt !== undefined) {
    if (payload.endAt === null) {
      endAt = null;
    } else {
      const value = new Date(payload.endAt);
      if (Number.isNaN(value.getTime())) {
        return examError("Tanggal selesai tidak valid", 400);
      }
      endAt = value;
    }
  }

  try {
    const existing = await findExamInTenant(id, actor.foundationId);
    if (!existing) return examError("Ujian tidak ditemukan", 404);

    if (payload.classId !== undefined) {
      const ownedClass = await prisma.class.findFirst({
        where: {
          id: payload.classId,
          branch: { foundationId: actor.foundationId },
        },
        select: { id: true },
      });
      if (!ownedClass) {
        return examError(
          "Kelas atau mata pelajaran tidak ditemukan di yayasan ini",
          403,
        );
      }
    }

    if (payload.subjectId !== undefined) {
      const ownedSubject = await prisma.subject.findFirst({
        where: {
          id: payload.subjectId,
          OR: [{ branch: { foundationId: actor.foundationId } }, { branchId: null }],
        },
        select: { id: true },
      });
      if (!ownedSubject) {
        return examError(
          "Kelas atau mata pelajaran tidak ditemukan di yayasan ini",
          403,
        );
      }
    }

    const data: Prisma.ExamUpdateInput = {};
    if (payload.title !== undefined) data.title = payload.title;
    if (payload.description !== undefined) {
      data.description = payload.description ?? null;
    }
    if (payload.classId !== undefined) data.classId = payload.classId;
    if (payload.subjectId !== undefined) data.subjectId = payload.subjectId;
    if (payload.majorId !== undefined) data.majorId = payload.majorId ?? null;
    if (payload.duration !== undefined) data.duration = payload.duration ?? null;
    if (payload.passingScore !== undefined) {
      data.passingScore = payload.passingScore ?? null;
    }
    if (startAt !== undefined) data.startAt = startAt;
    if (endAt !== undefined) data.endAt = endAt;

    await prisma.exam.update({ where: { id }, data });

    const detail = await loadExamDetail(id, actor.foundationId);
    if (!detail) return examError("Ujian tidak ditemukan", 404);
    return NextResponse.json(detail);
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** DELETE /api/exam/[id] — hapus ujian yang belum pernah dikerjakan (staff). */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const actorResult = await resolveExamActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const { id } = await params;

  try {
    const existing = await findExamInTenant(id, actor.foundationId);
    if (!existing) return examError("Ujian tidak ditemukan", 404);

    const attemptCount = await prisma.examAttempt.count({ where: { examId: id } });
    if (attemptCount > 0) {
      return examError(
        "Ujian sudah memiliki pengerjaan siswa dan tidak dapat dihapus",
        409,
      );
    }

    await prisma.exam.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: "Ujian berhasil dihapus",
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
