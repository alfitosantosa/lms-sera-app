import { assessmentUpsertSchema } from "@/app/(types)";
import {
  assessmentErrorResponse,
  assessmentInclude,
  toAssessmentDTO,
  upsertAssessment,
} from "@/lib/development/assessment.service";
import {
  assertClassAccess,
  assertStudentAccess,
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
  teacherClassIds,
} from "@/lib/development/development.guard";
import { createPaginationResponse, getPaginationQuery } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { type Prisma } from "@/prisma/generated/client";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/assessments?studentId=&classId=&periodId=&indicatorId=&page=&limit=
 * Daftar penilaian yayasan (berpaginasi). Filter per siswa tetap lewat aturan
 * akses siswa; filter per kelas lewat `assertClassAccess`.
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = getPaginationQuery(request);

  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");
  const periodId = searchParams.get("periodId");
  const indicatorId = searchParams.get("indicatorId");

  if (studentId) {
    const access = await assertStudentAccess(actor, studentId);
    if (!access.ok) return access.response;
  }
  if (classId) {
    const access = await assertClassAccess(actor, classId);
    if (!access.ok) return access.response;
  }
  // Tanpa filter kelas: guru hanya melihat kelas yang diajarnya (admin null).
  const classScope = classId ? null : await teacherClassIds(actor);

  const where: Prisma.StudentAssessmentWhereInput = {
    foundationId: actor.foundationId,
    ...(studentId ? { studentId } : {}),
    ...(classId ? { classId } : {}),
    ...(classScope ? { classId: { in: classScope } } : {}),
    ...(periodId ? { periodId } : {}),
    ...(indicatorId ? { indicatorId } : {}),
  };

  try {
    const [data, total] = await Promise.all([
      prisma.studentAssessment.findMany({
        where,
        include: assessmentInclude,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.studentAssessment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      ...createPaginationResponse(data.map(toAssessmentDTO), total, page, limit),
    });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}

/**
 * POST /api/assessments
 * Upsert satu nilai: `{ studentId, periodId, indicatorId, scaleId, score?, note? }`.
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

  const parsed = assessmentUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const row = await upsertAssessment(actor, parsed.data);
    return NextResponse.json({ success: true, data: toAssessmentDTO(row) });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
