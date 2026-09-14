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
import { resolveFoundation } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  const { id } = await params;

  try {
    const violations = await prisma.violation.findMany({
      where: { studentId: id, student: { foundationId: t.foundationId } },
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
