"use client";

import { useGetAttendanceByClass } from "@/app/(hooks)/hooks/Attendances/useAttendanceByClass";
import { useGetClasses } from "@/app/(hooks)/hooks/Classes/useClass";
import { useGetStudents } from "@/app/(hooks)/hooks/Users/useStudents";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { type attendanceTypes } from "@/app/(types)/types/attendance-types";
import { type ClassDataTypes } from "@/app/(types)/types/class-types";
import { type UserDataTypes } from "@/app/(types)/types/userData-types";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/authClients";
import { exportClassAttendanceDailyToExcel } from "@/lib/export/exportClassAttendance";
import { DEFAULT_AVATAR } from "@/lib/imageLoader";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Users,
  XCircle,
} from "lucide-react";
import { unauthorized } from "next/navigation";
import { useState } from "react";

const STATUS_CONFIG = {
  present: {
    label: "Hadir",
    bg: "bg-success-chip",
    text: "text-success-strong",
    icon: CheckCircle2,
  },
  late: {
    label: "Terlambat",
    bg: "bg-caution-chip",
    text: "text-caution-strong",
    icon: Clock,
  },
  excused: {
    label: "Izin",
    bg: "bg-info-chip",
    text: "text-info-strong",
    icon: AlertCircle,
  },
  sick: {
    label: "Sakit",
    bg: "bg-warning-chip",
    text: "text-warning-strong",
    icon: AlertCircle,
  },
  absent: {
    label: "Alfa",
    bg: "bg-destructive-chip",
    text: "text-destructive-strong",
    icon: XCircle,
  },
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
  const { data: students = [], isLoading: isLoadingStudents } =
    useGetStudents();
  const [selectedClass, setSelectedClass] = useState<ClassDataTypes | null>(
    null,
  );
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const { data: attendanceResponse, isLoading } = useGetAttendanceByClass(
    selectedClass?.id,
    startDate,
    endDate,
  );

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
    classStudents.length > 0
      ? classStudents
      : selectedClass
        ? students.filter(
            (student: UserDataTypes) => student.classId === selectedClass.id,
          )
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

  const sortedDates = Object.keys(attendanceByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );
  const totalPages = Math.ceil(sortedDates.length / itemsPerPage);
  const paginatedDates = sortedDates.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

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
    const result = await exportClassAttendanceDailyToExcel(
      selectedClass,
      attendanceByDate,
      filteredStudents,
      startDate,
      endDate,
    );
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
    <div className="bg-muted/50 min-h-screen">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Rekap Absensi Kelas
          </h1>
          <p className="text-muted-foreground">
            Lihat rekap kehadiran per kelas dan periode
          </p>
        </div>

        {/* Filter Section */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="text-muted-foreground h-5 w-5" />
              Filter Data
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">
                  Pilih Kelas
                </label>
                <Select
                  value={selectedClass?.id || ""}
                  onValueChange={(value) => {
                    if (value === "all") {
                      setSelectedClass({
                        id: "all",
                        name: "Semua Kelas",
                      } as ClassDataTypes);
                    } else {
                      const classData = classes.find(
                        (c: ClassDataTypes) => c.id === value,
                      );
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
                        <Users className="h-4 w-4" />
                        <span>Semua Kelas</span>
                      </div>
                    </SelectItem>
                    {classes.map((classItem: ClassDataTypes) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{classItem.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-border focus:ring-info w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-foreground text-sm font-medium">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-border focus:ring-info w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2"
                />
              </div>
            </div>

            {selectedClass && attendanceData.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <Button onClick={handleExportDaily} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export ke Excel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Info & Statistics */}
        {selectedClass && (
          <>
            <Card className="border-l-info border-l-4 shadow-sm">
              <CardHeader className="from-info-surface bg-gradient-to-r to-transparent">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="text-info h-5 w-5" />
                  {selectedClass.name}
                </CardTitle>
                <CardDescription>
                  {filteredStudents.length} siswa •{" "}
                  {format(new Date(startDate), "dd MMM yyyy", { locale: id })} -{" "}
                  {format(new Date(endDate), "dd MMM yyyy", { locale: id })}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="bg-muted/50 border-border rounded-lg border p-4 text-center">
                    <p className="text-foreground text-3xl font-bold">
                      {stats.total}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">Total</p>
                  </div>

                  {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    const count = stats[key as keyof typeof stats];
                    return (
                      <div
                        key={key}
                        className={`${config.bg} border-border rounded-lg border p-4`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-card rounded-full p-2">
                            <Icon className={`h-5 w-5 ${config.text}`} />
                          </div>
                          <div className="text-center">
                            <p className="text-foreground text-2xl font-bold">
                              {count}
                            </p>
                            <p className="text-foreground mt-1 text-xs">
                              {config.label}
                            </p>
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
              <CardHeader className="bg-muted/50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="text-muted-foreground h-5 w-5" />
                      Detail Absensi Harian
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Kehadiran siswa per tanggal
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {sortedDates.length} hari
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-muted h-24 animate-pulse rounded-lg"
                      />
                    ))}
                  </div>
                ) : paginatedDates.length === 0 ? (
                  <div className="py-12 text-center">
                    <Calendar className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                    <p className="text-muted-foreground font-medium">
                      Tidak ada data absensi
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Silakan pilih periode lain
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedDates.map((date) => {
                      const dailyAttendances = attendanceByDate[date] || [];

                      return (
                        <div
                          key={date}
                          className="border-border overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
                        >
                          <div className="from-muted/50 border-b bg-gradient-to-r to-transparent p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="text-foreground font-semibold">
                                {format(new Date(date), "EEEE, dd MMMM yyyy", {
                                  locale: id,
                                })}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(STATUS_CONFIG).map(
                                  ([key, config]) => {
                                    const count = dailyAttendances.filter(
                                      (a: attendanceTypes) => a.status === key,
                                    ).length;
                                    if (count === 0) return null;
                                    const Icon = config.icon;
                                    return (
                                      <Badge
                                        key={key}
                                        className={`${config.bg} ${config.text} gap-1 border-0`}
                                      >
                                        <Icon className="h-3 w-3" />
                                        {config.label}: {count}
                                      </Badge>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-card p-4">
                            {dailyAttendances.length === 0 ? (
                              <p className="text-muted-foreground py-4 text-center text-sm">
                                Tidak ada data kehadiran
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {dailyAttendances.map(
                                  (attendance: attendanceTypes) => {
                                    const student = filteredStudents.find(
                                      (s: UserDataTypes) =>
                                        s.id === attendance.studentId,
                                    );
                                    const config =
                                      STATUS_CONFIG[
                                        attendance.status as keyof typeof STATUS_CONFIG
                                      ];

                                    if (!config) return null;

                                    const Icon = config.icon;

                                    return (
                                      <div
                                        key={attendance.id}
                                        className="bg-muted/50 border-border hover:bg-muted flex items-center gap-3 rounded-lg border p-3 transition-colors"
                                      >
                                        <ImageWithFallback
                                          src={
                                            student?.avatarUrl || DEFAULT_AVATAR
                                          }
                                          alt={student?.name || "Student"}
                                          width={40}
                                          height={40}
                                          className="rounded-full ring-2 ring-white"
                                          fallback={DEFAULT_AVATAR}
                                        />
                                        <div className="min-w-0 flex-1">
                                          <p className="text-foreground truncate text-sm font-medium">
                                            {student?.name || "Unknown Student"}
                                          </p>
                                          <p className="text-muted-foreground truncate text-xs">
                                            NISN: {student?.nisn || "-"}
                                          </p>
                                        </div>
                                        <Badge
                                          className={`${config.bg} ${config.text} flex-shrink-0 gap-1 border-0`}
                                        >
                                          <Icon className="h-3 w-3" />
                                          {config.label}
                                        </Badge>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t pt-6">
                    <div className="text-muted-foreground text-sm">
                      Halaman {currentPage + 1} dari {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(0, p - 1))
                        }
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                        disabled={currentPage >= totalPages - 1}
                      >
                        Selanjutnya
                        <ChevronRight className="ml-1 h-4 w-4" />
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
                <Users className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                <h3 className="text-foreground mb-2 text-lg font-medium">
                  Pilih Kelas
                </h3>
                <p className="text-muted-foreground">
                  Silakan pilih kelas untuk melihat rekap absensi
                </p>
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
  const { data: userData, isLoading: isLoadingUserData } =
    useGetUserByIdBetterAuth(userId as string);
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
