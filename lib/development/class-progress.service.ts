import { type ClassProgressDTO } from "@/app/(types)";
import { unwrapClass } from "@/lib/development/daily-log.service";
import {
  assertClassAccess,
  type DevelopmentActor,
} from "@/lib/development/development.guard";
import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

/**
 * Progress buku catatan harian satu kelas (Phase 3).
 *
 * Dipakai dashboard guru & halaman siswa. Roster diambil dari `UserData.classId`
 * (bukan `/api/students`, yang tidak difilter per kelas), lalu log dihitung
 * lewat dua agregasi — bukan memuat seluruh baris log ke memori.
 *
 * `percentLogbook` = siswa yang punya log hari ini. `percentAssessment`
 * (Phase 4) = sel matriks terisi / (siswa × indikator aktif) pada periode
 * aktif. `percentReport` menyusul di Phase 6.
 */
export async function getClassProgress(
  actor: DevelopmentActor,
  classId: string,
): Promise<ClassProgressDTO> {
  await unwrapClass(await assertClassAccess(actor, classId));

  const today = new Date();
  const dayFilter = { gte: startOfDay(today), lte: endOfDay(today) };

  const [students, totals, todayRows, activePeriod, indicatorCount] =
    await Promise.all([
      prisma.userData.findMany({
        where: { classId, foundationId: actor.foundationId },
        select: { id: true, name: true, nisn: true, avatarUrl: true },
        orderBy: { name: "asc" },
      }),
      prisma.dailyLog.groupBy({
        by: ["studentId"],
        where: { classId, foundationId: actor.foundationId },
        _count: { _all: true },
        _max: { date: true },
      }),
      prisma.dailyLog.groupBy({
        by: ["studentId"],
        where: {
          classId,
          foundationId: actor.foundationId,
          date: dayFilter,
        },
      }),
      prisma.assessmentPeriod.findFirst({
        where: {
          foundationId: actor.foundationId,
          status: "OPEN",
          startDate: { lte: today },
          endDate: { gte: today },
        },
        select: { id: true },
        orderBy: { startDate: "desc" },
      }),
      prisma.developmentIndicator.count({
        where: {
          isActive: true,
          developmentArea: { foundationId: actor.foundationId },
        },
      }),
    ]);

  const assessmentCells = activePeriod
    ? await prisma.studentAssessment.count({
        where: {
          classId,
          foundationId: actor.foundationId,
          periodId: activePeriod.id,
          indicator: {
            isActive: true,
            developmentArea: { foundationId: actor.foundationId },
          },
        },
      })
    : 0;

  const totalByStudent = new Map(
    totals.map((row) => [row.studentId, row] as const),
  );
  const loggedTodayIds = new Set(todayRows.map((row) => row.studentId));

  const totalStudents = students.length;
  const loggedToday = students.filter((s) => loggedTodayIds.has(s.id)).length;
  const pendingToday = totalStudents - loggedToday;
  const assessmentCellsTotal = totalStudents * indicatorCount;

  return {
    students: students.map((student) => {
      const agg = totalByStudent.get(student.id);
      return {
        id: student.id,
        name: student.name,
        nisn: student.nisn,
        avatarUrl: student.avatarUrl,
        logCount: agg?._count._all ?? 0,
        hasLogToday: loggedTodayIds.has(student.id),
        lastLogAt: agg?._max.date?.toISOString() ?? null,
      };
    }),
    totalStudents,
    loggedToday,
    pendingToday,
    percentLogbook:
      totalStudents === 0 ? 0 : Math.round((loggedToday / totalStudents) * 100),
    percentAssessment:
      assessmentCellsTotal === 0
        ? 0
        : Math.round((assessmentCells / assessmentCellsTotal) * 100),
  };
}
