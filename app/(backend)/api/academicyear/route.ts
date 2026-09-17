// model AcademicYear {
//   id             String          @id @default(cuid())
//   year           String          @unique
//   startDate      DateTime
//   endDate        DateTime
//   isActive       Boolean         @default(false)
//   createdAt      DateTime        @default(now())
//   updatedAt      DateTime        @updatedAt
//   calendarEvents CalendarEvent[]
//   classes        Class[]
//   schedules      Schedule[]
//   students       Student[]
//   violationTypes ViolationType[]

//   @@map("academic_years")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  try {
    // ✅ Optimized: Drop unused createdAt/updatedAt, keep all accessed fields and _count
    const academicYears = await prisma.academicYear.findMany({
      where: { foundationId: t.foundationId },
      select: {
        id: true,
        year: true,
        startDate: true,
        endDate: true,
        isActive: true,
        _count: {
          select: {
            students: true,
            schedules: true,
            calendarEvents: true,
            classes: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(academicYears);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { year, startDate, endDate, isActive } = await request.json();
    if (!year || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Year, startDate, and endDate are required" },
        { status: 400 },
      );
    }

    const newAcademicYear = await prisma.academicYear.create({
      data: {
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : false, // Default to false if not provided
        foundationId: t.foundationId,
      },
    });

    return NextResponse.json(newAcademicYear, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, year, startDate, endDate, isActive } = await request.json();
    if (!id || !year || !startDate || !endDate) {
      return NextResponse.json(
        { error: "ID, year, startDate, and endDate are required" },
        { status: 400 },
      );
    }

    // Pastikan tahun ajaran milik yayasan pemanggil
    const owned = await prisma.academicYear.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });

    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const updatedAcademicYear = await prisma.academicYear.update({
      where: { id },
      data: {
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : false, // Default to false if not provided
      },
    });

    return NextResponse.json(updatedAcademicYear);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Pastikan tahun ajaran milik yayasan pemanggil
    const owned = await prisma.academicYear.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });

    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const deletedAcademicYear = await prisma.academicYear.delete({
      where: { id },
    });

    return NextResponse.json(deletedAcademicYear);
  } catch (error) {
    return handlePrismaError(error);
  }
}
