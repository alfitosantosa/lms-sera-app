import { dailyLogUpdateSchema } from "@/app/(types)";
import { writeAudit } from "@/lib/development/audit";
import {
  assertLogWritable,
  assertOpenPeriod,
  dailyLogErrorResponse,
  dailyLogInclude,
  evidenceRow,
  getOwnedDailyLog,
  observationRow,
} from "@/lib/development/daily-log.service";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { prisma } from "@/lib/prisma";
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
 * Ubah log — hanya saat DRAFT (guru pemilik) atau oleh staff.
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
  const data = parsed.data;

  try {
    const log = await getOwnedDailyLog(actor, id);
    assertLogWritable(actor, log, "update");
    if (data.date) await assertOpenPeriod(actor.foundationId, data.date);

    const updated = await prisma.$transaction(async (tx) => {
      if (data.observations) {
        await tx.dailyObservation.deleteMany({ where: { dailyLogId: log.id } });
        await tx.dailyObservation.createMany({
          data: data.observations.map((o) => observationRow(log.id, o)),
        });
      }
      if (data.evidences) {
        await tx.evidence.deleteMany({ where: { dailyLogId: log.id } });
        await tx.evidence.createMany({
          data: data.evidences.map((e) => evidenceRow(log.id, e, actor.userDataId)),
        });
      }

      const row = await tx.dailyLog.update({
        where: { id: log.id },
        data: {
          ...(data.date !== undefined ? { date: data.date } : {}),
          ...(data.subjectId !== undefined
            ? { subjectId: data.subjectId ?? null }
            : {}),
          ...(data.activity !== undefined ? { activity: data.activity } : {}),
          ...(data.achievement !== undefined
            ? { achievement: data.achievement ?? null }
            : {}),
          ...(data.challenge !== undefined
            ? { challenge: data.challenge ?? null }
            : {}),
          ...(data.teacherNote !== undefined
            ? { teacherNote: data.teacherNote ?? null }
            : {}),
          ...(data.parentVisible !== undefined
            ? { parentVisible: data.parentVisible }
            : {}),
        },
        include: dailyLogInclude,
      });

      await writeAudit(tx, {
        foundationId: actor.foundationId,
        actorId: actor.userId,
        action: "dailyLog.updated",
        entity: "DailyLog",
        entityId: log.id,
        before: log,
        after: row,
      });

      return row;
    });

    return NextResponse.json({ success: true, data: updated });
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
