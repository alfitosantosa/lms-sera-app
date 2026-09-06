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

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const getAllFoundation = await prisma.foundation.findMany({
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
    const { name, imageUrl, foundationCode, address, phone, userId } = await request.json();

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

    const getIdRoleAdmin = await prisma.role.findFirst({
      where: {
        name: "Admin",
      },
    });

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
  const { id, name, imageUrl, foundationCode, address, phone } = await request.json();
  try {
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
  const { id } = await request.json();

  try {
    const deleteFoundation = await prisma.foundation.delete({
      where: id,
    });
    return NextResponse.json(deleteFoundation);
  } catch (error) {
    return handlePrismaError(error);
  }
}
