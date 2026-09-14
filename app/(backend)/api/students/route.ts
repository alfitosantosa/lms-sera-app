// model User {
//   id          String    @id @default(cuid())
//   clerkId     String?   @unique  // ID dari Clerk
//   roleId      String    // Foreign key ke Role (WAJIB)
//   name        String    // Nama (WAJIB untuk semua)
//   email       String?   @unique
//   avatarUrl   String?

//   // === FIELDS UNTUK STUDENT ===
//   nisn           String?   @unique  // Wajib untuk student
//   birthPlace     String?            // Wajib untuk student
//   birthDate      DateTime?          // Wajib untuk student
//   nik            String?   @unique  // Wajib untuk student
//   address        String?            // Wajib untuk student
//   classId        String?            // Wajib untuk student
//   academicYearId String?            // Wajib untuk student
//   enrollmentDate DateTime?          // Default now() untuk student
//   gender         String?            // Wajib untuk student & teacher
//   graduationDate DateTime?          // Optional untuk student
//   majorId        String?            // Wajib untuk student
//   parentPhone    String?            // Optional untuk student
//   status         String?   @default("active")  // active/inactive/graduated

//   // === FIELDS UNTUK TEACHER ===
//   employeeId     String?   @unique  // Wajib untuk teacher
//   position       String?            // Optional untuk teacher
//   startDate      DateTime?          // Default now() untuk teacher
//   endDate        DateTime?          // Optional untuk teacher

//   // === FIELDS UNTUK PARENT ===
//   studentIds     String[]           // Array ID student (anak-anak) - untuk parent
//   relation       String?            // Father/Mother/Guardian - wajib untuk parent

//   // === TIMESTAMPS ===
//   createdAt      DateTime  @default(now())
//   updatedAt      DateTime  @updatedAt

//   // === RELATIONS ===
//   role           Role              @relation(fields: [roleId], references: [id])

//   // Relations sebagai Student
//   academicYear   AcademicYear?     @relation("StudentAcademicYear", fields: [academicYearId], references: [id])
//   class          Class?            @relation("StudentClass", fields: [classId], references: [id])
//   major          Major?            @relation("StudentMajor", fields: [majorId], references: [id])
//   attendances    Attendance[]      @relation("StudentAttendance")
//   payments       Payment[]         @relation("StudentPayment")
//   violations     Violation[]       @relation("StudentViolation")

//   // Relations sebagai Teacher
//   schedules      Schedule[]        @relation("TeacherSchedule")

//   // Relations sebagai Parent (many-to-many dengan students)
//   parentOf       User[]            @relation("ParentStudent")
//   parents        User[]            @relation("ParentStudent")

//   @@map("users")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(request, request.nextUrl.searchParams.get("foundationId"));
  if (!t.ok) return t.response;

  try {
    const users = await prisma.userData.findMany({
      include: {
        role: true,
        class: true,
        major: true,
        academicYear: true,
      },
      where: {
        foundationId: t.foundationId,
        role: {
          name: "Student",
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    // foundationId dari body dibuang, selalu di-stamp dari sesi
    const { name, email, roleId, majorId, classId, academicYearId, foundationId: _foundationId, ...rest } =
      await request.json();
    if (!name || !roleId) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }

    // Pastikan role & penempatan yang dikirim milik yayasan ini
    // (role bersama ber-foundationId NULL tetap diizinkan karena ikut tampil di daftar role)
    const [ownedRole, ownedMajor, ownedClass, ownedAcademicYear] = await Promise.all([
      prisma.role.findFirst({
        where: { id: roleId, OR: [{ foundationId: t.foundationId }, { foundationId: null }] },
        select: { id: true },
      }),
      majorId
        ? prisma.major.findFirst({ where: { id: majorId, foundationId: t.foundationId }, select: { id: true } })
        : null,
      classId
        ? prisma.class.findFirst({ where: { id: classId, major: { foundationId: t.foundationId } }, select: { id: true } })
        : null,
      academicYearId
        ? prisma.academicYear.findFirst({ where: { id: academicYearId, foundationId: t.foundationId }, select: { id: true } })
        : null,
    ]);

    if (!ownedRole || (majorId && !ownedMajor) || (classId && !ownedClass) || (academicYearId && !ownedAcademicYear)) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const newUser = await prisma.userData.create({
      data: {
        name,
        email,
        roleId,
        majorId,
        classId,
        academicYearId,
        ...rest,
        foundationId: t.foundationId,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, name, email, roleId, majorId, classId, academicYearId, foundationId: _foundationId, ...rest } =
      await request.json();
    if (!id || !name || !roleId) {
      return NextResponse.json({ error: "ID, name, and role are required" }, { status: 400 });
    }

    const owned = await prisma.userData.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });
    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    // Pastikan role & penempatan baru tetap milik yayasan ini
    const [ownedRole, ownedMajor, ownedClass, ownedAcademicYear] = await Promise.all([
      prisma.role.findFirst({
        where: { id: roleId, OR: [{ foundationId: t.foundationId }, { foundationId: null }] },
        select: { id: true },
      }),
      majorId
        ? prisma.major.findFirst({ where: { id: majorId, foundationId: t.foundationId }, select: { id: true } })
        : null,
      classId
        ? prisma.class.findFirst({ where: { id: classId, major: { foundationId: t.foundationId } }, select: { id: true } })
        : null,
      academicYearId
        ? prisma.academicYear.findFirst({ where: { id: academicYearId, foundationId: t.foundationId }, select: { id: true } })
        : null,
    ]);

    if (!ownedRole || (majorId && !ownedMajor) || (classId && !ownedClass) || (academicYearId && !ownedAcademicYear)) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const updatedUser = await prisma.userData.update({
      where: { id },
      data: {
        name,
        email,
        roleId,
        majorId,
        classId,
        academicYearId,
        ...rest,
        // stamp ulang agar data tidak bisa dipindah ke yayasan lain
        foundationId: t.foundationId,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handlePrismaError(error);
  }
}
export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const owned = await prisma.userData.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });
    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const deletedUser = await prisma.userData.delete({
      where: { id },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    return handlePrismaError(error);
  }
}
