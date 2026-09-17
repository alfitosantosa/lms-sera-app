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

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  try {
    const violations = await prisma.violation.findMany({
      where: { student: { foundationId: t.foundationId } },
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
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  const {
    studentId,
    violationTypeId,
    classId,
    description,
    status,
    reportedBy,
    date,
    resolutionDate,
    resolutionNotes,
  } = await request.json();

  try {
    // Pastikan siswa, kelas, dan jenis pelanggaran milik yayasan ini
    const [ownedStudent, ownedClass, ownedViolationType] = await Promise.all([
      prisma.userData.findFirst({
        where: { id: studentId, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.class.findFirst({
        where: { id: classId, major: { foundationId: t.foundationId } },
        select: { id: true },
      }),
      prisma.violationType.findFirst({
        where: {
          id: violationTypeId,
          academicYear: { foundationId: t.foundationId },
        },
        select: { id: true },
      }),
    ]);

    if (!ownedStudent || !ownedClass || !ownedViolationType) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

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
    return NextResponse.json(
      { error: "Failed to create violation" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const {
      id,
      studentId,
      violationTypeId,
      classId,
      description,
      status,
      reportedBy,
      date,
      resolutionDate,
      resolutionNotes,
    } = await request.json();

    // Pastikan data milik yayasan ini, sekaligus validasi relasi barunya
    const [owned, ownedStudent, ownedClass, ownedViolationType] =
      await Promise.all([
        prisma.violation.findFirst({
          where: { id, student: { foundationId: t.foundationId } },
          select: { id: true },
        }),
        prisma.userData.findFirst({
          where: { id: studentId, foundationId: t.foundationId },
          select: { id: true },
        }),
        prisma.class.findFirst({
          where: { id: classId, major: { foundationId: t.foundationId } },
          select: { id: true },
        }),
        prisma.violationType.findFirst({
          where: {
            id: violationTypeId,
            academicYear: { foundationId: t.foundationId },
          },
          select: { id: true },
        }),
      ]);

    if (!owned || !ownedStudent || !ownedClass || !ownedViolationType) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

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
    return NextResponse.json(
      { error: "Failed to update violation" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();

    const owned = await prisma.violation.findFirst({
      where: { id, student: { foundationId: t.foundationId } },
      select: { id: true },
    });

    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const violation = await prisma.violation.delete({
      where: { id },
    });
    return NextResponse.json(violation);
  } catch (error) {
    console.error("Error deleting violation:", error);
    return NextResponse.json(
      { error: "Failed to delete violation" },
      { status: 500 },
    );
  }
}
