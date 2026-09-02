// app/api/clerk-users/route.ts
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        userData: null,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return handlePrismaError(error);
  }
}
