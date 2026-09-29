import { dailyLogErrorResponse, reviewDailyLog } from "@/lib/development/daily-log.service";
import {
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** POST /api/daily-logs/[id]/review — SUBMITTED → REVIEWED (staff). */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const log = await reviewDailyLog(actor, id);
    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    return dailyLogErrorResponse(error);
  }
}
