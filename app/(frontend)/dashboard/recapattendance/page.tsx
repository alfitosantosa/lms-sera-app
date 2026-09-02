"use client";

import { useGetAttendanceByIdStudent } from "@/app/(hooks)/hooks/Attendances/useAttendaceByIdStudent";
import { useGetStudents } from "@/app/(hooks)/hooks/Users/useStudents";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/lib/authClients";
import { exportStudentAttendanceDailyToExcel, exportStudentAttendanceDetailToExcel } from "@/lib/export/exportStudentAttendance";
import { DEFAULT_AVATAR } from "@/lib/imageLoader";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, BarChart3, Calendar, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Download, Search, User, XCircle } from "lucide-react";
import { unauthorized } from "next/navigation";
import { useState } from "react";

const STATUS_CONFIG = {
  present: { label: "Hadir", bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
  late: { label: "Terlambat", bg: "bg-orange-100", text: "text-orange-800", icon: Clock },
  excused: { label: "Izin", bg: "bg-blue-100", text: "text-blue-800", icon: AlertCircle },
  sick: { label: "Sakit", bg: "bg-yellow-100", text: "text-yellow-800", icon: AlertCircle },
  absent: { label: "Alfa", bg: "bg-red-100", text: "text-red-800", icon: XCircle },
};

function getDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 31);
  return date.toISOString().split("T")[0];
}

function getDefaultEndDate() {
  return new Date().toISOString().split("T")[0];
}

function RecapAttendance() {
  const { data: students = [], isLoading: isLoadingStudents } = useGetStudents();
  const [selectedStudent, setSelectedStudent] = useState<any>({});
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [search, setSearch] = useState("");
  const [expandedDate, setExpandedDate] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Get attendance data for selected student
  const { data: attendances = [], isLoading: isLoadingAttendances } = useGetAttendanceByIdStudent(selectedStudent?.id || "");

  // Filter attendances by date range
  const filteredAttendances = attendances.filter((att: any) => {
    if (!att.date) return false;
    const attDate = new Date(att.date);
    return attDate >= new Date(startDate) && attDate <= new Date(endDate);
  });

  // Filter students based on search
  const filteredStudents = students.filter(
    (student: any) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase()) ||
      student.nisn?.toLowerCase().includes(search.toLowerCase()) ||
      student.avatarUrl?.toLowerCase().includes(search.toLowerCase()),
  );

  // Sort attendances by date (newest first)
  const sortedAttendances = [...filteredAttendances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination calculations
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const totalPages = Math.ceil(sortedAttendances.length / itemsPerPage);
  const paginatedAttendances = sortedAttendances.slice(startIndex, endIndex);
  const stats = {
    total: filteredAttendances.length,
    present: filteredAttendances.filter((a: any) => a.status === "present").length,
    late: filteredAttendances.filter((a: any) => a.status === "late").length,
    excused: filteredAttendances.filter((a: any) => a.status === "excused").length,
    sick: filteredAttendances.filter((a: any) => a.status === "sick").length,
    absent: filteredAttendances.filter((a: any) => a.status === "absent").length,
  };

  const presentPercentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  // Export handlers
  const handleExportDaily = async () => {
    if (!selectedStudent || filteredAttendances.length === 0) return;

    const result = await exportStudentAttendanceDailyToExcel(selectedStudent, filteredAttendances, startDate, endDate);
  };

  const handleExportSummary = async () => {
    if (!selectedStudent || filteredAttendances.length === 0) return;

    // const result = await exportStudentAttendanceToExcel(selectedStudent, filteredAttendances, startDate, endDate);
  };

  const handleExportDetail = async () => {
    if (!selectedStudent || filteredAttendances.length === 0) return;

    const result = await exportStudentAttendanceDetailToExcel(selectedStudent, filteredAttendances, startDate, endDate);

    if (result.success) {
      console.log(result.message);
    } else {
      console.error(result.message);
    }
  };

  // Show loading while fetching data
  if (isLoadingStudents) {
    return <Loading />;
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto min-h-screen">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Rekap Absensi Siswa</h1>
          <p className="text-sm sm:text-base text-gray-600">Lihat rekap kehadiran siswa per periode</p>
        </div>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Pilih Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input placeholder="Cari nama siswa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 text-sm" />
              </div>
              <Select
                value={selectedStudent?.id || ""}
                onValueChange={(value) => {
                  const student = students.find((s: any) => s.id === value);
                  setSelectedStudent(student);
                }}
              >
                <SelectTrigger className="text-xs sm:text-sm w-full sm:w-80">
                  <SelectValue placeholder="Pilih siswa..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((student: any) => (
                    <SelectItem key={student.id} value={student.id} className="text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <ImageWithFallback src={student.avatarUrl || DEFAULT_AVATAR} alt="User avatar" width={20} height={20} className="rounded-full" fallback={DEFAULT_AVATAR} />
                        <div className="flex flex-col">
                          <span className="truncate">{student.name}</span>
                          <span className="text-xs text-gray-500 truncate">
                            {student.email} {student.nisn && `• ${student.nisn}`}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex flex-row items-center gap-3">
                  <ImageWithFallback src={selectedStudent.avatarUrl || DEFAULT_AVATAR} alt="User avatar" width={40} height={40} className="rounded-full" fallback={DEFAULT_AVATAR} />
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-blue-900">{selectedStudent.name}</p>
                    <p className="text-xs text-blue-700">
                      {selectedStudent.email} {selectedStudent.nisn && `• NISN: ${selectedStudent.nisn}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Filter Periode</CardTitle>
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
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-6">
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </CardContent>
          </Card>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = stats[key as keyof typeof stats];
            return (
              <Card key={key}>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${config.bg} shrink-0`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${config.text}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold">{count}</p>
                      <p className="text-xs text-gray-600 truncate">{config.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Attendance Details */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-base sm:text-lg">Detail Kehadiran</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Periode: {format(new Date(startDate), "dd MMM yyyy", { locale: id })} - {format(new Date(endDate), "dd MMM yyyy", { locale: id })}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-600">{presentPercentage}% Kehadiran</span>
                </div>
                {selectedStudent && filteredAttendances.length > 0 && (
                  <div className="flex flex-wrap justify-center items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportDaily}>
                      <Download className="w-4 h-4 mr-1" />
                      Export Harian
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportSummary} className="text-xs">
                      <Download className="w-4 h-4 mr-1" />
                      Export Ringkasan
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportDetail} className="text-xs">
                      <Download className="w-4 h-4 mr-1" />
                      Export Detail
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAttendances ?
              <div className="space-y-2 sm:space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 sm:h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            : !selectedStudent ?
              <div className="py-6 sm:py-8 text-center text-gray-500">
                <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-20" />
                <p className="text-xs sm:text-sm">Silakan pilih siswa terlebih dahulu</p>
              </div>
            : filteredAttendances.length === 0 ?
              <div className="py-6 sm:py-8 text-center text-gray-500">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-20" />
                <p className="text-xs sm:text-sm">Tidak ada data absensi untuk periode ini</p>
              </div>
            : <>
                <div className="space-y-2 sm:space-y-3">
                  {paginatedAttendances.map((attendance: any) => {
                    const statusConfig = STATUS_CONFIG[attendance.status as keyof typeof STATUS_CONFIG];
                    const StatusIcon = statusConfig.icon;
                    const isExpanded = expandedDate === attendance.id;

                    return (
                      <div key={attendance.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Summary Row */}
                        <div className="p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer" onClick={() => setExpandedDate(isExpanded ? null : attendance.id)}>
                          <div className="flex items-start sm:items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs sm:text-sm">{format(new Date(attendance.date), "EEEE, dd MMMM yyyy", { locale: id })}</p>
                              <p className="text-xs text-gray-600">
                                {attendance.schedule?.subject?.name || "Mata Pelajaran"} - {attendance.schedule?.teacher?.name || "Guru"}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              <Badge className={`gap-1 text-xs ${statusConfig.bg} ${statusConfig.text} border-0`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </Badge>
                              <button className="p-1">
                                {isExpanded ?
                                  <ChevronUp className="w-4 h-4 text-gray-500" />
                                : <ChevronDown className="w-4 h-4 text-gray-500" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t bg-white p-3 sm:p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-gray-600">Mata Pelajaran</p>
                                <p className="text-sm font-medium">{attendance.schedule?.subject?.name || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Kode</p>
                                <p className="text-sm font-medium">{attendance.schedule?.subject?.code || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Guru</p>
                                <p className="text-sm font-medium">{attendance.schedule?.teacher?.name || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Ruangan</p>
                                <p className="text-sm font-medium">{attendance.schedule?.room || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Waktu</p>
                                <p className="text-sm font-medium">
                                  {attendance.schedule?.startTime || "-"} - {attendance.schedule?.endTime || "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Tanggal</p>
                                <p className="text-sm font-medium">{format(new Date(attendance.date), "dd MMMM yyyy", { locale: id })}</p>
                              </div>
                            </div>

                            {attendance.notes && (
                              <div className="pt-3 border-t">
                                <p className="text-xs text-gray-600 mb-1">Catatan</p>
                                <p className="text-sm">{attendance.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between px-2 mt-4">
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {startIndex + 1}-{Math.min(endIndex, sortedAttendances.length)} dari {sortedAttendances.length} data
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p: number) => Math.max(0, p - 1))} disabled={currentPage === 0}>
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Halaman {currentPage + 1} dari {totalPages}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p: number) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            }
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  // Show loading while checking authorization
  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check if user is Admin and Teacher
  if (userRole !== "Teacher") {
    if (userRole !== "Admin") {
      if (userRole !== "Head Of School") {
        if (userRole !== "Yayasan") {
          unauthorized();
          return null;
        }
      }
    }
  }

  // Render dashboard only after authorization is confirmed
  return <RecapAttendance />;
}
