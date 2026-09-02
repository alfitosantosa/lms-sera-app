"use client";
import { usePaymentsDashboardByDate } from "@/app/(hooks)/hooks/Payments/usePaymentByDate";
import { useGetMajors } from "@/app/(hooks)/hooks/Majors/useMajors";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { DatePickerWithRange } from "@/components/date/datePicker";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/authClients";
import { format, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Activity, BarChart2, Building2, CalendarDays, CreditCard, PieChart as PieIcon, Receipt, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type DashboardData = {
  summary: { total: number; sumTransaction: number };
  yearMonthly: { year: string; month: string; total: number; sumTransaction: number }[];
  byMajor: { major: string; total: number; sumTransaction: number }[];
  byMajorMonthly: { major: string; month: string; year: string; total: number; sumTransaction: number }[];
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

// ─── Color Palette ────────────────────────────────────────────────────────────
const PALETTE = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626", "#0891B2", "#65A30D", "#9333EA", "#F59E0B", "#10B981"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur shadow-xl p-3 min-w-[180px]">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-semibold">{p.name === "Transaksi" ? fmtNum(p.value) : fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ title, value, sub, icon: Icon, trend, color, loading }: { title: string; value: string; sub?: string; icon: React.ElementType; trend?: { value: number; label: string }; color: string; loading?: boolean }) {
  return (
    <Card className="relative overflow-hidden">
      {/* Accent stripe */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
      <CardContent className="pt-5 pb-4">
        {loading ?
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
        : <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">{title}</span>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend.value >= 0 ?
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                <span className={`text-xs font-medium ${trend.value >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {trend.value >= 0 ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </>
        }
      </CardContent>
    </Card>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
      <BarChart2 className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ─── Chart Skeletons ──────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {[80, 60, 90, 50, 70, 40, 85].map((h, i) => (
        <div key={i} className="flex items-end gap-1" style={{ height: 16 }}>
          <Skeleton className="h-full w-full rounded" style={{ opacity: h / 100 }} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function PaymentDashboard({ userMajorId, isAdmin }: { userMajorId?: string; isAdmin: boolean }) {
  // Default: last 3 months → today
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const [selectedMajorId, setSelectedMajorId] = React.useState<string>(isAdmin ? "all" : (userMajorId ?? "all"));
  const [activeTab, setActiveTab] = React.useState("overview");

  const { data: majors = [] } = useGetMajors();

  // Determine majorId to pass to hook
  const queryMajorId = React.useMemo(() => {
    if (!isAdmin) return userMajorId;
    return selectedMajorId === "all" ? undefined : selectedMajorId;
  }, [isAdmin, selectedMajorId, userMajorId]);

  const {
    data: rawData,
    isLoading,
    refetch,
    isFetching,
  } = usePaymentsDashboardByDate({
    fromdate: dateRange?.from,
    todate: dateRange?.to,
    majorId: queryMajorId,
  });

  console.log(rawData);

  const data = rawData as DashboardData | undefined;
  const summary = data?.summary ?? { total: 0, sumTransaction: 0 };
  const yearMonthly = data?.yearMonthly ?? [];
  const byMajor = data?.byMajor ?? [];
  const byMajorMonthly = data?.byMajorMonthly ?? [];

  // Avg per transaction
  const avgPerTransaction = summary.sumTransaction > 0 ? summary.total / summary.sumTransaction : 0;

  // Top major
  const topMajor = byMajor.reduce<{ major: string; total: number } | null>((acc, cur) => (!acc || cur.total > acc.total ? cur : acc), null);

  // Chart data: yearMonthly sorted
  const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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

  // Major pie data
  const majorPieData = byMajor.map((d) => ({
    name: d.major,
    value: d.total,
    count: d.sumTransaction,
  }));

  // Multi-line per major per month
  const majorNames = Array.from(new Set(byMajorMonthly.map((d) => d.major)));
  const periodKeys = Array.from(new Set(byMajorMonthly.map((d) => `${d.month.slice(0, 3)} ${d.year}`))).sort((a, b) => {
    const [mA, yA] = a.split(" ");
    const [mB, yB] = b.split(" ");
    return Number(yA) - Number(yB) || monthOrder.findIndex((m) => m.startsWith(mA)) - monthOrder.findIndex((m) => m.startsWith(mB));
  });

  const multiLineData = periodKeys.map((period) => {
    const row: Record<string, string | number> = { period };
    majorNames.forEach((major) => {
      const entry = byMajorMonthly.find((d) => `${d.month.slice(0, 3)} ${d.year}` === period && d.major === major);
      row[major] = entry?.total ?? 0;
    });
    return row;
  });

  const dateLabel = dateRange?.from && dateRange?.to ? `${format(dateRange.from, "d MMM yyyy", { locale: localeId })} – ${format(dateRange.to, "d MMM yyyy", { locale: localeId })}` : "Belum dipilih";

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Pembayaran</h1>
          <p className="text-muted-foreground text-sm mt-1">Analitik & ringkasan transaksi keuangan sekolah</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1.5 py-1.5">
            <CalendarDays className="h-3 w-3" />
            {dateLabel}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-muted-foreground">Periode:</span>
            </div>

            <DatePickerWithRange date={dateRange} setDate={setDateRange} />

            {isAdmin && (
              <>
                <Separator orientation="vertical" className="h-8" />
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium text-muted-foreground">Branch:</span>
                </div>
                <Select value={selectedMajorId} onValueChange={setSelectedMajorId}>
                  <SelectTrigger className="w-48 h-9">
                    <SelectValue placeholder="Semua Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Branch</SelectItem>
                    {(majors as any[]).map((m) => (
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
                <Button key={label} size="sm" variant="outline" className="h-8 text-xs" onClick={() => setDateRange({ from: subMonths(new Date(), months), to: new Date() })}>
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Pendapatan" value={isLoading ? "—" : fmt(summary.total)} sub={isLoading ? undefined : `Dalam periode ${dateLabel}`} icon={CreditCard} color="#2563EB" loading={isLoading} />
        <KPICard title="Total Transaksi" value={isLoading ? "—" : fmtNum(summary.sumTransaction)} sub="Jumlah kwitansi terbuat" icon={Receipt} color="#7C3AED" loading={isLoading} />
        <KPICard title="Rata-rata / Transaksi" value={isLoading ? "—" : fmt(avgPerTransaction)} sub="Nominal rata-rata per kwitansi" icon={Activity} color="#059669" loading={isLoading} />
        <KPICard title="Branch Terbesar" value={isLoading ? "—" : (topMajor?.major ?? "-")} sub={topMajor ? fmt(topMajor.total) : undefined} icon={Building2} color="#D97706" loading={isLoading} />
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Area chart — pendapatan per bulan */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Pendapatan Bulanan</CardTitle>
                <CardDescription className="text-xs">Total nominal transaksi per bulan dalam periode terpilih</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : monthlyChartData.length === 0 ?
                  <EmptyChart message="Tidak ada data dalam rentang tanggal ini" />
                : <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={monthlyChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v).replace("Rp", "").trim()} width={52} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="Total" stroke="#2563EB" strokeWidth={2.5} fill="url(#gradTotal)" dot={{ r: 3, fill: "#2563EB" }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>

            {/* Bar chart — jumlah transaksi per bulan */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Volume Transaksi</CardTitle>
                <CardDescription className="text-xs">Jumlah kwitansi per bulan</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : monthlyChartData.length === 0 ?
                  <EmptyChart message="Tidak ada data" />
                : <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="period" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={28} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Transaksi" fill="#7C3AED" radius={[4, 4, 0, 0]}>
                        {monthlyChartData.map((_, i) => (
                          <Cell key={i} fill={`hsl(${258 + i * 8}, 70%, ${55 + (i % 3) * 5}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>
          </div>

          {/* Summary table — per bulan */}
          {!isLoading && sortedMonthly.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rincian Bulanan</CardTitle>
                <CardDescription className="text-xs">Breakdown lengkap per bulan</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Periode</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Transaksi</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Rata-rata</th>
                        <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Porsi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMonthly.map((row, i) => {
                        const pct = summary.total > 0 ? Math.round((row.total / summary.total) * 100) : 0;
                        const avg = row.sumTransaction > 0 ? row.total / row.sumTransaction : 0;
                        return (
                          <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}>
                            <td className="px-4 py-2.5 font-medium">
                              {row.month} {row.year}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(row.sumTransaction)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-blue-600">{fmtFull(row.total)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{fmt(avg)}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[80px]">
                                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-blue-50 dark:bg-blue-950/30 border-t-2">
                        <td className="px-4 py-3 font-bold text-sm">Total</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">{fmtNum(summary.sumTransaction)}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums text-blue-700">{fmtFull(summary.total)}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums text-muted-foreground">{fmt(avgPerTransaction)}</td>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribusi per Branch</CardTitle>
                <CardDescription className="text-xs">Porsi total pendapatan per branch</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : majorPieData.length === 0 ?
                  <EmptyChart message="Tidak ada data per branch" />
                : <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={majorPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                          {majorPieData.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => (value ? [fmtFull(Number(value)), "Total"] : ["", ""])} labelFormatter={(name) => name} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full mt-2">
                      {majorPieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                          <span className="text-muted-foreground truncate">{d.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </CardContent>
            </Card>

            {/* Bar chart — per branch */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total per Branch</CardTitle>
                <CardDescription className="text-xs">Nominal pendapatan masing-masing branch</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : majorPieData.length === 0 ?
                  <EmptyChart message="Tidak ada data per branch" />
                : <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byMajor} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v).replace("Rp", "").trim()} />
                      <YAxis dataKey="major" type="category" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={80} />
                      <Tooltip formatter={(v: any) => (v ? [fmtFull(Number(v)), "Total"] : ["", ""])} />
                      <Bar dataKey="total" name="Total" radius={[0, 4, 4, 0]}>
                        {byMajor.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>
          </div>

          {/* Branch detail table */}
          {!isLoading && byMajor.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rincian per Branch</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Branch</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Transaksi</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Rata-rata</th>
                        <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Kontribusi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...byMajor]
                        .sort((a, b) => b.total - a.total)
                        .map((row, i) => {
                          const pct = summary.total > 0 ? Math.round((row.total / summary.total) * 100) : 0;
                          const avg = row.sumTransaction > 0 ? row.total / row.sumTransaction : 0;
                          return (
                            <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}>
                              <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                                  <span className="font-medium">{row.major}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(row.sumTransaction)}</td>
                              <td className="px-4 py-2.5 text-right tabular-nums font-semibold" style={{ color: PALETTE[i % PALETTE.length] }}>
                                {fmtFull(row.total)}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{fmt(avg)}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[80px]">
                                    <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: PALETTE[i % PALETTE.length] }} />
                                  </div>
                                  <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
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
            {/* Multi-line chart — per major per month */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tren Bulanan per Branch</CardTitle>
                <CardDescription className="text-xs">Perbandingan pendapatan antar branch dalam satu grafik</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : multiLineData.length === 0 ?
                  <EmptyChart message="Tidak ada data perbandingan" />
                : <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={multiLineData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v).replace("Rp", "").trim()} width={52} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {majorNames.map((name, i) => (
                        <Line key={name} type="monotone" dataKey={name} stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>

            {/* Grouped bar chart */}
            {isAdmin && byMajorMonthly.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Perbandingan Bulanan (Batang)</CardTitle>
                  <CardDescription className="text-xs">Grouped bar chart per branch per bulan</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ?
                    <ChartSkeleton />
                  : <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={multiLineData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="period" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v).replace("Rp", "").trim()} width={52} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {majorNames.map((name, i) => (
                          <Bar key={name} dataKey={name} fill={PALETTE[i % PALETTE.length]} radius={[3, 3, 0, 0]} maxBarSize={32} />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  }
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
  const { data: userData, isLoading } = useGetUserByIdBetterAuth(userId as string);

  if (isPending || isLoading) return <Loading />;

  const userRole = userData?.role?.name;
  if (userRole !== "Admin" && userRole !== "Bendahara") {
    unauthorized();
    return null;
  }

  const isAdmin = userRole === "Admin";
  const userMajorId = userData?.major?.id;

  return <PaymentDashboard isAdmin={isAdmin} userMajorId={userMajorId} />;
}
