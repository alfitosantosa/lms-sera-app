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
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // ✅ Optimized: Use select to drop unused createdAt/updatedAt
    // Fields used: id, name, description, isActive, permissions, _count.userData
    const roles = await prisma.role.findMany({
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
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, permissions } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          set: permissions || [],
        },
      },
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, description, permissions, isActive } = await request.json();
    if (!id || !name) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
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
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedRole = await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json(deletedRole);
  } catch (error) {
    return handlePrismaError(error);
  }
}
