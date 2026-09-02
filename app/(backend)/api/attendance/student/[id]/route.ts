import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

//use params for get id

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: { studentId: id },
      include: {
        schedule: {
          include: {
            class: true,
            subject: true,
            teacher: true,
            academicYear: true,
          },
        },
      },
    });
    return NextResponse.json(attendance);
  } catch (error) {
    return handlePrismaError(error);
  }
}
