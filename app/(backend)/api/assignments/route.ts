import { assignmentInputSchema } from "@/app/(types)";
import {
  assignmentErrorResponse,
  assignmentInclude,
  createAssignment,
} from "@/lib/development/assignment.service";
import {
  assertClassAccess,
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { createPaginationResponse, getPaginationQuery } from "@/lib/api/pagination";
import { prisma } from "@/lib/api/prisma";
import { type Prisma } from "@/prisma/generated/client";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/assignments?classId=&subjectId=&teacherId=&isPublished=&isActive=&page=&limit=
 * Staf melihat tugas di kelas yang boleh diaksesnya; siswa hanya tugas
 * `isPublished` di kelasnya sendiri.
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  if (!actor.isStaff && !actor.isStudent) {
    return developmentError("Akses ditolak", 403);
  }

  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = getPaginationQuery(request);
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");
  const teacherId = searchParams.get("teacherId");
  const isPublished = searchParams.get("isPublished");
  const isActive = searchParams.get("isActive");

  // Siswa: paksa filter ke kelasnya sendiri + hanya tugas terbit & aktif.
  if (actor.isStudent) {
    if (!actor.classId) {
      return NextResponse.json({
        success: true,
        ...createPaginationResponse([], 0, page, limit),
      });
    }
    const where: Prisma.AssignmentWhereInput = {
      classId: actor.classId,
      isPublished: true,
      isActive: true,
    };
    try {
      const [data, total] = await Promise.all([
        prisma.assignment.findMany({
          where,
          include: assignmentInclude,
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          skip,
          take: limit,
        }),
        prisma.assignment.count({ where }),
      ]);
      return NextResponse.json({
        success: true,
        ...createPaginationResponse(data, total, page, limit),
      });
    } catch (error) {
      return assignmentErrorResponse(error);
    }
  }

  const denied = requireStaff(actor);
  if (denied) return denied;

  if (classId) {
    const access = await assertClassAccess(actor, classId);
    if (!access.ok) return access.response;
  }

  const where: Prisma.AssignmentWhereInput = {
    class: { branch: { foundationId: actor.foundationId } },
    // Guru hanya melihat tugas pada jadwalnya sendiri (teacherId diturunkan
    // dari Schedule, jadi nilainya selalu konsisten).
    ...(actor.roleName === "teacher"
      ? { teacherId: actor.userDataId ?? "" }
      : teacherId
        ? { teacherId }
        : {}),
    ...(classId ? { classId } : {}),
    ...(subjectId ? { subjectId } : {}),
    ...(isPublished ? { isPublished: isPublished === "true" } : {}),
    ...(isActive ? { isActive: isActive === "true" } : {}),
  };

  try {
    const [data, total] = await Promise.all([
      prisma.assignment.findMany({
        where,
        include: assignmentInclude,
        orderBy: [{ dueDate: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.assignment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      ...createPaginationResponse(data, total, page, limit),
    });
  } catch (error) {
    return assignmentErrorResponse(error);
  }
}

/**
 * POST /api/assignments
 * `classId`/`subjectId`/`teacherId` diturunkan dari `scheduleId`, bukan body.
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

  const parsed = assignmentInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const assignment = await createAssignment(actor, parsed.data);
    return NextResponse.json(
      { success: true, data: assignment },
      { status: 201 },
    );
  } catch (error) {
    return assignmentErrorResponse(error);
  }
}
