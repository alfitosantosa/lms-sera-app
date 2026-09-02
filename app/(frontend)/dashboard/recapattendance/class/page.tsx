"use client";

import { useGetAttendanceByClass } from "@/app/(hooks)/hooks/Attendances/useAttendanceByClass";
import { useGetClasses } from "@/app/(hooks)/hooks/Classes/useClass";
import { useGetStudents } from "@/app/(hooks)/hooks/Users/useStudents";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { attendanceTypes } from "@/app/(types)/types/attendance-types";
import { ClassDataTypes } from "@/app/(types)/types/class-types";
import { UserDataTypes } from "@/app/(types)/types/userData";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "@/lib/authClients";
import { exportClassAttendanceDailyToExcel } from "@/lib/export/exportClassAttendance";
import { DEFAULT_AVATAR } from "@/lib/imageLoader";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, Calendar, CheckCircle2, ChevronLeft, ChevronRight, Clock, Download, Users, XCircle } from "lucide-react";
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
  date.setDate(date.getDate());
  return date.toISOString().split("T")[0];
}

function getDefaultEndDate() {
  return new Date().toISOString().split("T")[0];
}

function RecapAttendanceByClass() {
  const { data: classes = [], isLoading: isLoadingClasses } = useGetClasses();
  const { data: students = [], isLoading: isLoadingStudents } = useGetStudents();
  const [selectedClass, setSelectedClass] = useState<ClassDataTypes | null>(null);
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const { data: attendanceResponse, isLoading } = useGetAttendanceByClass(selectedClass?.id, startDate, endDate);

  // Extract data from response
  const rawAttendanceData = attendanceResponse?.data?.attendances || [];
  const classStudents = attendanceResponse?.data?.students || [];

  // Deduplicate attendance: one record per student per day
  const uniqueAttendanceMap = new Map();
  rawAttendanceData.forEach((attendance: attendanceTypes) => {
    if (!attendance.date || !attendance.studentId) return;
    const dateStr = format(new Date(attendance.date), "yyyy-MM-dd");
    const key = `${attendance.studentId}-${dateStr}`;
    uniqueAttendanceMap.set(key, attendance);
  });
  const attendanceData = Array.from(uniqueAttendanceMap.values());

  // Use students from attendance response if available, otherwise filter from all students
  const filteredStudents =
    classStudents.length > 0 ? classStudents
    : selectedClass ? students.filter((student: UserDataTypes) => student.classId === selectedClass.id)
    : [];

  // Group attendance by date
  const attendanceByDate: Record<string, attendanceTypes[]> = {};
  attendanceData.forEach((attendance: attendanceTypes) => {
    if (!attendance.date) return;
    const date = format(new Date(attendance.date), "yyyy-MM-dd");
    if (!attendanceByDate[date]) {
      attendanceByDate[date] = [];
    }
    attendanceByDate[date].push(attendance);
  });

  const sortedDates = Object.keys(attendanceByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const totalPages = Math.ceil(sortedDates.length / itemsPerPage);
  const paginatedDates = sortedDates.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // Calculate statistics
  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter((a) => a.status === "present").length,
    late: attendanceData.filter((a) => a.status === "late").length,
    sick: attendanceData.filter((a) => a.status === "sick").length,
    excused: attendanceData.filter((a) => a.status === "excused").length,
    absent: attendanceData.filter((a) => a.status === "absent").length,
  };

  const handleExportDaily = async () => {
    if (!selectedClass || attendanceData.length === 0) return;
    const result = await exportClassAttendanceDailyToExcel(selectedClass, attendanceByDate, filteredStudents, startDate, endDate);
    if (result.success) {
      console.log(result.message);
    } else {
      console.error(result.message);
    }
  };

  if (isLoadingClasses || isLoadingStudents) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Rekap Absensi Kelas</h1>
          <p className="text-gray-600">Lihat rekap kehadiran per kelas dan periode</p>
        </div>

        {/* Filter Section */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pilih Kelas</label>
                <Select
                  value={selectedClass?.id || ""}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedClass({ id: "all", name: "Semua Kelas" } as ClassDataTypes);
                    } else {
                      const classData = classes.find((c: ClassDataTypes) => c.id === value);
                      setSelectedClass(classData || null);
                    }
                    setCurrentPage(0);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih kelas..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Semua Kelas</span>
                      </div>
                    </SelectItem>
                    {classes.map((classItem: ClassDataTypes) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{classItem.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Dari Tanggal</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sampai Tanggal</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>

            {selectedClass && attendanceData.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button onClick={handleExportDaily} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export ke Excel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Info & Statistics */}
        {selectedClass && (
          <>
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  {selectedClass.name}
                </CardTitle>
                <CardDescription>
                  {filteredStudents.length} siswa • {format(new Date(startDate), "dd MMM yyyy", { locale: id })} - {format(new Date(endDate), "dd MMM yyyy", { locale: id })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-sm text-gray-600 mt-1">Total</p>
                  </div>

                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    const count = stats[key as keyof typeof stats];
                    return (
                      <div key={key} className={`${config.bg} rounded-lg p-4 border border-gray-200`}>
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-2 bg-white rounded-full">
                            <Icon className={`w-5 h-5 ${config.text}`} />
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className="text-xs text-gray-700 mt-1">{config.label}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Daily Attendance Details */}
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      Detail Absensi Harian
                    </CardTitle>
                    <CardDescription className="mt-1">Kehadiran siswa per tanggal</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {sortedDates.length} hari
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ?
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                : paginatedDates.length === 0 ?
                  <div className="py-12 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium">Tidak ada data absensi</p>
                    <p className="text-sm text-gray-400 mt-1">Silakan pilih periode lain</p>
                  </div>
                : <div className="space-y-4">
                    {paginatedDates.map((date) => {
                      const dailyAttendances = attendanceByDate[date] || [];

                      return (
                        <div key={date} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <div className="bg-gradient-to-r from-gray-50 to-transparent p-4 border-b">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h3 className="font-semibold text-gray-900">{format(new Date(date), "EEEE, dd MMMM yyyy", { locale: id })}</h3>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                                  const count = dailyAttendances.filter((a: attendanceTypes) => a.status === key).length;
                                  if (count === 0) return null;
                                  const Icon = config.icon;
                                  return (
                                    <Badge key={key} className={`${config.bg} ${config.text} border-0 gap-1`}>
                                      <Icon className="w-3 h-3" />
                                      {config.label}: {count}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-white">
                            {dailyAttendances.length === 0 ?
                              <p className="text-sm text-gray-500 text-center py-4">Tidak ada data kehadiran</p>
                            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {dailyAttendances.map((attendance: attendanceTypes) => {
                                  const student = filteredStudents.find((s: UserDataTypes) => s.id === attendance.studentId);
                                  const config = STATUS_CONFIG[attendance.status as keyof typeof STATUS_CONFIG];

                                  if (!config) return null;

                                  const Icon = config.icon;

                                  return (
                                    <div key={attendance.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                      <ImageWithFallback src={student?.avatarUrl || DEFAULT_AVATAR} alt={student?.name || "Student"} width={40} height={40} className="rounded-full ring-2 ring-white" fallback={DEFAULT_AVATAR} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{student?.name || "Unknown Student"}</p>
                                        <p className="text-xs text-gray-500 truncate">NISN: {student?.nisn || "-"}</p>
                                      </div>
                                      <Badge className={`${config.bg} ${config.text} border-0 gap-1 flex-shrink-0`}>
                                        <Icon className="w-3 h-3" />
                                        {config.label}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            }
                          </div>
                        </div>
                      );
                    })}
                  </div>
                }

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t">
                    <div className="text-sm text-gray-600">
                      Halaman {currentPage + 1} dari {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Sebelumnya
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>
                        Selanjutnya
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State when no class selected */}
        {!selectedClass && (
          <Card className="shadow-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Kelas</h3>
                <p className="text-gray-500">Silakan pilih kelas untuk melihat rekap absensi</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function RecapAttendanceByClassPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  if (userRole !== "Admin") {
    if (userRole !== "Teacher") {
      if (userRole !== "Head Of School") {
        if (userRole !== "Yayasan") {
          unauthorized();
          return null;
        }
      }
    }
  }

  return <RecapAttendanceByClass />;
}
