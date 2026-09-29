import { bulkAssessmentInputSchema } from "@/app/(types)";
import {
  assessmentErrorResponse,
  bulkUpsertAssessments,
} from "@/lib/development/assessment.service";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/assessments/bulk
 * Matriks satu kelas × satu indikator:
 * `{ classId, periodId, indicatorId, entries: [{ studentId, scaleId, note? }] }`.
 * Semua entri divalidasi sebelum transaksi — penolakan tidak menyisakan baris.
 */
export async function POST(request: NextRequest) {
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

  const parsed = bulkAssessmentInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const result = await bulkUpsertAssessments(actor, parsed.data);
    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
