// model Subject {
//   id          String     @id @default(cuid())
//   code        String     @unique
//   name        String
//   description String?
//   majorId     String?
//   credits     Int        @default(2)
//   isActive    Boolean    @default(true)
//   schedules   Schedule[]
//   major       Major?     @relation(fields: [majorId], references: [id])

//   @@map("subjects")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: { major: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, name, description, majorId, credits } = await request.json();
    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        description,
        majorId,
        credits,
      },
    });
    return NextResponse.json(subject);
  } catch (error) {
    return handlePrismaError(error);
  }
}
export async function PUT(request: NextRequest) {
  try {
    const { id, code, name, description, majorId, credits } = await request.json();
    const subject = await prisma.subject.update({
      where: { id },
      data: {
        code,
        name,
        description,
        majorId,
        credits,
      },
    });
    return NextResponse.json(subject);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    await prisma.subject.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    return handlePrismaError(error);
  }
}
