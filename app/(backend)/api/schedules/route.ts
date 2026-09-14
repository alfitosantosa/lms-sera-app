// model Schedule {
//   id             String       @id @default(cuid())
//   classId        String?
//   tahfidzGroupId String?
//   subjectId      String
//   teacherId      String
//   academicYearId String
//   dayOfWeek      Int
//   startTime      String
//   endTime        String
//   room           String?
//   isActive       Boolean      @default(true)
//   assignments    Assignment[]
//   attendances    Attendance[]
//   grades         Grade[]
//   academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
//   class          Class?       @relation(fields: [classId], references: [id])
//   tahfidzGroup   TahfidzGroup?  @relation("TahfidzGroupSchedule", fields: [tahfidzGroupId], references: [id])
//   subject        Subject      @relation(fields: [subjectId], references: [id])
//   teacher        UserData     @relation("TeacherSchedule", fields: [teacherId], references: [id])

//   @@unique([classId, subjectId, teacherId, dayOfWeek, startTime])
//   @@map("schedules")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  try {
    // ✅ Optimized: Field-selection to reduce payload, no N+1 risk (all 1-level includes)
    const schedules = await prisma.schedule.findMany({
      where: { academicYear: { foundationId: t.foundationId } },
      select: {
        id: true,
        classId: true,
        tahfidzGroupId: true,
        subjectId: true,
        teacherId: true,
        academicYearId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        room: true,
        isActive: true,
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, name: true } },
        academicYear: { select: { id: true, year: true } },
        tahfidzGroup: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { classId, subjectId, teacherId, academicYearId, dayOfWeek, startTime, endTime, room, tahfidzGroupId } = await request.json();

    // Pastikan seluruh relasi milik yayasan pemanggil
    const [ownedAcademicYear, ownedSubject, ownedTeacher, ownedClass] = await Promise.all([
      prisma.academicYear.findFirst({ where: { id: academicYearId, foundationId: t.foundationId }, select: { id: true } }),
      prisma.subject.findFirst({ where: { id: subjectId, major: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.userData.findFirst({ where: { id: teacherId, foundationId: t.foundationId }, select: { id: true } }),
      classId ? prisma.class.findFirst({ where: { id: classId, major: { foundationId: t.foundationId } }, select: { id: true } }) : null,
    ]);

    if (!ownedAcademicYear || !ownedSubject || !ownedTeacher || (classId && !ownedClass)) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    if (tahfidzGroupId) {
      // TahfidzGroup tidak punya relasi ke Major di schema, jadi diverifikasi lewat daftar major yayasan
      const majors = await prisma.major.findMany({ where: { foundationId: t.foundationId }, select: { id: true } });
      const ownedTahfidzGroup = await prisma.tahfidzGroup.findFirst({
        where: { id: tahfidzGroupId, majorId: { in: majors.map((major) => major.id) } },
        select: { id: true },
      });
      if (!ownedTahfidzGroup) return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const schedule = await prisma.schedule.create({
      data: {
        classId,
        tahfidzGroupId,
        subjectId,
        teacherId,
        academicYearId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      },
    });
    return NextResponse.json(schedule);
  } catch {
    return NextResponse.json({ error: "Jadwal dengan kombinasi kelas, mata pelajaran, guru, hari, dan jam yang sam a sudah ada." }, { status: 409 });
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, classId, subjectId, teacherId, academicYearId, dayOfWeek, startTime, endTime, room, tahfidzGroupId } = await request.json();

    // Pastikan baris & seluruh relasi baru milik yayasan pemanggil
    const [owned, ownedAcademicYear, ownedSubject, ownedTeacher, ownedClass] = await Promise.all([
      prisma.schedule.findFirst({ where: { id, academicYear: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.academicYear.findFirst({ where: { id: academicYearId, foundationId: t.foundationId }, select: { id: true } }),
      prisma.subject.findFirst({ where: { id: subjectId, major: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.userData.findFirst({ where: { id: teacherId, foundationId: t.foundationId }, select: { id: true } }),
      classId ? prisma.class.findFirst({ where: { id: classId, major: { foundationId: t.foundationId } }, select: { id: true } }) : null,
    ]);

    if (!owned || !ownedAcademicYear || !ownedSubject || !ownedTeacher || (classId && !ownedClass)) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    if (tahfidzGroupId) {
      // TahfidzGroup tidak punya relasi ke Major di schema, jadi diverifikasi lewat daftar major yayasan
      const majors = await prisma.major.findMany({ where: { foundationId: t.foundationId }, select: { id: true } });
      const ownedTahfidzGroup = await prisma.tahfidzGroup.findFirst({
        where: { id: tahfidzGroupId, majorId: { in: majors.map((major) => major.id) } },
        select: { id: true },
      });
      if (!ownedTahfidzGroup) return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        classId,
        tahfidzGroupId,
        subjectId,
        teacherId,
        academicYearId,
        dayOfWeek,
        startTime,
        endTime,
        room,
      },
    });
    return NextResponse.json(schedule);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();

    const owned = await prisma.schedule.findFirst({
      where: { id, academicYear: { foundationId: t.foundationId } },
      select: { id: true },
    });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    await prisma.schedule.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    return handlePrismaError(error);
  }
}
