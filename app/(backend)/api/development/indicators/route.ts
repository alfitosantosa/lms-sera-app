import { developmentIndicatorInputSchema } from "@/app/(types)";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/development/indicators?areaId=&isActive=
 * Daftar indikator + area induknya (lengkap, tanpa paginasi).
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const areaId = searchParams.get("areaId");
  const isActiveParam = searchParams.get("isActive");

  const where = {
    developmentArea: { foundationId: actor.foundationId },
    ...(areaId ? { developmentAreaId: areaId } : {}),
    ...(isActiveParam !== null ? { isActive: isActiveParam === "true" } : {}),
  };

  try {
    const indicators = await prisma.developmentIndicator.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { developmentArea: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ success: true, data: indicators });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/**
 * POST /api/development/indicators
 * Membuat indikator baru di dalam sebuah area.
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

  const parsed = developmentIndicatorInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  try {
    const area = await prisma.developmentArea.findFirst({
      where: { id: data.developmentAreaId, foundationId: actor.foundationId },
      select: { id: true },
    });
    if (!area) {
      return developmentError("Area tidak ditemukan di yayasan ini", 404);
    }

    const indicator = await prisma.developmentIndicator.create({
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

    return NextResponse.json(
      { success: true, data: indicator },
      { status: 201 },
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}
