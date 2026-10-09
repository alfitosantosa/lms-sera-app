import { dailyLogUpdateSchema } from "@/app/(types)";
import { writeAudit } from "@/lib/development/audit";
import {
  assertLogWritable,
  dailyLogErrorResponse,
  getOwnedDailyLog,
  updateDailyLog,
} from "@/lib/development/daily-log.service";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { prisma } from "@/lib/api/prisma";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/daily-logs/[id] */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const log = await getOwnedDailyLog(actor, id);
    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    return dailyLogErrorResponse(error);
  }
}

/**
 * PATCH /api/daily-logs/[id]
 * Ubah log — hanya saat DRAFT (guru pemilik) atau oleh admin.
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

  const parsed = dailyLogUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const log = await updateDailyLog(actor, id, parsed.data);
    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    return dailyLogErrorResponse(error);
  }
}

/** DELETE /api/daily-logs/[id] — hanya log berstatus DRAFT. */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const log = await getOwnedDailyLog(actor, id);
    assertLogWritable(actor, log, "delete");

    await prisma.$transaction(async (tx) => {
      await writeAudit(tx, {
        foundationId: actor.foundationId,
        actorId: actor.userId,
        action: "dailyLog.deleted",
        entity: "DailyLog",
        entityId: log.id,
        before: log,
      });
      await tx.dailyLog.delete({ where: { id: log.id } });
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return dailyLogErrorResponse(error);
  }
}
