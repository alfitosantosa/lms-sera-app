"use server";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const student = await prisma.userData.findMany({
      where: { tahfidzGroup: { id } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });
    return NextResponse.json(student);
  } catch (error) {
    return handlePrismaError(error);
  }
}
