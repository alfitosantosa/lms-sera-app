// model TahfidzRecord {
//   id         String      @id @default(cuid())
//   startVerse Int?
//   endVerse   Int?
//   grade      String?
//   date       DateTime
//   notes      String?
//   createdAt  DateTime    @default(now())
//   updatedAt  DateTime    @updatedAt
//   studentId  String?
//   teacherId  String?
//   surahQuranId String?
//   student    UserData?   @relation("TahfidzStudent", fields: [studentId], references: [id], onDelete: Cascade)
//   surah      SurahQuran? @relation(fields: [surahQuranId], references: [id])
//   teacher    UserData?   @relation("TahfidzTeacher", fields: [teacherId], references: [id], onDelete: Cascade)

//   @@map("tahfidz_records")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const tahfidzRecords = await prisma.tahfidzRecord.findMany({
      include: {
        student: true,
        teacher: true,
        surah: true,
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(tahfidzRecords);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { studentId, teacherId, surahQuranId, startVerse, endVerse, grade, date, notes } = await request.json();
    const newRecord = await prisma.tahfidzRecord.create({
      data: {
        studentId,
        teacherId,
        surahQuranId,
        startVerse,
        endVerse,
        grade,
        date: new Date(date),
        notes,
      },
    });
    return NextResponse.json(newRecord);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const updatedRecord = await prisma.tahfidzRecord.update({
      where: { id: data.id },
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        surahQuranId: data.surah,
        startVerse: data.startVerse,
        endVerse: data.endVerse,
        grade: data.grade,
        date: new Date(data.date),
        notes: data.notes,
      },
    });
    return NextResponse.json(updatedRecord);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    const deletedRecord = await prisma.tahfidzRecord.delete({
      where: { id: data.id },
    });
    return NextResponse.json(deletedRecord);
  } catch (error) {
    return handlePrismaError(error);
  }
}
