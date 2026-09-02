import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ majorId: string }> }) {
  const { majorId } = await params;

  if (!majorId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  try {
    const accountBank = await prisma.accountBank.findMany({
      where: {
        majorId: majorId,
      },
      include: { majors: true },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(accountBank);
  } catch (error) {
    return handlePrismaError(error);
  }
}
