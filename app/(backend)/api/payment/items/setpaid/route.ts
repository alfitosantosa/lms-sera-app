// model PaymentItems {
//   id              String      @id  @default(uuid())
//   paymentId       String?
//   studentId       String
//   paymentTypeId   String
//   month           String
//   year            String
//   isPaid          Boolean      @default(false)
//   isMonthly       Boolean      @default(false)
//   isActive        Boolean      @default(true)
//   isFixedAmount   Boolean
//   isFixedQuantity Boolean
//   quantity        Int
//   amount          Int
//   subtotal        Int
//   name            String
//   skuType         String
//   payment         Payment?    @relation(fields: [paymentId], references: [id])
//   PaymentType     PaymentType @relation(fields: [paymentTypeId], references: [id])
//   student         UserData    @relation(fields: [studentId], references: [id])

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const body = await request.json();
    const { paymentItemsIds, paymentId } = body;

    // Validate input
    if (
      !paymentItemsIds ||
      !Array.isArray(paymentItemsIds) ||
      paymentItemsIds.length === 0
    ) {
      return NextResponse.json(
        { error: "paymentItemsIds must be a non-empty array" },
        { status: 400 },
      );
    }

    // Pastikan seluruh paymentItems (dan payment tujuan) milik yayasan ini
    const [ownedCount, ownedPayment] = await Promise.all([
      prisma.paymentItems.count({
        where: {
          id: { in: paymentItemsIds },
          student: { foundationId: t.foundationId },
        },
      }),
      paymentId
        ? prisma.payment.findFirst({
            where: { id: paymentId, major: { foundationId: t.foundationId } },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (ownedCount !== paymentItemsIds.length || (paymentId && !ownedPayment)) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

    const getPaymentId = await prisma.paymentItems.findUnique({
      where: { id: paymentItemsIds[0] },
      select: { paymentId: true },
    });

    //set unpaid selain yang paymentItemsIds
    await prisma.paymentItems.updateMany({
      where: {
        paymentId: getPaymentId?.paymentId,
        id: { notIn: paymentItemsIds },
        student: { foundationId: t.foundationId },
      },
      data: {
        isPaid: false,
        paymentId: null,
      },
    });

    // Update multiple payment items to isPaid: true
    const result = await prisma.paymentItems.updateMany({
      where: {
        id: {
          in: paymentItemsIds,
        },
        student: { foundationId: t.foundationId },
      },
      data: {
        paymentId: paymentId,
        isPaid: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Updated ${result.count} payment items to isPaid: true`,
        count: result.count,
      },
      { status: 200 },
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}
