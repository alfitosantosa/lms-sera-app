import {
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import {
  publishReport,
  reportErrorResponse,
} from "@/lib/development/report.service";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/reports/[id]/publish — `APPROVED → PUBLISHED`.
 * Tidak menghitung ulang snapshot. Phase 9: hook notifikasi.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const row = await publishReport(actor, id);
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
