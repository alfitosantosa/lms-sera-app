import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  if (!studentId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  try {
    const payments = await prisma.paymentItems.findMany({
      where: { studentId: studentId, isPaid: false },
      include: {
        student: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
