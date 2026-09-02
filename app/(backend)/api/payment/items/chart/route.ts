// app/api/payment/items/dashboard/route.ts
"use server";

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";
import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────

type SummaryResult = {
  totalUnpaidAmount: number;
  totalUnpaidCount: number;
  totalPaidAmount: number;
  totalPaidCount: number;
  collectionRate: number; // persentase yang sudah dibayar
};

type MonthlyData = {
  year: string;
  month: string;
  totalUnpaidAmount: number;
  totalUnpaidCount: number;
  totalPaidAmount: number;
  totalPaidCount: number;
};

type ByMajorData = {
  major: string;
  majorId: string;
  totalUnpaidAmount: number;
  totalUnpaidCount: number;
  totalPaidAmount: number;
  totalPaidCount: number;
  collectionRate: number;
};

type BySkuTypeData = {
  skuType: string;
  totalUnpaidAmount: number;
  totalUnpaidCount: number;
  totalPaidAmount: number;
  totalPaidCount: number;
};

type ByStudentData = {
  studentId: string;
  studentName: string;
  className: string;
  majorName: string;
  totalUnpaidAmount: number;
  totalUnpaidCount: number;
  oldestUnpaidMonth: string;
  oldestUnpaidYear: string;
};

type DashboardResult = {
  summary: SummaryResult;
  monthly: MonthlyData[];
  byMajor: ByMajorData[];
  bySkuType: BySkuTypeData[];
  topUnpaidStudents: ByStudentData[];
  unpaidByMonth: {
    label: string; // "Januari 2025"
    amount: number;
    count: number;
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

  // Normalize ke awal dan akhir hari
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

// Buat where clause yang type-safe menggunakan Prisma.PaymentItemsWhereInput
function buildWhereClause({ startDate, endDate, majorId, skuType, isPaid }: { startDate: Date; endDate: Date; majorId?: string; skuType?: string; isPaid?: boolean }): Prisma.PaymentItemsWhereInput {
  return {
    createdAt: {
      gte: startDate,
      lte: endDate,
    },
    // Filter majorId melalui relasi student
    ...(majorId && {
      student: {
        majorId,
      },
    }),
    // Filter skuType melalui relasi PaymentType
    ...(skuType && {
      PaymentType: {
        skuType: skuType, // pastikan field name sesuai schema Prisma
      },
    }),
    // Filter isPaid — undefined berarti ambil semua
    ...(isPaid !== undefined && { isPaid }),
  };
}

// Group utility
function groupBy<T, K extends string | number>(arr: T[], keyFn: (item: T) => K): Map<K, T[]> {
  return arr.reduce((map, item) => {
    const key = keyFn(item);
    const group = map.get(key) ?? [];
    group.push(item);
    map.set(key, group);
    return map;
  }, new Map<K, T[]>());
}

// ─── GET Handler ──────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const fromdate = searchParams.get("fromdate");
  const todate = searchParams.get("todate");
  const majorId = searchParams.get("majorId") ?? undefined;
  const skuType = searchParams.get("skuType") ?? undefined;

  // ── 1. Validate dates ───────────────────────────────────────────────────
  const dateResult = parseAndValidateDate(fromdate, todate);
  if ("error" in dateResult) {
    return NextResponse.json({ error: dateResult.error }, { status: 400 });
  }
  const { startDate, endDate } = dateResult;

  try {
    // ── 2. Query: fokus isPaid (default false) ──────────────────────────
    // Best practice: dua query terpisah untuk unpaid & paid
    // sehingga agregasi lebih akurat tanpa conditional reduce
    const [unpaidItems, paidItems] = await Promise.all([
      // Query unpaid (fokus utama)
      prisma.paymentItems.findMany({
        where: buildWhereClause({
          startDate,
          endDate,
          majorId,
          skuType,
          isPaid: false,
        }),
        include: {
          PaymentType: true,
          payment: {
            select: { id: true, receiptNumber: true, status: true },
          },
          student: {
            select: {
              id: true,
              name: true,
              class: { select: { name: true } },
              major: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" }, // asc: yang paling lama dulu (prioritas collection)
      }),

      // Query paid (untuk comparison & collection rate)
      prisma.paymentItems.findMany({
        where: buildWhereClause({
          startDate,
          endDate,
          majorId,
          isPaid: true,
          skuType,
        }),
        select: {
          id: true,
          amount: true,
          subtotal: true,
          month: true,
          year: true,
          skuType: true,
          PaymentType: { select: { name: true, owner: true } },
          student: {
            select: {
              major: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ]);

    // ── 3. Summary ──────────────────────────────────────────────────────
    const totalUnpaidAmount = unpaidItems.reduce((sum, i) => sum + Number(i.subtotal ?? 0), 0);
    const totalPaidAmount = paidItems.reduce((sum, i) => sum + Number(i.subtotal ?? 0), 0);
    const totalAll = totalUnpaidAmount + totalPaidAmount;

    const summary: SummaryResult = {
      totalUnpaidAmount,
      totalUnpaidCount: unpaidItems.length,
      totalPaidAmount,
      totalPaidCount: paidItems.length,
      collectionRate: totalAll > 0 ? Math.round((totalPaidAmount / totalAll) * 100 * 10) / 10 : 0,
    };

    // ── 4. Monthly grouping ─────────────────────────────────────────────
    // Group unpaid by year-month (berdasarkan field month/year di record,
    // bukan createdAt — ini lebih akurat untuk tagihan bulanan)
    const unpaidByYearMonth = groupBy(unpaidItems, (i) => `${i.year}-${String(i.month).padStart(2, "0")}`);
    const paidByYearMonth = groupBy(paidItems, (i) => `${i.year}-${String(i.month).padStart(2, "0")}`);

    const allMonthKeys = Array.from(new Set([...unpaidByYearMonth.keys(), ...paidByYearMonth.keys()])).sort(); // sort ascending by year-month key

    const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    const monthly: MonthlyData[] = allMonthKeys.map((key) => {
      const [year, monthNum] = key.split("-");
      const monthName = MONTH_NAMES[parseInt(monthNum) - 1] ?? monthNum;
      const unpaid = unpaidByYearMonth.get(key) ?? [];
      const paid = paidByYearMonth.get(key) ?? [];

      return {
        year,
        month: monthName,
        totalUnpaidAmount: unpaid.reduce((s, i) => s + Number(i.subtotal ?? 0), 0),
        totalUnpaidCount: unpaid.length,
        totalPaidAmount: paid.reduce((s, i) => s + Number(i.subtotal ?? 0), 0),
        totalPaidCount: paid.length,
      };
    });

    // unpaidByMonth: ringkasan untuk chart khusus unpaid (label friendly)
    const unpaidByMonth = monthly
      .filter((m) => m.totalUnpaidAmount > 0)
      .map((m) => ({
        label: `${m.month} ${m.year}`,
        amount: m.totalUnpaidAmount,
        count: m.totalUnpaidCount,
      }));

    // ── 5. By Major ─────────────────────────────────────────────────────
    const unpaidByMajorMap = groupBy(unpaidItems, (i) => i.student?.major?.id ?? "unknown");
    const paidByMajorMap = groupBy(paidItems, (i) => i.student?.major?.id ?? "unknown");

    const allMajorIds = Array.from(new Set([...unpaidByMajorMap.keys(), ...paidByMajorMap.keys()]));

    const byMajor: ByMajorData[] = allMajorIds
      .map((mId) => {
        const unpaid = unpaidByMajorMap.get(mId) ?? [];
        const paid = paidByMajorMap.get(mId) ?? [];
        const uAmount = unpaid.reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
        const pAmount = paid.reduce((s, i) => s + Number(i.subtotal ?? 0), 0);
        const total = uAmount + pAmount;
        const majorInfo = unpaid[0]?.student?.major ?? paid[0]?.student?.major;

        return {
          major: majorInfo?.name ?? mId,
          majorId: mId,
          totalUnpaidAmount: uAmount,
          totalUnpaidCount: unpaid.length,
          totalPaidAmount: pAmount,
          totalPaidCount: paid.length,
          collectionRate: total > 0 ? Math.round((pAmount / total) * 100 * 10) / 10 : 0,
        };
      })
      .sort((a, b) => b.totalUnpaidAmount - a.totalUnpaidAmount);

    // ── 6. By SKU Type ──────────────────────────────────────────────────
    const unpaidBySkuMap = groupBy(unpaidItems, (i) => i.PaymentType?.owner ?? i.skuType ?? "unknown");
    const paidBySkuMap = groupBy(paidItems, (i) => i.PaymentType?.owner ?? i.skuType ?? "unknown");

    const allSkuKeys = Array.from(new Set([...unpaidBySkuMap.keys(), ...paidBySkuMap.keys()]));

    const bySkuType: BySkuTypeData[] = allSkuKeys
      .map((sku) => {
        const unpaid = unpaidBySkuMap.get(sku) ?? [];
        const paid = paidBySkuMap.get(sku) ?? [];
        return {
          skuType: sku,
          totalUnpaidAmount: unpaid.reduce((s, i) => s + Number(i.subtotal ?? 0), 0),
          totalUnpaidCount: unpaid.length,
          totalPaidAmount: paid.reduce((s, i) => s + Number(i.subtotal ?? 0), 0),
          totalPaidCount: paid.length,
        };
      })
      .sort((a, b) => b.totalUnpaidAmount - a.totalUnpaidAmount);

    // ── 7. Top unpaid students ──────────────────────────────────────────
    // Group unpaid by studentId, agregasi total tunggakan
    const unpaidByStudentMap = groupBy(unpaidItems, (i) => i.student?.id ?? "unknown");

    const topUnpaidStudents: ByStudentData[] = Array.from(unpaidByStudentMap.entries())
      .map(([studentId, items]) => {
        const student = items[0]?.student;
        // Cari tagihan paling lama (asc sudah di-sort di query)
        const oldest = items[0];
        return {
          studentId,
          studentName: student?.name ?? "-",
          className: student?.class?.name ?? "-",
          majorName: student?.major?.name ?? "-",
          totalUnpaidAmount: items.reduce((s, i) => s + Number(i.subtotal ?? 0), 0),
          totalUnpaidCount: items.length,
          oldestUnpaidMonth: oldest?.month?.toString() ?? "-",
          oldestUnpaidYear: oldest?.year?.toString() ?? "-",
        };
      })
      .sort((a, b) => b.totalUnpaidAmount - a.totalUnpaidAmount)
      .slice(0, 50); // top 20 siswa tunggakan terbesar

    // ── 8. Compose & return ─────────────────────────────────────────────
    const result: DashboardResult = {
      summary,
      monthly,
      byMajor,
      bySkuType,
      topUnpaidStudents,
      unpaidByMonth,
    };

    return NextResponse.json(result, {
      headers: {
        // Cache 60 detik di edge, stale-while-revalidate 120 detik
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}
