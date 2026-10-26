// model Role {
//   id          String   @id @default(cuid())
//   name        String   @unique
//   description String
//   permissions String[]
//   isActive    Boolean  @default(true)
//   users       User[]

//   @@map("roles")
// }

import { handlePrismaError } from "@/services/errorHandler";
import { prisma } from "@/services/prisma";
import { resolveFoundation, tenantForbidden } from "@/services/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  const { id } = await params;
  try {
    const user = await prisma.userData.findFirst({
      where: { id, foundationId: t.foundationId },
      include: {
        role: true,
      },
    });

    if (!user) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    return NextResponse.json(user.role);
  } catch (error) {
    return handlePrismaError(error);
  }
}
