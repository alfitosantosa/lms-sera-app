import { findExamInTenant, examError, requireStaff, resolveExamActor } from "@/lib/exam/exam.guard";
import { toExamQuestionItem } from "@/lib/exam/exam.mapper";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { questionInputSchema } from "@/app/(types)/types/exam-types";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/exam/[id]/question
 * Menambahkan soal baru ke ujian (hanya saat status DRAFT).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
    const created = await prisma.$transaction(async (tx) => {
      const createdQuestion = await tx.question.create({
        data: { type, question, imageUrl: imageUrl ?? null, points },
      });

      await tx.questionOption.createMany({
        data: options.map((option) => ({
          questionId: createdQuestion.id,
          option: option.option,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      });

      const maxOrder = await tx.examQuestion.aggregate({
        where: { examId: id },
        _max: { order: true },
      });
      const order = (maxOrder._max.order ?? 0) + 1;

      return tx.examQuestion.create({
        data: {
          examId: id,
          questionId: createdQuestion.id,
          order,
          points,
        },
        include: { question: { include: { options: true } } },
      });
    });

    return NextResponse.json(toExamQuestionItem(created), { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
