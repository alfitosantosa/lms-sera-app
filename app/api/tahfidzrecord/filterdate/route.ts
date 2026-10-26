"use server";
import { defaultDateRange } from "@/lib/dateRange";
import { createPaginationResponse, getPaginationQuery } from "@/lib/pagination";
import { type Prisma } from "@/prisma/generated/client";
import { handlePrismaError } from "@/services/errorHandler";
import { prisma } from "@/services/prisma";
import { resolveFoundation } from "@/services/tenant";
import { type NextRequest, NextResponse } from "next/server";

import type {
  TahfidzByGrade,
  TahfidzByGroup,
  TahfidzDailyPoint,
  TahfidzSummary,
} from "@/types/tahfidzrecord-types";

const GRADE_POINTS: Record<string, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  E: 0,
};

const GRADES = ["A", "B", "C", "D", "E"];

function emptySummary(): TahfidzSummary {
  return {
    total: 0,
    students: 0,
    groups: 0,
    teachers: 0,
    surahs: 0,
    averageGrade: 0,
  };
}

function roundGrade(totalPoints: number, totalRecords: number): number {
  if (totalRecords === 0) return 0;
  return Math.round((totalPoints / totalRecords) * 10) / 10;
}

/**
 * GET /api/tahfidzrecord/filterdate?fromdate=&todate=&branchId=&groupId=
 *     &teacherId=&surahId=&grade=&search=&page=&limit=
 *
 * Tanggal default: tanggal 1 bulan berjalan s/d hari ini.
 * Respons berpaginasi + agregat (ringkasan, pipeline harian, per nilai, per grup).
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
  const groupId = searchParams.get("groupId");
  const teacherId = searchParams.get("teacherId");
  const surahId = searchParams.get("surahId");
  const grade = searchParams.get("grade")?.toUpperCase();
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
  if (grade && !GRADES.includes(grade)) {
    return NextResponse.json(
      { error: `Nilai tidak valid: ${grade}` },
      { status: 400 },
    );
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const where: Prisma.TahfidzRecordWhereInput = {
    date: { gte: startDate, lte: endDate },
    student: {
      foundationId: t.foundationId,
      ...(branchId ? { branchId } : {}),
      ...(groupId ? { tahfidzGroupId: groupId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { nisn: { contains: search } },
            ],
          }
        : {}),
    },
    ...(teacherId ? { teacherId } : {}),
    ...(surahId ? { surahQuranId: surahId } : {}),
    ...(grade ? { grade } : {}),
  };

  try {
    const [records, aggregates, groupOptions, teacherOptions, surahOptions] =
      await Promise.all([
        prisma.tahfidzRecord.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                name: true,
                nisn: true,
                class: { select: { id: true, name: true } },
                tahfidzGroup: { select: { id: true, name: true } },
              },
            },
            teacher: { select: { id: true, name: true, employeeId: true } },
            surah: true,
          },
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          skip,
          take: limit,
        }),
        // ponytail: agregat dihitung dari satu query ringan; pindah ke SQL
        // GROUP BY bila rentang tanggal sudah mencapai puluhan ribu baris.
        prisma.tahfidzRecord.findMany({
          where,
          select: {
            date: true,
            grade: true,
            studentId: true,
            teacherId: true,
            surahQuranId: true,
            student: {
              select: {
                tahfidzGroupId: true,
                tahfidzGroup: { select: { id: true, name: true } },
              },
            },
          },
        }),
        prisma.tahfidzGroup.findMany({
          where: {
            students: { some: { foundationId: t.foundationId } },
            ...(branchId ? { branchId } : {}),
          },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
        prisma.userData.findMany({
          where: {
            foundationId: t.foundationId,
            ...(branchId ? { branchId } : {}),
            tahfidzRecordsAsTeacher: { some: {} },
          },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
        prisma.surahQuran.findMany({
          select: { id: true, nameLatin: true },
          orderBy: { nameLatin: "asc" },
        }),
      ]);

    const summary = emptySummary();
    const summaryStudents = new Set<string>();
    const summaryGroups = new Set<string>();
    const summaryTeachers = new Set<string>();
    const summarySurahs = new Set<string>();
    let summaryPoints = 0;

    const dailyMap = new Map<
      string,
      {
        total: number;
        points: number;
        students: Set<string>;
        groups: Set<string>;
        teachers: Set<string>;
        surahs: Set<string>;
        gradeCounts: Record<string, number>;
      }
    >();
    const groupMap = new Map<
      string,
      {
        groupId: string | null;
        groupName: string;
        total: number;
        points: number;
        students: Set<string>;
      }
    >();
    const gradeCounts = new Map<string, number>(GRADES.map((g) => [g, 0]));

    for (const row of aggregates) {
      const points = GRADE_POINTS[row.grade ?? ""] ?? 0;

      summary.total += 1;
      summaryPoints += points;
      if (row.studentId) summaryStudents.add(row.studentId);
      if (row.teacherId) summaryTeachers.add(row.teacherId);
      if (row.surahQuranId) summarySurahs.add(row.surahQuranId);
      if (row.student?.tahfidzGroupId)
        summaryGroups.add(row.student.tahfidzGroupId);

      const dayKey = row.date.toISOString().slice(0, 10);
      const day = dailyMap.get(dayKey) ?? {
        total: 0,
        points: 0,
        students: new Set<string>(),
        groups: new Set<string>(),
        teachers: new Set<string>(),
        surahs: new Set<string>(),
        gradeCounts: {},
      };
      day.total += 1;
      day.points += points;
      if (row.studentId) day.students.add(row.studentId);
      if (row.student?.tahfidzGroupId) day.groups.add(row.student.tahfidzGroupId);
      if (row.teacherId) day.teachers.add(row.teacherId);
      if (row.surahQuranId) day.surahs.add(row.surahQuranId);
      if (row.grade) {
        day.gradeCounts[row.grade] = (day.gradeCounts[row.grade] ?? 0) + 1;
      }
      dailyMap.set(dayKey, day);

      const groupKey = row.student?.tahfidzGroup?.id ?? "unassigned";
      const group = groupMap.get(groupKey) ?? {
        groupId: row.student?.tahfidzGroup?.id ?? null,
        groupName: row.student?.tahfidzGroup?.name ?? "Tanpa Grup",
        total: 0,
        points: 0,
        students: new Set<string>(),
      };
      group.total += 1;
      group.points += points;
      if (row.studentId) group.students.add(row.studentId);
      groupMap.set(groupKey, group);

      if (row.grade && gradeCounts.has(row.grade)) {
        gradeCounts.set(row.grade, (gradeCounts.get(row.grade) ?? 0) + 1);
      }
    }

    summary.students = summaryStudents.size;
    summary.groups = summaryGroups.size;
    summary.teachers = summaryTeachers.size;
    summary.surahs = summarySurahs.size;
    summary.averageGrade = roundGrade(summaryPoints, summary.total);

    const days: TahfidzDailyPoint[] = [];
    const cursor = new Date(`${fromdate}T00:00:00.000Z`);
    const lastDay = new Date(`${todate}T00:00:00.000Z`);
    while (cursor <= lastDay) {
      const key = cursor.toISOString().slice(0, 10);
      const day = dailyMap.get(key);
      days.push({
        date: key,
        total: day?.total ?? 0,
        students: day?.students.size ?? 0,
        groups: day?.groups.size ?? 0,
        teachers: day?.teachers.size ?? 0,
        surahs: day?.surahs.size ?? 0,
        averageGrade: roundGrade(day?.points ?? 0, day?.total ?? 0),
        gradeCounts: day?.gradeCounts ?? {},
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    const byGrade: TahfidzByGrade[] = GRADES.map((value) => {
      const total = gradeCounts.get(value) ?? 0;
      return {
        grade: value,
        total,
        percentage:
          summary.total > 0
            ? Math.round((total / summary.total) * 1000) / 10
            : 0,
      };
    });

    const byGroup: TahfidzByGroup[] = Array.from(groupMap.values())
      .map((row) => ({
        groupId: row.groupId,
        groupName: row.groupName,
        total: row.total,
        students: row.students.size,
        averageGrade: roundGrade(row.points, row.total),
      }))
      .sort((a, b) => a.groupName.localeCompare(b.groupName));

    return NextResponse.json({
      ...createPaginationResponse(records, aggregates.length, page, limit),
      summary,
      daily: days,
      byGrade,
      byGroup,
      filterOptions: {
        groups: groupOptions,
        teachers: teacherOptions,
        surahs: surahOptions,
      },
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
