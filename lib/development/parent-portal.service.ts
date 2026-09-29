import {
  isLogEntry,
  type DevelopmentMeDTO,
  type DevelopmentMeNoteDTO,
  type DevelopmentMeReportDTO,
  type DevelopmentMeStudentDTO,
} from "@/app/(types)";
import { prisma } from "@/lib/prisma";
import { getStudentOverview } from "./assessment.service";
import { getStudentTimeline } from "./daily-log.service";
import { type DevelopmentActor } from "./development.guard";

/**
 * Id siswa yang boleh dilihat aktor — **selalu** dari sesi, bukan argumen.
 * Orang tua: `UserData.studentIds` miliknya. Siswa: dirinya sendiri.
 * Staff tidak punya portal ini (route menolaknya lebih dulu).
 */
async function ownStudentIds(actor: DevelopmentActor): Promise<string[]> {
  if (actor.isParent && actor.userDataId) {
    const parent = await prisma.userData.findFirst({
      where: { id: actor.userDataId, foundationId: actor.foundationId },
      select: { studentIds: true },
    });
    return parent?.studentIds ?? [];
  }
  if (actor.isStudent && actor.userDataId) return [actor.userDataId];
  return [];
}

/**
 * Ringkasan portal untuk aktor (orang tua/siswa).
 *
 * Setiap bagian memakai jalur yang sudah ada — `getStudentOverview`
 * (ringkasan per area), `getStudentTimeline` (log `parentVisible: true` +
 * bukti tugas terbit), dan rapor `PUBLISHED` — supaya aturan visibilitas tidak
 * pernah berbeda antar halaman. Semua id di sini sudah milik aktor, dan tiap
 * service tetap memverifikasi ulang lewat `assertStudentAccess`.
 */
export async function getDevelopmentMe(
  actor: DevelopmentActor,
): Promise<DevelopmentMeDTO> {
  const role: DevelopmentMeDTO["role"] = actor.isParent ? "parent" : "student";
  const ids = await ownStudentIds(actor);
  if (ids.length === 0) return { role, students: [] };

  // `studentIds` bisa menunjuk baris di yayasan lain — filter tegas di sini.
  const scoped = await prisma.userData.findMany({
    where: { id: { in: ids }, foundationId: actor.foundationId },
    select: { id: true },
    orderBy: { name: "asc" },
  });
  if (scoped.length === 0) return { role, students: [] };

  const studentIds = scoped.map((row) => row.id);

  // Rapor: satu query untuk semua anak, hanya yang sudah terbit.
  const reportRows = await prisma.studentReport.findMany({
    where: {
      studentId: { in: studentIds },
      foundationId: actor.foundationId,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      studentId: true,
      periodId: true,
      publishedAt: true,
      period: { select: { name: true } },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  const reportsByStudent = new Map<string, DevelopmentMeReportDTO[]>();
  for (const row of reportRows) {
    const list = reportsByStudent.get(row.studentId) ?? [];
    list.push({
      id: row.id,
      periodId: row.periodId,
      periodName: row.period.name,
      publishedAt: row.publishedAt?.toISOString() ?? null,
    });
    reportsByStudent.set(row.studentId, list);
  }

  // ponytail: satu siswa = beberapa query (ringkasan + timeline). Anak per
  // orang tua biasanya 1–3; batch-batch kalau jumlah anak per akun naik.
  const students: DevelopmentMeStudentDTO[] = [];
  for (const studentId of studentIds) {
    const [overview, timeline] = await Promise.all([
      getStudentOverview(actor, studentId),
      getStudentTimeline(actor, studentId, {}),
    ]);

    // Catatan guru = entri log ber-`teacherNote`; timeline sudah menyaring
    // `parentVisible: true`, jadi tidak ada catatan tersembunyi yang lolos.
    const teacherNotes: DevelopmentMeNoteDTO[] = timeline.flatMap((entry) =>
      isLogEntry(entry) && entry.teacherNote
        ? [
            {
              logId: entry.id,
              date: entry.date,
              activity: entry.activity,
              teacherNote: entry.teacherNote,
              teacherName: entry.teacher?.name ?? null,
            },
          ]
        : [],
    );

    students.push({
      student: overview.student,
      areas: overview.areas,
      timeline,
      teacherNotes,
      reports: reportsByStudent.get(studentId) ?? [],
    });
  }

  return { role, students };
}
