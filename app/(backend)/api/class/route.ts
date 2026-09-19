// model Class {
//   id             String       @id @default(cuid())
//   name           String
//   grade          Int
//   branchId        String
//   academicYearId String
//   capacity       Int          @default(36)
//   academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
//   branch          Branch        @relation(fields: [branchId], references: [id])
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
    // Keeping: id, name, grade, capacity, branchId, academicYearId, branch.id/name, academicYear.id/year, _count.students
    const classes = await prisma.class.findMany({
      where: { branch: { foundationId: t.foundationId } },
      select: {
        id: true,
        name: true,
        grade: true,
        capacity: true,
        branchId: true,
        academicYearId: true,
        branch: {
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
    const { name, grade, branchId, academicYearId, capacity } =
      await request.json();
    if (!name || !grade || !branchId || !academicYearId) {
      return NextResponse.json(
        { error: "Name, grade, branchId, and academicYearId are required" },
        { status: 400 },
      );
    }

    // Pastikan branch & tahun ajaran milik yayasan pemanggil
    const [ownedBranch, ownedAcademicYear] = await Promise.all([
      prisma.branch.findFirst({
        where: { id: branchId, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.academicYear.findFirst({
        where: { id: academicYearId, foundationId: t.foundationId },
        select: { id: true },
      }),
    ]);

    if (!ownedBranch || !ownedAcademicYear) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        branchId,
        academicYearId,
        capacity: capacity || 36, // Default capacity if not provided
      },
      include: {
        academicYear: true,
        branch: true,
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
    const { id, name, grade, branchId, academicYearId, capacity } =
      await request.json();
    if (!id || !name || !grade || !branchId || !academicYearId) {
      return NextResponse.json(
        { error: "ID, name, grade, branchId, and academicYearId are required" },
        { status: 400 },
      );
    }

    // Pastikan kelas milik yayasan pemanggil, sekaligus branch & tahun ajaran tujuan
    const [ownedClass, ownedBranch, ownedAcademicYear] = await Promise.all([
      prisma.class.findFirst({
        where: { id, branch: { foundationId: t.foundationId } },
        select: { id: true },
      }),
      prisma.branch.findFirst({
        where: { id: branchId, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.academicYear.findFirst({
        where: { id: academicYearId, foundationId: t.foundationId },
        select: { id: true },
      }),
    ]);

    if (!ownedClass || !ownedBranch || !ownedAcademicYear) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        grade,
        branchId,
        academicYearId,
        capacity: capacity || 36, // Default capacity if not provided
      },
      include: {
        academicYear: true,
        branch: true,
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
      where: { id, branch: { foundationId: t.foundationId } },
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
