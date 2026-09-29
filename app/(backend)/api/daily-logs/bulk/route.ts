import { bulkDailyLogInputSchema } from "@/app/(types)";
import {
  bulkCreateDailyLogs,
  dailyLogErrorResponse,
} from "@/lib/development/daily-log.service";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/daily-logs/bulk
 * Satu log per siswa untuk satu kelas pada satu tanggal.
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

  const parsed = bulkDailyLogInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const result = await bulkCreateDailyLogs(actor, parsed.data);
    return NextResponse.json(
      { success: true, count: result.count },
      { status: 201 },
    );
  } catch (error) {
    return dailyLogErrorResponse(error);
  }
}
