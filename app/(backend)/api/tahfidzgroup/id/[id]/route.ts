"use server";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const tahfidzGroup = await prisma.tahfidzGroup.findUnique({
      where: { id },
      include: {
        students: {
          orderBy: {
            name: "asc",
          },
        },
        schedules: true,
        _count: { select: { students: true, schedules: true } },
      },
    });
    if (!tahfidzGroup) {
      return NextResponse.json({ error: "Tahfidz group not found" }, { status: 404 });
    }
    return NextResponse.json(tahfidzGroup);
  } catch (error) {
    return handlePrismaError(error);
  }
}
