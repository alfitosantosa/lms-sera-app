// model Violation {
//   id              String        @id @default(cuid())
//   studentId       String
//   violationTypeId String
//   classId         String
//   description     String?
//   status          String        @default("active")
//   reportedBy      String
//   createdAt       DateTime      @default(now())
//   date            DateTime
//   resolutionDate  DateTime?
//   resolutionNotes String?
//   class           Class         @relation(fields: [classId], references: [id])
//   student         User          @relation("StudentViolation", fields: [studentId], references: [id])
//   violationType   ViolationType @relation(fields: [violationTypeId], references: [id])

//   @@map("violations")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const schedules = await prisma.schedule.findMany({
      where: { teacherId: id },
      include: { class: true, subject: true, teacher: true, academicYear: true },
    });

    // Get all classIds from the teacher's schedules
    const classIds = schedules.map((schedule) => schedule.classId).filter((id): id is string => id !== null);

    // Fetch violations for those classes
    const violationsFromIdTeacher = await prisma.violation.findMany({
      where: {
        classId: {
          in: classIds,
        },
      },
      include: {
        class: true,
        student: true,
        violationType: true,
      },
    });

    return NextResponse.json(violationsFromIdTeacher);
  } catch (error) {
    return handlePrismaError(error);
  }
}
