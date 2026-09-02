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
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const paymentTypes = await prisma.paymentType.findMany({
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
  try {
    const { name, owner, description, amount, quantity, subtotal, isMonthly, isActive, isFixedAmount, isFixedQuantity, majorId, skuType } = await request.json();

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
  try {
    const { id, name, owner, description, amount, quantity, subtotal, isMonthly, isActive, isFixedAmount, isFixedQuantity, majorId } = await request.json();

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
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.paymentType.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Payment type deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment type:", error);
    return NextResponse.json({ error: "Failed to delete payment type" }, { status: 500 });
  }
}
