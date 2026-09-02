// model Class {
//   id             String       @id @default(cuid())
//   name           String
//   grade          Int
//   majorId        String
//   academicYearId String
//   capacity       Int          @default(36)
//   academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
//   major          Major        @relation(fields: [majorId], references: [id])
//   schedules      Schedule[]
//   students       Student[]
//   violations     Violation[]

//   @@unique([name, academicYearId])
//   @@map("classes")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        academicYear: true,
        major: true,
        students: {
          orderBy: {
            name: "asc",
          },
        },
        schedules: true,
        _count: {
          select: {
            students: true,
            schedules: true,
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    return handlePrismaError(error);
  }
}
