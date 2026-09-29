import { reportUpdateSchema } from "@/app/(types)";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import {
  getReport,
  reportErrorResponse,
  updateReport,
} from "@/lib/development/report.service";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/reports/[id] */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const row = await getReport(actor, id);
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    return reportErrorResponse(error);
  }
}

/**
 * PATCH /api/reports/[id]
 * Narasi hanya boleh diubah pada status `DRAFT`/`REVIEW`; setelah itu 409.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return developmentError("Body request tidak valid", 400);
  }

  const parsed = reportUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const row = await updateReport(actor, id, parsed.data);
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
