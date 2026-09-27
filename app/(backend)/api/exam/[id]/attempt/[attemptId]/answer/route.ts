import {
  examError,
  findExamInTenant,
  requireStudent,
  resolveExamActor,
} from "@/lib/exam/exam.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { answerInputSchema } from "@/app/(types)/types/exam-types";
import { type NextRequest, NextResponse } from "next/server";

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

    const attempt = await prisma.examAttempt.findFirst({
      where: { id: attemptId, examId: exam.id },
      select: { id: true, studentId: true, status: true },
    });
    if (!attempt) return examError("Pengerjaan ujian tidak ditemukan", 404);
    if (attempt.studentId !== studentId) {
      return examError("Anda tidak berhak mengakses pengerjaan ini", 403);
    }
    if (attempt.status !== "IN_PROGRESS") {
      return examError("Ujian sudah dikumpulkan", 409);
    }

    const body = await request.json().catch(() => null);
    const parsed = answerInputSchema.safeParse(body);
    if (!parsed.success) {
      return examError(parsed.error.issues[0].message, 400);
    }
    const { questionId, selectedOptionId, answerText } = parsed.data;

    const examQuestion = await prisma.examQuestion.findFirst({
      where: { examId: exam.id, questionId },
      select: { question: { select: { type: true } } },
    });
    if (!examQuestion) {
      return examError("Soal tidak ditemukan pada ujian ini", 400);
    }

    const text = answerText?.trim() ?? "";
    // Kedua field kosong = siswa menghapus jawabannya.
    if (!selectedOptionId && text.length === 0) {
      await prisma.examAnswer.deleteMany({
        where: { attemptId: attempt.id, questionId },
      });
      return NextResponse.json({
        questionId,
        selectedOptionId: null,
        answerText: null,
      });
    }

    let data: { selectedOptionId: string | null; answerText: string | null };
    if (examQuestion.question.type === "ESSAY") {
      if (text.length === 0) return examError("Jawaban essay wajib diisi", 400);
      data = { selectedOptionId: null, answerText: text };
    } else {
      if (!selectedOptionId) {
        return examError("Pilihan jawaban wajib diisi", 400);
      }
      const option = await prisma.questionOption.findFirst({
        where: { id: selectedOptionId, questionId },
        select: { id: true },
      });
      if (!option) return examError("Pilihan jawaban tidak valid", 400);
      data = { selectedOptionId, answerText: null };
    }

    const saved = await prisma.examAnswer.upsert({
      where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
      create: { attemptId: attempt.id, questionId, ...data },
      update: data,
      select: {
        id: true,
        questionId: true,
        selectedOptionId: true,
        answerText: true,
      },
    });

    return NextResponse.json(saved);
  } catch (error) {
    return handlePrismaError(error);
  }
}
