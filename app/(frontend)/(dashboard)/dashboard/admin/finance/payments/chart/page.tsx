"use client";
import { usePaymentsDashboardByDate } from "@/app/(hooks)/hooks/Payments/usePaymentByDate";
import { useGetBranchs } from "@/app/(hooks)/hooks/Branchs/useBranchs";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { DatePickerWithRange } from "@/components/date/datePicker";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/authClients";
import { CHART_GRID_STROKE, CHART_PALETTE, CHART_SERIES } from "@/lib/charts";
import { format, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Activity,
  BarChart2,
  Building2,
  CalendarDays,
  CreditCard,
  PieChart as PieIcon,
  Receipt,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type DashboardData = {
  summary: { total: number; sumTransaction: number };
  yearMonthly: {
    year: string;
    month: string;
    total: number;
    sumTransaction: number;
  }[];
  byBranch: { branch: string; total: number; sumTransaction: number }[];
  byBranchMonthly: {
    branch: string;
    month: string;
    year: string;
    total: number;
    sumTransaction: number;
  }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    notation: v >= 1_000_000_000 ? "compact" : "standard",
  }).format(v);

const fmtFull = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat("id-ID").format(v);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 min-w-[180px] rounded-xl border p-3 shadow-xl backdrop-blur">
      <p className="text-muted-foreground mb-2 text-xs font-semibold">
        {label}
      </p>
      {payload.map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 text-xs"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-semibold">
            {p.name === "Transaksi" ? fmtNum(p.value) : fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  color,
  loading,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color: string;
  loading?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      {/* Accent stripe */}
      <div
        className="absolute top-0 right-0 left-0 h-1"
        style={{ backgroundColor: color }}
      />
      <CardContent className="pt-5 pb-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                {title}
              </span>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {sub && <p className="text-muted-foreground mt-1 text-xs">{sub}</p>}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                {trend.value >= 0 ? (
                  <TrendingUp className="text-success h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="text-destructive h-3.5 w-3.5" />
                )}
                <span
                  className={`text-xs font-medium ${trend.value >= 0 ? "text-success" : "text-destructive"}`}
                >
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-muted-foreground text-xs">
                  {trend.label}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
      <BarChart2 className="text-muted-foreground/40 h-10 w-10" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

// ─── Chart Skeletons ──────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[80, 60, 90, 50, 70, 40, 85].map((h, i) => (
        <div key={i} className="flex items-end gap-1" style={{ height: 16 }}>
          <Skeleton
            className="h-full w-full rounded"
            style={{ opacity: h / 100 }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function PaymentDashboard({
  userBranchId,
  isAdmin,
}: {
  userBranchId?: string;
  isAdmin: boolean;
}) {
  // Default: last 3 months → today
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const [selectedBranchId, setSelectedBranchId] = React.useState<string>(
    isAdmin ? "all" : (userBranchId ?? "all"),
  );
  const [activeTab, setActiveTab] = React.useState("overview");

  const { data: branchs = [] } = useGetBranchs();

  // Determine branchId to pass to hook
  const queryBranchId = React.useMemo(() => {
    if (!isAdmin) return userBranchId;
    return selectedBranchId === "all" ? undefined : selectedBranchId;
  }, [isAdmin, selectedBranchId, userBranchId]);

  const {
    data: rawData,
    isLoading,
    refetch,
    isFetching,
  } = usePaymentsDashboardByDate({
    fromdate: dateRange?.from,
    todate: dateRange?.to,
    branchId: queryBranchId,
  });

  console.log(rawData);

  const data = rawData as DashboardData | undefined;
  const summary = data?.summary ?? { total: 0, sumTransaction: 0 };
  const yearMonthly = data?.yearMonthly ?? [];
  const byBranch = data?.byBranch ?? [];
  const byBranchMonthly = data?.byBranchMonthly ?? [];

  // Avg per transaction
  const avgPerTransaction =
    summary.sumTransaction > 0 ? summary.total / summary.sumTransaction : 0;

  // Top branch
  const topBranch = byBranch.reduce<{ branch: string; total: number } | null>(
    (acc, cur) => (!acc || cur.total > acc.total ? cur : acc),
    null,
  );

  // Chart data: yearMonthly sorted
  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const sortedMonthly = [...yearMonthly].sort((a, b) => {
    const yearDiff = Number(a.year) - Number(b.year);
    if (yearDiff !== 0) return yearDiff;
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  const monthlyChartData = sortedMonthly.map((d) => ({
    period: `${d.month.slice(0, 3)} ${d.year}`,
    Total: d.total,
    Transaksi: d.sumTransaction,
  }));

  // Branch pie data
  const branchPieData = byBranch.map((d) => ({
    name: d.branch,
    value: d.total,
    count: d.sumTransaction,
  }));

  // Multi-line per branch per month
  const branchNames = Array.from(new Set(byBranchMonthly.map((d) => d.branch)));
  const periodKeys = Array.from(
    new Set(byBranchMonthly.map((d) => `${d.month.slice(0, 3)} ${d.year}`)),
  ).sort((a, b) => {
    const [mA, yA] = a.split(" ");
    const [mB, yB] = b.split(" ");
    return (
      Number(yA) - Number(yB) ||
      monthOrder.findIndex((m) => m.startsWith(mA)) -
        monthOrder.findIndex((m) => m.startsWith(mB))
    );
  });

  const multiLineData = periodKeys.map((period) => {
    const row: Record<string, string | number> = { period };
    branchNames.forEach((branch) => {
      const entry = byBranchMonthly.find(
        (d) =>
          `${d.month.slice(0, 3)} ${d.year}` === period && d.branch === branch,
      );
      row[branch] = entry?.total ?? 0;
    });
    return row;
  });

  const dateLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "d MMM yyyy", { locale: localeId })} – ${format(dateRange.to, "d MMM yyyy", { locale: localeId })}`
      : "Belum dipilih";

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-6 p-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Pembayaran
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Analitik & ringkasan transaksi keuangan sekolah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1.5 text-xs">
            <CalendarDays className="h-3 w-3" />
            {dateLabel}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-muted-foreground h-4 w-4 shrink-0" />
              <span className="text-muted-foreground text-sm font-medium">
                Periode:
              </span>
            </div>

            <DatePickerWithRange date={dateRange} setDate={setDateRange} />

            {isAdmin && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <div className="flex items-center gap-2">
                  <Building2 className="text-muted-foreground h-4 w-4 shrink-0" />
                  <span className="text-muted-foreground text-sm font-medium">
                    Branch:
                  </span>
                </div>
                <Select
                  value={selectedBranchId}
                  onValueChange={setSelectedBranchId}
                >
                  <SelectTrigger className="h-9 w-48">
                    <SelectValue placeholder="Semua Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Branch</SelectItem>
                    {(branchs as any[]).map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {/* Quick range presets */}
            <div className="ml-auto flex items-center gap-1.5">
              {[
                { label: "1 Bln", months: 1 },
                { label: "3 Bln", months: 3 },
                { label: "6 Bln", months: 6 },
                { label: "1 Thn", months: 12 },
              ].map(({ label, months }) => (
                <Button
                  key={label}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() =>
                    setDateRange({
                      from: subMonths(new Date(), months),
                      to: new Date(),
                    })
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Pendapatan"
          value={isLoading ? "—" : fmt(summary.total)}
          sub={isLoading ? undefined : `Dalam periode ${dateLabel}`}
          icon={CreditCard}
          color={CHART_SERIES.positive}
          loading={isLoading}
        />
        <KPICard
          title="Total Transaksi"
          value={isLoading ? "—" : fmtNum(summary.sumTransaction)}
          sub="Jumlah kwitansi terbuat"
          icon={Receipt}
          color={CHART_SERIES.info}
          loading={isLoading}
        />
        <KPICard
          title="Rata-rata / Transaksi"
          value={isLoading ? "—" : fmt(avgPerTransaction)}
          sub="Nominal rata-rata per kwitansi"
          icon={Activity}
          color={CHART_PALETTE[1]}
          loading={isLoading}
        />
        <KPICard
          title="Branch Terbesar"
          value={isLoading ? "—" : (topBranch?.branch ?? "-")}
          sub={topBranch ? fmt(topBranch.total) : undefined}
          icon={Building2}
          color={CHART_SERIES.positive}
          loading={isLoading}
        />
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="branch" className="gap-1.5 text-xs">
            <PieIcon className="h-3.5 w-3.5" />
            Per Branch
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-1.5 text-xs">
            <BarChart2 className="h-3.5 w-3.5" />
            Perbandingan
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB: OVERVIEW ═══════════ */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Area chart — pendapatan per bulan */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pendapatan Bulanan</CardTitle>
                <CardDescription className="text-xs">
                  Total nominal transaksi per bulan dalam periode terpilih
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ChartSkeleton />
                ) : monthlyChartData.length === 0 ? (
                  <EmptyChart message="Tidak ada data dalam rentang tanggal ini" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart
                      data={monthlyChartData}
                      margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="gradTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={CHART_SERIES.positive}
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_SERIES.positive}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_GRID_STROKE}
                      />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => fmt(v).replace("Rp", "").trim()}
                        width={52}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="Total"
                        stroke={CHART_SERIES.positive}
                        strokeWidth={2.5}
                        fill="url(#gradTotal)"
                        dot={{ r: 3, fill: CHART_SERIES.positive }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Bar chart — jumlah transaksi per bulan */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Volume Transaksi</CardTitle>
                <CardDescription className="text-xs">
                  Jumlah kwitansi per bulan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ChartSkeleton />
                ) : monthlyChartData.length === 0 ? (
                  <EmptyChart message="Tidak ada data" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={monthlyChartData}
                      margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_GRID_STROKE}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                        width={28}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="Transaksi"
                        fill={CHART_SERIES.info}
                        radius={[4, 4, 0, 0]}
                      >
                        {monthlyChartData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary table — per bulan */}
          {!isLoading && sortedMonthly.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rincian Bulanan</CardTitle>
                <CardDescription className="text-xs">
                  Breakdown lengkap per bulan
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b">
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                          Periode
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Transaksi
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Total
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Rata-rata
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium">
                          Porsi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMonthly.map((row, i) => {
                        const pct =
                          summary.total > 0
                            ? Math.round((row.total / summary.total) * 100)
                            : 0;
                        const avg =
                          row.sumTransaction > 0
                            ? row.total / row.sumTransaction
                            : 0;
                        return (
                          <tr
                            key={i}
                            className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {row.month} {row.year}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">
                              {fmtNum(row.sumTransaction)}
                            </td>
                            <td className="text-info px-4 py-2.5 text-right font-semibold tabular-nums">
                              {fmtFull(row.total)}
                            </td>
                            <td className="text-muted-foreground px-4 py-2.5 text-right tabular-nums">
                              {fmt(avg)}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="bg-muted h-1.5 max-w-[80px] flex-1 rounded-full">
                                  <div
                                    className="bg-info-solid h-1.5 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-muted-foreground w-8 text-right text-xs tabular-nums">
                                  {pct}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-info-surface border-t-2">
                        <td className="px-4 py-3 text-sm font-bold">Total</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">
                          {fmtNum(summary.sumTransaction)}
                        </td>
                        <td className="text-info-strong px-4 py-3 text-right font-bold tabular-nums">
                          {fmtFull(summary.total)}
                        </td>
                        <td className="text-muted-foreground px-4 py-3 text-right font-bold tabular-nums">
                          {fmt(avgPerTransaction)}
                        </td>
                        <td className="px-4 py-3" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════ TAB: PER BRANCH ═══════════ */}
        <TabsContent value="branch" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Distribusi per Branch
                </CardTitle>
                <CardDescription className="text-xs">
                  Porsi total pendapatan per branch
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ChartSkeleton />
                ) : branchPieData.length === 0 ? (
                  <EmptyChart message="Tidak ada data per branch" />
                ) : (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={branchPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {branchPieData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) =>
                            value ? [fmtFull(Number(value)), "Total"] : ["", ""]
                          }
                          labelFormatter={(name) => name}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="mt-2 grid w-full grid-cols-2 gap-x-6 gap-y-1.5">
                      {branchPieData.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{
                              backgroundColor:
                                CHART_PALETTE[i % CHART_PALETTE.length],
                            }}
                          />
                          <span className="text-muted-foreground truncate">
                            {d.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar chart — per branch */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total per Branch</CardTitle>
                <CardDescription className="text-xs">
                  Nominal pendapatan masing-masing branch
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ChartSkeleton />
                ) : branchPieData.length === 0 ? (
                  <EmptyChart message="Tidak ada data per branch" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={byBranch}
                      layout="vertical"
                      margin={{ top: 0, right: 16, left: 4, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke={CHART_GRID_STROKE}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => fmt(v).replace("Rp", "").trim()}
                      />
                      <YAxis
                        dataKey="branch"
                        type="category"
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <Tooltip
                        formatter={(v: any) =>
                          v ? [fmtFull(Number(v)), "Total"] : ["", ""]
                        }
                      />
                      <Bar dataKey="total" name="Total" radius={[0, 4, 4, 0]}>
                        {byBranch.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Branch detail table */}
          {!isLoading && byBranch.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rincian per Branch</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b">
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                          #
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                          Branch
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Transaksi
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Total
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Rata-rata
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium">
                          Kontribusi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...byBranch]
                        .sort((a, b) => b.total - a.total)
                        .map((row, i) => {
                          const pct =
                            summary.total > 0
                              ? Math.round((row.total / summary.total) * 100)
                              : 0;
                          const avg =
                            row.sumTransaction > 0
                              ? row.total / row.sumTransaction
                              : 0;
                          return (
                            <tr
                              key={i}
                              className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}
                            >
                              <td className="text-muted-foreground px-4 py-2.5 text-xs">
                                {i + 1}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                                    style={{
                                      backgroundColor:
                                        CHART_PALETTE[i % CHART_PALETTE.length],
                                    }}
                                  />
                                  <span className="font-medium">
                                    {row.branch}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums">
                                {fmtNum(row.sumTransaction)}
                              </td>
                              <td
                                className="px-4 py-2.5 text-right font-semibold tabular-nums"
                                style={{
                                  color:
                                    CHART_PALETTE[i % CHART_PALETTE.length],
                                }}
                              >
                                {fmtFull(row.total)}
                              </td>
                              <td className="text-muted-foreground px-4 py-2.5 text-right tabular-nums">
                                {fmt(avg)}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="bg-muted h-1.5 max-w-[80px] flex-1 rounded-full">
                                    <div
                                      className="h-1.5 rounded-full"
                                      style={{
                                        width: `${pct}%`,
                                        backgroundColor:
                                          CHART_PALETTE[
                                            i % CHART_PALETTE.length
                                          ],
                                      }}
                                    />
                                  </div>
                                  <span className="text-muted-foreground w-8 text-right text-xs tabular-nums">
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════ TAB: PERBANDINGAN ═══════════ */}
        <TabsContent value="comparison" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Multi-line chart — per branch per month */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Tren Bulanan per Branch
                </CardTitle>
                <CardDescription className="text-xs">
                  Perbandingan pendapatan antar branch dalam satu grafik
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ChartSkeleton />
                ) : multiLineData.length === 0 ? (
                  <EmptyChart message="Tidak ada data perbandingan" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={multiLineData}
                      margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_GRID_STROKE}
                      />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => fmt(v).replace("Rp", "").trim()}
                        width={52}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {branchNames.map((name, i) => (
                        <Line
                          key={name}
                          type="monotone"
                          dataKey={name}
                          stroke={CHART_PALETTE[i % CHART_PALETTE.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Grouped bar chart */}
            {isAdmin && byBranchMonthly.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Perbandingan Bulanan (Batang)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Grouped bar chart per branch per bulan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <ChartSkeleton />
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={multiLineData}
                        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={CHART_GRID_STROKE}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 9 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 9 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => fmt(v).replace("Rp", "").trim()}
                          width={52}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {branchNames.map((name, i) => (
                          <Bar
                            key={name}
                            dataKey={name}
                            fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                            radius={[3, 3, 0, 0]}
                            maxBarSize={32}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Auth Wrapper ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading } = useGetUserByIdBetterAuth(
    userId as string,
  );

  if (isPending || isLoading) return <Loading />;

  const userRole = userData?.role?.name;
  if (userRole !== "Admin" && userRole !== "Treasurer") {
    unauthorized();
    return null;
  }

  const isAdmin = userRole === "Admin";
  const userBranchId = userData?.branch?.id;

  return <PaymentDashboard isAdmin={isAdmin} userBranchId={userBranchId} />;
}
