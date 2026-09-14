// model Foundation {
// id             String @id @unique
// name           String
// imageUrl       String
// foundationCode String
// address        String
// phone          String
// userData       UserData[]
// major          Major[]
// user           User[]
// }

import { auth } from "@/lib/auth";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden, tenantUnauthorized } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  try {
    const getAllFoundation = await prisma.foundation.findMany({
      where: { id: t.foundationId },
      include: {
        _count: {
          select: {
            user: true,
            major: true,
            userData: true,
          },
        },
      },
    });
    return NextResponse.json(getAllFoundation);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // User belum punya yayasan saat membuat yayasan baru, jadi cukup verifikasi sesi.
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) return tenantUnauthorized();

    // `userId` dari body diabaikan, selalu pakai user dari sesi.
    const { name, imageUrl, foundationCode, address, phone } = await request.json();
    // Create the foundation
    const createNewFoundation = await prisma.foundation.create({
      data: {
        name,
        imageUrl,
        foundationCode,
        address,
        phone,
      },
    });

    const AssignUserFoundation = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        foundation: {
          connect: {
            id: createNewFoundation.id,
          },
        },
      },
    });

    // Role Admin wajib milik yayasan baru, bukan role milik yayasan lain.
    const getIdRoleAdmin =
      (await prisma.role.findFirst({
        where: {
          name: "Admin",
          foundationId: createNewFoundation.id,
        },
      })) ??
      (await prisma.role.create({
        data: {
          name: "Admin",
          description: "Administrator yayasan",
          permissions: [],
          foundationId: createNewFoundation.id,
        },
      }));

    const AssignUserDataFoundation = await prisma.userData.create({
      data: {
        name: AssignUserFoundation.name,
        email: AssignUserFoundation.email,
        userId: AssignUserFoundation?.id,
        roleId: getIdRoleAdmin?.id,
        foundationId: createNewFoundation.id,
      },
    });
    return NextResponse.json({ foundation: createNewFoundation, user: AssignUserFoundation, userData: AssignUserDataFoundation });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  const { id, name, imageUrl, foundationCode, address, phone } = await request.json();
  try {
    // Hanya yayasan milik pemanggil yang boleh diubah.
    if (id !== t.foundationId) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const updateFoundation = await prisma.foundation.update({
      where: {
        id: id,
      },
      data: {
        name,
        imageUrl,
        foundationCode,
        address,
        phone,
      },
    });
    return NextResponse.json(updateFoundation);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  const { id } = await request.json();

  try {
    // Hanya yayasan milik pemanggil yang boleh dihapus.
    if (id !== t.foundationId) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const deleteFoundation = await prisma.foundation.delete({
      where: { id },
    });
    return NextResponse.json(deleteFoundation);
  } catch (error) {
    return handlePrismaError(error);
  }
}
