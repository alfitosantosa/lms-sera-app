// model TahfidzGroup {
//   id                  String               @id @default(cuid())
//   name                String
//   grade               Int
//   capacity            Int                  @default(40)
//   isActive            Boolean              @default(true)
//   schedules           Schedule[]           @relation("TahfidzGroupSchedule")
//   students            UserData[]           @relation("UserTahfidzGroup")

//   @@unique([name])
//   @@index([grade])
//   @@map("tahfidz_groups")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // ✅ Optimized: Explicit select for clarity and future-proofing
    // Fields used: id, name, grade, capacity, isActive, _count.students
    const tahfidzGroups = await prisma.tahfidzGroup.findMany({
      select: {
        id: true,
        name: true,
        grade: true,
        capacity: true,
        isActive: true,
        _count: { select: { students: true } },
      },
      orderBy: { grade: "asc" },
    });
    return NextResponse.json(tahfidzGroups);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, grade, capacity } = await request.json();
    if (!name || !grade) {
      return NextResponse.json({ error: "Name, grade, and capacity are required" }, { status: 400 });
    }

    const newTahfidzGroup = await prisma.tahfidzGroup.create({
      data: {
        name,
        grade,
        capacity: capacity || 40,
      },
    });

    return NextResponse.json(newTahfidzGroup, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, grade, capacity } = await request.json();
    if (!id || !name || !grade) {
      return NextResponse.json({ error: "ID, name, grade, and capacity are required" }, { status: 400 });
    }

    const updatedTahfidzGroup = await prisma.tahfidzGroup.update({
      where: { id },
      data: {
        name,
        grade,
        capacity: capacity || 40,
      },
    });

    return NextResponse.json(updatedTahfidzGroup);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedTahfidzGroup = await prisma.tahfidzGroup.delete({
      where: { id },
    });

    return NextResponse.json(deletedTahfidzGroup);
  } catch (error) {
    return handlePrismaError(error);
  }
}
