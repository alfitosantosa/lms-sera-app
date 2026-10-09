import {
  examError,
  requireStudent,
  resolveExamActor,
} from "@/lib/exam/exam.guard";
import { toStudentSessionDTO } from "@/lib/exam/exam.mapper";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
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
  const { foundationId } = auth.actor;
  const studentId = auth.actor.userDataId;

  try {
    const exam = await prisma.exam.findFirst({
      where: { id, foundationId },
      select: {
        id: true,
        title: true,
        description: true,
        duration: true,
        passingScore: true,
        endAt: true,
        classId: true,
        subjectId: true,
      },
    });
    if (!exam) return examError("Ujian tidak ditemukan", 404);

    const attempt = await prisma.examAttempt.findFirst({
      where: { examId: exam.id, studentId, status: "IN_PROGRESS" },
      select: {
        id: true,
        examId: true,
        attemptNumber: true,
        status: true,
        score: true,
        startedAt: true,
        submittedAt: true,
      },
    });
    if (!attempt) {
      return examError("Tidak ada pengerjaan ujian yang sedang berjalan", 404);
    }

    const [questions, answers, className, subjectName] = await Promise.all([
      prisma.examQuestion.findMany({
        where: { examId: exam.id },
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          points: true,
          question: {
            select: {
              id: true,
              type: true,
              question: true,
              imageUrl: true,
              points: true,
              options: {
                select: { id: true, option: true, text: true, isCorrect: true },
                orderBy: { option: "asc" },
              },
            },
          },
        },
      }),
      prisma.examAnswer.findMany({
        where: { attemptId: attempt.id },
        select: {
          questionId: true,
          selectedOptionId: true,
          answerText: true,
        },
      }),
      exam.classId
        ? prisma.class
            .findFirst({
              where: { id: exam.classId, branch: { foundationId } },
              select: { name: true },
            })
            .then((row) => row?.name ?? null)
        : Promise.resolve(null),
      exam.subjectId
        ? prisma.subject
            .findFirst({
              where: {
                id: exam.subjectId,
                OR: [{ branch: { foundationId } }, { branchId: null }],
              },
              select: { name: true },
            })
            .then((row) => row?.name ?? null)
        : Promise.resolve(null),
    ]);

    const remainingSeconds =
      exam.duration === null
        ? null
        : Math.max(
            0,
            Math.floor(
              (attempt.startedAt.getTime() +
                exam.duration * 60_000 -
                Date.now()) /
                1000,
            ),
          );

    return NextResponse.json(
      toStudentSessionDTO({
        attempt,
        exam: { ...exam, className, subjectName },
        questions,
        answers,
        remainingSeconds,
      }),
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}
