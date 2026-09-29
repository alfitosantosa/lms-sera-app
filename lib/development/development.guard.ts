import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Identitas + tenant pemanggil API modul pengembangan siswa.
 * `userDataId` adalah id `user_data` (dipakai sebagai teacherId).
 * `classId` adalah kelas wali kelas bila ada (kolom `UserData.classId`).
 * `userId` adalah id `user` (Better Auth) — id ini yang ditulis ke
 * `AuditLog.actorId` karena selalu ada walau akun belum punya baris UserData;
 * baris audit dijodohkan ke pengguna domain sekolah lewat `UserData.userId`
 * yang unik.
 */
export type DevelopmentActor = {
  userId: string; // User.id
  userDataId: string | null; // UserData.id
  roleName: string; // lowercase, trimmed
  foundationId: string;
  classId: string | null; // homeroom class kalau ada
  isStaff: boolean; // admin | admin school | teacher
  isStudent: boolean;
  isParent: boolean;
};

export type DevelopmentActorResult =
  | { ok: true; actor: DevelopmentActor }
  | { ok: false; response: NextResponse };

// Static literal lookups (konvensi repo: Record untuk tabel statis).
const STAFF_ROLE_NAMES: Record<string, true> = {
  admin: true,
  "admin school": true,
  teacher: true,
};

// Admin yayasan & admin sekolah: lolos scope kelas tanpa cek Schedule.
export const ADMIN_ROLE_NAMES: Record<string, true> = {
  admin: true,
  "admin school": true,
};

const STUDENT_ROLE_NAMES: Record<string, true> = {
  student: true,
  siswa: true,
};

const PARENT_ROLE_NAMES: Record<string, true> = {
  parent: true,
  "orang tua": true,
};

/** Respons error standar modul pengembangan (Bahasa Indonesia). */
export function developmentError(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

/**
 * Verifikasi sesi + ambil role/tenant. Menolak bila sesi tidak ada atau
 * akun belum terhubung ke yayasan mana pun.
 */
export async function resolveDevelopmentActor(
  request: NextRequest,
): Promise<DevelopmentActorResult> {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, response: developmentError("Sesi tidak ditemukan", 401) };
  }

  const [userData, user] = await Promise.all([
    prisma.userData.findUnique({
      where: { userId },
      select: {
        id: true,
        foundationId: true,
        classId: true,
        role: { select: { name: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { foundationId: true, role: true },
    }),
  ]);

  const foundationId = userData?.foundationId ?? user?.foundationId ?? null;
  if (!foundationId) {
    return {
      ok: false,
      response: developmentError("Akun belum terhubung ke yayasan", 403),
    };
  }

  const roleName =
    userData?.role?.name ?? user?.role ?? session?.user?.role ?? "user";
  const normalized = roleName.trim().toLowerCase();

  return {
    ok: true,
    actor: {
      userId,
      userDataId: userData?.id ?? null,
      roleName: normalized,
      foundationId,
      classId: userData?.classId ?? null,
      isStaff: STAFF_ROLE_NAMES[normalized] === true,
      isStudent: STUDENT_ROLE_NAMES[normalized] === true,
      isParent: PARENT_ROLE_NAMES[normalized] === true,
    },
  };
}

/** Guru/Admin: baca & ubah konfigurasi pengembangan. */
export function requireStaff(actor: DevelopmentActor): NextResponse | null {
  if (!actor.isStaff) {
    return developmentError(
      "Hanya guru atau admin yang dapat mengakses data ini",
      403,
    );
  }
  return null;
}

/** Orang tua: akses terbatas pada anaknya sendiri. */
export function requireParent(actor: DevelopmentActor): NextResponse | null {
  if (!actor.isParent) {
    return developmentError(
      "Hanya orang tua yang dapat mengakses data ini",
      403,
    );
  }
  return null;
}

/**
 * Student harus ada di foundation actor; kembalikan record scope atau NextResponse error.
 * - `admin`/`admin school`: lolos selama satu yayasan.
 * - `teacher`: hanya untuk siswa di kelas yang diajarnya (`Schedule` aktif).
 * - orang tua: hanya anak yang terdaftar di `studentIds`.
 * - siswa: hanya dirinya sendiri.
 */
export async function assertStudentAccess(
  actor: DevelopmentActor,
  studentId: string,
): Promise<
  | {
      ok: true;
      student: {
        id: string;
        classId: string;
        branchId: string;
        foundationId: string;
      };
    }
  | { ok: false; response: NextResponse }
> {
  const student = await prisma.userData.findFirst({
    where: { id: studentId, foundationId: actor.foundationId },
    select: { id: true, classId: true, branchId: true, foundationId: true },
  });

  if (!student) {
    return {
      ok: false,
      response: developmentError("Siswa tidak ditemukan di yayasan ini", 404),
    };
  }

  // Phase 2 (additif): orang tua hanya boleh mengakses anaknya sendiri,
  // siswa hanya boleh mengakses dirinya sendiri. Staff tidak terpengaruh.
  if (actor.isParent) {
    const parent = actor.userDataId
      ? await prisma.userData.findUnique({
          where: { id: actor.userDataId },
          select: { studentIds: true },
        })
      : null;
    if (!parent?.studentIds.includes(studentId)) {
      return {
        ok: false,
        response: developmentError(
          "Anda tidak memiliki akses ke data siswa ini",
          403,
        ),
      };
    }
  }

  if (actor.isStudent && actor.userDataId !== studentId) {
    return {
      ok: false,
      response: developmentError(
        "Anda tidak memiliki akses ke data siswa ini",
        403,
      ),
    };
  }

  // Phase 3: guru hanya boleh mengakses siswa di kelas yang diajarnya.
  // Admin (`admin`/`admin school`) tetap lolos selama masih satu yayasan.
  if (actor.roleName === "teacher") {
    const teachesClass =
      actor.userDataId !== null &&
      student.classId !== null &&
      (await teacherTeachesClass(actor.userDataId, student.classId));
    if (!teachesClass) {
      return {
        ok: false,
        response: developmentError("Anda tidak mengajar kelas siswa ini", 403),
      };
    }
  }

  return {
    ok: true,
    student: {
      id: student.id,
      classId: student.classId ?? "",
      branchId: student.branchId ?? "",
      foundationId: student.foundationId ?? actor.foundationId,
    },
  };
}

/**
 * Sumber tunggal cek "guru mengajar kelas ini": `Schedule` aktif dengan
 * `teacherId` guru tersebut. Dipakai `assertClassAccess` dan
 * `assertStudentAccess` agar keduanya tidak bisa berbeda.
 */
async function teacherTeachesClass(
  userDataId: string,
  classId: string,
): Promise<boolean> {
  // ponytail: wali-kelas not modeled; teacher access is schedule-derived, add a homeroom flag if per-class homeroom rights are needed
  const schedule = await prisma.schedule.findFirst({
    where: { classId, teacherId: userDataId, isActive: true },
    select: { id: true },
  });
  return schedule !== null;
}

/** Teacher harus punya akses ke class (via Schedule.teacherId); admin lolos. */
export async function assertClassAccess(
  actor: DevelopmentActor,
  classId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const cls = await prisma.class.findFirst({
    where: { id: classId, branch: { foundationId: actor.foundationId } },
    select: { id: true },
  });
  if (!cls) {
    return {
      ok: false,
      response: developmentError("Kelas tidak ditemukan di yayasan ini", 404),
    };
  }

  if (ADMIN_ROLE_NAMES[actor.roleName] === true) return { ok: true };

  if (actor.roleName === "teacher") {
    if (!actor.userDataId) {
      return {
        ok: false,
        response: developmentError("Akses kelas ditolak", 403),
      };
    }
    if (await teacherTeachesClass(actor.userDataId, classId))
      return { ok: true };
    return {
      ok: false,
      response: developmentError("Anda tidak mengajar kelas ini", 403),
    };
  }

  return { ok: false, response: developmentError("Akses kelas ditolak", 403) };
}

/**
 * Id kelas yang diajar seorang guru (dari `Schedule` aktif), atau `null` untuk
 * `admin`/`admin school` yang memang tidak dibatasi kelas.
 *
 * Endpoint daftar memakainya saat **tidak** ada filter `classId`: guru hanya
 * boleh melihat baris kelas yang diajarnya, sedangkan admin melihat seluruh
 * yayasan. Guru tanpa jadwal mengembalikan `[]` (daftar kosong), bukan seluruh
 * yayasan — sumber tunggal agar daftar log/penilaian/rapor tidak pernah bocor.
 */
export async function teacherClassIds(
  actor: DevelopmentActor,
): Promise<string[] | null> {
  if (ADMIN_ROLE_NAMES[actor.roleName] === true) return null;
  if (actor.roleName !== "teacher" || !actor.userDataId) return [];

  const schedules = await prisma.schedule.findMany({
    where: { teacherId: actor.userDataId, isActive: true, classId: { not: null } },
    select: { classId: true },
    distinct: ["classId"],
  });
  return schedules.flatMap((s) => (s.classId ? [s.classId] : []));
}
