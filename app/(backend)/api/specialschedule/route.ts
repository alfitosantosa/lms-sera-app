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
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  try {
    // ✅ Optimized: Select only accessed fields from academicYear relation
    // Fields used: id, title, description, eventDate, eventType, isPublished, academicYearId, createdAt, updatedAt, academicYear.year, academicYear.semester
    const specialSchedules = await prisma.calendarEvent.findMany({
      where: { foundationId: t.foundationId },
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
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { title, description, eventDate, eventType, academicYearId, isPublished } = await request.json();

    // Pastikan tahun ajaran milik yayasan pemanggil
    const ownedAcademicYear = await prisma.academicYear.findFirst({
      where: { id: academicYearId, foundationId: t.foundationId },
      select: { id: true },
    });
    if (!ownedAcademicYear) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const specialSchedule = await prisma.calendarEvent.create({
      data: { title, description, eventDate, eventType, academicYearId, isPublished, foundationId: t.foundationId },
    });
    return NextResponse.json(specialSchedule);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, title, description, eventDate, eventType, academicYearId, isPublished } = await request.json();

    // Pastikan baris & tahun ajaran baru milik yayasan pemanggil
    const [owned, ownedAcademicYear] = await Promise.all([
      prisma.calendarEvent.findFirst({ where: { id, foundationId: t.foundationId }, select: { id: true } }),
      prisma.academicYear.findFirst({ where: { id: academicYearId, foundationId: t.foundationId }, select: { id: true } }),
    ]);
    if (!owned || !ownedAcademicYear) return tenantForbidden("Data tidak ditemukan di yayasan ini");

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
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();

    const owned = await prisma.calendarEvent.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const specialSchedule = await prisma.calendarEvent.delete({ where: { id } });
    return NextResponse.json(specialSchedule);
  } catch (error) {
    console.error("Error deleting special schedule:", error);
    return NextResponse.error();
  }
}
