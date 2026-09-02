"use client";

import { useAccountBankDashboard } from "@/app/(hooks)/hooks/AccountBank/useAccountBankDashboard";
import { useGetMajors } from "@/app/(hooks)/hooks/Majors/useMajors";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { UserDataTypes } from "@/app/(types)";
import { DatePickerWithRange } from "@/components/date/datePicker";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/authClients";
import { format, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Activity, ArrowDownToLine, BarChart2, Building2, CalendarDays, ChevronRight, CreditCard, Landmark, ListChecks, PieChart as PieIcon, RefreshCw, Wallet } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// ─── Types (matches API response) ──────────────────────────────────────────
type Summary = {
  totalAccountBanks: number;
  totalActiveAccountBanks: number;
  totalInactiveAccountBanks: number;
  totalRevenue: number;
  totalTransaction: number;
  totalPaymentItems: number;
  totalUnpaidItems: number;
  totalUnpaidAmount: number;
  collectionRate: number;
};

type AccountDetail = {
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

type ByBankGroup = {
  bankName: string;
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

type TopAccount = {
  rank: number;
  accountName: string;
  accountBank: string;
  accountNumber: string;
  majorName: string;
  totalRevenue: number;
  totalTransaction: number;
  percentage: number;
};

type DashboardResult = {
  summary: Summary;
  accountDetails: AccountDetail[];
  byBankGroup: ByBankGroup[];
  revenueMonthly: RevenueMonthly[];
  topAccounts: TopAccount[];
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

const PALETTE = ["#2563EB", "#059669", "#D97706", "#7C3AED", "#DB2777", "#0891B2", "#DC2626", "#65A30D", "#CA8A04", "#EA580C"];

// ─── Custom Tooltip ─────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
  payload?: unknown;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur shadow-xl p-3 min-w-[180px]">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      {payload.map((p: TooltipPayloadItem, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-semibold">{typeof p.value === "number" && p.name?.toLowerCase().includes("transaksi") ? fmtNum(p.value) : fmt(Number(p.value))}</span>
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
function AccountBankBalanceDashboard({
  userDataMajor,
  isAdmin,
}: {
  userDataMajor:
    | {
        id: string;
        name: string;
      }
    | null
    | undefined;
  isAdmin: boolean;
}) {
  // ✅ Memoize initial date to prevent re-creation
  const initialDateRange = React.useMemo(
    () => ({
      from: subMonths(new Date(), 3),
      to: new Date(),
    }),
    [],
  );

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(initialDateRange);

  // ✅ Fix: Provide fallback value untuk undefined dan set based on isAdmin
  const [selectedMajorId, setSelectedMajorId] = React.useState<string>(isAdmin ? "all" : (userDataMajor?.id ?? ""));
  const [activeTab, setActiveTab] = React.useState("overview");

  // ✅ Memoize setDateRange handler to prevent recreating on every render
  const handleDateRangeChange = React.useCallback((newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  }, []);

  const { data: majors = [] } = useGetMajors();

  // Determine majorId untuk query based on isAdmin
  const queryMajorId = React.useMemo(() => {
    if (!isAdmin) return userDataMajor?.id;
    return selectedMajorId === "all" ? undefined : selectedMajorId;
  }, [isAdmin, selectedMajorId, userDataMajor?.id]);

  const {
    data: rawData,
    isLoading,
    isFetching,
    refetch,
  } = useAccountBankDashboard({
    fromdate: dateRange?.from,
    todate: dateRange?.to,
    majorId: queryMajorId,
  });

  const data = rawData as DashboardResult | null | undefined;

  const summary = data?.summary ?? {
    totalAccountBanks: 0,
    totalActiveAccountBanks: 0,
    totalInactiveAccountBanks: 0,
    totalRevenue: 0,
    totalTransaction: 0,
    totalPaymentItems: 0,
    totalUnpaidItems: 0,
    totalUnpaidAmount: 0,
    collectionRate: 0,
  };

  const accountDetails = data?.accountDetails ?? [];
  const byBankGroup = data?.byBankGroup ?? [];
  const revenueMonthly = data?.revenueMonthly ?? [];
  const topAccounts = data?.topAccounts ?? [];

  const topAccount = accountDetails.reduce<AccountDetail | null>((acc, cur) => (!acc || cur.totalRevenue > acc.totalRevenue ? cur : acc), null);

  const avgPerAccount = summary.totalAccountBanks > 0 ? Math.round(summary.totalRevenue / summary.totalAccountBanks) : 0;

  // Chart data: saldo masuk per bulan
  const revenueChartData = revenueMonthly.map((d) => ({
    period: d.label,
    "Saldo Masuk": d.totalRevenue,
    "Jumlah Transaksi": d.totalTransaction,
  }));

  // Pie: distribusi saldo per bank group
  const bankPieData = byBankGroup.map((d) => ({
    name: d.bankName,
    value: d.totalRevenue,
    accounts: d.totalAccounts,
  }));

  const dateLabel = dateRange?.from && dateRange?.to ? `${format(dateRange.from, "d MMM yyyy", { locale: localeId })} – ${format(dateRange.to, "d MMM yyyy", { locale: localeId })}` : "Belum dipilih";

  return (
    <div className="min-h-screen w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Saldo Account Bank</h1>
          <p className="text-muted-foreground text-sm mt-1">Pantau saldo yang masuk ke setiap rekening bank berdasarkan periode</p>
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

            <DatePickerWithRange date={dateRange} setDate={handleDateRangeChange} />

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
                    {majors.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

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
        <KPICard title="Total Saldo Masuk" value={isLoading ? "—" : fmt(summary.totalRevenue)} sub={isLoading ? undefined : `${fmtNum(summary.totalTransaction)} transaksi`} icon={ArrowDownToLine} color="#059669" loading={isLoading} />
        <KPICard title="Jumlah Rekening" value={isLoading ? "—" : fmtNum(summary.totalAccountBanks)} sub="Rekening bank terdaftar" icon={Landmark} color="#2563EB" loading={isLoading} />
        <KPICard title="Rata-rata per Rekening" value={isLoading ? "—" : fmt(avgPerAccount)} sub="Saldo masuk rata-rata per rekening" icon={Wallet} color="#7C3AED" loading={isLoading} />
        <KPICard
          title="Collection Rate"
          value={isLoading ? "—" : `${summary.collectionRate}%`}
          sub="Persentase tagihan terbayar"
          icon={Activity}
          color="#0891B2"
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
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-lg">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-1.5 text-xs">
            <PieIcon className="h-3.5 w-3.5" />
            Per Bank
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-1.5 text-xs">
            <CreditCard className="h-3.5 w-3.5" />
            Rekening
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB: OVERVIEW ═══════════ */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Saldo Masuk per Bulan</CardTitle>
                <CardDescription className="text-xs">Total saldo yang masuk ke seluruh rekening per bulan</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : revenueChartData.length === 0 ?
                  <EmptyChart message="Tidak ada data dalam rentang tanggal ini" />
                : <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={revenueChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v).replace("Rp", "").trim()} width={52} />
                      <Tooltip content={<CustomTooltip payload={[]} />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="Saldo Masuk" stroke="#059669" strokeWidth={2.5} fill="url(#gradRevenue)" dot={{ r: 3, fill: "#059669" }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Volume Transaksi</CardTitle>
                <CardDescription className="text-xs">Jumlah transaksi masuk per bulan</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : revenueChartData.length === 0 ?
                  <EmptyChart message="Tidak ada data" />
                : <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={revenueChartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="period" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={28} />
                      <Tooltip content={<CustomTooltip payload={[]} />} />
                      <Bar dataKey="Jumlah Transaksi" fill="#2563EB" radius={[4, 4, 0, 0]}>
                        {revenueChartData.map((_, i) => (
                          <Cell key={i} fill={`hsl(${210 + i * 4}, 70%, ${45 + (i % 3) * 5}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>
          </div>

          {/* Top Accounts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-emerald-600" />
                Top Rekening dengan Saldo Masuk Terbesar
              </CardTitle>
              <CardDescription className="text-xs">Diurutkan berdasarkan total saldo masuk pada periode ini</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ?
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              : topAccounts.length === 0 ?
                <EmptyChart message="Tidak ada data rekening" />
              : <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Rekening</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Branch</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Transaksi</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Saldo Masuk</th>
                        <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Porsi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topAccounts.map((a, i) => (
                        <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{a.rank}</td>
                          <td className="px-4 py-2.5">
                            <div className="font-medium">{a.accountName}</div>
                            <div className="text-xs text-muted-foreground">
                              {a.accountBank} • {a.accountNumber}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant="outline" className="text-xs font-normal">
                              {a.majorName}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(a.totalTransaction)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-600">{fmtFull(a.totalRevenue)}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-1.5 max-w-[100px]">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${a.percentage}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums w-9 text-right">{a.percentage}%</span>
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
        </TabsContent>

        {/* ═══════════ TAB: PER BANK ═══════════ */}
        <TabsContent value="bank" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribusi Saldo per Bank</CardTitle>
                <CardDescription className="text-xs">Porsi total saldo masuk berdasarkan nama bank</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : bankPieData.length === 0 ?
                  <EmptyChart message="Tidak ada data per bank" />
                : <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={bankPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                          {bankPieData.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => (value ? [fmtFull(Number(value)), "Saldo Masuk"] : ["", ""])} labelFormatter={(name) => name} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full mt-2">
                      {bankPieData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                          <span className="text-muted-foreground truncate">
                            {d.name} <span className="text-muted-foreground/60">({d.accounts})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Saldo Masuk per Bank</CardTitle>
                <CardDescription className="text-xs">Nominal saldo masing-masing bank</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ?
                  <ChartSkeleton />
                : byBankGroup.length === 0 ?
                  <EmptyChart message="Tidak ada data per bank" />
                : <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={byBankGroup} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v).replace("Rp", "").trim()} />
                      <YAxis dataKey="bankName" type="category" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={80} />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <Tooltip formatter={(v: any) => (v ? [fmtFull(Number(v)), "Saldo Masuk"] : ["", ""])} />
                      <Bar dataKey="totalRevenue" name="Saldo Masuk" radius={[0, 4, 4, 0]}>
                        {byBankGroup.map((_, i) => (
                          <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </CardContent>
            </Card>
          </div>

          {!isLoading && byBankGroup.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rincian per Bank</CardTitle>
                <CardDescription className="text-xs">Termasuk collection rate masing-masing kelompok bank</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Bank</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Jumlah Rekening</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Transaksi</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Saldo Masuk</th>
                        <th className="px-4 py-2.5 text-xs font-medium text-muted-foreground">Collection Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...byBankGroup]
                        .sort((a, b) => b.totalRevenue - a.totalRevenue)
                        .map((row, i) => (
                          <tr key={i} className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}>
                            <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                                <span className="font-medium">{row.bankName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(row.totalAccounts)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(row.totalTransaction)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-600">{fmtFull(row.totalRevenue)}</td>
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

        {/* ═══════════ TAB: REKENING ═══════════ */}
        <TabsContent value="accounts" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    Detail Semua Rekening
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">Saldo masuk dan collection rate per rekening bank</CardDescription>
                </div>
                {!isLoading && accountDetails.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {accountDetails.length} rekening
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
              : accountDetails.length === 0 ?
                <EmptyChart message="Tidak ada rekening" />
              : <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Nama Rekening</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Bank</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">No. Rekening</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Branch</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Transaksi</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Rata-rata/Transaksi</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Saldo Masuk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accountDetails.map((acc, i) => (
                        <tr key={acc.id} className={`border-b ${i % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors ${acc.id === topAccount?.id ? "bg-emerald-50/50" : ""}`}>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{i + 1}</td>
                          <td className="px-4 py-2.5 font-medium">{acc.accountName}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{acc.accountBank}</td>
                          <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{acc.accountNumber}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant="outline" className="text-xs font-normal">
                              {acc.major?.name ?? "-"}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{fmtNum(acc.totalTransaction)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{fmtFull(acc.avgTransactionAmount)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-emerald-600">{fmtFull(acc.totalRevenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </CardContent>
          </Card>

          {!isLoading && accountDetails.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:hidden">
              {accountDetails.slice(0, 6).map((acc) => (
                <Card key={acc.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{acc.accountName}</p>
                      <p className="text-xs text-muted-foreground">
                        {acc.accountBank} • {acc.accountNumber}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-bold text-emerald-600">{fmt(acc.totalRevenue)}</p>
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

export default function AccountBankChartPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = (userData as UserDataTypes)?.role?.name;
  const userDataMajor = (userData as UserDataTypes)?.major;

  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check if user is Admin or Bendahara
  if (userRole !== "Admin" && userRole !== "Bendahara") {
    unauthorized();
    return null;
  }

  return <AccountBankBalanceDashboard userDataMajor={userDataMajor} isAdmin={userRole == "Admin"} />;
}
