import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ majorId: string }> }) {
  const { majorId } = await params;

  if (!majorId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  try {
    const payments = await prisma.paymentItems.findMany({
      where: {
        student: {
          majorId: majorId,
        },
      },
      include: {
        // student: true,
        PaymentType: true,
        payment: true,
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return handlePrismaError(error);
  }
}
