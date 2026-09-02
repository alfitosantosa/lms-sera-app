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
    const { name, imageUrl, foundationCode, address, phone } = await request.json();
    const createNewFoundation = await prisma.foundation.create({
      data: {
        name,
        imageUrl,
        foundationCode,
        address,
        phone,
      },
    });
    return NextResponse.json(createNewFoundation);
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
