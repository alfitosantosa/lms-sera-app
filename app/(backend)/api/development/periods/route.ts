import {
  assessmentPeriodInputSchema,
  assessmentPeriodStatusSchema,
} from "@/app/(types)";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { createPaginationResponse, getPaginationQuery } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/development/periods?academicYearId=&status=
 * Daftar periode penilaian milik yayasan pemanggil.
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const academicYearId = searchParams.get("academicYearId");
  const statusParsed = assessmentPeriodStatusSchema.safeParse(
    searchParams.get("status"),
  );

  const where = {
    foundationId: actor.foundationId,
    ...(academicYearId ? { academicYearId } : {}),
    ...(statusParsed.success ? { status: statusParsed.data } : {}),
  };

  try {
    const { page, limit, skip } = getPaginationQuery(request);
    const [periods, total] = await Promise.all([
      prisma.assessmentPeriod.findMany({
        where,
        orderBy: [{ startDate: "desc" }],
        skip,
        take: limit,
        include: { academicYear: { select: { id: true, year: true } } },
      }),
      prisma.assessmentPeriod.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      ...createPaginationResponse(periods, total, page, limit),
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/**
 * POST /api/development/periods
 * Membuat periode penilaian baru.
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

  const parsed = assessmentPeriodInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  try {
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

    const period = await prisma.assessmentPeriod.create({
      data: {
        foundationId: actor.foundationId,
        academicYearId: data.academicYearId ?? null,
        name: data.name,
        semester: data.semester,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
      },
    });

    return NextResponse.json({ success: true, data: period }, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
