// model ViolationType {
//   id             String       @id @default(cuid())
//   name           String
//   description    String
//   points         Int
//   category       String
//   academicYearId String
//   academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
//   violations     Violation[]

//   @@map("violation_types")
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
    const violationTypes = await prisma.violationType.findMany({
      where: { academicYear: { foundationId: t.foundationId } },
    });
    return NextResponse.json(violationTypes);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { name, description, points, category, academicYearId } =
      await request.json();

    // Pastikan tahun ajaran milik yayasan ini
    const ownedAcademicYear = await prisma.academicYear.findFirst({
      where: { id: academicYearId, foundationId: t.foundationId },
      select: { id: true },
    });

    if (!ownedAcademicYear) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const violationType = await prisma.violationType.create({
      data: {
        name,
        description,
        points,
        category,
        academicYearId,
      },
    });
    return NextResponse.json(violationType);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, name, description, points, category, academicYearId } =
      await request.json();

    // Pastikan data milik yayasan ini, sekaligus validasi tahun ajaran barunya
    const [owned, ownedAcademicYear] = await Promise.all([
      prisma.violationType.findFirst({
        where: { id, academicYear: { foundationId: t.foundationId } },
        select: { id: true },
      }),
      prisma.academicYear.findFirst({
        where: { id: academicYearId, foundationId: t.foundationId },
        select: { id: true },
      }),
    ]);

    if (!owned || !ownedAcademicYear) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const violationType = await prisma.violationType.update({
      where: { id },
      data: {
        name,
        description,
        points,
        category,
        academicYearId,
      },
    });
    return NextResponse.json(violationType);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();

    const owned = await prisma.violationType.findFirst({
      where: { id, academicYear: { foundationId: t.foundationId } },
      select: { id: true },
    });

    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const violationType = await prisma.violationType.delete({
      where: { id },
    });
    return NextResponse.json(violationType);
  } catch (error) {
    return handlePrismaError(error);
  }
}
