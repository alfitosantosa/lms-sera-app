import {
  examError,
  findExamInTenant,
  resolveExamActor,
} from "@/lib/exam/exam.guard";
import { toStudentResultDTO } from "@/lib/exam/exam.mapper";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> },
) {
  const auth = await resolveExamActor(request);
  if (!auth.ok) return auth.response;

  const { id, attemptId } = await params;
  const { actor } = auth;

  try {
    const exam = await findExamInTenant(id, actor.foundationId);
    if (!exam) return examError("Ujian tidak ditemukan", 404);

    const attempt = await prisma.examAttempt.findFirst({
      where: { id: attemptId, examId: exam.id },
      select: {
        id: true,
        examId: true,
        studentId: true,
        attemptNumber: true,
        status: true,
        score: true,
        startedAt: true,
        submittedAt: true,
      },
    });
    if (!attempt) return examError("Pengerjaan ujian tidak ditemukan", 404);

    const isOwner =
      actor.userDataId !== null && actor.userDataId === attempt.studentId;
    if (!actor.isStaff && !isOwner) {
      return examError("Anda tidak berhak mengakses pengerjaan ini", 403);
    }
    if (attempt.status === "IN_PROGRESS") {
      return examError("Ujian belum dikumpulkan", 409);
    }

    const [questions, answers] = await Promise.all([
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
              options: { select: { id: true, option: true, text: true, isCorrect: true } },
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
          isCorrect: true,
          points: true,
        },
      }),
    ]);

    const essayQuestionIds = new Set(
      questions
        .filter((row) => row.question.type === "ESSAY")
        .map((row) => row.question.id),
    );
    const needsManualGrading = answers.some(
      (answer) =>
        essayQuestionIds.has(answer.questionId) &&
        Boolean(answer.answerText?.trim()),
    );

    return NextResponse.json(
      toStudentResultDTO({
        attempt,
        exam: { title: exam.title, passingScore: exam.passingScore },
        questions,
        answers,
        needsManualGrading,
      }),
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}
