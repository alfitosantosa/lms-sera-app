import {
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import {
  reportErrorResponse,
  reviewReport,
} from "@/lib/development/report.service";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** POST /api/reports/[id]/review — `DRAFT → REVIEW`. */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const row = await reviewReport(actor, id);
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
