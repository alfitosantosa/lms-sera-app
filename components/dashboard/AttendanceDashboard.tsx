"use client";

import { monthToDateRange } from "@/lib/dateRange";
import { CHART_GRID_STROKE, CHART_SERIES, CHART_PALETTE } from "@/lib/ui/charts";
import { useAttendanceByDate } from "@/hooks/Attendances/useAttendanceByDate";
import { useGetBranchs } from "@/hooks/Branchs/useBranchs";
import { DatePickerWithRange } from "@/components/date/datePicker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AttendanceDailyPoint,
  AttendanceStatus,
  AttendanceSummary,
} from "@/types/attendance-types";
import { format, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp,
  User,
  Users,
  XCircle,
} from "lucide-react";
import React, {
  type ElementType,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
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

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_KEYS: AttendanceStatus[] = [
  "present",
  "late",
  "excused",
  "sick",
  "absent",
];

const STATUS_MAP: Record<
  AttendanceStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    icon: ElementType;
    chartColor: string;
  }
> = {
  present: {
    label: "Hadir",
    color: "text-success-strong",
    bgColor: "bg-success-surface",
    icon: CheckCircle,
    chartColor: CHART_SERIES.positive,
  },
  late: {
    label: "Terlambat",
    color: "text-warning-strong",
    bgColor: "bg-warning-surface",
    icon: Clock,
    chartColor: CHART_SERIES.warning,
  },
  excused: {
    label: "Izin",
    color: "text-info-strong",
    bgColor: "bg-info-surface",
    icon: AlertCircle,
    chartColor: CHART_SERIES.info,
  },
  sick: {
    label: "Sakit",
    color: "text-tertiary-strong",
    bgColor: "bg-tertiary-surface",
    icon: AlertCircle,
    chartColor: CHART_SERIES.neutral,
  },
  absent: {
    label: "Alfa",
    color: "text-destructive-strong",
    bgColor: "bg-destructive-surface",
    icon: XCircle,
    chartColor: CHART_SERIES.negative,
  },
};

const EMPTY_SUMMARY: AttendanceSummary = {
  total: 0,
  present: 0,
  absent: 0,
  late: 0,
  excused: 0,
  sick: 0,
  attendanceRate: 0,
};

const numberFormat = (value: number) => value.toLocaleString("id-ID");

// ─── Shared bits ──────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background/95 min-w-40 rounded-3xl border p-3 shadow-xl backdrop-blur">
      <p className="text-muted-foreground mb-2 text-xs font-semibold">
        {label}
      </p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-semibold">{numberFormat(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function KPICard({
  title,
  value,
  sub,
  icon: Icon,
  color,
  badge,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: ElementType;
  color: string;
  badge?: { label: string; positive?: boolean };
}) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute top-0 right-0 left-0 h-1"
        style={{ backgroundColor: color }}
      />
      <CardContent className="pt-5 pb-4">
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
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
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
      </CardContent>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
      <BarChart3 className="text-muted-foreground/40 h-10 w-10" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-40 w-full rounded-3xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-3xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-3xl" />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status as AttendanceStatus];
  if (!config) return <Badge variant="outline">{status}</Badge>;
  const Icon = config.icon;
  return (
    <Badge
      className={`${config.bgColor} ${config.color} flex w-fit items-center gap-1 border-0 text-xs`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

function PipelineRow({ day }: { day: AttendanceDailyPoint }) {
  const date = new Date(`${day.date}T00:00:00`);
  return (
    <div className="grid grid-cols-[76px_1fr_auto] items-center gap-3 border-b px-4 py-2.5 last:border-0 hover:bg-muted/20">
      <div>
        <p className="text-sm font-medium">{format(date, "d MMM")}</p>
        <p className="text-muted-foreground text-[11px]">
          {format(date, "EEEE", { locale: localeId })}
        </p>
      </div>

      <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
        {day.total === 0
          ? null
          : STATUS_KEYS.map((key) => {
              const width = (day[key] / day.total) * 100;
              if (width === 0) return null;
              return (
                <div
                  key={key}
                  style={{ width: `${width}%`, backgroundColor: STATUS_MAP[key].chartColor }}
                  title={`${STATUS_MAP[key].label}: ${day[key]}`}
                />
              );
            })}
      </div>

      <div className="flex items-center gap-3 text-xs tabular-nums">
        <span className="text-muted-foreground hidden w-20 sm:block">
          {day.total} record
        </span>
        <span
          className="text-success-strong hidden w-8 text-right sm:block"
          title="Hadir"
        >
          {day.present}
        </span>
        <span
          className="text-warning-strong hidden w-8 text-right sm:block"
          title="Terlambat"
        >
          {day.late}
        </span>
        <span
          className="text-destructive-strong hidden w-8 text-right sm:block"
          title="Alfa"
        >
          {day.absent}
        </span>
        <Badge variant="outline" className="w-14 justify-center">
          {day.attendanceRate}%
        </Badge>
      </div>
    </div>
  );
}

// ─── Main dashboard ──────────────────────────────────────────────────────────

export default function AttendanceDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    monthToDateRange(),
  );
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchStudent, setSearchStudent] = useState<string>("");
  const deferredSearch = useDeferredValue(searchStudent.trim());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: branchs = [] } = useGetBranchs();

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useAttendanceByDate({
    fromdate: dateRange?.from,
    todate: dateRange?.to,
    branchId: selectedBranch === "all" ? undefined : selectedBranch,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    classId: selectedClass === "all" ? undefined : selectedClass,
    subjectId: selectedSubject === "all" ? undefined : selectedSubject,
    search: deferredSearch || undefined,
    page,
    limit: pageSize,
  });

  const rows = response?.data ?? [];
  const pagination = response?.pagination;
  const summary = response?.summary ?? EMPTY_SUMMARY;
  const daily = response?.daily ?? [];
  const byClass = response?.byClass ?? [];
  const filterOptions = response?.filterOptions ?? {
    classes: [],
    subjects: [],
  };

  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    if (pagination && pagination.pages > 0 && page > pagination.pages) {
      setPage(pagination.pages);
    }
  }, [pagination, page]);

  const pieData = useMemo(
    () =>
      STATUS_KEYS.map((key) => ({
        name: STATUS_MAP[key].label,
        value: summary[key],
        color: STATUS_MAP[key].chartColor,
      })).filter((entry) => entry.value > 0),
    [summary],
  );

  const trendData = useMemo(
    () =>
      daily.map((day) => ({
        label: format(new Date(`${day.date}T00:00:00`), "d MMM"),
        Hadir: day.present,
        Terlambat: day.late,
        Izin: day.excused,
        Sakit: day.sick,
        Alfa: day.absent,
      })),
    [daily],
  );

  const classData = useMemo(
    () =>
      byClass.map((row) => ({
        class: row.className,
        Hadir: row.present,
        Terlambat: row.late,
        Izin: row.excused,
        Sakit: row.sick,
        Alfa: row.absent,
      })),
    [byClass],
  );

  const hasActiveFilter =
    selectedBranch !== "all" ||
    selectedStatus !== "all" ||
    selectedClass !== "all" ||
    selectedSubject !== "all" ||
    !!searchStudent;

  const dateLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "d MMM yyyy", { locale: localeId })} – ${format(
          dateRange.to,
          "d MMM yyyy",
          { locale: localeId },
        )}`
      : "Belum dipilih";

  const totalRecords = pagination?.total ?? 0;
  const pageCount = Math.max(1, pagination?.pages ?? 0);
  const firstRow = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, totalRecords);

  const resetFilters = () => {
    setSelectedBranch("all");
    setSelectedStatus("all");
    setSelectedClass("all");
    setSelectedSubject("all");
    setSearchStudent("");
    setPage(1);
  };

  const quickRanges = [
    { label: "Bulan Ini", range: monthToDateRange() },
    {
      label: "7 Hari",
      range: { from: subDays(new Date(), 6), to: new Date() },
    },
    {
      label: "30 Hari",
      range: { from: subDays(new Date(), 29), to: new Date() },
    },
  ];

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="mx-auto min-h-screen max-w-7xl p-6">
        <Alert className="border-destructive-border bg-destructive-surface">
          <AlertTriangle className="text-destructive h-4 w-4" />
          <AlertDescription className="text-destructive-strong">
            Gagal memuat data kehadiran. Silakan coba muat ulang halaman.
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-6 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard Kehadiran
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pantau kehadiran siswa per periode, kelas, dan mata pelajaran
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1.5 text-xs">
            <CalendarDays className="h-3 w-3" />
            {dateLabel}
          </Badge>
          {selectedStatus !== "all" && (
            <Badge variant="secondary" className="gap-1.5 py-1.5 text-xs">
              {STATUS_MAP[selectedStatus as AttendanceStatus]?.label}
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

      {/* ── Filter bar ── */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Periode
                </span>
              </div>
              <DatePickerWithRange
                date={dateRange}
                className="w-full min-w-0"
                setDate={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Sekolah
                </span>
              </div>
              <Select
                value={selectedBranch}
                onValueChange={(value) => {
                  setSelectedBranch(value);
                  setSelectedClass("all");
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Semua Sekolah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Sekolah</SelectItem>
                  {branchs.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Status
                </span>
              </div>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {STATUS_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: STATUS_MAP[key].chartColor }}
                        />
                        {STATUS_MAP[key].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Kelas
                </span>
              </div>
              <Select
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  setPage(1);
                }}
                disabled={selectedBranch === "all"}
              >
                <SelectTrigger
                  className="h-10 w-full"
                  disabled={selectedBranch === "all"}
                >
                  <SelectValue
                    placeholder={
                      selectedBranch === "all"
                        ? "Pilih sekolah dulu"
                        : "Semua Kelas"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {filterOptions.classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Mata Pelajaran
                </span>
              </div>
              <Select
                value={selectedSubject}
                onValueChange={(value) => {
                  setSelectedSubject(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Semua Mapel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                  {filterOptions.subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Search className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Cari Siswa
                </span>
              </div>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-3 left-2.5 h-4 w-4" />
                <Input
                  placeholder="Nama atau NISN..."
                  value={searchStudent}
                  onChange={(event) => setSearchStudent(event.target.value)}
                  className="h-10 pl-8"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilter && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9"
                  onClick={resetFilters}
                >
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Reset Filter
                </Button>
              )}
              {hasActiveFilter && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground text-xs">
                    Filter aktif:
                  </span>
                  {selectedBranch !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {branchs.find(
                        (branch) => branch.id === selectedBranch,
                      )?.name ?? selectedBranch}
                    </Badge>
                  )}
                  {selectedStatus !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {STATUS_MAP[selectedStatus as AttendanceStatus]?.label}
                    </Badge>
                  )}
                  {selectedClass !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {filterOptions.classes.find(
                        (cls) => cls.id === selectedClass,
                      )?.name ?? selectedClass}
                    </Badge>
                  )}
                  {selectedSubject !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {filterOptions.subjects.find(
                        (subject) => subject.id === selectedSubject,
                      )?.name ?? selectedSubject}
                    </Badge>
                  )}
                  {searchStudent && (
                    <Badge variant="secondary" className="text-xs">
                      &quot;{searchStudent}&quot;
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground mr-1 text-xs">
                Quick:
              </span>
              {quickRanges.map(({ label, range }) => (
                <Button
                  key={label}
                  size="sm"
                  variant="secondary"
                  className="h-8 text-xs"
                  onClick={() => {
                    setDateRange(range);
                    setPage(1);
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Record"
          value={numberFormat(summary.total)}
          sub="Sesuai filter aktif"
          icon={Users}
          color={CHART_PALETTE[0]}
        />
        <KPICard
          title="Tingkat Kehadiran"
          value={`${summary.attendanceRate}%`}
          sub="Hadir + terlambat"
          icon={Activity}
          color={CHART_SERIES.positive}
          badge={{
            label:
              summary.attendanceRate >= 90
                ? "Baik"
                : summary.attendanceRate >= 75
                  ? "Cukup"
                  : "Rendah",
            positive: summary.attendanceRate >= 90,
          }}
        />
        <KPICard
          title="Hadir"
          value={numberFormat(summary.present)}
          sub={
            summary.total > 0
              ? `${Math.round((summary.present / summary.total) * 100)}% dari total`
              : "Belum ada data"
          }
          icon={CheckCircle}
          color={CHART_SERIES.positive}
        />
        <KPICard
          title="Alfa"
          value={numberFormat(summary.absent)}
          sub={
            summary.total > 0
              ? `${Math.round((summary.absent / summary.total) * 100)}% dari total`
              : "Belum ada data"
          }
          icon={XCircle}
          color={CHART_SERIES.negative}
        />
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            Pipeline Harian
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            Data Siswa
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB: OVERVIEW ═══════════ */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tren Kehadiran Harian</CardTitle>
                <CardDescription className="text-xs">
                  Jumlah record per status setiap hari
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trendData.length === 0 ? (
                  <EmptyChart message="Tidak ada data dalam rentang tanggal ini" />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart
                      data={trendData}
                      margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor={CHART_SERIES.positive}
                            stopOpacity={0.25}
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
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={28}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area
                        type="monotone"
                        dataKey="Hadir"
                        stroke={CHART_SERIES.positive}
                        strokeWidth={2}
                        fill="url(#gradPresent)"
                      />
                      <Area
                        type="monotone"
                        dataKey="Terlambat"
                        stroke={CHART_SERIES.warning}
                        strokeWidth={2}
                        fill="transparent"
                      />
                      <Area
                        type="monotone"
                        dataKey="Alfa"
                        stroke={CHART_SERIES.negative}
                        strokeWidth={2}
                        fill="transparent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Distribusi Status</CardTitle>
                <CardDescription className="text-xs">
                  Proporsi kehadiran per status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <EmptyChart message="Tidak ada data untuk ditampilkan" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={190}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => numberFormat(Number(value ?? 0))}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-1.5">
                      {pieData.map((entry) => (
                        <div
                          key={entry.name}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">
                              {entry.name}
                            </span>
                          </span>
                          <span className="font-semibold">
                            {numberFormat(entry.value)}
                            <span className="text-muted-foreground ml-1 font-normal">
                              (
                              {summary.total > 0
                                ? Math.round(
                                    (entry.value / summary.total) * 100,
                                  )
                                : 0}
                              %)
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Kehadiran per Kelas</CardTitle>
                <CardDescription className="text-xs">
                  Perbandingan status antar kelas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classData.length === 0 ? (
                  <EmptyChart message="Tidak ada data per kelas" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={classData}
                      margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_GRID_STROKE}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="class"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        width={28}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar
                        dataKey="Hadir"
                        stackId="status"
                        fill={CHART_SERIES.positive}
                        radius={[0, 0, 0, 0]}
                        maxBarSize={28}
                      />
                      <Bar
                        dataKey="Terlambat"
                        stackId="status"
                        fill={CHART_SERIES.warning}
                        maxBarSize={28}
                      />
                      <Bar
                        dataKey="Izin"
                        stackId="status"
                        fill={CHART_SERIES.info}
                        maxBarSize={28}
                      />
                      <Bar
                        dataKey="Sakit"
                        stackId="status"
                        fill={CHART_SERIES.neutral}
                        maxBarSize={28}
                      />
                      <Bar
                        dataKey="Alfa"
                        stackId="status"
                        fill={CHART_SERIES.negative}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rekap per Kelas</CardTitle>
                <CardDescription className="text-xs">
                  Jumlah record dan tingkat kehadiran setiap kelas
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {byClass.length === 0 ? (
                  <EmptyChart message="Tidak ada data per kelas" />
                ) : (
                  <div className="max-h-[280px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 sticky top-0">
                        <tr className="border-b">
                          <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                            Kelas
                          </th>
                          <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                            Record
                          </th>
                          <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                            Hadir
                          </th>
                          <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium">
                            Kehadiran
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {byClass.map((row, index) => (
                          <tr
                            key={row.classId ?? index}
                            className={`border-b ${index % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {row.className}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">
                              {numberFormat(row.total)}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">
                              {numberFormat(row.present)}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="bg-muted h-1.5 max-w-[100px] flex-1 rounded-full">
                                  <div
                                    className="bg-success-solid h-1.5 rounded-full"
                                    style={{ width: `${row.attendanceRate}%` }}
                                  />
                                </div>
                                <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
                                  {row.attendanceRate}%
                                </span>
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
          </div>
        </TabsContent>

        {/* ═══════════ TAB: DAILY PIPELINE ═══════════ */}
        <TabsContent value="daily" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {STATUS_KEYS.map((key) => {
              const config = STATUS_MAP[key];
              const Icon = config.icon;
              const pct =
                summary.total > 0
                  ? Math.round((summary[key] / summary.total) * 100)
                  : 0;
              return (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        {config.label}
                      </p>
                      <div
                        className={`${config.bgColor} flex h-7 w-7 items-center justify-center rounded-lg`}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: config.chartColor }}
                        />
                      </div>
                    </div>
                    <p
                      className="mt-1 text-2xl font-semibold tracking-tight"
                      style={{ color: config.chartColor }}
                    >
                      {numberFormat(summary[key])}
                    </p>
                    <div className="bg-muted mt-2 h-1.5 rounded-full">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: config.chartColor,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {pct}% dari {numberFormat(summary.total)} record
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Pipeline Harian</CardTitle>
                  <CardDescription className="text-xs">
                    Alur status kehadiran setiap hari pada periode terpilih
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {STATUS_KEYS.map((key) => (
                    <span
                      key={key}
                      className="text-muted-foreground flex items-center gap-1 text-[11px]"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: STATUS_MAP[key].chartColor }}
                      />
                      {STATUS_MAP[key].label}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {daily.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarDays className="text-muted-foreground/30 mb-3 h-12 w-12" />
                  <p className="text-muted-foreground font-medium">
                    Tidak ada data pada periode ini
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Ubah rentang tanggal atau filter status
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[560px]">
                    {[...daily].reverse().map((day) => (
                      <PipelineRow key={day.date} day={day} />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════════ TAB: DATA ═══════════ */}
        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="text-info h-4 w-4" />
                Data Kehadiran
              </CardTitle>
              <CardDescription className="mt-1">
                Menampilkan {firstRow}–{lastRow} dari{" "}
                {numberFormat(totalRecords)} record
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="text-muted-foreground/30 mb-3 h-12 w-12" />
                  <p className="text-muted-foreground font-medium">
                    Tidak ada data kehadiran
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Coba ubah filter atau rentang tanggal
                  </p>
                  {hasActiveFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={resetFilters}
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div
                    className={`overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead className="text-xs font-semibold">
                            Siswa
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Kelas
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Mata Pelajaran
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Tanggal
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Catatan
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((record) => (
                          <TableRow
                            key={record.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="py-2.5 font-medium">
                              <div className="flex items-center gap-2">
                                <div className="bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                                  <User className="text-muted-foreground h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="text-sm">
                                    {record.student?.name ?? "-"}
                                  </p>
                                  <p className="text-muted-foreground font-mono text-[11px]">
                                    {record.student?.nisn ?? "N/A"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {record.schedule?.class?.name ??
                                  record.schedule?.room ??
                                  "N/A"}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                <BookOpen className="h-3 w-3 shrink-0" />
                                {record.schedule?.subject?.name ?? "N/A"}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <StatusBadge status={record.status} />
                            </TableCell>
                            <TableCell className="text-muted-foreground py-2.5 text-sm whitespace-nowrap">
                              {format(new Date(record.date), "d MMM yyyy")}
                            </TableCell>
                            <TableCell className="max-w-40 py-2.5">
                              <span
                                className="text-muted-foreground block truncate text-xs"
                                title={record.notes ?? "-"}
                              >
                                {record.notes ?? "-"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
                    <p className="text-muted-foreground text-xs">
                      Halaman {page} dari {pageCount} ·{" "}
                      {numberFormat(totalRecords)} record
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                          setPageSize(Number(value));
                          setPage(1);
                        }}
                      >
                        <SelectTrigger className="h-8 w-[110px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[10, 25, 50, 100].map((size) => (
                            <SelectItem key={size} value={String(size)}>
                              {size} / halaman
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((current) => Math.max(1, current - 1))
                        }
                        disabled={page <= 1 || isFetching}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((current) => current + 1)}
                        disabled={!pagination?.hasMore || isFetching}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
