import { getClassProgress } from "@/lib/development/class-progress.service";
import { dailyLogErrorResponse } from "@/lib/development/daily-log.service";
import {
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ classId: string }> };

/**
 * GET /api/development/classes/[classId]/progress
 * Roster + progress buku catatan harian satu kelas. Guru hanya boleh membaca
 * kelas yang diajarnya (dicek di service via `assertClassAccess`).
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { classId } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const data = await getClassProgress(actor, classId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return dailyLogErrorResponse(error);
  }
}
