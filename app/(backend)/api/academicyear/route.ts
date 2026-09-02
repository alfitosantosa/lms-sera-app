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
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // ✅ Optimized: Drop unused createdAt/updatedAt, keep all accessed fields and _count
    const academicYears = await prisma.academicYear.findMany({
      select: {
        id: true,
        year: true,
        startDate: true,
        endDate: true,
        isActive: true,
        _count: { select: { students: true, schedules: true, calendarEvents: true, classes: true } },
      },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(academicYears);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { year, startDate, endDate, isActive } = await request.json();
    if (!year || !startDate || !endDate) {
      return NextResponse.json({ error: "Year, startDate, and endDate are required" }, { status: 400 });
    }

    const newAcademicYear = await prisma.academicYear.create({
      data: {
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive !== undefined ? isActive : false, // Default to false if not provided
      },
    });

    return NextResponse.json(newAcademicYear, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, year, startDate, endDate, isActive } = await request.json();
    if (!id || !year || !startDate || !endDate) {
      return NextResponse.json({ error: "ID, year, startDate, and endDate are required" }, { status: 400 });
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
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedAcademicYear = await prisma.academicYear.delete({
      where: { id },
    });

    return NextResponse.json(deletedAcademicYear);
  } catch (error) {
    return handlePrismaError(error);
  }
}
