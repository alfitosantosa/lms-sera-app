import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const schedules = await prisma.schedule.findMany({
      where: { tahfidzGroupId: id },
      include: { class: true, subject: true, teacher: true, academicYear: true },
    });
    return NextResponse.json(schedules);
  } catch (error) {
    return handlePrismaError(error);
  }
}
