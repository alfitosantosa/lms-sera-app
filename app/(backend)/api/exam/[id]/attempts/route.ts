import {
  examError,
  findExamInTenant,
  requireStaff,
  resolveExamActor,
} from "@/lib/exam/exam.guard";
import { isPassed } from "@/lib/exam/exam.grading";
import type {
  ExamResultsDTO,
  ExamResultRowDTO,
} from "@/app/(types)/types/exam-types";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await resolveExamActor(request);
  if (!auth.ok) return auth.response;

  const denied = requireStaff(auth.actor);
  if (denied) return denied;

  const { id } = await params;

  try {
    const exam = await findExamInTenant(id, auth.actor.foundationId);
    if (!exam) return examError("Ujian tidak ditemukan", 404);

    const [examQuestions, attempts, pendingEssays] = await Promise.all([
      prisma.examQuestion.findMany({
        where: { examId: exam.id },
        select: { points: true },
      }),
      prisma.examAttempt.findMany({
        where: { examId: exam.id },
        select: {
          id: true,
          status: true,
          score: true,
          submittedAt: true,
          student: {
            select: {
              id: true,
              name: true,
              nisn: true,
              class: { select: { name: true } },
            },
          },
        },
      }),
      // Attempt dengan essay yang belum dikoreksi -> pass/fail belum bisa ditentukan.
      prisma.examAnswer.findMany({
        where: {
          attempt: { examId: exam.id, status: "SUBMITTED" },
          question: { type: "ESSAY" },
        },
        select: { attemptId: true, answerText: true },
      }),
    ]);

    const maxScore = examQuestions.reduce((sum, row) => sum + row.points, 0);
    const pendingGradingAttemptIds = new Set(
      pendingEssays
        .filter((answer) => answer.answerText?.trim())
        .map((answer) => answer.attemptId),
    );

    const rows: ExamResultRowDTO[] = attempts.map((attempt) => ({
      attemptId: attempt.id,
      studentId: attempt.student.id,
      studentName: attempt.student.name,
      nisn: attempt.student.nisn,
      className: attempt.student.class?.name ?? null,
      status: attempt.status,
      score: attempt.score,
      submittedAt: attempt.submittedAt
        ? attempt.submittedAt.toISOString()
        : null,
      needsManualGrading: pendingGradingAttemptIds.has(attempt.id),
      passed: isPassed(
        attempt.score,
        maxScore,
        exam.passingScore,
        pendingGradingAttemptIds.has(attempt.id),
      ),
    }));
    rows.sort((a, b) => a.studentName.localeCompare(b.studentName, "id"));

    const attemptedStudentIds = new Set(rows.map((row) => row.studentId));
    const notAttempted = exam.classId
      ? (
          await prisma.userData.findMany({
            where: { classId: exam.classId, role: { name: "Student" } },
            select: { id: true, name: true, nisn: true },
          })
        )
          .filter((student) => !attemptedStudentIds.has(student.id))
          .map((student) => ({
            studentId: student.id,
            studentName: student.name,
            nisn: student.nisn,
          }))
      : [];

    const dto: ExamResultsDTO = {
      exam: {
        id: exam.id,
        title: exam.title,
        status: exam.status,
        passingScore: exam.passingScore,
        maxScore,
      },
      notAttempted,
      rows,
    };
    return NextResponse.json(dto);
  } catch (error) {
    return handlePrismaError(error);
  }
}
