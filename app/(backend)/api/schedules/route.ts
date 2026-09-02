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
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // ✅ Optimized: Field-selection to reduce payload, no N+1 risk (all 1-level includes)
    const schedules = await prisma.schedule.findMany({
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
  try {
    const { classId, subjectId, teacherId, academicYearId, dayOfWeek, startTime, endTime, room, tahfidzGroupId } = await request.json();
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
  try {
    const { id, classId, subjectId, teacherId, academicYearId, dayOfWeek, startTime, endTime, room, tahfidzGroupId } = await request.json();
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
  try {
    const { id } = await request.json();
    await prisma.schedule.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    return handlePrismaError(error);
  }
}
