// model TahfidzGroup {
//   id                  String               @id @default(cuid())
//   name                String
//   grade               Int
//   capacity            Int                  @default(40)
//   isActive            Boolean              @default(true)
//   schedules           Schedule[]           @relation("TahfidzGroupSchedule")
//   students            UserData[]           @relation("UserTahfidzGroup")

//   @@unique([name])
//   @@index([grade])
//   @@map("tahfidz_groups")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  try {
    // TahfidzGroup hanya menyimpan majorId (tanpa relasi), jadi scope lewat daftar major yayasan
    const majors = await prisma.major.findMany({ where: { foundationId: t.foundationId }, select: { id: true } });
    const majorIds = majors.map((major) => major.id);

    // ✅ Optimized: Explicit select for clarity and future-proofing
    // Fields used: id, name, grade, capacity, isActive, _count.students
    const tahfidzGroups = await prisma.tahfidzGroup.findMany({
      where: { majorId: { in: majorIds } },
      select: {
        id: true,
        name: true,
        grade: true,
        majorId: true,
        capacity: true,
        isActive: true,
        _count: { select: { students: true } },
      },
      orderBy: { grade: "asc" },
    });
    return NextResponse.json(tahfidzGroups);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { name, grade, capacity, majorId } = await request.json();
    if (!name || !grade) {
      return NextResponse.json({ error: "Name, grade, and capacity are required" }, { status: 400 });
    }
    if (!majorId) {
      return NextResponse.json({ error: "Major (majorId) wajib diisi" }, { status: 400 });
    }

    // Pastikan major milik yayasan ini
    const ownedMajor = await prisma.major.findFirst({
      where: { id: majorId, foundationId: t.foundationId },
      select: { id: true },
    });

    if (!ownedMajor) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const newTahfidzGroup = await prisma.tahfidzGroup.create({
      data: {
        name,
        grade,
        capacity: capacity || 40,
        majorId,
      },
    });

    return NextResponse.json(newTahfidzGroup, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, name, grade, capacity, majorId } = await request.json();
    if (!id || !name || !grade) {
      return NextResponse.json({ error: "ID, name, grade, and capacity are required" }, { status: 400 });
    }

    // Kepemilikan grup & major tujuan sama-sama harus milik yayasan ini
    const owned = await prisma.tahfidzGroup.findFirst({ where: { id }, select: { id: true, majorId: true } });
    const targetMajorId = majorId ?? owned?.majorId;
    const ownedMajor = targetMajorId
      ? await prisma.major.findFirst({ where: { id: targetMajorId, foundationId: t.foundationId }, select: { id: true } })
      : null;

    if (!owned || !ownedMajor) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const updatedTahfidzGroup = await prisma.tahfidzGroup.update({
      where: { id },
      data: {
        name,
        grade,
        capacity: capacity || 40,
        majorId: targetMajorId,
      },
    });

    return NextResponse.json(updatedTahfidzGroup);
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

    const owned = await prisma.tahfidzGroup.findFirst({ where: { id }, select: { id: true, majorId: true } });
    const ownedMajor = owned
      ? await prisma.major.findFirst({ where: { id: owned.majorId, foundationId: t.foundationId }, select: { id: true } })
      : null;

    if (!owned || !ownedMajor) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const deletedTahfidzGroup = await prisma.tahfidzGroup.delete({
      where: { id },
    });

    return NextResponse.json(deletedTahfidzGroup);
  } catch (error) {
    return handlePrismaError(error);
  }
}
