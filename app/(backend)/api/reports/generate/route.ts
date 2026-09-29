import { reportGenerateSchema } from "@/app/(types)";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import {
  generateReportDraft,
  reportErrorResponse,
} from "@/lib/development/report.service";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/reports/generate
 * Body kelas `{ classId, periodId }` atau satu siswa `{ studentId, periodId }`.
 * Satu transaksi per siswa; kegagalan per siswa dikumpulkan di `errors`.
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

  const parsed = reportGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const result = await generateReportDraft(actor, parsed.data);
    return NextResponse.json({
      success: true,
      data: { ...result, periodId: parsed.data.periodId },
    });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
