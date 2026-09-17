// model Role {
//   id          String   @id @default(cuid())
//   name        String   @unique
//   description String
//   permissions String[]
//   isActive    Boolean  @default(true)
//   users       User[]

//   @@map("roles")
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
    // ✅ Optimized: Use select to drop unused createdAt/updatedAt
    // Fields used: id, name, description, isActive, permissions, _count.userData
    // Role bawaan/sistem (foundationId NULL) tetap ditampilkan.
    const roles = await prisma.role.findMany({
      where: { OR: [{ foundationId: t.foundationId }, { foundationId: null }] },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        permissions: true,
        _count: { select: { userData: true } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { name, description, permissions } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        // foundationId selalu dari sesi, bukan dari body
        foundationId: t.foundationId,
        permissions: {
          set: permissions || [],
        },
      },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, name, description, permissions, isActive } =
      await request.json();
    if (!id || !name) {
      return NextResponse.json(
        { error: "ID and name are required" },
        { status: 400 },
      );
    }

    // Role milik yayasan ini boleh diubah; role bersama (foundationId NULL)
    // juga boleh, karena body tidak pernah dipakai untuk mengubah foundationId.
    const owned = await prisma.role.findFirst({
      where: {
        id,
        OR: [{ foundationId: t.foundationId }, { foundationId: null }],
      },
      select: { id: true },
    });
    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        permissions: {
          set: permissions || [],
        },
      },
    });

    return NextResponse.json(updatedRole);
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

    // Role bersama (foundationId NULL) tidak boleh dihapus dari yayasan lain
    const owned = await prisma.role.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });
    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const deletedRole = await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json(deletedRole);
  } catch (error) {
    return handlePrismaError(error);
  }
}
