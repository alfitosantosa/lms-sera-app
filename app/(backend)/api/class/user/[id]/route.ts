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
    const classes = await prisma.class.findFirst({
      where: { students: { some: { id: id } } }, // Fetch class where the student with id matches
      include: {
        academicYear: true,
        major: true,
        students: true,
        schedules: true,
        violations: true,

        _count: { select: { students: true, schedules: true, violations: true } },
      },
    });
    if (!classes) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    return NextResponse.json(classes);
  } catch (error) {
    return handlePrismaError(error);
  }
}
