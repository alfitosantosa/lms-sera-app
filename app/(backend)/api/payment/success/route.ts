import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, status, receiptNumber } = await request.json();

    const owned = await prisma.payment.findFirst({
      where: { id, branch: { foundationId: t.foundationId } },
      select: { id: true },
    });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const newPayment = await prisma.payment.update({
      where: {
        id,
      },
      data: {
        status,
        receiptNumber,
      },
    });

    return NextResponse.json(newPayment);
  } catch (error) {
    return handlePrismaError(error);
  }
}
