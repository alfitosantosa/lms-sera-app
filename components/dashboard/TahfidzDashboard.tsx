"use client";

import { monthToDateRange } from "@/lib/dateRange";
import { CHART_GRID_STROKE, CHART_PALETTE, CHART_SERIES } from "@/lib/ui/charts";
import { useGetBranchs } from "@/hooks/Branchs/useBranchs";
import { useTahfidzRecordsByDate } from "@/hooks/TahfidzRecord/useTahfidzRecordByDate";
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
  TahfidzDailyPoint,
  TahfidzSummary,
} from "@/types/tahfidzrecord-types";
import { format, subDays } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Layers,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
  User,
  Users,
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

// ─── Grade config ────────────────────────────────────────────────────────────

const GRADE_KEYS = ["A", "B", "C", "D", "E"] as const;

const GRADE_MAP: Record<
  (typeof GRADE_KEYS)[number],
  { label: string; bgColor: string; color: string; chartColor: string }
> = {
  A: {
    label: "A",
    bgColor: "bg-success-surface",
    color: "text-success-strong",
    chartColor: CHART_SERIES.positive,
  },
  B: {
    label: "B",
    bgColor: "bg-info-surface",
    color: "text-info-strong",
    chartColor: CHART_SERIES.info,
  },
  C: {
    label: "C",
    bgColor: "bg-warning-surface",
    color: "text-warning-strong",
    chartColor: CHART_SERIES.warning,
  },
  D: {
    label: "D",
    bgColor: "bg-caution-surface",
    color: "text-caution-strong",
    chartColor: CHART_SERIES.neutral,
  },
  E: {
    label: "E",
    bgColor: "bg-destructive-surface",
    color: "text-destructive-strong",
    chartColor: CHART_SERIES.negative,
  },
};

const EMPTY_SUMMARY: TahfidzSummary = {
  total: 0,
  students: 0,
  groups: 0,
  teachers: 0,
  surahs: 0,
  averageGrade: 0,
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
          <span className="font-semibold">
            {numberFormat(Number(p.value))}
          </span>
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
      <Skeleton className="h-52 w-full rounded-3xl" />
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

function GradeBadge({ grade }: { grade?: string | null }) {
  if (!grade) return <span className="text-muted-foreground">-</span>;
  const config =
    GRADE_MAP[grade.toUpperCase() as (typeof GRADE_KEYS)[number]];
  if (!config) return <Badge variant="outline">{grade}</Badge>;
  return (
    <Badge
      className={`${config.bgColor} ${config.color} flex w-fit items-center gap-1 border-0 text-xs font-bold`}
    >
      <Star className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

// ─── Daily pipeline row ──────────────────────────────────────────────────────

function PipelineRow({ day }: { day: TahfidzDailyPoint }) {
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
          : GRADE_KEYS.map((key) => {
              const count = day.gradeCounts[key] ?? 0;
              const width = (count / day.total) * 100;
              if (width === 0) return null;
              return (
                <div
                  key={key}
                  style={{
                    width: `${width}%`,
                    backgroundColor: GRADE_MAP[key].chartColor,
                  }}
                  title={`Nilai ${key}: ${count}`}
                />
              );
            })}
      </div>

      <div className="flex items-center gap-3 text-xs tabular-nums">
        <span className="text-muted-foreground hidden w-20 sm:block">
          {day.total} setoran
        </span>
        <span className="text-muted-foreground hidden w-16 sm:block">
          {day.students} siswa
        </span>
        <Badge variant="outline" className="w-16 justify-center">
          Nilai {day.averageGrade}
        </Badge>
      </div>
    </div>
  );
}

// ─── Main dashboard ──────────────────────────────────────────────────────────

export default function TahfidzDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    monthToDateRange(),
  );
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedSurah, setSelectedSurah] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [searchStudent, setSearchStudent] = useState("");
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
  } = useTahfidzRecordsByDate({
    fromdate: dateRange?.from,
    todate: dateRange?.to,
    branchId: selectedBranch === "all" ? undefined : selectedBranch,
    groupId: selectedGroup === "all" ? undefined : selectedGroup,
    teacherId: selectedTeacher === "all" ? undefined : selectedTeacher,
    surahId: selectedSurah === "all" ? undefined : selectedSurah,
    grade: selectedGrade === "all" ? undefined : selectedGrade,
    search: deferredSearch || undefined,
    page,
    limit: pageSize,
  });

  const rows = response?.data ?? [];
  const pagination = response?.pagination;
  const summary = response?.summary ?? EMPTY_SUMMARY;
  const daily = response?.daily ?? [];
  const byGrade = response?.byGrade ?? [];
  const byGroup = response?.byGroup ?? [];
  const filterOptions = response?.filterOptions ?? {
    groups: [],
    teachers: [],
    surahs: [],
  };

  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    if (pagination && pagination.pages > 0 && page > pagination.pages) {
      setPage(pagination.pages);
    }
  }, [pagination, page]);

  const gradePieData = useMemo(
    () =>
      byGrade
        .map((entry) => ({
          name: `Nilai ${entry.grade}`,
          value: entry.total,
          color:
            GRADE_MAP[entry.grade as (typeof GRADE_KEYS)[number]]?.chartColor ??
            CHART_PALETTE[0],
        }))
        .filter((entry) => entry.value > 0),
    [byGrade],
  );

  const trendData = useMemo(
    () =>
      daily.map((day) => ({
        label: format(new Date(`${day.date}T00:00:00`), "d MMM"),
        Setoran: day.total,
        Siswa: day.students,
      })),
    [daily],
  );

  const groupChartData = useMemo(
    () =>
      byGroup.map((group) => ({
        group: group.groupName,
        Setoran: group.total,
        Siswa: group.students,
      })),
    [byGroup],
  );

  const oneDay = daily.filter((day) => day.total > 0);
  const maxDailyTotal = oneDay.reduce(
    (max, day) => Math.max(max, day.total),
    0,
  );
  const gradeMissingData = byGrade.filter((entry) => entry.total > 0);

  const hasActiveFilter =
    selectedBranch !== "all" ||
    selectedGroup !== "all" ||
    selectedTeacher !== "all" ||
    selectedSurah !== "all" ||
    selectedGrade !== "all" ||
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
    setSelectedGroup("all");
    setSelectedTeacher("all");
    setSelectedSurah("all");
    setSelectedGrade("all");
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
            Gagal memuat data tahfizh. Silakan coba muat ulang halaman.
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
            Dashboard Tahfizh
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Pantau setoran hafalan per periode, sekolah, grup, dan guru
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1.5 py-1.5 text-xs">
            <CalendarDays className="h-3 w-3" />
            {dateLabel}
          </Badge>
          {selectedGrade !== "all" && (
            <Badge variant="secondary" className="gap-1.5 py-1.5 text-xs">
              Nilai {selectedGrade}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  setSelectedGroup("all");
                  setSelectedTeacher("all");
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
                <Layers className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Grup Tahfizh
                </span>
              </div>
              <Select
                value={selectedGroup}
                onValueChange={(value) => {
                  setSelectedGroup(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Semua Grup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Grup</SelectItem>
                  {filterOptions.groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Guru
                </span>
              </div>
              <Select
                value={selectedTeacher}
                onValueChange={(value) => {
                  setSelectedTeacher(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Semua Guru" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Guru</SelectItem>
                  {filterOptions.teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Surah
                </span>
              </div>
              <Select
                value={selectedSurah}
                onValueChange={(value) => {
                  setSelectedSurah(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Semua Surah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Surah</SelectItem>
                  {filterOptions.surahs.map((surah) => (
                    <SelectItem key={surah.id} value={surah.id}>
                      {surah.nameLatin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-sm font-medium">
                  Nilai
                </span>
              </div>
              <Select
                value={selectedGrade}
                onValueChange={(value) => {
                  setSelectedGrade(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Semua Nilai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Nilai</SelectItem>
                  {GRADE_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      Nilai {key}
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
                      {branchs.find((branch) => branch.id === selectedBranch)
                        ?.name ?? selectedBranch}
                    </Badge>
                  )}
                  {selectedGroup !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {filterOptions.groups.find(
                        (group) => group.id === selectedGroup,
                      )?.name ?? selectedGroup}
                    </Badge>
                  )}
                  {selectedTeacher !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {filterOptions.teachers.find(
                        (teacher) => teacher.id === selectedTeacher,
                      )?.name ?? selectedTeacher}
                    </Badge>
                  )}
                  {selectedSurah !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      {filterOptions.surahs.find(
                        (surah) => surah.id === selectedSurah,
                      )?.nameLatin ?? selectedSurah}
                    </Badge>
                  )}
                  {selectedGrade !== "all" && (
                    <Badge variant="secondary" className="text-xs">
                      Nilai {selectedGrade}
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
              <span className="text-muted-foreground mr-1 text-xs">Quick:</span>
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
          title="Total Setoran"
          value={numberFormat(summary.total)}
          sub="Sesuai filter aktif"
          icon={BookOpen}
          color={CHART_PALETTE[0]}
        />
        <KPICard
          title="Siswa Menyetor"
          value={numberFormat(summary.students)}
          sub={`${numberFormat(summary.groups)} grup terlibat`}
          icon={Users}
          color={CHART_SERIES.info}
        />
        <KPICard
          title="Rata-rata Nilai"
          value={`${summary.averageGrade}`}
          sub="Skala 0–4 (A=4, E=0)"
          icon={Star}
          color={CHART_SERIES.positive}
          badge={{
            label:
              summary.averageGrade >= 3.5
                ? "Baik"
                : summary.averageGrade >= 2.5
                  ? "Cukup"
                  : "Perlu Bimbingan",
            positive: summary.averageGrade >= 3.5,
          }}
        />
        <KPICard
          title="Guru Pembimbing"
          value={numberFormat(summary.teachers)}
          sub={`${numberFormat(summary.surahs)} surah disetorkan`}
          icon={GraduationCap}
          color={CHART_SERIES.warning}
        />
      </div>

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-1.5 text-xs">
            <CalendarDays className="h-3.5 w-3.5" />
            Pipeline Harian
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            Data Setoran
          </TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB: OVERVIEW ═══════════ */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tren Setoran Harian</CardTitle>
                <CardDescription className="text-xs">
                  Jumlah setoran dan siswa yang menyetor setiap hari
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
                        <linearGradient
                          id="gradSetoran"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
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
                        dataKey="Setoran"
                        stroke={CHART_SERIES.positive}
                        strokeWidth={2}
                        fill="url(#gradSetoran)"
                      />
                      <Area
                        type="monotone"
                        dataKey="Siswa"
                        stroke={CHART_SERIES.info}
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
                <CardTitle className="text-base">Distribusi Nilai</CardTitle>
                <CardDescription className="text-xs">
                  Proporsi setoran per nilai
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gradePieData.length === 0 ? (
                  <EmptyChart message="Tidak ada data nilai" />
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={190}>
                      <PieChart>
                        <Pie
                          data={gradePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {gradePieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => numberFormat(Number(value ?? 0))}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-1.5">
                      {gradeMissingData.map((entry) => (
                        <div
                          key={entry.grade}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  GRADE_MAP[
                                    entry.grade as (typeof GRADE_KEYS)[number]
                                  ]?.chartColor,
                              }}
                            />
                            <span className="text-muted-foreground">
                              Nilai {entry.grade}
                            </span>
                          </span>
                          <span className="font-semibold">
                            {numberFormat(entry.total)}
                            <span className="text-muted-foreground ml-1 font-normal">
                              ({entry.percentage}%)
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
                <CardTitle className="text-base">Setoran per Grup</CardTitle>
                <CardDescription className="text-xs">
                  Jumlah setoran masing-masing halaqah
                </CardDescription>
              </CardHeader>
              <CardContent>
                {groupChartData.length === 0 ? (
                  <EmptyChart message="Tidak ada data per grup" />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={groupChartData}
                      margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={CHART_GRID_STROKE}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="group"
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
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
                        dataKey="Setoran"
                        fill={CHART_SERIES.positive}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={24}
                      />
                      <Bar
                        dataKey="Siswa"
                        fill={CHART_SERIES.info}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rekap per Grup</CardTitle>
                <CardDescription className="text-xs">
                  Setoran, siswa, dan rata-rata nilai per grup
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {byGroup.length === 0 ? (
                  <EmptyChart message="Tidak ada data per grup" />
                ) : (
                  <div className="max-h-[280px] overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 sticky top-0">
                        <tr className="border-b">
                          <th className="text-muted-foreground px-4 py-2.5 text-left text-xs font-medium">
                            Grup
                          </th>
                          <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                            Setoran
                          </th>
                          <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                            Siswa
                          </th>
                          <th className="text-muted-foreground px-4 py-2.5 text-right text-xs font-medium">
                            Nilai
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {byGroup.map((group, index) => (
                          <tr
                            key={group.groupId ?? index}
                            className={`border-b ${index % 2 === 1 ? "bg-muted/20" : ""} hover:bg-muted/30 transition-colors`}
                          >
                            <td className="px-4 py-2.5 font-medium">
                              {group.groupName}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">
                              {numberFormat(group.total)}
                            </td>
                            <td className="px-4 py-2.5 text-right tabular-nums">
                              {numberFormat(group.students)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                              {group.averageGrade}
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
            {GRADE_KEYS.map((key) => {
              const config = GRADE_MAP[key];
              const entry = byGrade.find((item) => item.grade === key);
              return (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        Nilai {config.label}
                      </p>
                      <div
                        className={`${config.bgColor} flex h-7 w-7 items-center justify-center rounded-lg`}
                      >
                        <Star
                          className="h-4 w-4"
                          style={{ color: config.chartColor }}
                        />
                      </div>
                    </div>
                    <p
                      className="mt-1 text-2xl font-semibold tracking-tight"
                      style={{ color: config.chartColor }}
                    >
                      {numberFormat(entry?.total ?? 0)}
                    </p>
                    <div className="bg-muted mt-2 h-1.5 rounded-full">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${entry?.percentage ?? 0}%`,
                          backgroundColor: config.chartColor,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {entry?.percentage ?? 0}% dari {numberFormat(summary.total)}{" "}
                      setoran
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
                    Alur setoran dan sebaran nilai setiap hari pada periode
                    terpilih
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {GRADE_KEYS.map((key) => (
                    <span
                      key={key}
                      className="text-muted-foreground flex items-center gap-1 text-[11px]"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: GRADE_MAP[key].chartColor }}
                      />
                      Nilai {key}
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
                    Ubah rentang tanggal atau filter
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="text-info h-4 w-4" />
                    Data Setoran Tahfizh
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Menampilkan {firstRow}–{lastRow} dari{" "}
                    {numberFormat(totalRecords)} setoran
                  </CardDescription>
                </div>
                {maxDailyTotal > 0 && (
                  <Badge variant="outline" className="gap-1.5 text-xs">
                    <TrendingUp className="h-3 w-3" />
                    Puncak {maxDailyTotal} setoran/hari
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="text-muted-foreground/30 mb-3 h-12 w-12" />
                  <p className="text-muted-foreground font-medium">
                    Tidak ada setoran tahfizh
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
                            Tanggal
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Siswa
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Kelas / Grup
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Surah
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Ayat
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Nilai
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Guru
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
                            <TableCell className="py-2.5 text-sm whitespace-nowrap">
                              {format(new Date(record.date), "d MMM yyyy")}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                                  <User className="text-muted-foreground h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {record.student?.name ?? "-"}
                                  </p>
                                  <p className="text-muted-foreground font-mono text-[11px]">
                                    {record.student?.nisn ?? "N/A"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="text-muted-foreground text-sm">
                                {record.student?.class?.name ?? "N/A"}
                              </div>
                              <div className="text-muted-foreground text-[11px]">
                                {record.student?.tahfidzGroup?.name ?? "-"}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="text-sm font-medium">
                                {record.surah?.nameLatin ?? "-"}
                              </div>
                              <div className="text-muted-foreground text-[11px]">
                                {record.surah?.name ?? ""}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground py-2.5 text-sm tabular-nums">
                              {record.startVerse ?? "-"}–{record.endVerse ?? "-"}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <GradeBadge grade={record.grade} />
                            </TableCell>
                            <TableCell className="text-muted-foreground py-2.5 text-sm">
                              {record.teacher?.name ?? "-"}
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
                      {numberFormat(totalRecords)} setoran
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
