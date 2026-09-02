import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const major = await prisma.major.findUnique({
      where: { id },
    });

    if (!major) {
      return NextResponse.json({ success: false, message: "Major not found" }, { status: 404 });
    }

    return NextResponse.json(major);
  } catch (error) {
    return handlePrismaError(error);
  }
}
