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
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  try {
    // TahfidzGroup hanya menyimpan branchId (tanpa relasi), jadi scope lewat daftar branch yayasan
    const branchs = await prisma.branch.findMany({
      where: { foundationId: t.foundationId },
      select: { id: true },
    });
    const branchIds = branchs.map((branch) => branch.id);

    // ✅ Optimized: Explicit select for clarity and future-proofing
    // Fields used: id, name, grade, capacity, isActive, _count.students
    const tahfidzGroups = await prisma.tahfidzGroup.findMany({
      where: { branchId: { in: branchIds } },
      select: {
        id: true,
        name: true,
        grade: true,
        branchId: true,
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
    const { name, grade, capacity, branchId } = await request.json();
    if (!name || !grade) {
      return NextResponse.json(
        { error: "Name, grade, and capacity are required" },
        { status: 400 },
      );
    }
    if (!branchId) {
      return NextResponse.json(
        { error: "Branch (branchId) wajib diisi" },
        { status: 400 },
      );
    }

    // Pastikan branch milik yayasan ini
    const ownedBranch = await prisma.branch.findFirst({
      where: { id: branchId, foundationId: t.foundationId },
      select: { id: true },
    });

    if (!ownedBranch) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const newTahfidzGroup = await prisma.tahfidzGroup.create({
      data: {
        name,
        grade,
        capacity: capacity || 40,
        branchId,
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
    const { id, name, grade, capacity, branchId } = await request.json();
    if (!id || !name || !grade) {
      return NextResponse.json(
        { error: "ID, name, grade, and capacity are required" },
        { status: 400 },
      );
    }

    // Kepemilikan grup & branch tujuan sama-sama harus milik yayasan ini
    const owned = await prisma.tahfidzGroup.findFirst({
      where: { id },
      select: { id: true, branchId: true },
    });
    const targetBranchId = branchId ?? owned?.branchId;
    const ownedBranch = targetBranchId
      ? await prisma.branch.findFirst({
          where: { id: targetBranchId, foundationId: t.foundationId },
          select: { id: true },
        })
      : null;

    if (!owned || !ownedBranch) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const updatedTahfidzGroup = await prisma.tahfidzGroup.update({
      where: { id },
      data: {
        name,
        grade,
        capacity: capacity || 40,
        branchId: targetBranchId,
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

    const owned = await prisma.tahfidzGroup.findFirst({
      where: { id },
      select: { id: true, branchId: true },
    });
    const ownedBranch = owned
      ? await prisma.branch.findFirst({
          where: { id: owned.branchId, foundationId: t.foundationId },
          select: { id: true },
        })
      : null;

    if (!owned || !ownedBranch) {
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
