import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  try {
    const getAllPaymentItems = await prisma.paymentItems.findMany({
      where: {
        student: { foundationId: t.foundationId },
      },
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
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const body = await request.json();
    const {
      studentId,
      paymentTypeId,
      quantity,
      amount,
      subtotal,
      month,
      name,
      year,
      skuType,
    } = body;

    // Pastikan siswa & jenis pembayaran milik yayasan ini
    const [ownedStudent, ownedPaymentType] = await Promise.all([
      prisma.userData.findFirst({
        where: { id: studentId, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.paymentType.findFirst({
        where: { id: paymentTypeId, branch: { foundationId: t.foundationId } },
        select: { id: true },
      }),
    ]);

    if (!ownedStudent || !ownedPaymentType) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

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

    console.log(
      "[PaymentItems] Created with quantity:",
      createPaymentItems.quantity,
    );

    return NextResponse.json(createPaymentItems);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const body = await request.json();

    const {
      id,
      studentId,
      paymentTypeId,
      quantity,
      amount,
      subtotal,
      month,
      name,
      year,
      skuType,
    } = body;

    // Pastikan data milik yayasan ini, sekaligus validasi siswa & jenis pembayaran baru
    const [owned, ownedStudent, ownedPaymentType] = await Promise.all([
      prisma.paymentItems.findFirst({
        where: { id, student: { foundationId: t.foundationId } },
        select: { id: true },
      }),
      prisma.userData.findFirst({
        where: { id: studentId, foundationId: t.foundationId },
        select: { id: true },
      }),
      prisma.paymentType.findFirst({
        where: { id: paymentTypeId, branch: { foundationId: t.foundationId } },
        select: { id: true },
      }),
    ]);

    if (!owned || !ownedStudent || !ownedPaymentType) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

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
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  try {
    const { id } = await request.json();

    const owned = await prisma.paymentItems.findFirst({
      where: { id, student: { foundationId: t.foundationId } },
      select: { id: true },
    });

    if (!owned) {
      return tenantForbidden("Data tidak ditemukan di yayasan ini");
    }

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
