// model Class {
//   id             String       @id @default(cuid())
//   name           String
//   grade          Int
//   majorId        String
//   academicYearId String
//   capacity       Int          @default(36)
//   academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
//   major          Major        @relation(fields: [majorId], references: [id])
//   schedules      Schedule[]
//   students       Student[]
//   violations     Violation[]

//   @@unique([name, academicYearId])
//   @@map("classes")
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
    // ✅ Optimized: Field-selection to keep only accessed fields
    // Dropping: _count.schedules, _count.violations (not accessed)
    // Keeping: id, name, grade, capacity, majorId, academicYearId, major.id/name, academicYear.id/year, _count.students
    const classes = await prisma.class.findMany({
      where: { major: { foundationId: t.foundationId } },
      select: {
        id: true,
        name: true,
        grade: true,
        capacity: true,
        majorId: true,
        academicYearId: true,
        major: {
          select: { id: true, name: true },
        },
        academicYear: {
          select: { id: true, year: true },
        },
        _count: { select: { students: true } },
      },
      orderBy: { grade: "asc" },
    });
    return NextResponse.json(classes);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { name, grade, majorId, academicYearId, capacity } =
      await request.json();
    if (!name || !grade || !majorId || !academicYearId) {
      return NextResponse.json(
        { error: "Name, grade, majorId, and academicYearId are required" },
        { status: 400 },
      );
    }

    // Pastikan major & tahun ajaran milik yayasan pemanggil
    const [ownedMajor, ownedAcademicYear] = await Promise.all([
      prisma.major.findFirst({
        where: { id: majorId, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.academicYear.findFirst({
        where: { id: academicYearId, foundationId: t.foundationId },
        select: { id: true },
      }),
    ]);

    if (!ownedMajor || !ownedAcademicYear) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        majorId,
        academicYearId,
        capacity: capacity || 36, // Default capacity if not provided
      },
      include: {
        academicYear: true,
        major: true,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, name, grade, majorId, academicYearId, capacity } =
      await request.json();
    if (!id || !name || !grade || !majorId || !academicYearId) {
      return NextResponse.json(
        { error: "ID, name, grade, majorId, and academicYearId are required" },
        { status: 400 },
      );
    }

    // Pastikan kelas milik yayasan pemanggil, sekaligus major & tahun ajaran tujuan
    const [ownedClass, ownedMajor, ownedAcademicYear] = await Promise.all([
      prisma.class.findFirst({
        where: { id, major: { foundationId: t.foundationId } },
        select: { id: true },
      }),
      prisma.major.findFirst({
        where: { id: majorId, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.academicYear.findFirst({
        where: { id: academicYearId, foundationId: t.foundationId },
        select: { id: true },
      }),
    ]);

    if (!ownedClass || !ownedMajor || !ownedAcademicYear) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        grade,
        majorId,
        academicYearId,
        capacity: capacity || 36, // Default capacity if not provided
      },
      include: {
        academicYear: true,
        major: true,
      },
    });

    return NextResponse.json(updatedClass);
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

    // Pastikan kelas milik yayasan pemanggil
    const ownedClass = await prisma.class.findFirst({
      where: { id, major: { foundationId: t.foundationId } },
      select: { id: true },
    });

    if (!ownedClass) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const deletedClass = await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json(deletedClass, { status: 200 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

// app/api/class/route.ts
