"use client";

import { useGetBranchs } from "@/app/(hooks)/hooks/Branchs/useBranchs";
import { usePaymentsItemsDashboardByDate } from "@/app/(hooks)/hooks/Payments/usePaymentItemsByDate";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/authClients";
import { CHART_GRID_STROKE, CHART_PALETTE, CHART_SERIES } from "@/lib/charts";
import { format, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  ListChecks,
  PieChart as PieIcon,
  RefreshCw,
  Users,
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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Types (matches API response) ──────────────────────────────────────────
type SummaryResult = {
  totalUnpaidAmount: number;
  totalUnpaidCount: number;
  totalPaidAmount: number;
  totalPaidCount: number;
  collectionRate: number;
};

type MonthlyData = {
  year: string;
  month: string;
  totalUnpaidAmount: number;
  totalUnpaidCount: number;
  totalPaidAmount: number;
  totalPaidCount: number;
};

type ByBranchData = {
  branch: string;
  branchId: string;
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
  branchName: string;
  totalUnpaidAmount: number;
  totalUnpaidCount: number;
  oldestUnpaidMonth: string;
  oldestUnpaidYear: string;
};

type DashboardResult = {
  summary: SummaryResult;
  monthly: MonthlyData[];
  byBranch: ByBranchData[];
  bySkuType: BySkuTypeData[];
  topUnpaidStudents: ByStudentData[];
  unpaidByMonth: { label: string; amount: number; count: number }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────
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

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
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
            {typeof p.value === "number" &&
            p.name?.toLowerCase().includes("jumlah")
              ? fmtNum(p.value)
              : fmt(Number(p.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  loading,
  badge,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
  badge?: { label: string; positive?: boolean };
}) {
  return (
    <Card className="relative overflow-hidden">
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
            <div className="mt-1 flex items-center justify-between">
              {sub && <p className="text-muted-foreground text-xs">{sub}</p>}
              {badge && (
                <Badge
                  variant={badge.positive ? "default" : "destructive"}
                  className="px-1.5 py-0 text-[10px]"
                >
                  {badge.label}
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Empty / Skeleton ───────────────────────────────────────────────────────
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
      <BarChart2 className="text-muted-foreground/40 h-10 w-10" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

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

// ─── Main Dashboard ─────────────────────────────────────────────────────────
function UnpaidPaymentDashboard({
  userBranchId,
  isAdmin,
}: {
  userBranchId?: string;
  isAdmin: boolean;
}) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const [selectedBranchId, setSelectedBranchId] = React.useState<string>(
    isAdmin ? "all" : (userBranchId ?? "all"),
  );

  const [selectedSKU, setSelectedSKU] = React.useState<string>("all");

  const [activeTab, setActiveTab] = React.useState("overview");

  const { data: branchs = [] } = useGetBranchs();

  const queryBranchId = React.useMemo(() => {
    if (!isAdmin) return userBranchId;
    return selectedBranchId === "all" ? undefined : selectedBranchId;
  }, [isAdmin, selectedBranchId, userBranchId]);

  const querySKUType = React.useMemo(() => {
    return selectedSKU === "all" ? undefined : selectedSKU;
  }, [selectedSKU]);

  const {
    data: rawData,
    isLoading,
    refetch,
    isFetching,
  } = usePaymentsItemsDashboardByDate({
    fromdate: dateRange?.from,
    todate: dateRange?.to,
    branchId: queryBranchId,
    skuType: querySKUType,
    isPaid: false, // fokus dashboard ini: tunggakan / belum bayar
  });

  const data = rawData as DashboardResult | undefined;
  const summary = data?.summary ?? {
    totalUnpaidAmount: 0,
    totalUnpaidCount: 0,
    totalPaidAmount: 0,
    totalPaidCount: 0,
    collectionRate: 0,
  };
  const monthly = data?.monthly ?? [];
  const byBranch = data?.byBranch ?? [];
  const bySkuType = data?.bySkuType ?? [];
  const topUnpaidStudents = data?.topUnpaidStudents ?? [];

  const worstBranch = byBranch.reduce<ByBranchData | null>(
    (acc, cur) =>
      !acc || cur.totalUnpaidAmount > acc.totalUnpaidAmount ? cur : acc,
    null,
  );

  // Monthly chart data (unpaid vs paid)
  const monthlyChartData = monthly.map((d) => ({
    period: `${d.month.slice(0, 3)} ${d.year}`,
    Tunggakan: d.totalUnpaidAmount,
    Terbayar: d.totalPaidAmount,
    "Jumlah Tunggakan": d.totalUnpaidCount,
  }));

  // Pie: distribusi tunggakan per branch
  const branchPieData = byBranch.map((d) => ({
    name: d.branch,
    value: d.totalUnpaidAmount,
    count: d.totalUnpaidCount,
  }));

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
            Dashboard Tunggakan Pembayaran
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pantau item pembayaran yang belum lunas per branch, jenis, dan siswa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1.5 text-xs">
            <CalendarDays className="h-3 w-3" />
            {dateLabel}
          </Badge>
          {selectedSKU !== "all" && (
            <Badge variant="secondary" className="gap-1.5 py-1.5 text-xs">
              <ListChecks className="h-3 w-3" />
              {selectedSKU}
            </Badge>
          )}
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
          <div className="space-y-4">
            {/* Row 1: Main Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Date Range Picker */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm font-medium">
                    Periode
                  </span>
                </div>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>

              {/* Branch Filter (Admin Only) */}
              {isAdmin && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-sm font-medium">
                      Branch
                    </span>
                  </div>
                  <Select
                    value={selectedBranchId}
                    onValueChange={setSelectedBranchId}
                  >
                    <SelectTrigger className="h-10 w-full">
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
                </div>
              )}

              {/* SKU Type Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="text-muted-foreground h-4 w-4" />
                  <span className="text-muted-foreground text-sm font-medium">
                    Jenis Pembayaran
                  </span>
                </div>
                <Select value={selectedSKU} onValueChange={setSelectedSKU}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Semua Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="SPP">SPP</SelectItem>
                    <SelectItem value="Buku">Buku</SelectItem>
                    <SelectItem value="Seragam">Seragam</SelectItem>
                    <SelectItem value="Kegiatan">Kegiatan</SelectItem>
                    <SelectItem value="Catering">Catering</SelectItem>
                    <SelectItem value="Lainya">Lainya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Reset Button */}
                {(selectedBranchId !== "all" || selectedSKU !== "all") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9"
                    onClick={() => {
                      setSelectedBranchId(
                        isAdmin ? "all" : (userBranchId ?? "all"),
                      );
                      setSelectedSKU("all");
                    }}
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Reset Filter
                  </Button>
                )}
              </div>

              {/* Quick Date Shortcuts */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground mr-1 text-xs">
                  Quick:
                </span>
                {[
                  { label: "1 Bulan", months: 1 },
                  { label: "3 Bulan", months: 3 },
                  { label: "6 Bulan", months: 6 },
                  { label: "1 Tahun", months: 12 },
                ].map(({ label, months }) => (
                  <Button
                    key={label}
                    size="sm"
                    variant="secondary"
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
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Tunggakan"
          value={isLoading ? "—" : fmt(summary.totalUnpaidAmount)}
          sub={
            isLoading
              ? undefined
              : `${fmtNum(summary.totalUnpaidCount)} item belum lunas`
          }
          icon={AlertTriangle}
          color={CHART_SERIES.negative}
          loading={isLoading}
        />
        <KPICard
          title="Total Terbayar"
          value={isLoading ? "—" : fmt(summary.totalPaidAmount)}
          sub={
            isLoading
              ? undefined
              : `${fmtNum(summary.totalPaidCount)} item lunas`
          }
          icon={CheckCircle2}
          color={CHART_SERIES.positive}
          loading={isLoading}
        />
        <KPICard
          title="Collection Rate"
          value={isLoading ? "—" : `${summary.collectionRate}%`}
          sub="Persentase dari total tagihan"
          icon={Activity}
          color={CHART_PALETTE[2]}
          loading={isLoading}
          badge={
            !isLoading
              ? {
                  label:
                    summary.collectionRate >= 80
                      ? "Baik"
                      : summary.collectionRate >= 50
                        ? "Cukup"
                        : "Rendah",
                  positive: summary.collectionRate >= 80,
                }
              : undefined
          }
        />
        <KPICard
          title="Branch Tunggakan Terbesar"
          value={isLoading ? "—" : (worstBranch?.branch ?? "-")}
          sub={worstBranch ? fmt(worstBranch.totalUnpaidAmount) : undefined}
          icon={Building2}
          color={CHART_SERIES.negative}
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
          <TabsTrigger value="students" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            Siswa Tunggakan
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB: OVERVIEW ═══════════ */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Tunggakan vs Terbayar per Bulan
                </CardTitle>
                <CardDescription className="text-xs">
                  Perbandingan nominal belum bayar dan sudah bayar
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
                          id="gradUnpaid"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={CHART_SERIES.negative}
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor={CHART_SERIES.negative}
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient
                          id="gradPaid"
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
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area
                        type="monotone"
                        dataKey="Tunggakan"
                        stroke={CHART_SERIES.negative}
                        strokeWidth={2.5}
                        fill="url(#gradUnpaid)"
                        dot={{ r: 3, fill: CHART_SERIES.negative }}
                        activeDot={{ r: 5 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Terbayar"
                        stroke={CHART_SERIES.positive}
                        strokeWidth={2.5}
                        fill="url(#gradPaid)"
                        dot={{ r: 3, fill: CHART_SERIES.positive }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Volume Tunggakan</CardTitle>
                <CardDescription className="text-xs">
                  Jumlah item belum bayar per bulan
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
                        dataKey="Jumlah Tunggakan"
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

          {/* By SKU Type */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Tunggakan per Jenis Pembayaran
              </CardTitle>
              <CardDescription className="text-xs">
                Breakdown berdasarkan tipe SKU / jenis tagihan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <ChartSkeleton />
              ) : bySkuType.length === 0 ? (
                <EmptyChart message="Tidak ada data jenis pembayaran" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b">
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                          Jenis
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Jumlah Item
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Total Tunggakan
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Total Terbayar
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium">
                          Porsi Tunggakan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bySkuType.map((row, i) => {
                        const total =
                          row.totalUnpaidAmount + row.totalPaidAmount;
                        const pct =
                          total > 0
                            ? Math.round((row.totalUnpaidAmount / total) * 100)
                            : 0;
                        return (
                          <tr
                            key={i}
                            className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {row.skuType}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">
                              {fmtNum(row.totalUnpaidCount)}
                            </td>
                            <td className="text-destructive px-4 py-2.5 text-right font-semibold tabular-nums">
                              {fmtFull(row.totalUnpaidAmount)}
                            </td>
                            <td className="text-muted-foreground px-4 py-2.5 text-right tabular-nums">
                              {fmtFull(row.totalPaidAmount)}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="bg-muted h-1.5 max-w-[100px] flex-1 rounded-full">
                                  <div
                                    className="bg-destructive-solid h-1.5 rounded-full"
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
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB: PER BRANCH ═══════════ */}
        <TabsContent value="branch" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Distribusi Tunggakan per Branch
                </CardTitle>
                <CardDescription className="text-xs">
                  Porsi total tunggakan per branch
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
                            value
                              ? [fmtFull(Number(value)), "Tunggakan"]
                              : ["", ""]
                          }
                          labelFormatter={(name) => name}
                        />
                      </PieChart>
                    </ResponsiveContainer>
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Tunggakan per Branch
                </CardTitle>
                <CardDescription className="text-xs">
                  Nominal tunggakan masing-masing branch
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ChartSkeleton />
                ) : byBranch.length === 0 ? (
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
                          v ? [fmtFull(Number(v)), "Tunggakan"] : ["", ""]
                        }
                      />
                      <Bar
                        dataKey="totalUnpaidAmount"
                        name="Tunggakan"
                        radius={[0, 4, 4, 0]}
                      >
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

          {!isLoading && byBranch.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rincian per Branch</CardTitle>
                <CardDescription className="text-xs">
                  Termasuk collection rate masing-masing branch
                </CardDescription>
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
                          Item Belum Bayar
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Total Tunggakan
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Total Terbayar
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium">
                          Collection Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...byBranch]
                        .sort(
                          (a, b) => b.totalUnpaidAmount - a.totalUnpaidAmount,
                        )
                        .map((row, i) => (
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
                                <span className="font-medium">{row.branch}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">
                              {fmtNum(row.totalUnpaidCount)}
                            </td>
                            <td className="text-destructive px-4 py-2.5 text-right font-semibold tabular-nums">
                              {fmtFull(row.totalUnpaidAmount)}
                            </td>
                            <td className="text-muted-foreground px-4 py-2.5 text-right tabular-nums">
                              {fmtFull(row.totalPaidAmount)}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={row.collectionRate}
                                  className="h-1.5 max-w-[100px]"
                                />
                                <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
                                  {row.collectionRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════════ TAB: SISWA TUNGGAKAN ═══════════ */}
        <TabsContent value="students" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ListChecks className="text-destructive h-4 w-4" />
                    Top 50 Siswa dengan Tunggakan Terbesar
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    Diurutkan berdasarkan total nominal belum bayar
                  </CardDescription>
                </div>
                {!isLoading && topUnpaidStudents.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {topUnpaidStudents.length} siswa
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : topUnpaidStudents.length === 0 ? (
                <EmptyChart message="Tidak ada siswa dengan tunggakan" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b">
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                          #
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                          Nama Siswa
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                          Kelas
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                          Branch
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Jumlah Item
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                          Total Tunggakan
                        </th>
                        <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                          Tertua
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUnpaidStudents.map((s, i) => (
                        <tr
                          key={s.studentId}
                          className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}
                        >
                          <td className="text-muted-foreground px-4 py-2.5 text-xs">
                            {i + 1}
                          </td>
                          <td className="px-4 py-2.5 font-medium">
                            {s.studentName}
                          </td>
                          <td className="text-muted-foreground px-4 py-2.5">
                            {s.className}
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {s.branchName}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">
                            {fmtNum(s.totalUnpaidCount)}
                          </td>
                          <td className="text-destructive px-4 py-2.5 text-right font-semibold tabular-nums">
                            {fmtFull(s.totalUnpaidAmount)}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                              <Clock className="h-3 w-3" />
                              Bulan {s.oldestUnpaidMonth}/{s.oldestUnpaidYear}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {!isLoading && topUnpaidStudents.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden lg:grid-cols-3">
              {topUnpaidStudents.slice(0, 6).map((s) => (
                <Card key={s.studentId}>
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {s.studentName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {s.className} • {s.branchName}
                      </p>
                    </div>
                    <div className="ml-2 shrink-0 text-right">
                      <p className="text-destructive text-sm font-bold">
                        {fmt(s.totalUnpaidAmount)}
                      </p>
                      <ChevronRight className="text-muted-foreground ml-auto h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Auth Wrapper ───────────────────────────────────────────────────────────
export default function UnpaidDashboardPage() {
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

  return <UnpaidPaymentDashboard isAdmin={isAdmin} userBranchId={userBranchId} />;
}
