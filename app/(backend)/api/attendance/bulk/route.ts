//create attendance bulk

// model Attendance {
//   id         String   @id @default(cuid())
//   studentId  String
//   scheduleId String
//   status     String
//   notes      String?
//   createdAt  DateTime @default(now())
//   date       DateTime
//   schedule   Schedule @relation(fields: [scheduleId], references: [id])
//   student    User     @relation("StudentAttendance", fields: [studentId], references: [id])

//   @@unique([studentId, scheduleId, date])
//   @@map("attendances")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  const { attendances } = await request.json();

  try {
    // Pastikan seluruh siswa dan jadwal milik yayasan pemanggil
    const studentIds = attendances.map(
      (a: { studentId: string }) => a.studentId,
    );
    const scheduleIds = attendances.map(
      (a: { scheduleId: string }) => a.scheduleId,
    );

    const [students, schedules] = await Promise.all([
      prisma.userData.findMany({
        where: { id: { in: studentIds }, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.schedule.findMany({
        where: {
          id: { in: scheduleIds },
          academicYear: { foundationId: t.foundationId },
        },
        select: { id: true },
      }),
    ]);
    if (
      students.length !== new Set(studentIds).size ||
      schedules.length !== new Set(scheduleIds).size
    ) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const createdAttendances = await prisma.attendance.createMany({
      data: attendances,
    });
    return NextResponse.json(createdAttendances);
  } catch (error) {
    return handlePrismaError(error);
  }
}
// put many attendance

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  const { attendances } = await request.json();

  try {
    // Verifikasi kepemilikan seluruh baris yang diubah
    const ids = attendances.map((a: { id: string }) => a.id);
    const owned = await prisma.attendance.findMany({
      where: {
        id: { in: ids },
        schedule: { academicYear: { foundationId: t.foundationId } },
        student: { foundationId: t.foundationId },
      },
      select: { id: true },
    });
    if (owned.length !== new Set(ids).size)
      return tenantForbidden("Data tidak ditemukan di yayasan ini");

    // Verifikasi parent baru bila ikut diubah
    const studentIds = attendances
      .map((a: { studentId?: string }) => a.studentId)
      .filter((id: string | undefined): id is string => Boolean(id));
    const scheduleIds = attendances
      .map((a: { scheduleId?: string }) => a.scheduleId)
      .filter((id: string | undefined): id is string => Boolean(id));

    const [students, schedules] = await Promise.all([
      prisma.userData.findMany({
        where: { id: { in: studentIds }, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.schedule.findMany({
        where: {
          id: { in: scheduleIds },
          academicYear: { foundationId: t.foundationId },
        },
        select: { id: true },
      }),
    ]);
    if (
      students.length !== new Set(studentIds).size ||
      schedules.length !== new Set(scheduleIds).size
    ) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const updatePromises = attendances.map(
      (attendance: { id: string; [key: string]: unknown }) =>
        prisma.attendance.update({
          where: {
            id: attendance.id,
          },
          data: attendance,
        }),
    );
    const updatedAttendances = await Promise.all(updatePromises);
    return NextResponse.json(updatedAttendances);
  } catch (error) {
    return handlePrismaError(error);
  }
}
