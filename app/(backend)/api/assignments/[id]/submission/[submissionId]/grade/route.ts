import { assignmentGradeInputSchema } from "@/app/(types)";
import {
  assignmentErrorResponse,
  gradeSubmission,
} from "@/lib/development/assignment.service";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string; submissionId: string }> };

/**
 * PATCH /api/assignments/[id]/submission/[submissionId]/grade
 * Menulis nilai + feedback pengumpulan sekaligus meng-upsert baris `Grade`
 * (dan `Evidence` LINK bila tugas punya indikator) dalam satu transaksi.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id, submissionId } = await params;

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

  const parsed = assignmentGradeInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const data = await gradeSubmission(actor, id, submissionId, parsed.data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return assignmentErrorResponse(error);
  }
}
