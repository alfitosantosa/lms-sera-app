import { findExamInTenant, examError, requireStaff, resolveExamActor } from "@/lib/exam/exam.guard";
import { toExamQuestionItem } from "@/lib/exam/exam.mapper";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { questionInputSchema } from "@/app/(types)/types/exam-types";
import { type NextRequest, NextResponse } from "next/server";

/**
 * PUT /api/exam/[id]/question/[questionId]
 * Mengubah soal ujian (hanya saat status DRAFT). Opsi diganti seluruhnya.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  const { id, questionId } = await params;

  const actorResult = await resolveExamActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const exam = await findExamInTenant(id, actor.foundationId);
  if (!exam) return examError("Ujian tidak ditemukan", 404);

  if (exam.status !== "DRAFT") {
    return examError("Soal hanya dapat diubah saat ujian berstatus draft", 409);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return examError("Body request tidak valid", 400);
  }

  const parsed = questionInputSchema.safeParse(body);
  if (!parsed.success) return examError(parsed.error.issues[0].message, 400);

  const { type, question, imageUrl, points, options } = parsed.data;

  try {
    const existing = await prisma.examQuestion.findFirst({
      where: { examId: id, questionId },
      select: { id: true },
    });
    if (!existing) return examError("Soal tidak ditemukan", 404);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id: questionId },
        data: { type, question, imageUrl: imageUrl ?? null, points },
      });

      await tx.questionOption.deleteMany({ where: { questionId } });
      await tx.questionOption.createMany({
        data: options.map((option) => ({
          questionId,
          option: option.option,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      });

      await tx.examQuestion.update({
        where: { examId_questionId: { examId: id, questionId } },
        data: { points },
      });

      return tx.examQuestion.findUniqueOrThrow({
        where: { examId_questionId: { examId: id, questionId } },
        include: { question: { include: { options: true } } },
      });
    });

    return NextResponse.json(toExamQuestionItem(updated));
  } catch (error) {
    return handlePrismaError(error);
  }
}

/**
 * DELETE /api/exam/[id]/question/[questionId]
 * Menghapus soal dari ujian (hanya saat status DRAFT).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> },
) {
  const { id, questionId } = await params;

  const actorResult = await resolveExamActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const exam = await findExamInTenant(id, actor.foundationId);
  if (!exam) return examError("Ujian tidak ditemukan", 404);

  if (exam.status !== "DRAFT") {
    return examError("Soal hanya dapat diubah saat ujian berstatus draft", 409);
  }

  try {
    const existing = await prisma.examQuestion.findFirst({
      where: { examId: id, questionId },
      select: { id: true },
    });
    if (!existing) return examError("Soal tidak ditemukan", 404);

    await prisma.$transaction([
      prisma.examQuestion.delete({
        where: { examId_questionId: { examId: id, questionId } },
      }),
      prisma.question.delete({ where: { id: questionId } }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Soal berhasil dihapus",
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
