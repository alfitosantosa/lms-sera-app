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

export async function GET() {
  try {
    const violations = await prisma.violation.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        violationType: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return NextResponse.json(violations);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const { studentId, violationTypeId, classId, description, status, reportedBy, date, resolutionDate, resolutionNotes } = await request.json();

  try {
    const violation = await prisma.violation.create({
      data: {
        studentId,
        violationTypeId,
        classId,
        description,
        status,
        reportedBy,
        date,
        resolutionDate,
        resolutionNotes,
      },
    });
    return NextResponse.json(violation);
  } catch (error) {
    console.error("Error creating violation:", error);
    return NextResponse.json({ error: "Failed to create violation" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, studentId, violationTypeId, classId, description, status, reportedBy, date, resolutionDate, resolutionNotes } = await request.json();

    const violation = await prisma.violation.update({
      where: { id },
      data: {
        studentId,
        violationTypeId,
        classId,
        description,
        status,
        reportedBy,
        date,
        resolutionDate,
        resolutionNotes,
      },
    });
    return NextResponse.json(violation);
  } catch (error) {
    console.error("Error updating violation:", error);
    return NextResponse.json({ error: "Failed to update violation" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    const violation = await prisma.violation.delete({
      where: { id },
    });
    return NextResponse.json(violation);
  } catch (error) {
    console.error("Error deleting violation:", error);
    return NextResponse.json({ error: "Failed to delete violation" }, { status: 500 });
  }
}
