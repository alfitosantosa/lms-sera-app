import { assessmentScaleInputSchema } from "@/app/(types)";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/development/scales?isActive=
 * Daftar skala penilaian, urut `order asc` (lengkap, tanpa paginasi).
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
    const scales = await prisma.assessmentScale.findMany({
      where,
      orderBy: [{ order: "asc" }, { value: "asc" }],
    });

    return NextResponse.json({ success: true, data: scales });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/**
 * POST /api/development/scales
 * Membuat skala baru (idempotent by `foundationId` + `code`).
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

  const parsed = assessmentScaleInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  try {
    const scale = await prisma.assessmentScale.upsert({
      where: {
        foundationId_code: { foundationId: actor.foundationId, code: data.code },
      },
      create: {
        foundationId: actor.foundationId,
        code: data.code,
        label: data.label,
        description: data.description ?? null,
        value: data.value,
        color: data.color ?? null,
        order: data.order,
        isActive: data.isActive,
      },
      update: {
        label: data.label,
        description: data.description ?? null,
        value: data.value,
        color: data.color ?? null,
        order: data.order,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, data: scale }, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
