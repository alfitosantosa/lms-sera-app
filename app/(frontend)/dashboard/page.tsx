"use client";

import { useAttendanceByDate } from "@/app/(hooks)/hooks/Attendances/useAttendanceByDate";
import { DatePickerWithRange } from "@/components/date/datePicker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, AlertCircle, AlertTriangle, BarChart3, BookOpen, CalendarDays, CheckCircle, Clock, MapPin, PieChart as PieChartIcon, RefreshCw, Search, TrendingUp, User, Users, XCircle } from "lucide-react";
import React, { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusKey = "present" | "absent" | "late" | "excused" | "sick";

type AttendanceRecord = {
  id: string;
  status: StatusKey;
  date: string;
  notes?: string | null;
  student: {
    name: string;
    nisn?: string | null;
  };
  schedule: {
    room?: string | null;
    subject?: {
      id: string;
      name: string;
    } | null;
  };
};

type StatsMap = {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  sick: number;
  attendanceRate: string | number;
};

type DailyRecord = {
  date: string;
  present: number;
  late: number;
  absent: number;
  sick: number;
  excused: number;
  total: number;
  [key: string]: string | number;
};

type ClassRecord = {
  class: string;
  present: number;
  late: number;
  absent: number;
  sick: number;
  excused: number;
  [key: string]: string | number;
};

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  StatusKey,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ElementType;
    chartColor: string;
  }
> = {
  present: {
    label: "Hadir",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-500",
    icon: CheckCircle,
    chartColor: "#10B981",
  },
  absent: {
    label: "Tidak Hadir",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    icon: XCircle,
    chartColor: "#EF4444",
  },
  late: {
    label: "Terlambat",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-500",
    icon: Clock,
    chartColor: "#F59E0B",
  },
  excused: {
    label: "Izin",
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-500",
    icon: AlertCircle,
    chartColor: "#06B6D4",
  },
  sick: {
    label: "Sakit",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
    icon: AlertCircle,
    chartColor: "#8B5CF6",
  },
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur shadow-xl p-3 min-w-40">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="h-32 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 animate-pulse" />

      {/* Filter skeleton */}
      <div className="h-24 rounded-xl border bg-card animate-pulse" />

      {/* KPI skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border bg-card animate-pulse" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-80 rounded-xl border bg-card animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AttendanceDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchStudent, setSearchStudent] = useState<string>("");
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  // ── Data ─────────────────────────────────────────────────────────────────
  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAttendanceByDate({
    fromdate: dateRange?.from ?? new Date(),
    todate: dateRange?.to ?? new Date(),
  });

  const attendanceData: AttendanceRecord[] = useMemo(() => (Array.isArray(rawData) ? (rawData as AttendanceRecord[]) : []), [rawData]);

  // ── Derived filter options ───────────────────────────────────────────────
  const classes = useMemo<string[]>(() => {
    const set = new Set<string>();
    attendanceData.forEach((r) => {
      if (r.schedule?.room) set.add(r.schedule.room);
    });
    return Array.from(set).sort();
  }, [attendanceData]);

  const subjects = useMemo<string[]>(() => {
    const set = new Set<string>();
    attendanceData.forEach((r) => {
      if (r.schedule?.subject?.name) set.add(r.schedule.subject.name);
    });
    return Array.from(set).sort();
  }, [attendanceData]);

  // ── Filtered data ────────────────────────────────────────────────────────
  const filteredData = useMemo<AttendanceRecord[]>(() => {
    return attendanceData.filter((r) => {
      const matchStatus = selectedStatus === "all" || r.status === selectedStatus;
      const matchClass = selectedClass === "all" || r.schedule?.room === selectedClass;
      const matchSubject = selectedSubject === "all" || r.schedule?.subject?.name === selectedSubject;
      const q = searchStudent.toLowerCase();
      const matchSearch = !q || r.student?.name?.toLowerCase().includes(q) || (r.student?.nisn ?? "").includes(q);
      return matchStatus && matchClass && matchSubject && matchSearch;
    });
  }, [attendanceData, selectedStatus, selectedClass, selectedSubject, searchStudent]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo<StatsMap>(() => {
    const total = filteredData.length;
    const present = filteredData.filter((r) => r.status === "present").length;
    const late = filteredData.filter((r) => r.status === "late").length;
    const absent = filteredData.filter((r) => r.status === "absent").length;
    const sick = filteredData.filter((r) => r.status === "sick").length;
    const excused = filteredData.filter((r) => r.status === "excused").length;
    return {
      total,
      present,
      late,
      absent,
      sick,
      excused,
      attendanceRate: total > 0 ? (((present + late) / total) * 100).toFixed(1) : "0",
    };
  }, [filteredData]);

  // ── Pie data ─────────────────────────────────────────────────────────────
  const pieData = useMemo(() => {
    return (Object.keys(STATUS_MAP) as StatusKey[])
      .map((key) => ({
        name: STATUS_MAP[key].label,
        value: stats[key],
        color: STATUS_MAP[key].chartColor,
      }))
      .filter((d) => d.value > 0);
  }, [stats]);

  // ── Line chart data ───────────────────────────────────────────────────────
  const lineData = useMemo<DailyRecord[]>(() => {
    const daily: Record<string, DailyRecord> = {};
    filteredData.forEach((r) => {
      const date = new Date(r.date).toLocaleDateString("id-ID");
      if (!daily[date]) {
        daily[date] = { date, present: 0, late: 0, absent: 0, sick: 0, excused: 0, total: 0 };
      }
      (daily[date][r.status] as number)++;
      (daily[date].total as number)++;
    });
    return Object.values(daily).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredData]);

  // ── Bar chart data (by class) ─────────────────────────────────────────────
  const classData = useMemo<ClassRecord[]>(() => {
    const map: Record<string, ClassRecord> = {};
    filteredData.forEach((r) => {
      const cls = r.schedule?.room ?? "Unknown";
      if (!map[cls]) {
        map[cls] = { class: cls, present: 0, late: 0, absent: 0, sick: 0, excused: 0 };
      }
      (map[cls][r.status] as number)++;
    });
    return Object.values(map).sort((a, b) => String(a.class).localeCompare(String(b.class)));
  }, [filteredData]);

  const displayedRows = showAllRows ? filteredData : filteredData.slice(0, 10);
  const hasActiveFilter = selectedStatus !== "all" || selectedClass !== "all" || selectedSubject !== "all" || !!searchStudent;

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto pt-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">Gagal memuat data kehadiran. Silakan coba muat ulang halaman.</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Page Header ── */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl">
          {/* decorative circles */}
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />

          <div className="relative px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1 uppercase tracking-wide">Sistem Informasi Sekolah</p>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Kehadiran</h1>
                <p className="text-blue-200 text-sm mt-1">Pantau dan analisis kehadiran siswa secara real-time</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Attendance rate pill */}
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                  <Activity className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-xs text-blue-200">Tingkat Kehadiran</p>
                    <p className="text-xl font-bold">{stats.attendanceRate}%</p>
                  </div>
                </div>

                {/* Total records pill */}
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                  <Users className="h-5 w-5 text-blue-200" />
                  <div>
                    <p className="text-xs text-blue-200">Total Record</p>
                    <p className="text-xl font-bold">{stats.total.toLocaleString("id-ID")}</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="bg-white/15 border-white/30 text-white hover:bg-white/25">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Date Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Periode</label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {(Object.keys(STATUS_MAP) as StatusKey[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_MAP[key].chartColor }} />
                          {STATUS_MAP[key].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Kelas</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Semua Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mata Pelajaran</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Semua Mapel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Cari Siswa
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Nama atau NISN..." value={searchStudent} onChange={(e) => setSearchStudent(e.target.value)} className="pl-8 w-48" />
                </div>
              </div>

              {/* Reset */}
              {hasActiveFilter && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground opacity-0">Reset</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10"
                    onClick={() => {
                      setSelectedStatus("all");
                      setSelectedClass("all");
                      setSelectedSubject("all");
                      setSearchStudent("");
                    }}
                  >
                    Reset Filter
                  </Button>
                </div>
              )}
            </div>

            {/* Active filter badges */}
            {hasActiveFilter && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                <span className="text-xs text-muted-foreground">Filter aktif:</span>
                {selectedStatus !== "all" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS_MAP[selectedStatus as StatusKey]?.chartColor }} />
                    {STATUS_MAP[selectedStatus as StatusKey]?.label}
                  </Badge>
                )}
                {selectedClass !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedClass}
                  </Badge>
                )}
                {selectedSubject !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedSubject}
                  </Badge>
                )}
                {searchStudent && (
                  <Badge variant="secondary" className="text-xs">
                    &quot;{searchStudent}&quot;
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Total */}
          <Card className="border-l-4 border-l-slate-400">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-700">{stats.total.toLocaleString("id-ID")}</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-slate-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per status */}
          {(Object.keys(STATUS_MAP) as StatusKey[]).map((key) => {
            const cfg = STATUS_MAP[key];
            const Icon = cfg.icon;
            const count = stats[key];
            const pct = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : "0";

            return (
              <Card key={key} className={`border-l-4 ${cfg.borderColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{cfg.label}</p>
                      <p className="text-2xl font-bold" style={{ color: cfg.chartColor }}>
                        {count}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{pct}%</p>
                    </div>
                    <div className={`h-8 w-8 rounded-lg ${cfg.bgColor} flex items-center justify-center`}>
                      <Icon className="h-4 w-4" style={{ color: cfg.chartColor }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Charts Row 1: Pie + Line ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-4 w-4 text-blue-600" />
                Distribusi Status
              </CardTitle>
              <CardDescription>Proporsi kehadiran berdasarkan status</CardDescription>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ?
                <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">Tidak ada data untuk ditampilkan</div>
              : <div className="flex items-center gap-4">
                  <ResponsiveContainer width="60%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0];
                          return (
                            <div className="rounded-lg border bg-background shadow-md p-2 text-xs">
                              <p className="font-semibold">{d.name}</p>
                              <p style={{ color: d.payload.color }}>{d.value} siswa</p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="flex-1 space-y-2">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                          <span className="text-muted-foreground">{d.name}</span>
                        </span>
                        <span className="font-semibold">
                          {d.value} <span className="text-muted-foreground font-normal">({stats.total > 0 ? ((d.value / stats.total) * 100).toFixed(0) : 0}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              }
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Tren Kehadiran Harian
              </CardTitle>
              <CardDescription>Perkembangan kehadiran per hari</CardDescription>
            </CardHeader>
            <CardContent>
              {lineData.length === 0 ?
                <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">Tidak ada data tren untuk periode ini</div>
              : <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={24} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} dot={false} name="Hadir" />
                    <Line type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} dot={false} name="Terlambat" />
                    <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} dot={false} name="Tidak Hadir" />
                    <Line type="monotone" dataKey="sick" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Sakit" />
                    <Line type="monotone" dataKey="excused" stroke="#06B6D4" strokeWidth={2} dot={false} name="Izin" />
                  </LineChart>
                </ResponsiveContainer>
              }
            </CardContent>
          </Card>
        </div>

        {/* ── Bar Chart ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              Kehadiran per Kelas
            </CardTitle>
            <CardDescription>Perbandingan tingkat kehadiran antar kelas</CardDescription>
          </CardHeader>
          <CardContent>
            {classData.length === 0 ?
              <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">Tidak ada data per kelas untuk periode ini</div>
            : <ResponsiveContainer width="100%" height={280}>
                <BarChart data={classData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="class" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={24} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="present" fill="#10B981" name="Hadir" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="late" fill="#F59E0B" name="Terlambat" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="absent" fill="#EF4444" name="Tidak Hadir" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="sick" fill="#8B5CF6" name="Sakit" radius={[3, 3, 0, 0]} maxBarSize={20} />
                  <Bar dataKey="excused" fill="#06B6D4" name="Izin" radius={[3, 3, 0, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            }
          </CardContent>
        </Card>

        {/* ── Table ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  Data Kehadiran
                </CardTitle>
                <CardDescription className="mt-1">
                  {filteredData.length} record ditemukan
                  {filteredData.length !== attendanceData.length && <span className="ml-1">(difilter dari {attendanceData.length} total)</span>}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="p-0">
            {filteredData.length === 0 ?
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="font-medium text-muted-foreground">Tidak ada data kehadiran</p>
                <p className="text-sm text-muted-foreground mt-1">Coba ubah filter atau rentang tanggal</p>
              </div>
            : <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="font-semibold text-xs">Siswa</TableHead>
                        <TableHead className="font-semibold text-xs">NISN</TableHead>
                        <TableHead className="font-semibold text-xs">Kelas</TableHead>
                        <TableHead className="font-semibold text-xs">Mata Pelajaran</TableHead>
                        <TableHead className="font-semibold text-xs">Status</TableHead>
                        <TableHead className="font-semibold text-xs">Tanggal</TableHead>
                        <TableHead className="font-semibold text-xs">Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedRows.map((record) => {
                        const cfg = STATUS_MAP[record.status];
                        if (!cfg) return null;
                        const Icon = cfg.icon;
                        return (
                          <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <span className="text-sm">{record.student?.name ?? "-"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Badge variant="outline" className="text-xs font-mono">
                                {record.student?.nisn ?? "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {record.schedule?.room ?? "N/A"}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <BookOpen className="h-3 w-3 shrink-0" />
                                {record.schedule?.subject?.name ?? "N/A"}
                              </div>
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Badge className={`${cfg.bgColor} ${cfg.color} border-0 flex items-center gap-1 w-fit text-xs`}>
                                <Icon className="h-3 w-3" />
                                {cfg.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(record.date).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="py-2.5 max-w-40">
                              <span className="text-xs text-muted-foreground truncate block" title={record.notes ?? "-"}>
                                {record.notes ?? "-"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Show more / show less */}
                {filteredData.length > 10 && (
                  <div className="p-4 border-t flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Menampilkan {showAllRows ? filteredData.length : Math.min(10, filteredData.length)} dari {filteredData.length} record
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setShowAllRows((v) => !v)}>
                      {showAllRows ? "Tampilkan Lebih Sedikit" : `Lihat Semua (${filteredData.length} record)`}
                    </Button>
                  </div>
                )}
              </>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
