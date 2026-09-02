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

//use params for get id

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const schedules = await prisma.schedule.findMany({
      where: { classId: id },
      include: { class: true, subject: true, teacher: true, academicYear: true },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    return handlePrismaError(error);
  }
}
