"use server";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  const fromdate = request.nextUrl.searchParams.get("fromdate");
  const todate = request.nextUrl.searchParams.get("todate");
  const branchId = request.nextUrl.searchParams.get("branchId");

  if (!fromdate || !todate) {
    return NextResponse.json(
      { error: "Missing fromdate or todate query parameters" },
      { status: 400 },
    );
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
        branch: { foundationId: t.foundationId },
        ...(branchId && { branchId }),
      },
      include: {
        student: {
          include: {
            class: true,
          },
        },
        branch: true,
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
      total: payments.reduce(
        (sum, p) => sum + (p.amount ? Number(p.amount) : 0),
        0,
      ),
      sumTransaction: payments.length,
    };

    // Group by Year-Month
    const yearMonthlyMap = new Map<
      string,
      { year: string; month: string; total: number; sumTransaction: number }
    >();

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

    // Group by Branch
    const byBranchMap = new Map<
      string,
      { branch: string; total: number; sumTransaction: number }
    >();

    payments.forEach((payment) => {
      const branchName = payment.branch?.name || "Unknown";

      if (!byBranchMap.has(branchName)) {
        byBranchMap.set(branchName, {
          branch: branchName,
          total: 0,
          sumTransaction: 0,
        });
      }

      const entry = byBranchMap.get(branchName)!;
      entry.total += payment.amount ? Number(payment.amount) : 0;
      entry.sumTransaction += 1;
    });

    const byBranch = Array.from(byBranchMap.values());

    // Group by Branch-Month
    const byBranchMonthlyMap = new Map<
      string,
      {
        branch: string;
        month: string;
        year: string;
        total: number;
        sumTransaction: number;
      }
    >();

    payments.forEach((payment) => {
      const branchName = payment.branch?.name || "Unknown";
      const year = payment.createdAt.getFullYear().toString();
      const month = payment.createdAt.toLocaleString("default", {
        month: "long",
      });
      const key = `${branchName}-${year}-${month}`;

      if (!byBranchMonthlyMap.has(key)) {
        byBranchMonthlyMap.set(key, {
          branch: branchName,
          month,
          year,
          total: 0,
          sumTransaction: 0,
        });
      }

      const entry = byBranchMonthlyMap.get(key)!;
      entry.total += payment.amount ? Number(payment.amount) : 0;
      entry.sumTransaction += 1;
    });

    const byBranchMonthly = Array.from(byBranchMonthlyMap.values());

    const result = {
      summary,
      yearMonthly,
      byBranch,
      byBranchMonthly,
    };

    return NextResponse.json(result);
  } catch (error) {
    return handlePrismaError(error);
  }
}
