"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  useBulkCreateTeacherAttendance,
  useDeleteTeacherAttendance,
  useGetTeacherAttendance,
  useGetTeacherAttendanceReports,
  useUpdateTeacherAttendance,
} from "@/app/(hooks)/hooks/TeacherAttendance/useTeacherAttendance";
import { useGetTeachers } from "@/app/(hooks)/hooks/Users/useTeachers";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import type {
  AttendanceStats,
  AttendanceStatus,
  CheckinTabProps,
  StatusConfigMap,
  TeacherAttendanceRecord,
} from "@/app/(types)/types/teacher-attendance-types";
import Loading from "@/components/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/authClients";
import {
  exportTeacherAttendanceDetailToExcel,
  exportTeacherAttendanceToExcel,
} from "@/lib/export/exportTeacherAttendances";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Activity,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Edit2,
  FileText,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { unauthorized } from "next/navigation";
import { toast } from "sonner";

const STATUS_CONFIG: StatusConfigMap = {
  hadir: {
    color: "text-success",
    label: "Hadir",
    bg: "bg-success-chip",
    text: "text-success-strong",
    icon: Check,
  },
  sakit: {
    color: "text-warning",
    label: "Sakit",
    bg: "bg-warning-chip",
    text: "text-warning-strong",
    icon: Activity,
  },
  izin: {
    color: "text-info",
    label: "Izin",
    bg: "bg-info-chip",
    text: "text-info-strong",
    icon: FileText,
  },
  alfa: {
    color: "text-destructive",
    label: "Alfa",
    bg: "bg-destructive-chip",
    text: "text-destructive-strong",
    icon: X,
  },
  terlambat: {
    color: "text-caution",
    label: "Terlambat",
    bg: "bg-caution-chip",
    text: "text-caution-strong",
    icon: Clock,
  },
};

// Stats yang ditampilkan di UI (SEKARANG TERMASUK TERLAMBAT)
const VISIBLE_STATS: AttendanceStatus[] = [
  "hadir",
  "sakit",
  "izin",
  "alfa",
  "terlambat",
];

function TeacherAttendancePage() {
  const { data: session } = useSession();
  const { data: adminData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  return (
    <div className="">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Absensi Guru
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Kelola kehadiran dan lihat laporan absensi guru
        </p>
      </div>

      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger
            value="checkin"
            className="gap-1.5 text-xs sm:gap-2 sm:text-sm"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Check-in
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="gap-1.5 text-xs sm:gap-2 sm:text-sm"
          >
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Laporan
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="checkin"
          className="mt-4 space-y-3 sm:mt-6 sm:space-y-4"
        >
          <CheckinTab adminId={adminData?.id} />
        </TabsContent>

        <TabsContent
          value="reports"
          className="mt-4 space-y-3 sm:mt-6 sm:space-y-4"
        >
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CheckinTab({ adminId }: CheckinTabProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [editingRecord, setEditingRecord] =
    useState<TeacherAttendanceRecord | null>(null);
  const [deletingRecord, setDeletingRecord] =
    useState<TeacherAttendanceRecord | null>(null);
  const [bulkStatus, setBulkStatus] = useState<AttendanceStatus>("hadir");
  const [editStatus, setEditStatus] = useState<AttendanceStatus>("hadir");
  const [bulkNotes, setBulkNotes] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: attendance = [], isLoading } = useGetTeacherAttendance(date);
  const { mutate: bulkCreateAttendance, isPending: isBulkPending } =
    useBulkCreateTeacherAttendance();
  const { mutate: updateAttendance, isPending: isUpdatePending } =
    useUpdateTeacherAttendance();
  const { mutate: deleteAttendance, isPending: isDeletePending } =
    useDeleteTeacherAttendance();
  const { data: teachers = [] } = useGetTeachers();

  const handleBulkSubmit = () => {
    if (selectedTeachers.length === 0 || !adminId) return;

    bulkCreateAttendance(
      {
        teacherIds: selectedTeachers,
        date,
        status: bulkStatus,
        notes: bulkNotes,
        createdBy: adminId,
      },
      {
        onSuccess: () => {
          setOpenBulkDialog(false);
          setSelectedTeachers([]);
          setBulkNotes("");
          setBulkStatus("hadir");
        },
      },
    );
  };

  const handleEditSubmit = () => {
    if (!editingRecord) return;

    updateAttendance(
      {
        id: editingRecord.id,
        status: editStatus,
        notes: editNotes,
      },
      {
        onSuccess: () => {
          setOpenEditDialog(false);
          setEditingRecord(null);
          setEditStatus("hadir");
          setEditNotes("");
        },
      },
    );
  };

  const openEditDialog_ = (record: TeacherAttendanceRecord) => {
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditNotes(record.notes || "");
    setOpenEditDialog(true);
  };

  const handleDeleteSubmit = () => {
    if (!deletingRecord) return;

    deleteAttendance(deletingRecord.id, {
      onSuccess: () => {
        setOpenDeleteDialog(false);
        setDeletingRecord(null);
      },
    });
  };

  const openDeleteDialog_ = (record: TeacherAttendanceRecord) => {
    setDeletingRecord(record);
    setOpenDeleteDialog(true);
  };

  // Calculate stats (TERMASUK TERLAMBAT)
  const stats: AttendanceStats = {
    hadir: attendance.filter(
      (a: TeacherAttendanceRecord) => a.status === "hadir",
    ).length,
    sakit: attendance.filter(
      (a: TeacherAttendanceRecord) => a.status === "sakit",
    ).length,
    izin: attendance.filter((a: TeacherAttendanceRecord) => a.status === "izin")
      .length,
    alfa: attendance.filter((a: TeacherAttendanceRecord) => a.status === "alfa")
      .length,
    terlambat: attendance.filter(
      (a: TeacherAttendanceRecord) => a.status === "terlambat",
    ).length,
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Date & Search */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Calendar className="text-muted-foreground hidden h-4 w-4 sm:block sm:h-5 sm:w-5" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-border w-full rounded-lg border px-3 py-2 text-xs font-medium sm:w-auto sm:text-sm"
          />
          <span className="text-muted-foreground text-xs sm:text-sm">
            {format(new Date(date), "EEEE, dd MMMM yyyy", { locale: id })}
          </span>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              placeholder="Cari guru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
          <Dialog
            open={openBulkDialog}
            onOpenChange={(open) => {
              setOpenBulkDialog(open);
              if (!open) {
                setSelectedTeachers([]);
                setBulkNotes("");
                setBulkStatus("hadir");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="flex-1 gap-1.5 py-2 text-xs sm:flex-none sm:gap-2 sm:text-sm"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Absensi Guru</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] w-[95vw] max-w-150 overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  Bulk Check-in Absensi Guru
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Catat absensi untuk beberapa guru sekaligus
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium sm:text-sm">
                    Pilih Guru ({selectedTeachers.length})
                  </label>
                  <div className="border-border max-h-40 space-y-2 overflow-y-auto rounded-lg border p-2 sm:max-h-48 sm:p-3">
                    {teachers.map((teacher: any) => (
                      <div
                        key={teacher.id}
                        className="flex items-center gap-2 sm:gap-3"
                      >
                        <input
                          type="checkbox"
                          id={`teacher-${teacher.id}`}
                          checked={selectedTeachers.includes(teacher.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeachers([
                                ...selectedTeachers,
                                teacher.id,
                              ]);
                            } else {
                              setSelectedTeachers(
                                selectedTeachers.filter(
                                  (id) => id !== teacher.id,
                                ),
                              );
                            }
                          }}
                          className="border-border h-4 w-4 shrink-0 cursor-pointer rounded"
                        />
                        <label
                          htmlFor={`teacher-${teacher.id}`}
                          className="min-w-0 flex-1 cursor-pointer"
                        >
                          <p className="truncate text-xs font-medium sm:text-sm">
                            {teacher.name}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {teacher.email}
                          </p>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium sm:text-sm">
                    Status Kehadiran
                  </label>
                  <Select
                    value={bulkStatus}
                    onValueChange={(value) =>
                      setBulkStatus(value as AttendanceStatus)
                    }
                  >
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(STATUS_CONFIG) as [
                          AttendanceStatus,
                          (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG],
                        ][]
                      ).map(([key, config]) => (
                        <SelectItem
                          key={key}
                          value={key}
                          className="text-xs sm:text-sm"
                        >
                          {config?.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium sm:text-sm">
                    Catatan (Opsional)
                  </label>
                  <Input
                    placeholder="Masukkan catatan..."
                    value={bulkNotes}
                    onChange={(e) => setBulkNotes(e.target.value)}
                    className="text-xs sm:text-sm"
                  />
                </div>

                <Button
                  onClick={handleBulkSubmit}
                  disabled={isBulkPending || selectedTeachers.length === 0}
                  className="w-full text-xs sm:text-sm"
                  size="lg"
                >
                  {isBulkPending
                    ? "Menyimpan..."
                    : `Simpan Absensi (${selectedTeachers.length})`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats - SEKARANG MENAMPILKAN 5 STATS TERMASUK TERLAMBAT */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
        {VISIBLE_STATS.map((key) => {
          const config = STATUS_CONFIG[key];
          const count = stats[key];
          const Icon = config?.icon;

          return (
            <Card key={key}>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={`rounded-lg p-1.5 sm:p-2 ${config?.bg} shrink-0`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold sm:text-2xl">{count}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {config?.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Daftar Absensi ({attendance.length})
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Guru yang sudah melakukan check-in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 sm:space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-12 animate-pulse rounded-lg sm:h-14"
                />
              ))}
            </div>
          ) : attendance.length === 0 ? (
            <div className="text-muted-foreground py-6 text-center sm:py-8">
              <Calendar className="mx-auto mb-2 h-10 w-10 opacity-20 sm:h-12 sm:w-12" />
              <p className="text-xs sm:text-sm">
                Belum ada absensi untuk tanggal ini
              </p>
            </div>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {attendance.map((record: TeacherAttendanceRecord) => {
                const config = STATUS_CONFIG[record.status];
                const Icon = config.icon;
                return (
                  <div
                    key={record.id}
                    className="bg-muted/50 border-border hover:border-border flex flex-col gap-2 rounded-lg border p-3 transition sm:flex-row sm:items-center sm:justify-between sm:gap-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold sm:text-sm">
                        {record.teacher?.name}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {record.teacher?.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-2 sm:ml-4 sm:justify-end sm:gap-3">
                      {record.checkinTime && (
                        <div className="text-left sm:text-right">
                          <p className="text-muted-foreground text-xs">
                            Check-in
                          </p>
                          <p className="font-mono text-xs font-semibold sm:text-sm">
                            {format(new Date(record.checkinTime), "HH:mm")}
                          </p>
                        </div>
                      )}
                      <Badge
                        className={`gap-1 text-xs ${config.bg} ${config.text} border-0 whitespace-nowrap`}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog_(record)}
                          className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog_(record)}
                          className="hover:text-destructive h-7 w-7 p-0 sm:h-8 sm:w-8"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="max-h-[85vh] w-[95vw] max-w-125 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              Edit Absensi Guru
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Ubah status kehadiran dan catatan
            </DialogDescription>
          </DialogHeader>

          {editingRecord && (
            <div className="space-y-4">
              <div className="bg-info-surface border-info-border rounded-lg border p-3">
                <p className="text-info-strong text-xs font-semibold sm:text-sm">
                  {editingRecord.teacher?.name}
                </p>
                <p className="text-info-strong text-xs">
                  {editingRecord.teacher?.email}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Status Kehadiran
                </label>
                <Select
                  value={editStatus}
                  onValueChange={(value) =>
                    setEditStatus(value as AttendanceStatus)
                  }
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(STATUS_CONFIG) as [
                        AttendanceStatus,
                        (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG],
                      ][]
                    ).map(([key, config]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="text-xs sm:text-sm"
                      >
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium sm:text-sm">
                  Catatan (Opsional)
                </label>
                <Input
                  placeholder="Masukkan catatan..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="text-xs sm:text-sm"
                />
              </div>

              <Button
                onClick={handleEditSubmit}
                disabled={isUpdatePending}
                className="w-full text-xs sm:text-sm"
                size="lg"
              >
                {isUpdatePending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent className="w-[95vw] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">
              Hapus Absensi
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Apakah Anda yakin ingin menghapus absensi untuk{" "}
              {deletingRecord?.teacher?.name}? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
            <AlertDialogCancel className="mt-0 text-xs sm:text-sm">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmit}
              disabled={isDeletePending}
              className="bg-destructive-solid hover:bg-destructive-solid/90 text-xs sm:text-sm"
            >
              {isDeletePending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReportsTab() {
  const [startDate, setStartDate] = useState(
    format(
      new Date(new Date().setDate(new Date().getDate() - 62)),
      "yyyy-MM-dd",
    ),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useGetTeacherAttendanceReports(
    startDate,
    endDate,
  );

  // Calculate summary stats (SEKARANG TERMASUK TERLAMBAT)
  const totalTeachers = reports.length;
  const avgPresent =
    totalTeachers > 0
      ? Math.round(
          reports.reduce(
            (sum: number, t: any) =>
              sum +
              ((t.statistics?.presentDays || 0) /
                (t.statistics?.totalDays || 1)) *
                100,
            0,
          ) / totalTeachers,
        )
      : 0;
  const avgSick =
    totalTeachers > 0
      ? Math.round(
          reports.reduce(
            (sum: number, t: any) =>
              sum +
              ((t.statistics?.sickDays || 0) / (t.statistics?.totalDays || 1)) *
                100,
            0,
          ) / totalTeachers,
        )
      : 0;
  const avgAbsent =
    totalTeachers > 0
      ? Math.round(
          reports.reduce(
            (sum: number, t: any) =>
              sum +
              ((t.statistics?.absentDays || 0) /
                (t.statistics?.totalDays || 1)) *
                100,
            0,
          ) / totalTeachers,
        )
      : 0;
  const avgLate =
    totalTeachers > 0
      ? Math.round(
          reports.reduce(
            (sum: number, t: any) =>
              sum +
              ((t.statistics?.lateDays || 0) / (t.statistics?.totalDays || 1)) *
                100,
            0,
          ) / totalTeachers,
        )
      : 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-medium sm:text-sm">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-border w-full rounded-lg border px-3 py-2 text-xs sm:text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-2 block text-xs font-medium sm:text-sm">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-border w-full rounded-lg border px-3 py-2 text-xs sm:text-sm"
            />
          </div>
          <Button className="w-full text-xs sm:w-auto sm:text-sm">
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Summary Stats - SEKARANG TERMASUK TERLAMBAT */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xl font-bold sm:text-2xl">{totalTeachers}</p>
              <p className="text-muted-foreground text-xs">Total Guru</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-success text-xl font-bold sm:text-2xl">
                {avgPresent}%
              </p>
              <p className="text-muted-foreground text-xs">Rata-rata Hadir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-warning text-xl font-bold sm:text-2xl">
                {avgSick}%
              </p>
              <p className="text-muted-foreground text-xs">Rata-rata Sakit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-destructive text-xl font-bold sm:text-2xl">
                {avgAbsent}%
              </p>
              <p className="text-muted-foreground text-xs">Rata-rata Alfa</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-caution text-xl font-bold sm:text-2xl">
                {avgLate}%
              </p>
              <p className="text-muted-foreground text-xs">
                Rata-rata Terlambat
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">
                Detail Absensi Guru
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Periode: {format(new Date(startDate), "dd MMM yyyy")} -{" "}
                {format(new Date(endDate), "dd MMM yyyy")}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const result = await exportTeacherAttendanceToExcel(
                      reports,
                      startDate,
                      endDate,
                    );
                    if (result.success) {
                      toast.success(result.message);
                    } else {
                      toast.error(result.message);
                    }
                  } catch (error) {
                    toast.error("Gagal mengexport laporan");
                    console.error(error);
                  }
                }}
                className="w-full gap-1.5 text-xs sm:w-auto sm:gap-2 sm:text-sm"
                disabled={reports.length === 0}
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Export Ringkasan</span>
                <span className="sm:hidden">Ringkasan</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const result = await exportTeacherAttendanceDetailToExcel(
                      reports,
                      startDate,
                      endDate,
                    );
                    if (result.success) {
                      toast.success(result.message);
                    } else {
                      toast.error(result.message);
                    }
                  } catch (error) {
                    toast.error("Gagal mengexport laporan");
                    console.error(error);
                  }
                }}
                className="w-full gap-1.5 text-xs sm:w-auto sm:gap-2 sm:text-sm"
                disabled={reports.length === 0}
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Export Detail</span>
                <span className="sm:hidden">Detail</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2 sm:space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-12 animate-pulse rounded-lg sm:h-14"
                />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-muted-foreground py-6 text-center sm:py-8">
              <BarChart3 className="mx-auto mb-2 h-10 w-10 opacity-20 sm:h-12 sm:w-12" />
              <p className="text-xs sm:text-sm">
                Tidak ada data absensi untuk periode ini
              </p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {reports.map((teacher: any) => (
                <div
                  key={teacher.id}
                  className="border-border overflow-hidden rounded-lg border"
                >
                  {/* Summary Row */}
                  <div
                    className="bg-muted/50 hover:bg-muted cursor-pointer p-3 transition sm:p-4"
                    onClick={() =>
                      setExpandedTeacher(
                        expandedTeacher === teacher.id ? null : teacher.id,
                      )
                    }
                  >
                    <div className="flex items-start justify-between gap-2 sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold sm:text-sm">
                          {teacher.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {teacher.email}
                        </p>
                      </div>

                      {/* Mobile: Show percentage and toggle */}
                      <div className="flex shrink-0 items-center gap-2 sm:hidden">
                        <div className="text-right">
                          <p className="text-muted-foreground text-xs">
                            Kehadiran
                          </p>
                          <span className="text-success text-sm font-semibold">
                            {teacher.statistics?.presentPercentage}%
                          </span>
                        </div>
                        <button className="p-1">
                          {expandedTeacher === teacher.id ? (
                            <ChevronUp className="text-muted-foreground h-4 w-4" />
                          ) : (
                            <ChevronDown className="text-muted-foreground h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Desktop: Show all stats including terlambat */}
                      <div className="ml-4 hidden shrink-0 items-center gap-3 sm:flex lg:gap-4">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            Total Hari
                          </p>
                          <p className="text-sm font-semibold">
                            {teacher.statistics?.totalDays || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Hadir</p>
                          <span className="bg-success-chip text-success-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.presentDays || 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Sakit</p>
                          <span className="bg-warning-chip text-warning-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.sickDays || 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Izin</p>
                          <span className="bg-info-chip text-info-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.leaveDays || 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Alfa</p>
                          <span className="bg-destructive-chip text-destructive-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.absentDays || 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            Terlambat
                          </p>
                          <span className="bg-caution-chip text-caution-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.lateDays || 0}
                          </span>
                        </div>
                        <button className="p-1">
                          {expandedTeacher === teacher.id ? (
                            <ChevronUp className="text-muted-foreground h-4 w-4" />
                          ) : (
                            <ChevronDown className="text-muted-foreground h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Mobile: Expanded stats (include terlambat) */}
                    {expandedTeacher === teacher.id && (
                      <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 sm:hidden">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Total</p>
                          <p className="text-sm font-semibold">
                            {teacher.statistics?.totalDays || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Hadir</p>
                          <span className="bg-success-chip text-success-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.presentDays || 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Sakit</p>
                          <span className="bg-warning-chip text-warning-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.sickDays || 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Izin</p>
                          <span className="bg-info-chip text-info-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.leaveDays || 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">Alfa</p>
                          <span className="bg-destructive-chip text-destructive-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.absentDays || 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            Terlambat
                          </p>
                          <span className="bg-caution-chip text-caution-strong inline-block rounded px-2 py-1 text-xs font-semibold">
                            {teacher.statistics?.lateDays || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detail Attendances */}
                  {expandedTeacher === teacher.id &&
                    teacher.attendances &&
                    teacher.attendances.length > 0 && (
                      <div className="bg-card border-t">
                        <div className="divide-y">
                          {teacher.attendances.map((attendance: any) => {
                            const statusConfig =
                              STATUS_CONFIG[
                                attendance.status as AttendanceStatus
                              ];
                            const StatusIcon = statusConfig.icon;
                            return (
                              <div
                                key={attendance.id}
                                className="hover:bg-muted/50 p-3 transition"
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-muted-foreground text-xs font-medium">
                                      {format(
                                        new Date(attendance.date),
                                        "dd MMMM yyyy",
                                        {
                                          locale: id,
                                        },
                                      )}
                                    </p>
                                    {attendance.notes && (
                                      <p className="text-muted-foreground mt-1 text-xs">
                                        Catatan: {attendance.notes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
                                    {attendance.checkinTime && (
                                      <div className="text-left sm:text-right">
                                        <p className="text-muted-foreground text-xs">
                                          Jam Masuk
                                        </p>
                                        <p className="font-mono text-xs font-semibold sm:text-sm">
                                          {format(
                                            new Date(attendance.checkinTime),
                                            "HH:mm",
                                          )}
                                        </p>
                                      </div>
                                    )}
                                    <Badge
                                      className={`gap-1 text-xs ${statusConfig.bg} ${statusConfig.text} border-0 whitespace-nowrap`}
                                    >
                                      <StatusIcon className="h-3 w-3" />
                                      {statusConfig.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } =
    useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  if (
    userRole !== "Admin" &&
    userRole !== "Head Of School" &&
    userRole !== "Yayasan"
  ) {
    unauthorized();
    return null;
  }

  return <TeacherAttendancePage />;
}
