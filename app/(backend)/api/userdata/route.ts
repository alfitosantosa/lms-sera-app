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
import { NextRequest, NextResponse } from "next/server";

function replaceUndefinedWithNull<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => replaceUndefinedWithNull(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val === undefined) {
        result[key] = null;
      } else if (Array.isArray(val) || (val !== null && typeof val === "object")) {
        result[key] = replaceUndefinedWithNull(val);
      } else {
        result[key] = val;
      }
    }
    return result as unknown as T;
  }
  return (value === undefined ? (null as unknown as T) : value) as T;
}

export async function GET() {
  try {
    const users = await prisma.userData.findMany({
      include: {
        role: true,
        class: true,
        major: true,
        academicYear: true,
        user: true,
        tahfidzGroup: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, roleId, ...rest } = await request.json();
    if (!name || !roleId) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }

    const data = replaceUndefinedWithNull({ name, email, roleId, ...rest });

    const newUser = await prisma.userData.create({
      data,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, roleId, ...restData } = await request.json();
    if (!id || !name || !roleId) {
      return NextResponse.json({ error: "ID, name, and role are required" }, { status: 400 });
    }

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
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deletedUser = await prisma.userData.delete({
      where: { id },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    return handlePrismaError(error);
  }
}
