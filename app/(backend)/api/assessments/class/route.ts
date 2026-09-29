import {
  assessmentErrorResponse,
  getClassMatrix,
} from "@/lib/development/assessment.service";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/assessments/class?classId=&periodId=&areaId=&indicatorId=
 * Data matriks untuk UI bulk: daftar indikator + baris siswa + nilai per sel.
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const periodId = searchParams.get("periodId");
  if (!classId || !periodId) {
    return developmentError("Kelas dan periode wajib dipilih", 400);
  }

  try {
    const data = await getClassMatrix(actor, {
      classId,
      periodId,
      areaId: searchParams.get("areaId") ?? undefined,
      indicatorId: searchParams.get("indicatorId") ?? undefined,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
