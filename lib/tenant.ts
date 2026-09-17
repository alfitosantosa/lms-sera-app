import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Sumber tenant (yayasan) milik pemanggil.
 * - `foundationId` dari sesi: userData.foundationId, fallback user.foundationId.
 * - Bila klien mengirim parameter `foundationId`, nilainya diverifikasi harus sama
 *   dengan milik sesi (mencegah tenant spoofing).
 */
export type Tenant =
  { ok: true; foundationId: string } | { ok: false; response: NextResponse };

export function tenantUnauthorized(message = "Sesi tidak ditemukan") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function tenantForbidden(message = "Akun belum terhubung ke yayasan") {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

/**
 * Ambil foundationId milik pemanggil.
 *
 * @param request  Request handler (untuk membaca cookie sesi).
 * @param explicit `foundationId` opsional dari query/body. Bila diisi, harus sama
 *                 dengan foundationId sesi.
 */
export async function resolveFoundation(
  request: NextRequest,
  explicit?: string | null,
): Promise<Tenant> {
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;

  if (!userId) return { ok: false, response: tenantUnauthorized() };

  const [userData, user] = await Promise.all([
    prisma.userData.findUnique({
      where: { userId },
      select: { foundationId: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { foundationId: true },
    }),
  ]);

  const sessionFoundationId =
    userData?.foundationId ?? user?.foundationId ?? null;

  if (!sessionFoundationId) return { ok: false, response: tenantForbidden() };

  if (explicit && explicit !== sessionFoundationId) {
    return {
      ok: false,
      response: tenantForbidden("Tidak punya akses ke data yayasan ini"),
    };
  }

  return { ok: true, foundationId: sessionFoundationId };
}
