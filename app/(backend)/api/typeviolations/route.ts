// model ViolationType {
//   id             String       @id @default(cuid())
//   name           String
//   description    String
//   points         Int
//   category       String
//   academicYearId String
//   academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
//   violations     Violation[]

//   @@map("violation_types")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const violationTypes = await prisma.violationType.findMany();
    return NextResponse.json(violationTypes);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, points, category, academicYearId } = await request.json();

    const violationType = await prisma.violationType.create({
      data: {
        name,
        description,
        points,
        category,
        academicYearId,
      },
    });
    return NextResponse.json(violationType);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, description, points, category, academicYearId } = await request.json();

    const violationType = await prisma.violationType.update({
      where: { id },
      data: {
        name,
        description,
        points,
        category,
        academicYearId,
      },
    });
    return NextResponse.json(violationType);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    const violationType = await prisma.violationType.delete({
      where: { id },
    });
    return NextResponse.json(violationType);
  } catch (error) {
    return handlePrismaError(error);
  }
}
