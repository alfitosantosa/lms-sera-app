"use server";
import { defaultDateRange } from "@/lib/dateRange";
import { createPaginationResponse, getPaginationQuery } from "@/lib/pagination";
import { type Prisma } from "@/prisma/generated/client";
import { handlePrismaError } from "@/services/errorHandler";
import { prisma } from "@/services/prisma";
import { resolveFoundation } from "@/services/tenant";
import { type NextRequest, NextResponse } from "next/server";

import type {
  AttendanceByClass,
  AttendanceDailyPoint,
  AttendanceStatus,
  AttendanceSummary,
} from "@/types/attendance-types";

const STATUSES: AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "excused",
  "sick",
];

function emptySummary(): AttendanceSummary {
  return {
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    sick: 0,
    attendanceRate: 0,
  };
}

function rateOf(present: number, late: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((present + late) / total) * 1000) / 10;
}

function addStatus(summary: AttendanceSummary, status: string) {
  summary.total += 1;
  if (STATUSES.includes(status as AttendanceStatus)) {
    summary[status as AttendanceStatus] += 1;
  }
}

/**
 * GET /api/attendance/filterdate?fromdate=&todate=&branchId=&status=&classId=
 *     &subjectId=&search=&page=&limit=
 *
 * Tanggal default: tanggal 1 bulan berjalan s/d hari ini.
 * Respons berpaginasi + agregat (summary, pipeline harian, per kelas).
 */
export async function GET(request: NextRequest) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  const { searchParams } = request.nextUrl;
  const { fromdate, todate } = defaultDateRange(
    searchParams.get("fromdate"),
    searchParams.get("todate"),
  );
  const branchId = searchParams.get("branchId");
  const statusParam = searchParams.get("status");
  const classId = searchParams.get("classId");
  const subjectId = searchParams.get("subjectId");
  const search = searchParams.get("search")?.trim();
  const { page, limit, skip } = getPaginationQuery(request);

  const startDate = new Date(fromdate);
  const endDate = new Date(todate);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: "Format tanggal tidak valid. Gunakan format YYYY-MM-DD" },
      { status: 400 },
    );
  }
  if (startDate > endDate) {
    return NextResponse.json(
      { error: "fromdate tidak boleh lebih besar dari todate" },
      { status: 400 },
    );
  }

  const status =
    statusParam && STATUSES.includes(statusParam as AttendanceStatus)
      ? statusParam
      : undefined;
  if (statusParam && !status) {
    return NextResponse.json(
      { error: `Status tidak valid: ${statusParam}` },
      { status: 400 },
    );
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const where: Prisma.AttendanceWhereInput = {
    date: { gte: startDate, lte: endDate },
    schedule: {
      academicYear: { foundationId: t.foundationId },
      ...(branchId ? { class: { branchId } } : {}),
      ...(classId ? { classId } : {}),
      ...(subjectId ? { subjectId } : {}),
    },
    student: {
      foundationId: t.foundationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { nisn: { contains: search } },
            ],
          }
        : {}),
    },
    ...(status ? { status } : {}),
  };

  try {
    const [attendances, aggregates, scheduleScopes] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          student: true,
          schedule: {
            include: {
              subject: true,
              class: { include: { branch: true } },
            },
          },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      // ponytail: agregat dihitung dari satu query ringan; pindah ke SQL
      // GROUP BY bila rentang tanggal sudah mencapai puluhan ribu baris.
      prisma.attendance.findMany({
        where,
        select: {
          date: true,
          status: true,
          schedule: {
            select: {
              classId: true,
              class: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.schedule.findMany({
        where: {
          academicYear: { foundationId: t.foundationId },
          ...(branchId ? { class: { branchId } } : {}),
        },
        select: {
          class: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Ringkasan + pipeline harian + rekap per kelas dari kumpulan baris yang sama.
    const summary = emptySummary();
    const dailyMap = new Map<string, AttendanceSummary>();
    const classMap = new Map<string, AttendanceByClass>();

    for (const row of aggregates) {
      addStatus(summary, row.status);

      const dayKey = row.date.toISOString().slice(0, 10);
      const day = dailyMap.get(dayKey) ?? emptySummary();
      addStatus(day, row.status);
      dailyMap.set(dayKey, day);

      const classKey = row.schedule?.class?.id ?? "unassigned";
      const classSummary = classMap.get(classKey) ?? {
        classId: row.schedule?.class?.id ?? null,
        className: row.schedule?.class?.name ?? "Tanpa Kelas",
        ...emptySummary(),
      };
      addStatus(classSummary, row.status);
      classMap.set(classKey, classSummary);
    }

    summary.attendanceRate = rateOf(
      summary.present,
      summary.late,
      summary.total,
    );

    // Isi semua hari pada rentang agar pipeline tidak bolong.
    const days: AttendanceDailyPoint[] = [];
    const cursor = new Date(`${fromdate}T00:00:00.000Z`);
    const lastDay = new Date(`${todate}T00:00:00.000Z`);
    while (cursor <= lastDay) {
      const key = cursor.toISOString().slice(0, 10);
      const day = dailyMap.get(key) ?? emptySummary();
      days.push({
        date: key,
        ...day,
        attendanceRate: rateOf(day.present, day.late, day.total),
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const byClass = Array.from(classMap.values())
      .map((row) => ({
        ...row,
        attendanceRate: rateOf(row.present, row.late, row.total),
      }))
      .sort((a, b) => a.className.localeCompare(b.className));

    const classOptions = new Map<string, string>();
    const subjectOptions = new Map<string, string>();
    for (const scope of scheduleScopes) {
      if (scope.class) classOptions.set(scope.class.id, scope.class.name);
      if (scope.subject) subjectOptions.set(scope.subject.id, scope.subject.name);
    }

    return NextResponse.json({
      ...createPaginationResponse(
        attendances,
        aggregates.length,
        page,
        limit,
      ),
      summary,
      daily: days,
      byClass,
      filterOptions: {
        classes: Array.from(classOptions, ([id, name]) => ({ id, name })).sort(
          (a, b) => a.name.localeCompare(b.name),
        ),
        subjects: Array.from(
          subjectOptions,
          ([id, name]) => ({ id, name }),
        ).sort((a, b) => a.name.localeCompare(b.name)),
      },
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
