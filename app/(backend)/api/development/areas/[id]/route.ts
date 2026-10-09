import { developmentAreaInputSchema } from "@/app/(types)";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/development/areas/[id] */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const area = await prisma.developmentArea.findFirst({
      where: { id, foundationId: actor.foundationId },
      include: { _count: { select: { indicators: true } } },
    });
    if (!area) return developmentError("Area tidak ditemukan", 404);

    return NextResponse.json({ success: true, data: area });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** PATCH /api/development/areas/[id] */
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

  const parsed = developmentAreaInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  try {
    const owned = await prisma.developmentArea.findFirst({
      where: { id, foundationId: actor.foundationId },
      select: { id: true },
    });
    if (!owned) return developmentError("Area tidak ditemukan", 404);

    const area = await prisma.developmentArea.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? null,
        order: data.order,
        isActive: data.isActive,
      },
      include: { _count: { select: { indicators: true } } },
    });

    return NextResponse.json({ success: true, data: area });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** DELETE /api/development/areas/[id] */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const owned = await prisma.developmentArea.findFirst({
      where: { id, foundationId: actor.foundationId },
      select: { id: true },
    });
    if (!owned) return developmentError("Area tidak ditemukan", 404);

    await prisma.developmentArea.delete({ where: { id } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return handlePrismaError(error);
  }
}
