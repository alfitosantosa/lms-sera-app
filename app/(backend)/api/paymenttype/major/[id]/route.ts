import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const paymentTypes = await prisma.paymentType.findMany({
      where: {
        majorId: id,
      },
      include: {
        major: true,
      },
    });
    return NextResponse.json(paymentTypes);
  } catch (error) {
    return handlePrismaError(error);
  }
}
