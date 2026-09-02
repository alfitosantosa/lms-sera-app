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
    const violations = await prisma.violation.findMany({
      where: { studentId: id },
      include: {
        violationType: true,
        class: true,
        student: true,
      },
    });
    return NextResponse.json(violations);
  } catch (error) {
    return handlePrismaError(error);
  }
}
