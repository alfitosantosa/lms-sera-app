"use client";

import { useGetMajors } from "@/app/(hooks)/hooks/Majors/useMajors";
import { usePaymentsItemsDashboardByDate } from "@/app/(hooks)/hooks/Payments/usePaymentItemsByDate";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { DatePickerWithRange } from "@/components/date/datePicker";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/authClients";
import { format, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Activity, AlertTriangle, BarChart2, Building2, CalendarDays, CheckCircle2, ChevronRight, Clock, ListChecks, PieChart as PieIcon, RefreshCw, Users } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

// ─── Color Palette ──────────────────────────────────────────────────────────
const PALETTE = ["#DC2626", "#EA580C", "#D97706", "#CA8A04", "#65A30D", "#059669", "#0891B2", "#2563EB", "#7C3AED", "#DB2777"];

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
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
          <span className="font-semibold">{typeof p.value === "number" && p.name?.toLowerCase().includes("jumlah") ? fmtNum(p.value) : fmt(Number(p.value))}</span>
        </div>
      ))}
    </div>
  );
}

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KPICard({ title, value, sub, icon: Icon, color, loading, badge }: { title: string; value: string; sub?: string; icon: React.ElementType; color: string; loading?: boolean; badge?: { label: string; positive?: boolean } }) {
  return (
    <Card className="relative overflow-hidden">
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
            <div className="flex items-center justify-between mt-1">
              {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
              {badge && (
                <Badge variant={badge.positive ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                  {badge.label}
                </Badge>
              )}
            </div>
          </>
        }
      </CardContent>
    </Card>
  );
}

// ─── Empty / Skeleton ───────────────────────────────────────────────────────
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
      <BarChart2 className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

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

// ─── Main Dashboard ─────────────────────────────────────────────────────────
function UnpaidPaymentDashboard({ userMajorId, isAdmin }: { userMajorId?: string; isAdmin: boolean }) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  const [selectedMajorId, setSelectedMajorId] = React.useState<string>(isAdmin ? "all" : (userMajorId ?? "all"));

  const [selectedSKU, setSelectedSKU] = React.useState<string>("all");

  const [activeTab, setActiveTab] = React.useState("overview");

  const { data: majors = [] } = useGetMajors();

  const queryMajorId = React.useMemo(() => {
    if (!isAdmin) return userMajorId;
    return selectedMajorId === "all" ? undefined : selectedMajorId;
  }, [isAdmin, selectedMajorId, userMajorId]);

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
    majorId: queryMajorId,
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
  const byMajor = data?.byMajor ?? [];
  const bySkuType = data?.bySkuType ?? [];
  const topUnpaidStudents = data?.topUnpaidStudents ?? [];

  const worstMajor = byMajor.reduce<ByMajorData | null>((acc, cur) => (!acc || cur.totalUnpaidAmount > acc.totalUnpaidAmount ? cur : acc), null);

  // Monthly chart data (unpaid vs paid)
  const monthlyChartData = monthly.map((d) => ({
    period: `${d.month.slice(0, 3)} ${d.year}`,
    Tunggakan: d.totalUnpaidAmount,
    Terbayar: d.totalPaidAmount,
    "Jumlah Tunggakan": d.totalUnpaidCount,
  }));

  // Pie: distribusi tunggakan per branch
  const majorPieData = byMajor.map((d) => ({
    name: d.major,
    value: d.totalUnpaidAmount,
    count: d.totalUnpaidCount,
  }));

  const dateLabel = dateRange?.from && dateRange?.to ? `${format(dateRange.from, "d MMM yyyy", { locale: localeId })} – ${format(dateRange.to, "d MMM yyyy", { locale: localeId })}` : "Belum dipilih";

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Tunggakan Pembayaran</h1>
          <p className="text-muted-foreground text-sm mt-1">Pantau item pembayaran yang belum lunas per branch, jenis, dan siswa</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1.5 py-1.5">
            <CalendarDays className="h-3 w-3" />
            {dateLabel}
          </Badge>
          {selectedSKU !== "all" && (
            <Badge variant="secondary" className="text-xs gap-1.5 py-1.5">
              <ListChecks className="h-3 w-3" />
              {selectedSKU}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <Card>
        <CardContent className="py-4">
          <div className="space-y-4">
            {/* Row 1: Main Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range Picker */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Periode</span>
                </div>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>

              {/* Branch Filter (Admin Only) */}
              {isAdmin && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Branch</span>
                  </div>
                  <Select value={selectedMajorId} onValueChange={setSelectedMajorId}>
                    <SelectTrigger className="w-full h-10">
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
                </div>
              )}

              {/* SKU Type Filter */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Jenis Pembayaran</span>
                </div>
                <Select value={selectedSKU} onValueChange={setSelectedSKU}>
                  <SelectTrigger className="w-full h-10">
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
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
              <div className="flex flex-wrap items-center gap-2">
                {/* Reset Button */}
                {(selectedMajorId !== "all" || selectedSKU !== "all") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9"
                    onClick={() => {
                      setSelectedMajorId(isAdmin ? "all" : (userMajorId ?? "all"));
                      setSelectedSKU("all");
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Reset Filter
                  </Button>
                )}
              </div>

              {/* Quick Date Shortcuts */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Quick:</span>
                {[
                  { label: "1 Bulan", months: 1 },
                  { label: "3 Bulan", months: 3 },
                  { label: "6 Bulan", months: 6 },
                  { label: "1 Tahun", months: 12 },
                ].map(({ label, months }) => (
                  <Button key={label} size="sm" variant="secondary" className="h-8 text-xs" onClick={() => setDateRange({ from: subMonths(new Date(), months), to: new Date() })}>
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Tunggakan"
          value={isLoading ? "—" : fmt(summary.totalUnpaidAmount)}
          sub={isLoading ? undefined : `${fmtNum(summary.totalUnpaidCount)} item belum lunas`}
          icon={AlertTriangle}
          color="#DC2626"
          loading={isLoading}
        />
        <KPICard title="Total Terbayar" value={isLoading ? "—" : fmt(summary.totalPaidAmount)} sub={isLoading ? undefined : `${fmtNum(summary.totalPaidCount)} item lunas`} icon={CheckCircle2} color="#059669" loading={isLoading} />
        <KPICard
          title="Collection Rate"
          value={isLoading ? "—" : `${summary.collectionRate}%`}
          sub="Persentase dari total tagihan"
          icon={Activity}
          color="#2563EB"
          loading={isLoading}
          badge={
            !isLoading ?
              {
                label:
                  summary.collectionRate >= 80 ? "Baik"
                  : summary.collectionRate >= 50 ? "Cukup"
                  : "Rendah",
                positive: summary.collectionRate >= 80,
              }
            : undefined
          }
        />
        <KPICard title="Branch Tunggakan Terbesar" value={isLoading ? "—" : (worstMajor?.major ?? "-")} sub={worstMajor ? fmt(worstMajor.totalUnpaidAmount) : undefined} icon={Building2} color="#EA580C" loading={isLoading} />
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
          <TabsTrigger value="students" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            Siswa Tunggakan
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB: OVERVIEW ═══════════ */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tunggakan vs Terbayar per Bulan</CardTitle>
                <CardDescription className="text-xs">Perbandingan nominal belum bayar dan sudah bayar</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : monthlyChartData.length === 0 ?
                  <EmptyChart message="Tidak ada data dalam rentang tanggal ini" />
                : <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={monthlyChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradUnpaid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradPaid" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v).replace("Rp", "").trim()} width={52} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="Tunggakan" stroke="#DC2626" strokeWidth={2.5} fill="url(#gradUnpaid)" dot={{ r: 3, fill: "#DC2626" }} activeDot={{ r: 5 }} />
                      <Area type="monotone" dataKey="Terbayar" stroke="#059669" strokeWidth={2.5} fill="url(#gradPaid)" dot={{ r: 3, fill: "#059669" }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Volume Tunggakan</CardTitle>
                <CardDescription className="text-xs">Jumlah item belum bayar per bulan</CardDescription>
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
                      <Bar dataKey="Jumlah Tunggakan" fill="#DC2626" radius={[4, 4, 0, 0]}>
                        {monthlyChartData.map((_, i) => (
                          <Cell key={i} fill={`hsl(${0 + i * 6}, 72%, ${50 + (i % 3) * 5}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>
          </div>

          {/* By SKU Type */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tunggakan per Jenis Pembayaran</CardTitle>
              <CardDescription className="text-xs">Breakdown berdasarkan tipe SKU / jenis tagihan</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ?
                <ChartSkeleton />
              : bySkuType.length === 0 ?
                <EmptyChart message="Tidak ada data jenis pembayaran" />
              : <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Jenis</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Jumlah Item</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total Tunggakan</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total Terbayar</th>
                        <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Porsi Tunggakan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bySkuType.map((row, i) => {
                        const total = row.totalUnpaidAmount + row.totalPaidAmount;
                        const pct = total > 0 ? Math.round((row.totalUnpaidAmount / total) * 100) : 0;
                        return (
                          <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}>
                            <td className="px-4 py-2.5 font-medium">{row.skuType}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(row.totalUnpaidCount)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-red-600">{fmtFull(row.totalUnpaidAmount)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{fmtFull(row.totalPaidAmount)}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[100px]">
                                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
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
              }
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB: PER BRANCH ═══════════ */}
        <TabsContent value="branch" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribusi Tunggakan per Branch</CardTitle>
                <CardDescription className="text-xs">Porsi total tunggakan per branch</CardDescription>
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
                        <Tooltip formatter={(value: any) => (value ? [fmtFull(Number(value)), "Tunggakan"] : ["", ""])} labelFormatter={(name) => name} />
                      </PieChart>
                    </ResponsiveContainer>
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

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tunggakan per Branch</CardTitle>
                <CardDescription className="text-xs">Nominal tunggakan masing-masing branch</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : byMajor.length === 0 ?
                  <EmptyChart message="Tidak ada data per branch" />
                : <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byMajor} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v).replace("Rp", "").trim()} />
                      <YAxis dataKey="major" type="category" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={80} />
                      <Tooltip formatter={(v: any) => (v ? [fmtFull(Number(v)), "Tunggakan"] : ["", ""])} />
                      <Bar dataKey="totalUnpaidAmount" name="Tunggakan" radius={[0, 4, 4, 0]}>
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

          {!isLoading && byMajor.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rincian per Branch</CardTitle>
                <CardDescription className="text-xs">Termasuk collection rate masing-masing branch</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Branch</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Item Belum Bayar</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total Tunggakan</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total Terbayar</th>
                        <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Collection Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...byMajor]
                        .sort((a, b) => b.totalUnpaidAmount - a.totalUnpaidAmount)
                        .map((row, i) => (
                          <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}>
                            <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                                <span className="font-medium">{row.major}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(row.totalUnpaidCount)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-red-600">{fmtFull(row.totalUnpaidAmount)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{fmtFull(row.totalPaidAmount)}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <Progress value={row.collectionRate} className="h-1.5 max-w-[100px]" />
                                <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">{row.collectionRate}%</span>
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
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-red-600" />
                    Top 50 Siswa dengan Tunggakan Terbesar
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">Diurutkan berdasarkan total nominal belum bayar</CardDescription>
                </div>
                {!isLoading && topUnpaidStudents.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {topUnpaidStudents.length} siswa
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ?
                <div className="p-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              : topUnpaidStudents.length === 0 ?
                <EmptyChart message="Tidak ada siswa dengan tunggakan" />
              : <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Nama Siswa</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Kelas</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Branch</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Jumlah Item</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Total Tunggakan</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Tertua</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUnpaidStudents.map((s, i) => (
                        <tr key={s.studentId} className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="px-4 py-2.5 font-medium">{s.studentName}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{s.className}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant="outline" className="text-xs font-normal">
                              {s.majorName}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(s.totalUnpaidCount)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-red-600">{fmtFull(s.totalUnpaidAmount)}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Bulan {s.oldestUnpaidMonth}/{s.oldestUnpaidYear}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </CardContent>
          </Card>

          {!isLoading && topUnpaidStudents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:hidden">
              {topUnpaidStudents.slice(0, 6).map((s) => (
                <Card key={s.studentId}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{s.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.className} • {s.majorName}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-bold text-red-600">{fmt(s.totalUnpaidAmount)}</p>
                      <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
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
  const { data: userData, isLoading } = useGetUserByIdBetterAuth(userId as string);

  if (isPending || isLoading) return <Loading />;

  const userRole = userData?.role?.name;
  if (userRole !== "Admin" && userRole !== "Bendahara") {
    unauthorized();
    return null;
  }

  const isAdmin = userRole === "Admin";
  const userMajorId = userData?.major?.id;

  return <UnpaidPaymentDashboard isAdmin={isAdmin} userMajorId={userMajorId} />;
}
