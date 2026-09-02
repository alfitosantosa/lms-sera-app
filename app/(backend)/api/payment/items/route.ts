import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const getAllPaymentItems = await prisma.paymentItems.findMany({
      include: {
        // student: true,
        PaymentType: true,
        payment: true,
        student: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(getAllPaymentItems);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, paymentTypeId, quantity, amount, subtotal, month, name, year, skuType } = body;
    const createPaymentItems = await prisma.paymentItems.create({
      data: {
        studentId,
        paymentTypeId,
        quantity: Number(quantity),
        amount: Number(amount),
        subtotal: Number(subtotal),
        month,
        name,
        year,
        skuType,
      },
    });

    console.log("[PaymentItems] Created with quantity:", createPaymentItems.quantity);

    return NextResponse.json(createPaymentItems);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { id, studentId, paymentTypeId, quantity, amount, subtotal, month, name, year, skuType } = body;

    const updatedPaymentItems = await prisma.paymentItems.update({
      where: {
        id,
      },
      data: {
        studentId,
        paymentTypeId,
        quantity: Number(quantity),
        amount: Number(amount),
        subtotal: Number(subtotal),
        month,
        name,
        year,
        skuType,
      },
    });

    return NextResponse.json(updatedPaymentItems);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    const deletedPaymentItems = await prisma.paymentItems.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(deletedPaymentItems);
  } catch (error) {
    return handlePrismaError(error);
  }
}
