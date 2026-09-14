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
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  try {
    const tahfidzRecords = await prisma.tahfidzRecord.findMany({
      where: { student: { foundationId: t.foundationId } },
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
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { studentId, teacherId, surahQuranId, startVerse, endVerse, grade, date, notes } = await request.json();

    // Pastikan siswa & guru (bila ada) milik yayasan ini
    const [ownedStudent, ownedTeacher] = await Promise.all([
      studentId
        ? prisma.userData.findFirst({ where: { id: studentId, foundationId: t.foundationId }, select: { id: true } })
        : null,
      teacherId
        ? prisma.userData.findFirst({ where: { id: teacherId, foundationId: t.foundationId }, select: { id: true } })
        : null,
    ]);

    if (studentId && !ownedStudent) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }
    if (teacherId && !ownedTeacher) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

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
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const data = await request.json();

    // Pastikan data milik yayasan ini, sekaligus validasi siswa & guru barunya
    const [owned, ownedStudent, ownedTeacher] = await Promise.all([
      prisma.tahfidzRecord.findFirst({
        where: { id: data.id, student: { foundationId: t.foundationId } },
        select: { id: true },
      }),
      data.studentId
        ? prisma.userData.findFirst({ where: { id: data.studentId, foundationId: t.foundationId }, select: { id: true } })
        : null,
      data.teacherId
        ? prisma.userData.findFirst({ where: { id: data.teacherId, foundationId: t.foundationId }, select: { id: true } })
        : null,
    ]);

    if (!owned || (data.studentId && !ownedStudent) || (data.teacherId && !ownedTeacher)) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

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
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const data = await request.json();

    const owned = await prisma.tahfidzRecord.findFirst({
      where: { id: data.id, student: { foundationId: t.foundationId } },
      select: { id: true },
    });

    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const deletedRecord = await prisma.tahfidzRecord.delete({
      where: { id: data.id },
    });
    return NextResponse.json(deletedRecord);
  } catch (error) {
    return handlePrismaError(error);
  }
}
