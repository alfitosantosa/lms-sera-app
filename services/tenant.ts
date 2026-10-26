import { normalizeModules, moduleForApiPath, moduleLabel, type ModuleKey } from "@/config/modules";
import { auth } from "@/services/auth/auth";
import { prisma } from "@/services/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Sumber tenant (yayasan) milik pemanggil.
 * - `foundationId` dari sesi: userData.foundationId, fallback user.foundationId.
 * - Bila klien mengirim parameter `foundationId`, nilainya diverifikasi harus sama
 *   dengan milik sesi (mencegah tenant spoofing).
 * - `modules` adalah subset modul opsional yang aktif untuk yayasan tersebut.
 */
export type Tenant =
  | { ok: true; foundationId: string; modules: ModuleKey[] }
  | { ok: false; response: NextResponse };

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
      select: {
        foundationId: true,
        foundation: { select: { modules: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        foundationId: true,
        foundation: { select: { modules: true } },
      },
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

  const storedModules = userData?.foundation?.modules ?? user?.foundation?.modules;
  const modules = normalizeModules(storedModules);

  // Gate API terpusat: semua route yang memakai resolver ini otomatis
  // menolak path milik modul yang tidak aktif untuk yayasan pemanggil.
  const denied = moduleAccessDenied(request.nextUrl.pathname, modules);
  if (denied) return { ok: false, response: denied };

  return { ok: true, foundationId: sessionFoundationId, modules };
}

/** 403 untuk path modul yang tidak aktif; `null` bila boleh lewat. */
export function moduleAccessDenied(
  pathname: string,
  modules: ModuleKey[],
): NextResponse | null {
  const moduleKey = moduleForApiPath(pathname);
  if (!moduleKey || modules.includes(moduleKey)) return null;
  return NextResponse.json(
    {
      success: false,
      message: `Modul ${moduleLabel(moduleKey)} tidak aktif untuk yayasan ini`,
    },
    { status: 403 },
  );
}
