import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  try {
    const users = await prisma.user.findMany({
      include: {
        userData: {
          include: { role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      // User dianggap milik yayasan bila kolom langsung ATAU userData-nya ber-yayasan sama
      where: {
        OR: [
          { foundationId: t.foundationId },
          { userData: { foundationId: t.foundationId } },
        ],
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    const getUserBetterauth = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        foundation: true,
        userData: {
          include: {
            foundation: true,
          },
        },
      },
    });

    return NextResponse.json(getUserBetterauth);
  } catch (error) {
    return handlePrismaError(error);
  }
}
