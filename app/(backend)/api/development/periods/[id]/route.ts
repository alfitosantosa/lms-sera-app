import { assessmentPeriodInputSchema } from "@/app/(types)";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/development/periods/[id] */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const period = await prisma.assessmentPeriod.findFirst({
      where: { id, foundationId: actor.foundationId },
      include: { academicYear: { select: { id: true, year: true } } },
    });
    if (!period) return developmentError("Periode tidak ditemukan", 404);

    return NextResponse.json({ success: true, data: period });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** PATCH /api/development/periods/[id] */
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

  const parsed = assessmentPeriodInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  try {
    const owned = await prisma.assessmentPeriod.findFirst({
      where: { id, foundationId: actor.foundationId },
      select: { id: true },
    });
    if (!owned) return developmentError("Periode tidak ditemukan", 404);

    if (data.academicYearId) {
      const academicYear = await prisma.academicYear.findFirst({
        where: { id: data.academicYearId, foundationId: actor.foundationId },
        select: { id: true },
      });
      if (!academicYear) {
        return developmentError(
          "Tahun ajaran tidak ditemukan di yayasan ini",
          404,
        );
      }
    }

    const period = await prisma.assessmentPeriod.update({
      where: { id },
      data: {
        academicYearId: data.academicYearId ?? null,
        name: data.name,
        semester: data.semester,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      },
    });

    return NextResponse.json({ success: true, data: period });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** DELETE /api/development/periods/[id] */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const owned = await prisma.assessmentPeriod.findFirst({
      where: { id, foundationId: actor.foundationId },
      select: { id: true },
    });
    if (!owned) return developmentError("Periode tidak ditemukan", 404);

    await prisma.assessmentPeriod.delete({ where: { id } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return handlePrismaError(error);
  }
}
