"use server";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

//filter by date
export async function GET(request: NextRequest) {
  const fromdate = request.nextUrl.searchParams.get("fromdate");
  const todate = request.nextUrl.searchParams.get("todate");
  const majorId = request.nextUrl.searchParams.get("majorId");

  if (!fromdate || !todate) {
    return NextResponse.json({ error: "Missing fromdate or todate query parameters" }, { status: 400 });
  }

  try {
    const startDate = new Date(fromdate);
    const endDate = new Date(todate);

    // Add 1 day to endDate to make sure we fetch data up to the end of the strict toDate
    // set start date only from 00:00:00 and end date only until 23:59:59
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(majorId && { majorId }),
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
        major: true,
        accountBank: true,
        createdBy: true,
        paymentItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return handlePrismaError(error);
  }
}
