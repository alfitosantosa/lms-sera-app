// model Subject {
//   id          String     @id @default(cuid())
//   code        String     @unique
//   name        String
//   description String?
//   branchId     String?
//   credits     Int        @default(2)
//   isActive    Boolean    @default(true)
//   schedules   Schedule[]
//   branch       Branch?     @relation(fields: [branchId], references: [id])

//   @@map("subjects")
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
    const subjects = await prisma.subject.findMany({
      where: { branch: { foundationId: t.foundationId } },
      include: { branch: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { code, name, description, branchId, credits } = await request.json();

    // Pastikan branch milik yayasan pemanggil
    if (branchId) {
      const ownedBranch = await prisma.branch.findFirst({
        where: { id: branchId, foundationId: t.foundationId },
        select: { id: true },
      });

      if (!ownedBranch) {
        return tenantForbidden("Data tidak ditemukan di yayasan ini");
      }
    }

    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        description,
        branchId,
        credits,
      },
    });
    return NextResponse.json(subject);
  } catch (error) {
    return handlePrismaError(error);
  }
}
export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, code, name, description, branchId, credits } =
      await request.json();

    // Pastikan subject milik yayasan pemanggil
    const ownedSubject = await prisma.subject.findFirst({
      where: { id, branch: { foundationId: t.foundationId } },
      select: { id: true },
    });

    if (!ownedSubject) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    // Pastikan branch tujuan (bila diisi) milik yayasan pemanggil
    if (branchId) {
      const ownedBranch = await prisma.branch.findFirst({
        where: { id: branchId, foundationId: t.foundationId },
        select: { id: true },
      });

      if (!ownedBranch) {
        return tenantForbidden("Data tidak ditemukan di yayasan ini");
      }
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        code,
        name,
        description,
        branchId,
        credits,
      },
    });
    return NextResponse.json(subject);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();

    // Pastikan subject milik yayasan pemanggil
    const ownedSubject = await prisma.subject.findFirst({
      where: { id, branch: { foundationId: t.foundationId } },
      select: { id: true },
    });

    if (!ownedSubject) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    await prisma.subject.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    return handlePrismaError(error);
  }
}
