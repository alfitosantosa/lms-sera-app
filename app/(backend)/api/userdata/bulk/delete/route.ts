import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { data } = await request.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Hanya boleh menghapus data milik yayasan pemanggil
    const owned = await prisma.userData.findMany({
      where: { id: { in: data }, foundationId: t.foundationId },
      select: { id: true },
    });

    if (owned.length !== new Set<string>(data).size) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const deletedUser = await prisma.userData.deleteMany({
      where: {
        id: { in: data },
        foundationId: t.foundationId,
      },
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    return handlePrismaError(error);
  }
}
