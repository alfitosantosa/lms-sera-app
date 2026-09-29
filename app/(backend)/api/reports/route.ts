import { type ReportStatusTypes, reportStatusSchema } from "@/app/(types)";
import {
  assertClassAccess,
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
  teacherClassIds,
} from "@/lib/development/development.guard";
import {
  reportErrorResponse,
  reportInclude,
} from "@/lib/development/report.service";
import { createPaginationResponse, getPaginationQuery } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@/prisma/generated/client";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/reports?classId=&periodId=&status=&page=&limit=
 * Daftar rapor yayasan (berpaginasi). Satu periode bisa mencakup banyak kelas,
 * jadi daftar tidak pernah dibatasi diam-diam.
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = getPaginationQuery(request);

  const classId = searchParams.get("classId");
  const periodId = searchParams.get("periodId");
  const statusParam = searchParams.get("status");

  let status: ReportStatusTypes | undefined;
  if (statusParam) {
    const parsed = reportStatusSchema.safeParse(statusParam);
    if (!parsed.success) {
      return developmentError("Status rapor tidak valid", 400);
    }
    status = parsed.data;
  }

  if (classId) {
    const access = await assertClassAccess(actor, classId);
    if (!access.ok) return access.response;
  }
  // Tanpa filter kelas: guru hanya melihat kelas yang diajarnya (admin null).
  const classScope = classId ? null : await teacherClassIds(actor);

  const where: Prisma.StudentReportWhereInput = {
    foundationId: actor.foundationId,
    ...(classId ? { classId } : {}),
    ...(classScope ? { classId: { in: classScope } } : {}),
    ...(periodId ? { periodId } : {}),
    ...(status ? { status } : {}),
  };

  try {
    const [data, total] = await Promise.all([
      prisma.studentReport.findMany({
        where,
        include: reportInclude,
        orderBy: { student: { name: "asc" } },
        skip,
        take: limit,
      }),
      prisma.studentReport.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      ...createPaginationResponse(data, total, page, limit),
    });
  } catch (error) {
    return reportErrorResponse(error);
  }
}
