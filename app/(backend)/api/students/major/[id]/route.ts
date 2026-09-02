// model User {
//   id          String    @id @default(cuid())
//   userId     String?   @unique  // ID dari Clerk
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
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const students = await prisma.userData.findMany({
      where: {
        majorId: id,
        role: {
          name: "Student",
        },
      },
      include: {
        role: true,
        academicYear: true,
        class: true,
        major: true,
        attendances: true,
        payments: true,
        violations: true,
        _count: {
          select: {
            attendances: true,
            payments: true,
            violations: true,
          },
        },
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    return handlePrismaError(error);
  }
}
