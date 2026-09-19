// model Branch {
//   id          String    @id @default(cuid())
//   code        String    @unique
//   name        String
//   description String?
//   isActive    Boolean   @default(true)
//   adminName   String?
//   signatureUrl String?
//   classes     Class[]
//   students    Student[]
//   subjects    Subject[]
//   paymenttype   // Paymenttype[]

//   @@map("branchs")
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
    const branchs = await prisma.branch.findMany({
      where: { foundationId: t.foundationId },
      include: {
        _count: {
          select: {
            classes: true,
            students: {
              where: {
                role: {
                  name: "Student",
                },
              },
            },
            subjects: true,
            paymenttype: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(branchs);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const {
      code,
      name,
      description,
      isActive,
      phone,
      address,
      adminName,
      signatureUrl,
    } = await request.json();
    if (!code || !name) {
      return NextResponse.json(
        { error: "Code and name are required" },
        { status: 400 },
      );
    }

    const newBranch = await prisma.branch.create({
      data: {
        code,
        name,
        description,
        phone,
        address,
        adminName,
        signatureUrl,
        isActive: isActive !== undefined ? isActive : true,
        // Default to true if not provided
        foundationId: t.foundationId,
      },
    });

    return NextResponse.json(newBranch, { status: 201 });
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json(
      { error: "Failed to create branch" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const {
      id,
      code,
      name,
      description,
      isActive,
      phone,
      address,
      adminName,
      signatureUrl,
    } = await request.json();
    if (!id || !code || !name) {
      return NextResponse.json(
        { error: "ID, code, and name are required" },
        { status: 400 },
      );
    }

    // Pastikan branch milik yayasan pemanggil
    const owned = await prisma.branch.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });

    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: {
        code,
        name,
        description,
        phone,
        address,
        adminName,
        signatureUrl,
        isActive: isActive !== undefined ? isActive : true,
        // Default to true if not provided
      },
    });

    return NextResponse.json(updatedBranch, { status: 200 });
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json(
      { error: "Failed to update branch" },
      { status: 500 },
    );
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

    // Pastikan branch milik yayasan pemanggil
    const owned = await prisma.branch.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });

    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const deletedBranch = await prisma.branch.delete({
      where: { id },
    });

    return NextResponse.json(deletedBranch, { status: 200 });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return NextResponse.json(
      { error: "Failed to delete branch" },
      { status: 500 },
    );
  }
}
