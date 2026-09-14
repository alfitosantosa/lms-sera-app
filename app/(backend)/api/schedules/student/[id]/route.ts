// model Schedule {
//   id             String       @id @default(cuid())
//   classId        String
//   subjectId      String
//   teacherId      String
//   academicYearId String
//   dayOfWeek      Int
//   startTime      String
//   endTime        String
//   room           String?
//   attendances    Attendance[]
//   academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
//   class          Class        @relation(fields: [classId], references: [id])
//   subject        Subject      @relation(fields: [subjectId], references: [id])
//   teacher        User         @relation("TeacherSchedule", fields: [teacherId], references: [id])

//   @@unique([classId, subjectId, teacherId, dayOfWeek, startTime])
//   @@map("schedules")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  const { id } = await params;
  try {
    const schedules = await prisma.schedule.findMany({
      // get schedules where the related class has the student
      where: { class: { students: { some: { id } } }, academicYear: { foundationId: t.foundationId } },
      include: { class: true, subject: true, teacher: true, academicYear: true },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { classId, subjectId, teacherId, academicYearId, dayOfWeek, startTime, endTime, room } = await request.json();

    // Pastikan seluruh relasi milik yayasan pemanggil
    const [ownedClass, ownedSubject, ownedTeacher, ownedAcademicYear] = await Promise.all([
      prisma.class.findFirst({ where: { id: classId, major: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.subject.findFirst({ where: { id: subjectId, major: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.userData.findFirst({ where: { id: teacherId, foundationId: t.foundationId }, select: { id: true } }),
      prisma.academicYear.findFirst({ where: { id: academicYearId, foundationId: t.foundationId }, select: { id: true } }),
    ]);

    if (!ownedClass || !ownedSubject || !ownedTeacher || !ownedAcademicYear) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const schedule = await prisma.schedule.create({
      data: {
        classId,
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

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, classId, subjectId, teacherId, academicYearId, dayOfWeek, startTime, endTime, room } = await request.json();

    // Pastikan baris & seluruh relasi baru milik yayasan pemanggil
    const [owned, ownedClass, ownedSubject, ownedTeacher, ownedAcademicYear] = await Promise.all([
      prisma.schedule.findFirst({ where: { id, academicYear: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.class.findFirst({ where: { id: classId, major: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.subject.findFirst({ where: { id: subjectId, major: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.userData.findFirst({ where: { id: teacherId, foundationId: t.foundationId }, select: { id: true } }),
      prisma.academicYear.findFirst({ where: { id: academicYearId, foundationId: t.foundationId }, select: { id: true } }),
    ]);

    if (!owned || !ownedClass || !ownedSubject || !ownedTeacher || !ownedAcademicYear) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        classId,
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
