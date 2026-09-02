"use client";

import { useBulkCreateTeacherAttendance, useDeleteTeacherAttendance, useGetTeacherAttendance, useGetTeacherAttendanceReports, useUpdateTeacherAttendance } from "@/app/(hooks)/hooks/TeacherAttendance/useTeacherAttendance";
import { useGetTeachers } from "@/app/(hooks)/hooks/Users/useTeachers";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import type { AttendanceStats, AttendanceStatus, CheckinTabProps, StatusConfigMap, TeacherAttendanceRecord } from "@/app/(types)/types/teacher-attendance-types";
import Loading from "@/components/loading";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/authClients";
import { exportTeacherAttendanceDetailToExcel, exportTeacherAttendanceToExcel } from "@/lib/export/exportTeacherAttendances";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Activity, BarChart3, Calendar, Check, ChevronDown, ChevronUp, Clock, Download, Edit2, FileText, Plus, Search, Trash2, X } from "lucide-react";
import { unauthorized } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_CONFIG: StatusConfigMap = {
  hadir: {
    color: "text-white",
    label: "Hadir",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: Check,
  },
  sakit: {
    color: "text-white",
    label: "Sakit",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: Activity,
  },
  izin: {
    color: "text-white",
    label: "Izin",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: FileText,
  },
  alfa: {
    color: "text-white",
    label: "Alfa",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: X,
  },
  terlambat: {
    color: "white",
    label: "Terlambat",
    bg: "bg-orange-100",
    text: "text-orange-700",
    icon: Clock,
  },
};

// Stats yang ditampilkan di UI (SEKARANG TERMASUK TERLAMBAT)
const VISIBLE_STATS: AttendanceStatus[] = ["hadir", "sakit", "izin", "alfa", "terlambat"];

function TeacherAttendancePage() {
  const { data: session } = useSession();
  const { data: adminData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  return (
    <div className="">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Absensi Guru</h1>
        <p className="text-sm sm:text-base text-gray-600">Kelola kehadiran dan lihat laporan absensi guru</p>
      </div>

      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="checkin" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Check-in
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Laporan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
          <CheckinTab adminId={adminData?.id} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
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
  const [editingRecord, setEditingRecord] = useState<TeacherAttendanceRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<TeacherAttendanceRecord | null>(null);
  const [bulkStatus, setBulkStatus] = useState<AttendanceStatus>("hadir");
  const [editStatus, setEditStatus] = useState<AttendanceStatus>("hadir");
  const [bulkNotes, setBulkNotes] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: attendance = [], isLoading } = useGetTeacherAttendance(date);
  const { mutate: bulkCreateAttendance, isPending: isBulkPending } = useBulkCreateTeacherAttendance();
  const { mutate: updateAttendance, isPending: isUpdatePending } = useUpdateTeacherAttendance();
  const { mutate: deleteAttendance, isPending: isDeletePending } = useDeleteTeacherAttendance();
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
    hadir: attendance.filter((a: TeacherAttendanceRecord) => a.status === "hadir").length,
    sakit: attendance.filter((a: TeacherAttendanceRecord) => a.status === "sakit").length,
    izin: attendance.filter((a: TeacherAttendanceRecord) => a.status === "izin").length,
    alfa: attendance.filter((a: TeacherAttendanceRecord) => a.status === "alfa").length,
    terlambat: attendance.filter((a: TeacherAttendanceRecord) => a.status === "terlambat").length,
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Date & Search */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 hidden sm:block" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium" />
          <span className="text-xs sm:text-sm text-gray-600">{format(new Date(date), "EEEE, dd MMMM yyyy", { locale: id })}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input placeholder="Cari guru..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 text-sm" />
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
              <Button variant="default" className="gap-1.5 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm py-2">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Absensi Guru</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-150 max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Bulk Check-in Absensi Guru</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">Catat absensi untuk beberapa guru sekaligus</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium block mb-2">Pilih Guru ({selectedTeachers.length})</label>
                  <div className="border border-gray-300 rounded-lg max-h-40 sm:max-h-48 overflow-y-auto p-2 sm:p-3 space-y-2">
                    {teachers.map((teacher: any) => (
                      <div key={teacher.id} className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="checkbox"
                          id={`teacher-${teacher.id}`}
                          checked={selectedTeachers.includes(teacher.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeachers([...selectedTeachers, teacher.id]);
                            } else {
                              setSelectedTeachers(selectedTeachers.filter((id) => id !== teacher.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 cursor-pointer shrink-0"
                        />
                        <label htmlFor={`teacher-${teacher.id}`} className="flex-1 cursor-pointer min-w-0">
                          <p className="text-xs sm:text-sm font-medium truncate">{teacher.name}</p>
                          <p className="text-xs text-gray-600 truncate">{teacher.email}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium block mb-2">Status Kehadiran</label>
                  <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as AttendanceStatus)}>
                    <SelectTrigger className="text-xs sm:text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]][]).map(([key, config]) => (
                        <SelectItem key={key} value={key} className="text-xs sm:text-sm">
                          {config?.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium block mb-2">Catatan (Opsional)</label>
                  <Input placeholder="Masukkan catatan..." value={bulkNotes} onChange={(e) => setBulkNotes(e.target.value)} className="text-xs sm:text-sm" />
                </div>

                <Button onClick={handleBulkSubmit} disabled={isBulkPending || selectedTeachers.length === 0} className="w-full text-xs sm:text-sm" size="lg">
                  {isBulkPending ? "Menyimpan..." : `Simpan Absensi (${selectedTeachers.length})`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats - SEKARANG MENAMPILKAN 5 STATS TERMASUK TERLAMBAT */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
        {VISIBLE_STATS.map((key) => {
          const config = STATUS_CONFIG[key];
          const count = stats[key];
          const Icon = config?.icon;
          return (
            <Card key={key}>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${config?.bg} shrink-0`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config?.text}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold">{count}</p>
                    <p className="text-xs text-gray-600 truncate">{config?.label}</p>
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
          <CardTitle className="text-base sm:text-lg">Daftar Absensi ({attendance.length})</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Guru yang sudah melakukan check-in</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ?
            <div className="space-y-2 sm:space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 sm:h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          : attendance.length === 0 ?
            <div className="py-6 sm:py-8 text-center text-gray-500">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-20" />
              <p className="text-xs sm:text-sm">Belum ada absensi untuk tanggal ini</p>
            </div>
          : <div className="space-y-2 max-h-96 overflow-y-auto">
              {attendance.map((record: TeacherAttendanceRecord) => {
                const config = STATUS_CONFIG[record.status];
                const Icon = config.icon;
                return (
                  <div key={record.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition gap-2 sm:gap-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs sm:text-sm truncate">{record.teacher?.name}</p>
                      <p className="text-xs text-gray-600 truncate">{record.teacher?.email}</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 sm:ml-4 shrink-0">
                      {record.checkinTime && (
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-gray-600">Check-in</p>
                          <p className="font-mono text-xs sm:text-sm font-semibold">{format(new Date(record.checkinTime), "HH:mm")}</p>
                        </div>
                      )}
                      <Badge className={`gap-1 text-xs ${config.bg} ${config.text} border-0 whitespace-nowrap`}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog_(record)} className="h-7 w-7 sm:h-8 sm:w-8 p-0">
                          <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteDialog_(record)} className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:text-red-600">
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="w-[95vw] max-w-125 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Absensi Guru</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Ubah status kehadiran dan catatan</DialogDescription>
          </DialogHeader>

          {editingRecord && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs sm:text-sm font-semibold text-blue-900">{editingRecord.teacher?.name}</p>
                <p className="text-xs text-blue-700">{editingRecord.teacher?.email}</p>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium block mb-2">Status Kehadiran</label>
                <Select value={editStatus} onValueChange={(value) => setEditStatus(value as AttendanceStatus)}>
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]][]).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-xs sm:text-sm">
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium block mb-2">Catatan (Opsional)</label>
                <Input placeholder="Masukkan catatan..." value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="text-xs sm:text-sm" />
              </div>

              <Button onClick={handleEditSubmit} disabled={isUpdatePending} className="w-full text-xs sm:text-sm" size="lg">
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
            <AlertDialogTitle className="text-base sm:text-lg">Hapus Absensi</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">Apakah Anda yakin ingin menghapus absensi untuk {deletingRecord?.teacher?.name}? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <AlertDialogCancel className="text-xs sm:text-sm mt-0">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSubmit} disabled={isDeletePending} className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm">
              {isDeletePending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReportsTab() {
  const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 62)), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);

  const { data: reports = [], isLoading } = useGetTeacherAttendanceReports(startDate, endDate);

  // Calculate summary stats (SEKARANG TERMASUK TERLAMBAT)
  const totalTeachers = reports.length;
  const avgPresent = totalTeachers > 0 ? Math.round(reports.reduce((sum: number, t: any) => sum + ((t.statistics?.presentDays || 0) / (t.statistics?.totalDays || 1)) * 100, 0) / totalTeachers) : 0;
  const avgSick = totalTeachers > 0 ? Math.round(reports.reduce((sum: number, t: any) => sum + ((t.statistics?.sickDays || 0) / (t.statistics?.totalDays || 1)) * 100, 0) / totalTeachers) : 0;
  const avgAbsent = totalTeachers > 0 ? Math.round(reports.reduce((sum: number, t: any) => sum + ((t.statistics?.absentDays || 0) / (t.statistics?.totalDays || 1)) * 100, 0) / totalTeachers) : 0;
  const avgLate = totalTeachers > 0 ? Math.round(reports.reduce((sum: number, t: any) => sum + ((t.statistics?.lateDays || 0) / (t.statistics?.totalDays || 1)) * 100, 0) / totalTeachers) : 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex-1">
            <label className="text-xs sm:text-sm font-medium block mb-2">Dari Tanggal</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm" />
          </div>
          <div className="flex-1">
            <label className="text-xs sm:text-sm font-medium block mb-2">Sampai Tanggal</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm" />
          </div>
          <Button className="text-xs sm:text-sm w-full sm:w-auto">Refresh</Button>
        </CardContent>
      </Card>

      {/* Summary Stats - SEKARANG TERMASUK TERLAMBAT */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold">{totalTeachers}</p>
              <p className="text-xs text-gray-600">Total Guru</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-600">{avgPresent}%</p>
              <p className="text-xs text-gray-600">Rata-rata Hadir</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{avgSick}%</p>
              <p className="text-xs text-gray-600">Rata-rata Sakit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-red-600">{avgAbsent}%</p>
              <p className="text-xs text-gray-600">Rata-rata Alfa</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{avgLate}%</p>
              <p className="text-xs text-gray-600">Rata-rata Terlambat</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">Detail Absensi Guru</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Periode: {format(new Date(startDate), "dd MMM yyyy")} - {format(new Date(endDate), "dd MMM yyyy")}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const result = await exportTeacherAttendanceToExcel(reports, startDate, endDate);
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
                className="gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto"
                disabled={reports.length === 0}
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export Ringkasan</span>
                <span className="sm:hidden">Ringkasan</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const result = await exportTeacherAttendanceDetailToExcel(reports, startDate, endDate);
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
                className="gap-1.5 sm:gap-2 text-xs sm:text-sm w-full sm:w-auto"
                disabled={reports.length === 0}
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export Detail</span>
                <span className="sm:hidden">Detail</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ?
            <div className="space-y-2 sm:space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 sm:h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          : reports.length === 0 ?
            <div className="py-6 sm:py-8 text-center text-gray-500">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-20" />
              <p className="text-xs sm:text-sm">Tidak ada data absensi untuk periode ini</p>
            </div>
          : <div className="space-y-2 sm:space-y-3">
              {reports.map((teacher: any) => (
                <div key={teacher.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Summary Row */}
                  <div className="p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer" onClick={() => setExpandedTeacher(expandedTeacher === teacher.id ? null : teacher.id)}>
                    <div className="flex items-start sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs sm:text-sm truncate">{teacher.name}</p>
                        <p className="text-xs text-gray-600 truncate">{teacher.email}</p>
                      </div>

                      {/* Mobile: Show percentage and toggle */}
                      <div className="flex sm:hidden items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-600">Kehadiran</p>
                          <span className="font-semibold text-green-600 text-sm">{teacher.statistics?.presentPercentage}%</span>
                        </div>
                        <button className="p-1">
                          {expandedTeacher === teacher.id ?
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </button>
                      </div>

                      {/* Desktop: Show all stats including terlambat */}
                      <div className="hidden sm:flex items-center gap-3 lg:gap-4 ml-4 shrink-0">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Total Hari</p>
                          <p className="font-semibold text-sm">{teacher.statistics?.totalDays || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Hadir</p>
                          <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">{teacher.statistics?.presentDays || 0}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Sakit</p>
                          <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">{teacher.statistics?.sickDays || 0}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Izin</p>
                          <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">{teacher.statistics?.leaveDays || 0}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Alfa</p>
                          <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold">{teacher.statistics?.absentDays || 0}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Terlambat</p>
                          <span className="inline-block px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs font-semibold">{teacher.statistics?.lateDays || 0}</span>
                        </div>
                        <button className="p-1">
                          {expandedTeacher === teacher.id ?
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </button>
                      </div>
                    </div>

                    {/* Mobile: Expanded stats (include terlambat) */}
                    {expandedTeacher === teacher.id && (
                      <div className="sm:hidden mt-3 pt-3 border-t grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Total</p>
                          <p className="font-semibold text-sm">{teacher.statistics?.totalDays || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Hadir</p>
                          <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">{teacher.statistics?.presentDays || 0}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Sakit</p>
                          <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">{teacher.statistics?.sickDays || 0}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Izin</p>
                          <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">{teacher.statistics?.leaveDays || 0}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Alfa</p>
                          <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold">{teacher.statistics?.absentDays || 0}</span>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Terlambat</p>
                          <span className="inline-block px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs font-semibold">{teacher.statistics?.lateDays || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Detail Attendances */}
                  {expandedTeacher === teacher.id && teacher.attendances && teacher.attendances.length > 0 && (
                    <div className="border-t bg-white">
                      <div className="divide-y">
                        {teacher.attendances.map((attendance: any) => {
                          const statusConfig = STATUS_CONFIG[attendance.status as AttendanceStatus];
                          const StatusIcon = statusConfig.icon;
                          return (
                            <div key={attendance.id} className="p-3 hover:bg-gray-50 transition">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-600">
                                    {format(new Date(attendance.date), "dd MMMM yyyy", {
                                      locale: id,
                                    })}
                                  </p>
                                  {attendance.notes && <p className="text-xs text-gray-500 mt-1">Catatan: {attendance.notes}</p>}
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                                  {attendance.checkinTime && (
                                    <div className="text-left sm:text-right">
                                      <p className="text-xs text-gray-600">Jam Masuk</p>
                                      <p className="font-mono text-xs sm:text-sm font-semibold">{format(new Date(attendance.checkinTime), "HH:mm")}</p>
                                    </div>
                                  )}
                                  <Badge className={`gap-1 text-xs ${statusConfig.bg} ${statusConfig.text} border-0 whitespace-nowrap`}>
                                    <StatusIcon className="w-3 h-3" />
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
          }
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  if (userRole !== "Admin" && userRole !== "Head Of School" && userRole !== "Yayasan") {
    unauthorized();
    return null;
  }

  return <TeacherAttendancePage />;
}
