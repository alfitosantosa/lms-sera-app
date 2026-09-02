"use server";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

//filter by date
export async function GET(request: NextRequest) {
  const fromdate = request.nextUrl.searchParams.get("fromdate");
  const todate = request.nextUrl.searchParams.get("todate");
  const majorId = request.nextUrl.searchParams.get("majorId");
  const status = request.nextUrl.searchParams.get("status");
  const isPaidParam = request.nextUrl.searchParams.get("isPaid");
  const skuType = request.nextUrl.searchParams.get("skuType");

  if (!fromdate || !todate) {
    return NextResponse.json({ error: "Missing fromdate or todate query parameters" }, { status: 400 });
  }

  try {
    const startDate = new Date(fromdate);
    const endDate = new Date(todate);

    // Set time boundaries
    startDate.setHours(0, 0, 0, 1);
    endDate.setHours(23, 59, 59, 999);

    // Build where clause dynamically
    const whereClause: Record<string, unknown> = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Filter by payment status through payment relation if provided
    if (status) {
      whereClause.payment = {
        status: status,
      };
    }

    // Filter by majorId through student relation if provided
    if (majorId) {
      whereClause.student = {
        majorId: majorId,
      };
    }

    // Filter by skuType if provided (skuType is a field in paymentType and take skuType)
    if (skuType) {
      whereClause.PaymentType = {
        skuType: skuType,
      };
    }

    // Filter by isPaid if provided (true = Lunas, false = Belum Lunas)
    if (isPaidParam !== null) {
      whereClause.isPaid = isPaidParam === "true";
    }

    const paymentItems = await prisma.paymentItems.findMany({
      where: whereClause,
      include: {
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
    return NextResponse.json(paymentItems);
  } catch (error) {
    return handlePrismaError(error);
  }
}
