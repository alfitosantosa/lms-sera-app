import { auth } from "@/lib/auth";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Yayasan pemanggil (sekaligus memastikan ada sesi).
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  // Check if user is authenticated and is admin
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
  }

  try {
    // Parse request body
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing required fields: userId and role" }, { status: 400 });
    }

    // Validate role
    const validRoles = ["user", "admin", "teacher", "student", "parent"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` }, { status: 400 });
    }

    // Target harus milik yayasan pemanggil (lewat user.foundationId atau userData.foundationId).
    const owned = await prisma.user.findFirst({
      where: {
        id: userId,
        OR: [{ foundationId: t.foundationId }, { userData: { foundationId: t.foundationId } }],
      },
      select: { id: true },
    });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    // Update user role in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json({
      success: true,
      message: `Role updated successfully`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
