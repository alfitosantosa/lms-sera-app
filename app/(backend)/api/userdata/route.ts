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
//   tahfidzGroupId String?            // Wajib untuk student
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
import { type NextRequest, NextResponse } from "next/server";

function replaceUndefinedWithNull<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => replaceUndefinedWithNull(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val === undefined) {
        result[key] = null;
      } else if (
        Array.isArray(val) ||
        (val !== null && typeof val === "object")
      ) {
        result[key] = replaceUndefinedWithNull(val);
      } else {
        result[key] = val;
      }
    }
    return result as unknown as T;
  }
  return (value === undefined ? (null as unknown as T) : value) as T;
}

type TenantRefs = {
  userId?: string | null;
  roleId?: string | null;
  majorId?: string | null;
  classId?: string | null;
  academicYearId?: string | null;
  tahfidzGroupId?: string | null;
};

// Verifikasi setiap FK dari body memang milik yayasan pemanggil.
// Role bersama (foundationId NULL) tetap diizinkan karena ikut tampil di daftar role.
async function refsOwnedByFoundation(
  data: TenantRefs,
  foundationId: string,
): Promise<boolean> {
  const { userId, roleId, majorId, classId, academicYearId, tahfidzGroupId } =
    data;

  // TahfidzGroup tidak punya relasi ke Major (hanya majorId), jadi scope-nya lewat major yayasan ini
  const tenantMajorIds = tahfidzGroupId
    ? (
        await prisma.major.findMany({
          where: { foundationId },
          select: { id: true },
        })
      ).map((major) => major.id)
    : [];

  const [user, role, major, kelas, academicYear, tahfidzGroup] =
    await Promise.all([
      userId
        ? prisma.user.findFirst({
            where: { id: userId, foundationId },
            select: { id: true },
          })
        : true,
      roleId
        ? prisma.role.findFirst({
            where: {
              id: roleId,
              OR: [{ foundationId }, { foundationId: null }],
            },
            select: { id: true },
          })
        : true,
      majorId
        ? prisma.major.findFirst({
            where: { id: majorId, foundationId },
            select: { id: true },
          })
        : true,
      classId
        ? prisma.class.findFirst({
            where: { id: classId, major: { foundationId } },
            select: { id: true },
          })
        : true,
      academicYearId
        ? prisma.academicYear.findFirst({
            where: { id: academicYearId, foundationId },
            select: { id: true },
          })
        : true,
      tahfidzGroupId
        ? prisma.tahfidzGroup.findFirst({
            where: { id: tahfidzGroupId, majorId: { in: tenantMajorIds } },
            select: { id: true },
          })
        : true,
    ]);

  return Boolean(
    user && role && major && kelas && academicYear && tahfidzGroup,
  );
}

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  try {
    const users = await prisma.userData.findMany({
      where: {
        foundationId: t.foundationId,
      },
      include: {
        role: true,
        class: true,
        major: true,
        academicYear: true,
        user: true,
        tahfidzGroup: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
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
    const { name, email, roleId, ...rest } = await request.json();
    if (!name || !roleId) {
      return NextResponse.json(
        { error: "Name and role are required" },
        { status: 400 },
      );
    }

    if (!(await refsOwnedByFoundation({ roleId, ...rest }, t.foundationId))) {
      return tenantForbidden("Data referensi tidak ditemukan di yayasan ini");
    }

    // foundationId dari body dibuang, distempel dari sesi
    delete rest.foundationId;

    const data = replaceUndefinedWithNull({
      name,
      email,
      roleId,
      ...rest,
      foundationId: t.foundationId,
    });

    const newUser = await prisma.userData.create({
      data,
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
    const { id, name, email, roleId, ...restData } = await request.json();
    if (!id || !name || !roleId) {
      return NextResponse.json(
        { error: "ID, name, and role are required" },
        { status: 400 },
      );
    }

    const owned = await prisma.userData.findFirst({
      where: { id, foundationId: t.foundationId },
      select: { id: true },
    });
    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    if (
      !(await refsOwnedByFoundation({ roleId, ...restData }, t.foundationId))
    ) {
      return tenantForbidden("Data referensi tidak ditemukan di yayasan ini");
    }

    // foundationId dari body dibuang: klien tidak boleh memindah yayasan
    delete restData.foundationId;

    const data = replaceUndefinedWithNull({ name, email, roleId, ...restData });

    const updatedUser = await prisma.userData.update({
      where: { id },
      data,
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
