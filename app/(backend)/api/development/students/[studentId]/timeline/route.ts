import {
  dailyLogErrorResponse,
  getStudentTimeline,
  parseDateParam,
} from "@/lib/development/daily-log.service";
import {
  developmentError,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ studentId: string }> };

/**
 * GET /api/development/students/[studentId]/timeline?fromdate=&todate=
 * Timeline gabungan log + observasi + bukti. Orang tua & siswa hanya
 * menerima entri dengan `parentVisible: true` (difilter di service).
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { studentId } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  if (!actor.isStaff && !actor.isParent && !actor.isStudent) {
    return developmentError("Akses ditolak", 403);
  }

  const { searchParams } = new URL(request.url);

  try {
    const data = await getStudentTimeline(actor, studentId, {
      fromDate: parseDateParam(searchParams.get("fromdate")),
      toDate: parseDateParam(searchParams.get("todate")),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return dailyLogErrorResponse(error);
  }
}
