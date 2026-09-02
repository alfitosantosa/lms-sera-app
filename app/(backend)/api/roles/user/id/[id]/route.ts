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

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const user = await prisma.userData.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.role);
  } catch (error) {
    return handlePrismaError(error);
  }
}
