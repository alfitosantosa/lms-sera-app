import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Identitas + tenant pemanggil API ujian.
 * `userDataId` adalah id `user_data` (dipakai sebagai createdBy/studentId di modul ujian).
 */
export type ExamActor = {
  userId: string;
  userDataId: string | null;
  roleName: string;
  foundationId: string;
  isStaff: boolean;
  isStudent: boolean;
};

export type ActorResult =
  | { ok: true; actor: ExamActor }
  | { ok: false; response: NextResponse };

/** Field ujian yang dibutuhkan guard/route (bukan seluruh kolom). */
export type ExamTenantRecord = {
  id: string;
  foundationId: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  duration: number | null;
  passingScore: number | null;
  classId: string | null;
  createdBy: string;
  title: string;
  startAt: Date | null;
  endAt: Date | null;
};

// Static literal lookups (konvensi repo: Record untuk tabel statis).
const STAFF_ROLE_NAMES: Record<string, true> = {
  admin: true,
  "admin school": true,
  teacher: true,
};

const STUDENT_ROLE_NAMES: Record<string, true> = {
  student: true,
};

/** Respons error standar modul ujian (Bahasa Indonesia). */
export function examError(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

/**
 * Verifikasi sesi + ambil role/tenant. Menolak bila sesi tidak ada atau
 * akun belum terhubung ke yayasan mana pun.
 */
export async function resolveExamActor(
  request: NextRequest,
): Promise<ActorResult> {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  if (!userId) return { ok: false, response: examError("Sesi tidak ditemukan", 401) };

  const [userData, user] = await Promise.all([
    prisma.userData.findUnique({
      where: { userId },
      select: {
        id: true,
        foundationId: true,
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
      response: examError("Akun belum terhubung ke yayasan", 403),
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
      roleName,
      foundationId,
      isStaff: STAFF_ROLE_NAMES[normalized] === true,
      isStudent: STUDENT_ROLE_NAMES[normalized] === true,
    },
  };
}

/** Guru/Admin yayasan: CRUD, publish, close, lihat hasil semua siswa. */
export function requireStaff(actor: ExamActor) {
  if (!actor.isStaff) {
    return examError("Hanya guru atau admin yang dapat mengakses ujian ini", 403);
  }
  return null;
}

/** Siswa: mulai ujian, jawab, submit, lihat hasil sendiri. */
export function requireStudent(actor: ExamActor) {
  if (!actor.isStudent) {
    return examError("Hanya siswa yang dapat mengerjakan ujian", 403);
  }
  return null;
}

/**
 * Ambil ujian yang berada di yayasan pemanggil (mencegah cross-tenant access).
 */
export async function findExamInTenant(
  examId: string,
  foundationId: string,
): Promise<ExamTenantRecord | null> {
  return prisma.exam.findFirst({
    where: { id: examId, foundationId },
    select: {
      id: true,
      foundationId: true,
      status: true,
      duration: true,
      passingScore: true,
      classId: true,
      createdBy: true,
      title: true,
      startAt: true,
      endAt: true,
    },
  });
}
