// app/api/clerk-users/route.ts
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get foundationId from query parameters
    const { searchParams } = request.nextUrl;
    const foundationId = searchParams.get("foundationId");

    const users = await prisma.user.findMany({
      where: {
        userData: null,
        foundationId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return handlePrismaError(error);
  }
}
