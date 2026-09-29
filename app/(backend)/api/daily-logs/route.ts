import {
  dailyLogInputSchema,
  dailyLogStatusSchema,
} from "@/app/(types)";
import {
  dailyLogErrorResponse,
  createDailyLog,
  parseDateParam,
} from "@/lib/development/daily-log.service";
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

const listInclude = {
  student: { select: { id: true, name: true, nisn: true, avatarUrl: true } },
  teacher: { select: { id: true, name: true } },
  observations: {
    include: {
      indicator: {
        select: {
          id: true,
          name: true,
          developmentArea: { select: { id: true, name: true } },
        },
      },
      scale: true,
    },
  },
  _count: { select: { evidences: true } },
} satisfies Prisma.DailyLogInclude;


/**
 * GET /api/daily-logs?classId=&studentId=&teacherId=&fromdate=&todate=&status=&page=&limit=
 * Daftar log harian yayasan (berpaginasi).
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
  const studentId = searchParams.get("studentId");
  const teacherId = searchParams.get("teacherId");
  const fromDate = parseDateParam(searchParams.get("fromdate"));
  const toDate = parseDateParam(searchParams.get("todate"));

  // Filter per siswa tetap harus lewat aturan akses siswa (guru hanya kelas
  // yang diajarnya; orang tua/siswa hanya dirinya) — sama seperti endpoint lain.
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

  const statusParam = searchParams.get("status");
  const status = statusParam
    ? dailyLogStatusSchema.safeParse(statusParam)
    : null;
  if (status && !status.success) {
    return developmentError("Status log tidak valid", 400);
  }

  const where: Prisma.DailyLogWhereInput = {
    foundationId: actor.foundationId,
    ...(classId ? { classId } : {}),
    ...(classScope ? { classId: { in: classScope } } : {}),
    ...(studentId ? { studentId } : {}),
    ...(teacherId ? { teacherId } : {}),
    ...(status?.success ? { status: status.data } : {}),
    ...(fromDate || toDate
      ? {
          date: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {}),
          },
        }
      : {}),
  };

  try {
    const [data, total] = await Promise.all([
      prisma.dailyLog.findMany({
        where,
        include: listInclude,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.dailyLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      ...createPaginationResponse(data, total, page, limit),
    });
  } catch (error) {
    return dailyLogErrorResponse(error);
  }
}

/**
 * POST /api/daily-logs
 * Membuat log harian + observasi + bukti dalam satu transaksi.
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

  const parsed = dailyLogInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const log = await createDailyLog(actor, parsed.data);
    return NextResponse.json({ success: true, data: log }, { status: 201 });
  } catch (error) {
    return dailyLogErrorResponse(error);
  }
}
