// model CalendarEvent {
//   id             String       @id @default(cuid())
//   title          String
//   description    String?
//   eventDate      DateTime
//   eventType      String
//   isPublished    Boolean      @default(false)
//   academicYearId String
//   createdAt      DateTime     @default(now())
//   updatedAt      DateTime     @updatedAt
//   academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])

//   @@map("calendar_events")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // ✅ Optimized: Select only accessed fields from academicYear relation
    // Fields used: id, title, description, eventDate, eventType, isPublished, academicYearId, createdAt, updatedAt, academicYear.year, academicYear.semester
    const specialSchedules = await prisma.calendarEvent.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        eventDate: true,
        eventType: true,
        isPublished: true,
        academicYearId: true,
        createdAt: true,
        updatedAt: true,
        academicYear: {
          select: { id: true, year: true },
        },
      },
    });
    return NextResponse.json(specialSchedules);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, eventDate, eventType, academicYearId, isPublished } = await request.json();
    const specialSchedule = await prisma.calendarEvent.create({
      data: { title, description, eventDate, eventType, academicYearId, isPublished },
    });
    return NextResponse.json(specialSchedule);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, eventDate, eventType, academicYearId, isPublished } = await request.json();
    const specialSchedule = await prisma.calendarEvent.update({
      where: { id },
      data: { title, description, eventDate, eventType, academicYearId, isPublished },
    });
    return NextResponse.json(specialSchedule);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const specialSchedule = await prisma.calendarEvent.delete({ where: { id } });
    return NextResponse.json(specialSchedule);
  } catch (error) {
    console.error("Error deleting special schedule:", error);
    return NextResponse.error();
  }
}
