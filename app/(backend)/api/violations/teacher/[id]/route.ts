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
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  const { id } = await params;

  try {
    // Pastikan guru milik yayasan ini
    const ownedTeacher = await prisma.userData.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });

    if (!ownedTeacher) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const schedules = await prisma.schedule.findMany({
      where: { teacherId: id },
      include: {
        class: true,
        subject: true,
        teacher: true,
        academicYear: true,
      },
    });

    // Get all classIds from the teacher's schedules
    const classIds = schedules
      .map((schedule) => schedule.classId)
      .filter((id): id is string => id !== null);

    // Fetch violations for those classes
    const violationsFromIdTeacher = await prisma.violation.findMany({
      where: {
        classId: {
          in: classIds,
        },
        student: { foundationId: t.foundationId },
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
