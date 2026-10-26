import { bootstrapGradeTypes } from "@/services/development/development.defaults";
import {
  requireStaff,
  resolveDevelopmentActor,
} from "@/services/development/development.guard";
import { handlePrismaError } from "@/services/errorHandler";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/grade-types/bootstrap
 * Isi jenis penilaian default ("Tugas") bila belum ada. Idempotent: aman
 * dipanggil berulang. Dipisah dari GET supaya baca daftar tidak pernah
 * menulis ke tabel global `grade_types`.
 */
export async function POST(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const created = await bootstrapGradeTypes();
    return NextResponse.json({ success: true, created });
  } catch (error) {
    return handlePrismaError(error);
  }
}
