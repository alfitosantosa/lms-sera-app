import { developmentAreaInputSchema } from "@/app/(types)";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/development/areas?isActive=
 * Daftar area pengembangan + jumlah indikator (lengkap, tanpa paginasi).
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const isActiveParam = new URL(request.url).searchParams.get("isActive");
  const where = {
    foundationId: actor.foundationId,
    ...(isActiveParam !== null ? { isActive: isActiveParam === "true" } : {}),
  };

  try {
    const areas = await prisma.developmentArea.findMany({
      where,
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { indicators: true } } },
    });

    return NextResponse.json({ success: true, data: areas });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/**
 * POST /api/development/areas
 * Membuat area pengembangan baru.
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

  const parsed = developmentAreaInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  try {
    const area = await prisma.developmentArea.create({
      data: {
        foundationId: actor.foundationId,
        name: data.name,
        description: data.description ?? null,
        order: data.order,
        isActive: data.isActive,
      },
      include: { _count: { select: { indicators: true } } },
    });

    return NextResponse.json({ success: true, data: area }, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
