import {
  examError,
  findExamInTenant,
  requireStudent,
  resolveExamActor,
} from "@/lib/exam/exam.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";
import { type NextRequest, NextResponse } from "next/server";

const ATTEMPT_SELECT = {
  id: true,
  examId: true,
  attemptNumber: true,
  status: true,
  startedAt: true,
  submittedAt: true,
  score: true,
} as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveExamActor(request);
  if (!auth.ok) return auth.response;

  const denied = requireStudent(auth.actor);
  if (denied) return denied;
  if (!auth.actor.userDataId) {
    return examError("Akun belum terhubung ke data sekolah", 403);
  }

  const { id } = await params;
  const studentId = auth.actor.userDataId;

  try {
    const exam = await findExamInTenant(id, auth.actor.foundationId);
    if (!exam) return examError("Ujian tidak ditemukan", 404);

    if (exam.status === "DRAFT") {
      return examError("Ujian belum dipublikasikan", 400);
    }
    if (exam.status === "CLOSED") {
      return examError("Ujian sudah ditutup", 400);
    }

    const now = new Date();
    if (exam.startAt && now < exam.startAt) {
      return examError("Ujian belum dimulai", 400);
    }
    if (exam.endAt && now > exam.endAt) {
      return examError("Ujian sudah berakhir", 400);
    }

    if (exam.classId) {
      const student = await prisma.userData.findUnique({
        where: { id: studentId },
        select: { classId: true },
      });
      if (student?.classId !== exam.classId) {
        return examError("Ujian ini bukan untuk kelas Anda", 403);
      }
    }

    const existing = await prisma.examAttempt.findFirst({
      where: { examId: exam.id, studentId, status: "IN_PROGRESS" },
      select: ATTEMPT_SELECT,
    });
    if (existing) return NextResponse.json(existing);

    const attemptCount = await prisma.examAttempt.count({
      where: { examId: exam.id, studentId },
    });

    try {
      const created = await prisma.examAttempt.create({
        data: {
          examId: exam.id,
          studentId,
          attemptNumber: attemptCount + 1,
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
        select: ATTEMPT_SELECT,
      });
      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      // Dua request start bersamaan dapat memicu pelanggaran unique
      // (examId, studentId, attemptNumber) — cukup ambil attempt yang menang.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const retried = await prisma.examAttempt.findFirst({
          where: { examId: exam.id, studentId, status: "IN_PROGRESS" },
          select: ATTEMPT_SELECT,
        });
        if (retried) return NextResponse.json(retried);
      }
      throw error;
    }
  } catch (error) {
    return handlePrismaError(error);
  }
}
