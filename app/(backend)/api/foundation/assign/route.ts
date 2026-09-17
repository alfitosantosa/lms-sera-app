import { auth } from "@/lib/auth";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { tenantUnauthorized } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // User yang belum punya yayasan memang belum punya foundationId, jadi cukup cek sesi.
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) return tenantUnauthorized();

    // `userId` dari body diabaikan, selalu pakai user dari sesi.
    const { foundationCode } = await request.json();

    const foundation = await prisma.foundation.findUnique({
      where: {
        foundationCode: foundationCode,
      },
    });

    if (!foundation) {
      return NextResponse.json(
        { error: "Kode yayasan tidak ditemukan" },
        { status: 404 },
      );
    }

    const AssignUserFoundation = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        foundationId: foundation.id,
      },
    });

    // Dashboard membaca userData.foundationId, jadi ikut diisi bila userData-nya sudah ada.
    await prisma.userData.updateMany({
      where: {
        userId: userId,
      },
      data: {
        foundationId: foundation.id,
      },
    });

    return NextResponse.json({
      AssignUserFoundation,
      foundationId: foundation.id,
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
