// model Class {
//   id             String       @id @default(cuid())
//   name           String
//   grade          Int
//   branchId        String
//   academicYearId String
//   capacity       Int          @default(36)
//   academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
//   branch          Branch        @relation(fields: [branchId], references: [id])
//   schedules      Schedule[]
//   students       Student[]
//   violations     Violation[]

//   @@unique([name, academicYearId])
//   @@map("classes")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  const { id } = await params;

  try {
    const classData = await prisma.class.findMany({
      where: {
        branchId: id,
        branch: { foundationId: t.foundationId },
      },
      include: {
        academicYear: true,
        branch: true,
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
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(classData);
  } catch (error) {
    return handlePrismaError(error);
  }
}
