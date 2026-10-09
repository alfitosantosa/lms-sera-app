// app/api/clerk-users/route.ts
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { resolveFoundation } from "@/lib/api/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  try {
    const users = await prisma.user.findMany({
      where: {
        userData: null,
        foundationId: t.foundationId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return handlePrismaError(error);
  }
}
