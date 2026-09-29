import { developmentIndicatorInputSchema } from "@/app/(types)";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/development/indicators/[id] */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const indicator = await prisma.developmentIndicator.findFirst({
      where: {
        id,
        developmentArea: { foundationId: actor.foundationId },
      },
      include: { developmentArea: { select: { id: true, name: true } } },
    });
    if (!indicator) return developmentError("Indikator tidak ditemukan", 404);

    return NextResponse.json({ success: true, data: indicator });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** PATCH /api/development/indicators/[id] */
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

  const parsed = developmentIndicatorInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  try {
    const owned = await prisma.developmentIndicator.findFirst({
      where: { id, developmentArea: { foundationId: actor.foundationId } },
      select: { id: true },
    });
    if (!owned) return developmentError("Indikator tidak ditemukan", 404);

    const area = await prisma.developmentArea.findFirst({
      where: { id: data.developmentAreaId, foundationId: actor.foundationId },
      select: { id: true },
    });
    if (!area) {
      return developmentError("Area tidak ditemukan di yayasan ini", 404);
    }

    const indicator = await prisma.developmentIndicator.update({
      where: { id },
      data: {
        developmentAreaId: data.developmentAreaId,
        code: data.code ?? null,
        name: data.name,
        description: data.description ?? null,
        order: data.order,
        isActive: data.isActive,
      },
      include: { developmentArea: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: indicator });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** DELETE /api/development/indicators/[id] */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const owned = await prisma.developmentIndicator.findFirst({
      where: { id, developmentArea: { foundationId: actor.foundationId } },
      select: { id: true },
    });
    if (!owned) return developmentError("Indikator tidak ditemukan", 404);

    await prisma.developmentIndicator.delete({ where: { id } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return handlePrismaError(error);
  }
}
