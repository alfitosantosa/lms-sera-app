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
//   surahQuran String?
//   student    UserData?   @relation("TahfidzStudent", fields: [studentId], references: [id], onDelete: Cascade)
//   surah      SurahQuran? @relation(fields: [surahQuran], references: [id])
//   teacher    UserData?   @relation("TahfidzTeacher", fields: [teacherId], references: [id], onDelete: Cascade)

//   @@map("tahfidz_records")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  if (!studentId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  try {
    const tahfidzRecords = await prisma.tahfidzRecord.findMany({
      where: { studentId: studentId },
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
