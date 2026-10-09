import {
  examError,
  findExamInTenant,
  requireStaff,
  resolveExamActor,
} from "@/lib/exam/exam.guard";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { loadExamDetail } from "../../examService";

/** POST /api/exam/[id]/close — tutup ujian yang sedang berjalan (staff). */
export async function POST(
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

    if (existing.status === "DRAFT") {
      return examError("Ujian belum dipublikasikan", 409);
    }
    if (existing.status === "CLOSED") {
      return examError("Ujian sudah ditutup", 409);
    }

    await prisma.exam.update({ where: { id }, data: { status: "CLOSED" } });

    const detail = await loadExamDetail(id, actor.foundationId);
    if (!detail) return examError("Ujian tidak ditemukan", 404);
    return NextResponse.json(detail);
  } catch (error) {
    return handlePrismaError(error);
  }
}
