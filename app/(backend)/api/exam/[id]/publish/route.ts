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

/** POST /api/exam/[id]/publish — terbitkan ujian draft (staff). */
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

    if (existing.status === "PUBLISHED") {
      return examError("Ujian sudah dipublikasikan", 409);
    }
    if (existing.status === "CLOSED") {
      return examError("Ujian sudah ditutup", 409);
    }

    const check = await prisma.exam.findFirst({
      where: { id, foundationId: actor.foundationId },
      select: {
        title: true,
        classId: true,
        subjectId: true,
        _count: { select: { questions: true } },
      },
    });
    if (!check) return examError("Ujian tidak ditemukan", 404);

    if (!check.title.trim()) {
      return examError("Judul ujian wajib diisi", 400);
    }
    if (!check.classId) {
      return examError("Kelas ujian wajib dipilih", 400);
    }
    if (!check.subjectId) {
      return examError("Mata pelajaran ujian wajib dipilih", 400);
    }
    if (check._count.questions < 1) {
      return examError("Ujian harus memiliki minimal 1 soal", 400);
    }
    if (!existing.duration || existing.duration <= 0) {
      return examError("Durasi ujian harus lebih dari 0 menit", 400);
    }
    if (
      existing.passingScore === null ||
      existing.passingScore < 0 ||
      existing.passingScore > 100
    ) {
      return examError("Nilai kelulusan harus antara 0 dan 100", 400);
    }

    await prisma.exam.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });

    const detail = await loadExamDetail(id, actor.foundationId);
    if (!detail) return examError("Ujian tidak ditemukan", 404);
    return NextResponse.json(detail);
  } catch (error) {
    return handlePrismaError(error);
  }
}
