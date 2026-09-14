// model PaymentType {
//   id              String         @id @default(cuid())

//   name            String         @unique
//   description     String
//   amount          Decimal
//   isMonthly       Boolean        @default(false)
//   isActive        Boolean        @default(true)
//   isFixedAmount   Boolean
//   isFixedQuantity Boolean
//   quantity        Decimal
//   subtotal        Decimal
//   owner           String
//   majorId         String
//   skuType         String

//   paymentItems    PaymentItems[]
//   major           Major          @relation(fields: [majorId], references: [id])

//   @@index([majorId])
//   @@index([owner])
//   @@map("payment_types")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  try {
    const paymentTypes = await prisma.paymentType.findMany({
      where: {
        major: { foundationId: t.foundationId },
      },
      include: {
        major: true,
      },
    });
    return NextResponse.json(paymentTypes);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { name, owner, description, amount, quantity, subtotal, isMonthly, isActive, isFixedAmount, isFixedQuantity, majorId, skuType } = await request.json();

    const major = await prisma.major.findFirst({ where: { id: majorId, foundationId: t.foundationId }, select: { id: true } });
    if (!major) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const newPaymentType = await prisma.paymentType.create({
      data: {
        name,
        description,
        majorId,
        skuType,
        amount: parseFloat(amount),
        quantity: parseFloat(quantity),
        subtotal: parseFloat(subtotal),
        isMonthly: typeof isMonthly === "boolean" ? isMonthly : isMonthly === "true",
        isActive: typeof isActive === "boolean" ? isActive : isActive === "true",
        isFixedAmount: typeof isFixedAmount === "boolean" ? isFixedAmount : isFixedAmount === "true",
        isFixedQuantity: typeof isFixedQuantity === "boolean" ? isFixedQuantity : isFixedQuantity === "true",
        owner,
      },
      include: {
        major: true,
      },
    });

    return NextResponse.json(newPaymentType);
  } catch (error) {
    console.error("Error creating payment type:", error);
    return NextResponse.json({ error: "Failed to create payment type" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id, name, owner, description, amount, quantity, subtotal, isMonthly, isActive, isFixedAmount, isFixedQuantity, majorId } = await request.json();

    const [owned, major] = await Promise.all([
      prisma.paymentType.findFirst({ where: { id, major: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.major.findFirst({ where: { id: majorId, foundationId: t.foundationId }, select: { id: true } }),
    ]);
    if (!owned || !major) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const updatedPaymentType = await prisma.paymentType.update({
      where: { id },
      data: {
        name,
        description,
        owner,
        majorId,
        amount: parseFloat(amount),
        quantity: parseFloat(quantity),
        subtotal: parseFloat(subtotal),
        isMonthly: typeof isMonthly === "boolean" ? isMonthly : isMonthly === "true",
        isActive: typeof isActive === "boolean" ? isActive : isActive === "true",
        isFixedAmount: typeof isFixedAmount === "boolean" ? isFixedAmount : isFixedAmount === "true",
        isFixedQuantity: typeof isFixedQuantity === "boolean" ? isFixedQuantity : isFixedQuantity === "true",
      },
      include: {
        major: true,
      },
    });

    return NextResponse.json(updatedPaymentType);
  } catch (error) {
    console.error("Error updating payment type:", error);
    return NextResponse.json({ error: "Failed to update payment type" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const owned = await prisma.paymentType.findFirst({ where: { id, major: { foundationId: t.foundationId } }, select: { id: true } });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    await prisma.paymentType.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Payment type deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment type:", error);
    return NextResponse.json({ error: "Failed to delete payment type" }, { status: 500 });
  }
}
