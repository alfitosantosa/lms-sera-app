import {
  assessmentErrorResponse,
  getStudentOverview,
} from "@/lib/development/assessment.service";
import {
  developmentError,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ studentId: string }> };

/**
 * GET /api/development/students/[studentId]/overview
 * Ringkasan per area (skala terakhir & tertinggi). Orang tua/siswa hanya
 * melihat periode `PUBLISHED` (difilter di service).
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { studentId } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  if (!actor.isStaff && !actor.isParent && !actor.isStudent) {
    return developmentError("Akses ditolak", 403);
  }

  try {
    const data = await getStudentOverview(actor, studentId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
