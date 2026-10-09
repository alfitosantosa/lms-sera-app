import {
  examError,
  findExamInTenant,
  requireStudent,
  resolveExamActor,
} from "@/lib/exam/exam.guard";
import { gradeAttempt } from "@/lib/exam/exam.grading";
import { toStudentResultDTO } from "@/lib/exam/exam.mapper";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { type NextRequest, NextResponse } from "next/server";

const ATTEMPT_SELECT = {
  id: true,
  examId: true,
  attemptNumber: true,
  status: true,
  score: true,
  startedAt: true,
  submittedAt: true,
} as const;

/** Guard yang harus menggagalkan transaksi sekaligus mengembalikan status HTTP. */
class SubmitGuardError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> },
) {
  const auth = await resolveExamActor(request);
  if (!auth.ok) return auth.response;

  const denied = requireStudent(auth.actor);
  if (denied) return denied;
  if (!auth.actor.userDataId) {
    return examError("Akun belum terhubung ke data sekolah", 403);
  }

  const { id, attemptId } = await params;
  const studentId = auth.actor.userDataId;

  try {
    const exam = await findExamInTenant(id, auth.actor.foundationId);
    if (!exam) return examError("Ujian tidak ditemukan", 404);

    // ponytail: expiry ditegakkan oleh timer di client; server menerima submit
    // terlambat supaya browser yang crash tidak menghilangkan pekerjaan siswa.
    const dto = await prisma.$transaction(
      async (tx) => {
        const attempt = await tx.examAttempt.findFirst({
          where: { id: attemptId, examId: exam.id },
          select: { ...ATTEMPT_SELECT, studentId: true },
        });
        if (!attempt) {
          throw new SubmitGuardError(404, "Pengerjaan ujian tidak ditemukan");
        }
        if (attempt.studentId !== studentId) {
          throw new SubmitGuardError(
            403,
            "Anda tidak berhak mengakses pengerjaan ini",
          );
        }
        if (attempt.status !== "IN_PROGRESS") {
          throw new SubmitGuardError(409, "Ujian sudah dikumpulkan");
        }

        const questions = await tx.examQuestion.findMany({
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
        });

        const storedAnswers = await tx.examAnswer.findMany({
          where: { attemptId: attempt.id },
          select: {
            id: true,
            questionId: true,
            selectedOptionId: true,
            answerText: true,
          },
        });

        const grading = gradeAttempt(
          questions.map((row) => ({
            questionId: row.question.id,
            type: row.question.type,
            points: row.points,
            correctOptionId:
              row.question.options.find((option) => option.isCorrect)?.id ??
              null,
          })),
          storedAnswers.map((row) => ({
            questionId: row.questionId,
            selectedOptionId: row.selectedOptionId,
            answerText: row.answerText,
          })),
        );

        const storedByQuestionId = new Map(
          storedAnswers.map((row) => [row.questionId, row.id]),
        );
        for (const graded of grading.graded) {
          // Essay (isCorrect null) dinilai manual, bukan auto-grade.
          if (graded.isCorrect === null) continue;
          const answerId = storedByQuestionId.get(graded.questionId);
          if (!answerId) continue;
          await tx.examAnswer.update({
            where: { id: answerId },
            data: { isCorrect: graded.isCorrect, points: graded.points },
          });
        }

        const updated = await tx.examAttempt.update({
          where: { id: attempt.id },
          data: {
            score: grading.totalScore,
            submittedAt: new Date(),
            status: grading.needsManualGrading ? "SUBMITTED" : "GRADED",
          },
          select: ATTEMPT_SELECT,
        });

        const answers = await tx.examAnswer.findMany({
          where: { attemptId: attempt.id },
          select: {
            questionId: true,
            selectedOptionId: true,
            answerText: true,
            isCorrect: true,
            points: true,
          },
        });

        return toStudentResultDTO({
          attempt: updated,
          exam: { title: exam.title, passingScore: exam.passingScore },
          questions,
          answers,
          needsManualGrading: grading.needsManualGrading,
        });
      },
      { timeout: 15000 },
    );

    return NextResponse.json(dto);
  } catch (error) {
    if (error instanceof SubmitGuardError) {
      return examError(error.message, error.status);
    }
    return handlePrismaError(error);
  }
}
