import { bootstrapDevelopment } from "@/lib/development/development.defaults";
import {
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/development/bootstrap
 * Isi default area + indikator + skala untuk yayasan pemanggil.
 * Idempotent: aman dipanggil berulang.
 */
export async function POST(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const created = await bootstrapDevelopment(actor.foundationId);
    return NextResponse.json({ success: true, created });
  } catch (error) {
    return handlePrismaError(error);
  }
}
