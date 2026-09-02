"use client";
import { useGetAttendanceByIdStudent } from "@/app/(hooks)/hooks/Attendances/useAttendaceByIdStudent";
import { useGetStudentsByIds } from "@/app/(hooks)/hooks/Users/useStudentByIds";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { useGetViolationsByIdStudent } from "@/app/(hooks)/hooks/Violations/useViolationsByIdStudent";
import Loading from "@/components/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/authClients";
import { AlertCircle, AlertTriangle, ArrowUpDown, Award, BookOpen, Calendar, CheckCircle, ChevronLeft, ChevronRight, Clock, FileText, GraduationCap, Mail, Phone, User, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

// Simple Table Component
function SimpleTable({ columns, data, emptyMessage = "Tidak ada data" }: any) {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const pageSize = 10;

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = sortConfig.key.split(".").reduce((obj, key) => obj?.[key], a);
      const bValue = sortConfig.key.split(".").reduce((obj, key) => obj?.[key], b);

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column: any) => (
                <th key={column.key} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:bg-muted/70" onClick={() => column.sortable !== false && handleSort(column.key)}>
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable !== false && <ArrowUpDown className="h-3 w-3" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row: any, idx: number) => (
              <tr key={idx} className="border-b transition-colors hover:bg-muted/50">
                {columns.map((column: any) => (
                  <td key={column.key} className="p-4 align-middle">
                    {column.render ? column.render(row) : column.key.split(".").reduce((obj: any, key: string) => obj?.[key], row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, sortedData.length)} dari {sortedData.length} data
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p: number) => Math.max(0, p - 1))} disabled={currentPage === 0}>
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <span className="text-sm">
              Halaman {currentPage + 1} dari {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p: number) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParentPage() {
  const { data: session, isPending } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const studentIds = userData?.studentIds || [];

  const { data: students = [], isLoading: loadingStudents, isError } = useGetStudentsByIds(studentIds);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Set selected student once data is loaded
  useMemo(() => {
    if (!selectedStudent && students.length > 0) {
      setSelectedStudent(students[0]);
    }
  }, [students, selectedStudent]);

  const selectedStudentId = selectedStudent?.id || "";

  const { data: attendanceStudent = [], isLoading: loadingAttendance } = useGetAttendanceByIdStudent(selectedStudentId);
  const { data: violationStudent = [], isLoading: loadingViolations } = useGetViolationsByIdStudent(selectedStudentId);

  // Calculate statistics
  const attendanceStats = useMemo(() => {
    const total = attendanceStudent.length;
    const present = attendanceStudent.filter((a: any) => a.status === "present").length;
    const absent = attendanceStudent.filter((a: any) => a.status === "absent").length;
    const late = attendanceStudent.filter((a: any) => a.status === "late").length;
    const excused = attendanceStudent.filter((a: any) => a.status === "excused" || a.status === "sick").length;
    const percentage = total > 0 ? (present / total) * 100 : 0;
    return { total, present, absent, late, excused, percentage };
  }, [attendanceStudent]);

  const violationStats = useMemo(() => {
    const activeViolations = violationStudent.filter((v: any) => v.status === "active");
    const totalPoints = activeViolations.reduce((sum: number, v: any) => sum + (v.violationType?.points || 0), 0);
    return { activeCount: activeViolations.length, totalPoints, total: violationStudent.length };
  }, [violationStudent]);

  // Attendance columns
  const attendanceColumns = [
    {
      key: "date",
      header: "Tanggal",
      render: (row: any) => {
        const date = new Date(row.date);
        return (
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xl font-bold">{date.getDate()}</div>
              <div className="text-xs text-muted-foreground">{date.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "schedule.subject.name",
      header: "Mata Pelajaran",
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.schedule?.subject?.name || "-"}</div>
          <div className="text-sm text-muted-foreground">{row.schedule?.teacher?.name || "-"}</div>
        </div>
      ),
    },
    {
      key: "schedule.startTime",
      header: "Waktu",
      render: (row: any) => (
        <div className="text-sm">
          {row.schedule?.startTime || "-"} - {row.schedule?.endTime || "-"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => {
        const variants: any = {
          present: { variant: "default", icon: CheckCircle, label: "Hadir", color: "text-green-600" },
          absent: { variant: "destructive", icon: XCircle, label: "Tidak Hadir", color: "text-red-600" },
          late: { variant: "secondary", icon: Clock, label: "Terlambat", color: "text-yellow-600" },
          excused: { variant: "outline", icon: FileText, label: "Izin", color: "text-blue-600" },
          sick: { variant: "outline", icon: AlertCircle, label: "Sakit", color: "text-blue-600" },
        };
        const config = variants[row.status] || variants.ABSENT;
        const Icon = config.icon;
        return (
          <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "notes",
      header: "Catatan",
      sortable: false,
      render: (row: any) => <div className="text-sm text-muted-foreground max-w-xs truncate">{row.notes || "-"}</div>,
    },
  ];

  // Violations columns
  const violationsColumns = [
    {
      key: "date",
      header: "Tanggal",
      render: (row: any) => <div className="text-sm">{new Date(row.date).toLocaleDateString("id-ID")}</div>,
    },
    {
      key: "violationType.name",
      header: "Jenis Pelanggaran",
      render: (row: any) => (
        <div>
          <div className="font-medium">{row.violationType?.name || "-"}</div>
          <div className="text-sm text-muted-foreground">{row.description || "-"}</div>
        </div>
      ),
    },
    {
      key: "violationType.category",
      header: "Kategori",
      render: (row: any) => {
        const category = row.violationType?.category || "RINGAN";
        const variants: any = {
          RINGAN: "secondary",
          SEDANG: "default",
          BERAT: "destructive",
        };
        return (
          <Badge variant={variants[category]} className="capitalize">
            {category.toLowerCase()}
          </Badge>
        );
      },
    },
    {
      key: "violationType.points",
      header: "Poin",
      render: (row: any) => (
        <div className="flex items-center gap-1 font-semibold">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          {row.violationType?.points || 0}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: any) => (
        <Badge variant={row.status === "RESOLVED" ? "default" : "secondary"}>
          {row.status === "RESOLVED" ?
            "Selesai"
          : row.status === "APPEALED" ?
            "Banding"
          : "Aktif"}
        </Badge>
      ),
    },
  ];

  // Loading state
  if (isPending || loadingStudents) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!selectedStudent) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Anda Bukan Orang Tua...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Dashboard Orang Tua</h1>
            <p className="text-muted-foreground">Pantau perkembangan anak Anda di {process.env.NEXT_PUBLIC_CLIENT_NAME}</p>
          </div>

          {/* Parent Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Orang Tua
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userData?.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userData?.parentPhone || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Jumlah Anak: {students.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Pilih Anak</CardTitle>
              <CardDescription>Pilih anak yang ingin Anda pantau</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedStudent?.id}
                onValueChange={(value) => {
                  const student = students.find((s: any) => s.id === value);
                  if (student) setSelectedStudent(student);
                }}
              >
                <SelectTrigger className="w-full md:w-[400px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student: any) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={student.avatarUrl || undefined} />
                          <AvatarFallback>{student.name?.[0] || "?"}</AvatarFallback>
                        </Avatar>
                        <span>
                          {student.name || "Tanpa Nama"} - {student.class?.name || "-"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Student Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Profil Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={selectedStudent?.avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {selectedStudent?.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3 flex-1">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedStudent?.name}</h3>
                    <p className="text-muted-foreground">
                      NISN: {selectedStudent?.nisn || "-"} | NIK: {selectedStudent?.nik || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Kelas: {selectedStudent?.class?.name || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Jurusan: {selectedStudent?.major?.name || "-"}</span>
                    </div>
                  </div>
                  <Badge variant={selectedStudent?.status === "ACTIVE" ? "default" : "secondary"}>{selectedStudent?.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Kehadiran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">{attendanceStats.percentage.toFixed(1)}%</div>
                    <span className="text-sm text-muted-foreground">dari {attendanceStats.total} pertemuan</span>
                  </div>
                  <Progress value={attendanceStats.percentage} className="h-2" />
                  <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>Hadir: {attendanceStats.present}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      <span>Alpa: {attendanceStats.absent}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span>Terlambat: {attendanceStats.late}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Izin: {attendanceStats.excused}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Violations Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Pelanggaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold">{violationStats.totalPoints}</div>
                    <span className="text-sm text-muted-foreground">poin</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {violationStats.activeCount} pelanggaran aktif dari {violationStats.total} total
                  </div>
                  {violationStats.totalPoints > 50 ?
                    <Badge variant="destructive" className="mt-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Perlu Perhatian
                    </Badge>
                  : violationStats.totalPoints > 20 ?
                    <Badge variant="secondary" className="mt-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Hati-hati
                    </Badge>
                  : <Badge variant="default" className="mt-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Baik
                    </Badge>
                  }
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tabs */}
          <Tabs defaultValue="attendance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance">
                <Calendar className="h-4 w-4 mr-2" />
                Riwayat Absensi
              </TabsTrigger>
              <TabsTrigger value="violations">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Riwayat Pelanggaran
              </TabsTrigger>
            </TabsList>

            {/* Attendance Tab */}
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Riwayat Kehadiran</CardTitle>
                  <CardDescription>Data kehadiran lengkap dari {selectedStudent?.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAttendance ?
                    <Loading />
                  : <SimpleTable columns={attendanceColumns} data={attendanceStudent} emptyMessage="Belum ada data kehadiran" />}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Violations Tab */}
            <TabsContent value="violations">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Pelanggaran</CardTitle>
                  <CardDescription>Catatan pelanggaran dari {selectedStudent?.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingViolations ?
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Memuat data pelanggaran...</p>
                    </div>
                  : violationStudent.length === 0 ?
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 mx-auto text-green-600 mb-4" />
                      <h3 className="font-semibold text-lg">Tidak Ada Pelanggaran</h3>
                      <p className="text-muted-foreground">{selectedStudent?.name} belum memiliki catatan pelanggaran</p>
                    </div>
                  : <SimpleTable columns={violationsColumns} data={violationStudent} emptyMessage="Belum ada data pelanggaran" />}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
