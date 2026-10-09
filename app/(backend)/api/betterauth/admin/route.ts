"use server";
// app/api/clerk-users/route.ts
import { auth } from "@/lib/betterauth/auth";
import { authClient } from "@/lib/betterauth/authClients";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/api/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  // Hanya admin yang boleh mengubah role user lain.
  const session = await auth.api.getSession({ headers: request.headers });
  if (session?.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 },
    );
  }

  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields: userId and role" },
        { status: 400 },
      );
    }

    // Target harus milik yayasan pemanggil (lewat user.foundationId atau userData.foundationId).
    const owned = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [
          { foundationId: t.foundationId },
          { userData: { foundationId: t.foundationId } },
        ],
      },
      select: { id: true },
    });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    await authClient.admin.setRole({
      userId: userId, // id dari database
      role: role,
    });
    return NextResponse.json(
      { message: "Role assigned successfully" },
      { status: 200 },
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}
