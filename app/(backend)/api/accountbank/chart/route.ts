// app/api/accountbank/dashboard/route.ts
"use server";

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";
import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountBankSummary = {
  totalAccountBanks: number;
  totalActiveAccountBanks: number;
  totalInactiveAccountBanks: number;
  totalRevenue: number; // total dari semua payment yang masuk via akun ini
  totalTransaction: number; // total jumlah payment
  totalPaymentItems: number; // total payment items terhubung
  totalUnpaidItems: number; // payment items yang belum lunas
  totalUnpaidAmount: number;
  collectionRate: number; // % yang sudah terbayar
};

type AccountBankDetail = {
  id: string;
  accountName: string;
  accountBank: string;
  accountNumber: string;
  isActive: boolean;
  major: { id: string; name: string } | null;
  totalRevenue: number;
  totalTransaction: number;
  totalPaymentItems: number;
  totalUnpaidItems: number;
  totalUnpaidAmount: number;
  collectionRate: number;
  avgTransactionAmount: number;
};

type MonthlyByAccount = {
  accountName: string;
  accountBank: string;
  year: string;
  month: string;
  totalRevenue: number;
  totalTransaction: number;
};

type ByBankGroup = {
  bankName: string; // mis. BCA, BNI, Mandiri
  totalAccounts: number;
  totalRevenue: number;
  totalTransaction: number;
  collectionRate: number;
};

type RevenueMonthly = {
  year: string;
  month: string;
  label: string;
  totalRevenue: number;
  totalTransaction: number;
};

type DashboardResult = {
  summary: AccountBankSummary;
  accountDetails: AccountBankDetail[];
  byBankGroup: ByBankGroup[];
  revenueMonthly: RevenueMonthly[];
  monthlyByAccount: MonthlyByAccount[];
  topAccounts: {
    rank: number;
    accountName: string;
    accountBank: string;
    accountNumber: string;
    majorName: string;
    totalRevenue: number;
    totalTransaction: number;
    percentage: number;
  }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAndValidateDate(fromdate: string | null, todate: string | null): { startDate: Date; endDate: Date } | { error: string } {
  if (!fromdate || !todate) {
    return { error: "Parameter fromdate dan todate wajib diisi" };
  }

  const startDate = new Date(fromdate);
  const endDate = new Date(todate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { error: "Format tanggal tidak valid. Gunakan format YYYY-MM-DD" };
  }

  if (startDate > endDate) {
    return { error: "fromdate tidak boleh lebih besar dari todate" };
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

function buildPaymentWhereClause({ startDate, endDate, majorId, accountBankId }: { startDate: Date; endDate: Date; majorId?: string; accountBankId?: string }): Prisma.PaymentWhereInput {
  return {
    createdAt: { gte: startDate, lte: endDate },
    ...(majorId && { majorId }),
    ...(accountBankId && { accountBankId }),
  };
}

function groupBy<T, K extends string>(arr: T[], keyFn: (item: T) => K): Map<K, T[]> {
  return arr.reduce((map, item) => {
    const key = keyFn(item);
    const existing = map.get(key) ?? [];
    existing.push(item);
    map.set(key, existing);
    return map;
  }, new Map<K, T[]>());
}

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function monthLabel(year: string, month: string): string {
  const m = parseInt(month);
  return `${MONTH_NAMES[m - 1] ?? month} ${year}`;
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const fromdate = searchParams.get("fromdate");
  const todate = searchParams.get("todate");
  const majorId = searchParams.get("majorId") ?? undefined;
  const accountBankId = searchParams.get("accountBankId") ?? undefined;

  // ── 1. Validate ───────────────────────────────────────────────────────────
  const dateResult = parseAndValidateDate(fromdate, todate);
  if ("error" in dateResult) {
    return NextResponse.json({ error: dateResult.error }, { status: 400 });
  }
  const { startDate, endDate } = dateResult;

  try {
    // ── 2. Parallel queries ───────────────────────────────────────────────
    const [allAccountBanks, payments, unpaidPaymentItems, allPaymentItems] = await Promise.all([
      // Semua account bank (tidak di-filter tanggal — ini adalah master data)
      prisma.accountBank.findMany({
        include: {
          majors: { select: { id: true, name: true } },
          _count: {
            select: { payments: true },
          },
        },
        orderBy: { accountName: "asc" },
      }),

      // Payment dalam rentang tanggal, di-group nanti di JS
      prisma.payment.findMany({
        where: buildPaymentWhereClause({ startDate, endDate, majorId, accountBankId }),
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          accountBankId: true,
          accountBank: {
            select: {
              id: true,
              accountName: true,
              accountBank: true,
              accountNumber: true,
              majorId: true,
              majors: { select: { id: true, name: true } },
            },
          },
          paymentItems: {
            select: {
              id: true,
              isPaid: true,
              subtotal: true,
              amount: true,
              month: true,
              year: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),

      // Unpaid payment items dalam rentang tanggal
      prisma.paymentItems.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          isPaid: false,
          ...(majorId && {
            student: { majorId },
          }),
          ...(accountBankId && {
            payment: { accountBankId },
          }),
        },
        select: {
          id: true,
          subtotal: true,
          month: true,
          year: true,
          payment: {
            select: {
              accountBankId: true,
              accountBank: {
                select: { id: true, accountName: true, accountBank: true },
              },
            },
          },
        },
      }),

      // Semua payment items (paid + unpaid) untuk collection rate
      prisma.paymentItems.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          ...(majorId && { student: { majorId } }),
          ...(accountBankId && { payment: { accountBankId } }),
        },
        select: {
          id: true,
          isPaid: true,
          subtotal: true,
          payment: {
            select: { accountBankId: true },
          },
        },
      }),
    ]);

    // ── 3. Aggregate payment data ────────────────────────────────────────
    const totalRevenue = payments.reduce((s, p) => s + Number(p.amount ?? 0), 0);
    const totalTransaction = payments.length;
    const allItemsCount = allPaymentItems.length;
    const unpaidItemsCount = unpaidPaymentItems.length;

    const totalPaidAmount = allPaymentItems.filter((i) => i.isPaid).reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
    const totalUnpaidAmount = unpaidPaymentItems.reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
    const totalAllAmount = totalPaidAmount + totalUnpaidAmount;

    // ── 4. Summary ──────────────────────────────────────────────────────
    const summary: AccountBankSummary = {
      totalAccountBanks: allAccountBanks.length,
      totalActiveAccountBanks: 0, // Field isActive tidak ada di schema
      totalInactiveAccountBanks: 0, // Field isActive tidak ada di schema
      totalRevenue,
      totalTransaction,
      totalPaymentItems: allItemsCount,
      totalUnpaidItems: unpaidItemsCount,
      totalUnpaidAmount,
      collectionRate: totalAllAmount > 0 ? Math.round((totalPaidAmount / totalAllAmount) * 1000) / 10 : 0,
    };

    // ── 5. Per account bank detail ───────────────────────────────────────
    const paymentsByAccount = groupBy(payments, (p) => p.accountBankId ?? "");
    const unpaidByAccount = groupBy(unpaidPaymentItems, (i) => i.payment?.accountBankId ?? "");
    const allItemsByAccount = groupBy(allPaymentItems, (i) => i.payment?.accountBankId ?? "");

    const accountDetails: AccountBankDetail[] = allAccountBanks
      .filter((acct) => {
        // Kalau ada filter accountBankId, hanya tampilkan yang sesuai
        if (accountBankId) return acct.id === accountBankId;
        return true;
      })
      .map((acct) => {
        const acctPayments = paymentsByAccount.get(acct.id) ?? [];
        const acctUnpaid = unpaidByAccount.get(acct.id) ?? [];
        const acctAllItems = allItemsByAccount.get(acct.id) ?? [];

        const revenue = acctPayments.reduce((s, p) => s + Number(p.amount ?? 0), 0);
        const unpaidAmt = acctUnpaid.reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
        const paidAmt = acctAllItems.filter((i) => i.isPaid).reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
        const totalAmt = paidAmt + unpaidAmt;

        return {
          id: acct.id,
          accountName: acct.accountName,
          accountBank: acct.accountBank,
          accountNumber: acct.accountNumber,
          isActive: true, // Default value karena field tidak ada di schema
          major: acct.majors ?? null,
          totalRevenue: revenue,
          totalTransaction: acctPayments.length,
          totalPaymentItems: acctAllItems.length,
          totalUnpaidItems: acctUnpaid.length,
          totalUnpaidAmount: unpaidAmt,
          collectionRate: totalAmt > 0 ? Math.round((paidAmt / totalAmt) * 1000) / 10 : 0,
          avgTransactionAmount: acctPayments.length > 0 ? Math.round(revenue / acctPayments.length) : 0,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // ── 6. By bank group (BCA, BNI, Mandiri, dst.) ──────────────────────
    const accountsByBank = groupBy(accountDetails, (a) => a.accountBank);

    const byBankGroup: ByBankGroup[] = Array.from(accountsByBank.entries())
      .map(([bankName, accounts]) => {
        const rev = accounts.reduce((s, a) => s + a.totalRevenue, 0);
        const trx = accounts.reduce((s, a) => s + a.totalTransaction, 0);
        const paid = accounts.reduce((s, a) => s + a.totalRevenue - a.totalUnpaidAmount, 0);
        const unpd = accounts.reduce((s, a) => s + a.totalUnpaidAmount, 0);
        const tot = paid + unpd;
        return {
          bankName,
          totalAccounts: accounts.length,
          totalRevenue: rev,
          totalTransaction: trx,
          collectionRate: tot > 0 ? Math.round((paid / tot) * 1000) / 10 : 0,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // ── 7. Revenue monthly (aggregate semua akun) ────────────────────────
    const paymentsByMonth = groupBy(payments, (p) => {
      const d = new Date(p.createdAt);
      const y = d.getFullYear().toString();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    });

    const revenueMonthly: RevenueMonthly[] = Array.from(paymentsByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => {
        const [year, month] = key.split("-");
        return {
          year,
          month,
          label: monthLabel(year, month),
          totalRevenue: items.reduce((s, p) => s + Number(p.amount ?? 0), 0),
          totalTransaction: items.length,
        };
      });

    // ── 8. Monthly breakdown per account ────────────────────────────────
    const monthlyByAccount: MonthlyByAccount[] = [];

    payments.forEach((payment) => {
      const d = new Date(payment.createdAt);
      const year = d.getFullYear().toString();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const acct = payment.accountBank;
      if (!acct) return;

      const existing = monthlyByAccount.find((r) => r.accountName === acct.accountName && r.accountBank === acct.accountBank && r.year === year && r.month === month);

      if (existing) {
        existing.totalRevenue += Number(payment.amount ?? 0);
        existing.totalTransaction += 1;
      } else {
        monthlyByAccount.push({
          accountName: acct.accountName,
          accountBank: acct.accountBank,
          year,
          month,
          totalRevenue: Number(payment.amount ?? 0),
          totalTransaction: 1,
        });
      }
    });

    monthlyByAccount.sort((a, b) => `${a.year}-${a.month}`.localeCompare(`${b.year}-${b.month}`));

    // ── 9. Top accounts ──────────────────────────────────────────────────
    const topAccounts = accountDetails
      .filter((a) => a.totalRevenue > 0)
      .slice(0, 10)
      .map((a, i) => ({
        rank: i + 1,
        accountName: a.accountName,
        accountBank: a.accountBank,
        accountNumber: a.accountNumber,
        majorName: a.major?.name ?? "-",
        totalRevenue: a.totalRevenue,
        totalTransaction: a.totalTransaction,
        percentage: totalRevenue > 0 ? Math.round((a.totalRevenue / totalRevenue) * 1000) / 10 : 0,
      }));

    // ── 10. Response ─────────────────────────────────────────────────────
    const result: DashboardResult = {
      summary,
      accountDetails,
      byBankGroup,
      revenueMonthly,
      monthlyByAccount,
      topAccounts,
    };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
