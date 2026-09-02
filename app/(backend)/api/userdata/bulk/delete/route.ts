import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedUser = await prisma.userData.deleteMany({
      where: {
        id: { in: data },
      },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    return handlePrismaError(error);
  }
}
