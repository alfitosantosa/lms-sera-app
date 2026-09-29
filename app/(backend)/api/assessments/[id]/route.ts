import { assessmentUpdateSchema } from "@/app/(types)";
import {
  assessmentErrorResponse,
  deleteAssessment,
  getAssessment,
  toAssessmentDTO,
  updateAssessment,
} from "@/lib/development/assessment.service";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/assessments/[id] */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const row = await getAssessment(actor, id);
    return NextResponse.json({ success: true, data: toAssessmentDTO(row) });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}

/**
 * PATCH /api/assessments/[id]
 * Ubah skala/catatan/bukti. Periode `LOCKED`/`PUBLISHED` → 409.
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

  const parsed = assessmentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const row = await updateAssessment(actor, id, parsed.data);
    return NextResponse.json({ success: true, data: toAssessmentDTO(row) });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}

/**
 * DELETE /api/assessments/[id]
 * Aturan kunci seragam: diblokir saat periode `LOCKED` **atau** `PUBLISHED`.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    await deleteAssessment(actor, id);
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
