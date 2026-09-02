"use server";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    // Transform data sesuai format yang diinginkan
    const summary = {
      total: payments.reduce((sum, p) => sum + (p.amount ? Number(p.amount) : 0), 0),
      sumTransaction: payments.length,
    };

    // Group by Year-Month
    const yearMonthlyMap = new Map<string, { year: string; month: string; total: number; sumTransaction: number }>();

    payments.forEach((payment) => {
      const year = payment.createdAt.getFullYear().toString();
      const month = payment.createdAt.toLocaleString("default", {
        month: "long",
      });
      const key = `${year}-${month}`;

      if (!yearMonthlyMap.has(key)) {
        yearMonthlyMap.set(key, {
          year,
          month,
          total: 0,
          sumTransaction: 0,
        });
      }

      const entry = yearMonthlyMap.get(key)!;
      entry.total += payment.amount ? Number(payment.amount) : 0;
      entry.sumTransaction += 1;
    });

    const yearMonthly = Array.from(yearMonthlyMap.values());

    // Group by Major
    const byMajorMap = new Map<string, { major: string; total: number; sumTransaction: number }>();

    payments.forEach((payment) => {
      const majorName = payment.major?.name || "Unknown";

      if (!byMajorMap.has(majorName)) {
        byMajorMap.set(majorName, {
          major: majorName,
          total: 0,
          sumTransaction: 0,
        });
      }

      const entry = byMajorMap.get(majorName)!;
      entry.total += payment.amount ? Number(payment.amount) : 0;
      entry.sumTransaction += 1;
    });

    const byMajor = Array.from(byMajorMap.values());

    // Group by Major-Month
    const byMajorMonthlyMap = new Map<
      string,
      {
        major: string;
        month: string;
        year: string;
        total: number;
        sumTransaction: number;
      }
    >();

    payments.forEach((payment) => {
      const majorName = payment.major?.name || "Unknown";
      const year = payment.createdAt.getFullYear().toString();
      const month = payment.createdAt.toLocaleString("default", {
        month: "long",
      });
      const key = `${majorName}-${year}-${month}`;

      if (!byMajorMonthlyMap.has(key)) {
        byMajorMonthlyMap.set(key, {
          major: majorName,
          month,
          year,
          total: 0,
          sumTransaction: 0,
        });
      }

      const entry = byMajorMonthlyMap.get(key)!;
      entry.total += payment.amount ? Number(payment.amount) : 0;
      entry.sumTransaction += 1;
    });

    const byMajorMonthly = Array.from(byMajorMonthlyMap.values());

    const result = {
      summary,
      yearMonthly,
      byMajor,
      byMajorMonthly,
    };

    return NextResponse.json(result);
  } catch (error) {
    return handlePrismaError(error);
  }
}
