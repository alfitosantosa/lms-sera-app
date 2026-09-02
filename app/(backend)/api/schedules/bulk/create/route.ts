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
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { schedules } = await request.json();

    // Validate input
    if (!schedules || !Array.isArray(schedules)) {
      return NextResponse.json({ error: "Invalid data format. Expected array of schedules." }, { status: 400 });
    }

    // Validate each schedule
    const validatedSchedules = schedules.map(
      (schedule: { classId: string; subjectId: string; teacherId: string; academicYearId: string; dayOfWeek: number | string; startTime: string; endTime: string; room?: string | null; isActive?: boolean }) => {
        return {
          classId: schedule.classId,
          subjectId: schedule.subjectId,
          teacherId: schedule.teacherId,
          academicYearId: schedule.academicYearId,
          dayOfWeek: parseInt(String(schedule.dayOfWeek)) || 1,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room || null,
          isActive: schedule.isActive !== undefined ? schedule.isActive : true,
        };
      },
    );

    const result = await prisma.schedule.createMany({
      data: validatedSchedules,
      skipDuplicates: true, // Skip if duplicate exists based on unique constraint
    });

    return NextResponse.json({
      message: `Successfully created ${result.count} schedules`,
      created: result.count,
      total: schedules.length,
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
