"use client";

export default function Page() {
  return <div>Input Teacher Attendance</div>;
}

// import { useState } from "react";
// import { useSession } from "@/lib/auth-client";
// import { useGetUserByIdBetterAuth } from "@/app/hooks/Users/useUsersByIdBetterAuth";
// import { useGetTeachers } from "@/app/hooks/Users/useTeachers";
// import {
//   useGetTeacherAttendance,
//   useCreateTeacherAttendance,
//   useGetTeacherAttendanceReports,
//   useBulkCreateTeacherAttendance,
//   useUpdateTeacherAttendance,
//   useDeleteTeacherAttendance,
// } from "@/app/hooks/TeacherAttendance/useTeacherAttendance";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { CheckCircle2, Clock, AlertCircle, Search, Plus, Calendar, BarChart3, Edit2, Download, Trash2, ChevronDown, ChevronUp, User } from "lucide-react";
// import { format } from "date-fns";
// import { id } from "date-fns/locale";
// import { exportTeacherAttendanceToExcel, exportTeacherAttendanceDetailToExcel } from "@/lib/export/exportTeacherAttendances";
// import { toast } from "sonner";
// import type { AttendanceStatus, TeacherAttendanceRecord, Teacher, StatusConfigMap, CheckinTabProps, AttendanceStats, BulkTeacherAttendanceInput } from "@/app/types/teacher-attendance";
// import { unauthorized } from "next/navigation";
// import Loading from "@/components/loading";
// import Link from "next/link";

// const STATUS_CONFIG: StatusConfigMap = {
//   hadir: { label: "Hadir", bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
//   sakit: { label: "Sakit", bg: "bg-yellow-100", text: "text-yellow-800", icon: AlertCircle },
//   izin: { label: "Izin", bg: "bg-blue-100", text: "text-blue-800", icon: Clock },
//   alfa: { label: "Alfa", bg: "bg-red-100", text: "text-red-800", icon: AlertCircle },
// };

// function CheckinTab({ adminId }: CheckinTabProps) {
//   const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
//   const [search, setSearch] = useState("");
//   const [openEditDialog, setOpenEditDialog] = useState(false);
//   const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
//   const [openBulkDialog, setOpenBulkDialog] = useState(false);
//   const [editingRecord, setEditingRecord] = useState<TeacherAttendanceRecord | null>(null);
//   const [deletingRecord, setDeletingRecord] = useState<TeacherAttendanceRecord | null>(null);
//   const [editStatus, setEditStatus] = useState<AttendanceStatus>("hadir");
//   const [editNotes, setEditNotes] = useState("");
//   const [bulkAttendance, setBulkAttendance] = useState<Record<string, { status: AttendanceStatus; notes?: string }>>({});
//   const [bulkNotes, setBulkNotes] = useState("");

//   const { data: attendance = [], isLoading } = useGetTeacherAttendance(date);
//   const { data: teachers = [] } = useGetTeachers();
//   // const { mutate: createAttendance, isPending } = useCreateTeacherAttendance();
//   const { mutate: bulkCreateAttendance, isPending: isBulkPending } = useBulkCreateTeacherAttendance();
//   const { mutate: updateAttendance, isPending: isUpdatePending } = useUpdateTeacherAttendance();
//   const { mutate: deleteAttendance, isPending: isDeletePending } = useDeleteTeacherAttendance();

//   const updateBulkAttendance = (teacherId: string, status: AttendanceStatus) => {
//     setBulkAttendance((prev) => ({
//       ...prev,
//       [teacherId]: { ...prev[teacherId], status },
//     }));
//   };

//   const handleBulkSubmit = () => {
//     const teachersWithStatus = Object.keys(bulkAttendance).filter((id) => bulkAttendance[id]?.status);

//     if (teachersWithStatus.length === 0) {
//       toast.error("Silakan set status kehadiran untuk minimal satu guru.");
//       return;
//     }

//     const bulkData: BulkTeacherAttendanceInput = {
//       teacherIds: teachersWithStatus,
//       date,
//       status: "hadir" as AttendanceStatus,
//       createdBy: adminId ? adminId : "",
//     };

//     bulkCreateAttendance(bulkData, {
//       onSuccess: () => {
//         setOpenBulkDialog(false);
//         setBulkAttendance({});
//         setBulkNotes("");
//         toast.success("Absensi guru berhasil disimpan!");
//       },
//     });
//   };

//   const handleEditSubmit = () => {
//     if (!editingRecord) return;

//     updateAttendance(
//       {
//         id: editingRecord.id,
//         status: editStatus,
//         notes: editNotes,
//       },
//       {
//         onSuccess: () => {
//           setOpenEditDialog(false);
//           setEditingRecord(null);
//           setEditStatus("hadir");
//           setEditNotes("");
//           toast.success("Absensi guru berhasil diperbarui!");
//         },
//       }
//     );
//   };

//   const handleDeleteSubmit = () => {
//     if (!deletingRecord) return;

//     deleteAttendance(deletingRecord.id, {
//       onSuccess: () => {
//         setOpenDeleteDialog(false);
//         setDeletingRecord(null);
//         toast.success("Absensi guru berhasil dihapus!");
//       },
//     });
//   };

//   const openEditDialog_ = (record: TeacherAttendanceRecord) => {
//     setEditingRecord(record);
//     setEditStatus(record.status);
//     setEditNotes(record.notes || "");
//     setOpenEditDialog(true);
//   };

//   const openDeleteDialog_ = (record: TeacherAttendanceRecord) => {
//     setDeletingRecord(record);
//     setOpenDeleteDialog(true);
//   };

//   const stats: AttendanceStats = {
//     hadir: attendance.filter((a: TeacherAttendanceRecord) => a.status === "hadir").length,
//     sakit: attendance.filter((a: TeacherAttendanceRecord) => a.status === "sakit").length,
//     izin: attendance.filter((a: TeacherAttendanceRecord) => a.status === "izin").length,
//     alfa: attendance.filter((a: TeacherAttendanceRecord) => a.status === "alfa").length,
//   };

//   const formatDate = (date: string) => {
//     const d = new Date(date);
//     return format(d, "EEEE, dd MMMM yyyy", { locale: id });
//   };

//   const formatTime = (date: Date | string) => {
//     const d = new Date(date);
//     return format(d, "HH:mm");
//   };

//   const getStatusColor = (status: AttendanceStatus) => {
//     return STATUS_CONFIG[status]?.bg || "bg-gray-100";
//   };

//   return (
//     <div className="space-y-4">
//       {/* Date & Search */}
//       <div className="flex flex-col gap-3">
//         <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//           <Calendar className="w-5 h-5 text-gray-500 hidden sm:block" />
//           <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium" />
//           <span className="text-sm text-gray-600">{formatDate(date)}</span>
//         </div>

//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
//             <Input placeholder="Cari guru..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 text-sm" />
//           </div>
//           <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
//             <DialogTrigger asChild>
//               <Button className="gap-2">
//                 <Plus className="w-4 h-4" />
//                 Bulk Check-in
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Bulk Check-in Absensi Guru</DialogTitle>
//                 <DialogDescription>Catat absensi untuk beberapa guru sekaligus</DialogDescription>
//               </DialogHeader>

//               <div className="space-y-3 mt-4">
//                 {teachers.map((teacher: Teacher) => {
//                   const teacherAttendance = bulkAttendance[teacher.id];
//                   return (
//                     <div key={teacher.id} className="flex flex-wrap items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-3">
//                       <div className={`w-3 h-3 rounded-xl ${getStatusColor(teacherAttendance?.status || "hadir")}`}></div>

//                       <div className="flex-1">
//                         <div className="flex flex-wrap items-center w-full gap-2 border rounded-xl p-4">
//                           <img src={teacher?.avatarUrl || "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png"} alt={teacher.name} className="w-15 h-15 rounded-lg object-cover" />
//                           <div>
//                             <p className="font-medium flex items-center gap-3">
//                               <User className="h-4 w-4 text-gray-400" />
//                               {teacher.name}
//                             </p>
//                             {teacher.position && (
//                               <p className="text-xs text-gray-500">
//                                 <Badge variant="outline" className="px-1 py-0.5">
//                                   {teacher.position}
//                                 </Badge>
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex flex-wrap gap-1 justify-center items-center">
//                         {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]][]).map(([status, config]) => (
//                           <Button key={status} size="sm" variant={teacherAttendance?.status === status ? "default" : "outline"} onClick={() => updateBulkAttendance(teacher.id, status)} className="text-xs px-2 py-1">
//                             {config.label}
//                           </Button>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="mt-6 space-y-4">
//                 <div>
//                   <label className="text-sm font-medium block mb-2">Catatan (Opsional)</label>
//                   <Input placeholder="Masukkan catatan..." value={bulkNotes} onChange={(e) => setBulkNotes(e.target.value)} />
//                 </div>

//                 <div className="flex justify-between items-center">
//                   <Button onClick={handleBulkSubmit} disabled={isBulkPending || Object.keys(bulkAttendance).length === 0} className="min-w-[180px]">
//                     {isBulkPending ? (
//                       <>
//                         <span className="animate-spin mr-2">⏳</span>
//                         Menyimpan...
//                       </>
//                     ) : (
//                       <>
//                         <CheckCircle2 className="h-4 w-4 mr-2" />
//                         Simpan Absensi ({Object.keys(bulkAttendance).filter((id) => bulkAttendance[id]?.status).length})
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//         {(Object.entries(stats) as [AttendanceStatus, number][]).map(([key, count]) => {
//           const config = STATUS_CONFIG[key];
//           const Icon = config.icon;
//           return (
//             <Card key={key}>
//               <CardContent className="pt-6">
//                 <div className="flex items-center gap-3">
//                   <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
//                     <Icon className={`w-5 h-5 ${config.text}`} />
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-2xl font-bold">{count}</p>
//                     <p className="text-xs text-gray-600 truncate">{config.label}</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {/* Attendance List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Daftar Absensi ({attendance.length})</CardTitle>
//           <CardDescription>Guru yang sudah melakukan check-in</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="space-y-3">
//               {[...Array(3)].map((_, i) => (
//                 <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
//               ))}
//             </div>
//           ) : attendance.length === 0 ? (
//             <div className="py-8 text-center text-gray-500">
//               <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
//               <p className="text-sm">Belum ada absensi untuk tanggal ini</p>
//             </div>
//           ) : (
//             <div className="space-y-2 max-h-96 overflow-y-auto">
//               {attendance
//                 .filter((record) => search === "" || record.teacher?.name.toLowerCase().includes(search.toLowerCase()) || record.teacher?.email.toLowerCase().includes(search.toLowerCase()))
//                 .map((record: TeacherAttendanceRecord) => {
//                   const config = STATUS_CONFIG[record.status];
//                   const Icon = config.icon;
//                   return (
//                     <div key={record.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition gap-2">
//                       <div className="min-w-0 flex-1">
//                         <p className="font-semibold text-sm truncate">{record.teacher?.name}</p>
//                         <p className="text-xs text-gray-600 truncate">{record.teacher?.email}</p>
//                       </div>
//                       <div className="flex items-center justify-between sm:justify-end gap-3 sm:ml-4 shrink-0">
//                         {record.checkinTime && (
//                           <div className="text-right">
//                             <p className="text-xs text-gray-600">Check-in</p>
//                             <p className="font-mono text-sm font-semibold">{formatTime(record.checkinTime)}</p>
//                           </div>
//                         )}
//                         <Badge className={`gap-1 text-xs ${config.bg} ${config.text} border-0 whitespace-nowrap`}>
//                           <Icon className="w-3 h-3" />
//                           {config.label}
//                         </Badge>
//                         <div className="flex gap-1">
//                           <Button variant="ghost" size="sm" onClick={() => openEditDialog_(record)} className="h-8 w-8 p-0">
//                             <Edit2 className="w-4 h-4" />
//                           </Button>
//                           <Button variant="ghost" size="sm" onClick={() => openDeleteDialog_(record)} className="h-8 w-8 p-0 hover:text-red-600">
//                             <Trash2 className="w-4 h-4" />
//                           </Button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Edit Dialog */}
//       <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
//         <DialogContent className="w-[95vw] max-w-md">
//           <DialogHeader>
//             <DialogTitle>Edit Absensi Guru</DialogTitle>
//             <DialogDescription>Ubah status kehadiran dan catatan</DialogDescription>
//           </DialogHeader>

//           {editingRecord && (
//             <div className="space-y-4">
//               <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//                 <p className="text-sm font-semibold text-blue-900">{editingRecord.teacher?.name}</p>
//                 <p className="text-xs text-blue-700">{editingRecord.teacher?.email}</p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium block mb-2">Status Kehadiran</label>
//                 <Select value={editStatus} onValueChange={(value: AttendanceStatus) => setEditStatus(value)}>
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {(Object.entries(STATUS_CONFIG) as [AttendanceStatus, (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG]][]).map(([key, config]) => (
//                       <SelectItem key={key} value={key}>
//                         {config.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <label className="text-sm font-medium block mb-2">Catatan (Opsional)</label>
//                 <Input placeholder="Masukkan catatan..." value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
//               </div>

//               <Button onClick={handleEditSubmit} disabled={isUpdatePending} className="w-full">
//                 {isUpdatePending ? "Menyimpan..." : "Simpan Perubahan"}
//               </Button>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
//         <AlertDialogContent className="w-[95vw] max-w-md">
//           <AlertDialogHeader>
//             <AlertDialogTitle>Hapus Absensi</AlertDialogTitle>
//             <AlertDialogDescription>Apakah Anda yakin ingin menghapus absensi untuk {deletingRecord?.teacher?.name}? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
//           </AlertDialogHeader>
//           <div className="flex flex-col-reverse sm:flex-row gap-2">
//             <AlertDialogCancel>Batal</AlertDialogCancel>
//             <AlertDialogAction onClick={handleDeleteSubmit} disabled={isDeletePending} className="bg-red-600 hover:bg-red-700">
//               {isDeletePending ? "Menghapus..." : "Hapus"}
//             </AlertDialogAction>
//           </div>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

// function ReportsTab() {
//   const [startDate, setStartDate] = useState(() => {
//     const d = new Date();
//     d.setDate(d.getDate() - 30);
//     return d.toISOString().split("T")[0];
//   });
//   const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
//   const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);

//   const { data: reports = [], isLoading } = useGetTeacherAttendanceReports(startDate, endDate);

//   const formatDate = (dateStr: string) => {
//     const d = new Date(dateStr);
//     return format(d, "EEEE, dd MMMM yyyy", { locale: id });
//   };

//   const totalTeachers = reports.length;
//   const avgPresent =
//     totalTeachers > 0 ? Math.round(reports.reduce((sum, t) => sum + Number(typeof t.statistics?.presentPercentage === "number" ? t.statistics.presentPercentage : parseFloat(t.statistics?.presentPercentage || "0")), 0) / totalTeachers) : 0;
//   const avgSick = totalTeachers > 0 ? Math.round(reports.reduce((sum, t) => sum + ((t.statistics?.sickDays || 0) / (t.statistics?.totalDays || 1)) * 100, 0) / totalTeachers) : 0;
//   const avgAbsent = totalTeachers > 0 ? Math.round(reports.reduce((sum, t) => sum + ((t.statistics?.absentDays || 0) / (t.statistics?.totalDays || 1)) * 100, 0) / totalTeachers) : 0;

//   return (
//     <div className="space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Filter Laporan</CardTitle>
//         </CardHeader>
//         <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
//           <div className="flex-1">
//             <label className="text-sm font-medium block mb-2">Dari Tanggal</label>
//             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
//           </div>
//           <div className="flex-1">
//             <label className="text-sm font-medium block mb-2">Sampai Tanggal</label>
//             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
//           </div>
//           <Button className="w-full sm:w-auto">Refresh</Button>
//         </CardContent>
//       </Card>

//       <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//         {[
//           { label: "Total Guru", value: totalTeachers },
//           { label: "Rata-rata Hadir", value: `${avgPresent}%` },
//           { label: "Rata-rata Sakit", value: `${avgSick}%` },
//           { label: "Rata-rata Alfa", value: `${avgAbsent}%` },
//         ].map((stat) => (
//           <Card key={stat.label}>
//             <CardContent className="pt-6">
//               <div className="text-center">
//                 <p className="text-2xl font-bold">{stat.value}</p>
//                 <p className="text-xs text-gray-600">{stat.label}</p>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Detail Absensi Guru</CardTitle>
//           <CardDescription>
//             Periode: {formatDate(startDate)} - {formatDate(endDate)}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="space-y-3">
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
//               ))}
//             </div>
//           ) : reports.length === 0 ? (
//             <div className="py-8 text-center text-gray-500">
//               <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
//               <p className="text-sm">Tidak ada data absensi untuk periode ini</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {reports.map((teacher: any) => (
//                 <div key={teacher.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1">
//                       <p className="font-semibold">{teacher.name}</p>
//                       <p className="text-sm text-gray-600">{teacher.email}</p>
//                     </div>
//                     <div className="text-right">
//                       <span className="font-semibold text-green-600">{teacher.statistics?.presentPercentage}%</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default function TeacherAttendancePage() {
//   const { data: session } = useSession();
//   const { data: adminData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");
//   console.log(adminData);

//   return (
//     <div className="space-y-6 p-6 max-w-7xl mx-auto min-h-screen">
//       <div className="space-y-2">
//         <h1 className="text-3xl font-bold tracking-tight">Absensi Guru</h1>
//         <p className="text-gray-600">Kelola kehadiran dan lihat laporan absensi guru</p>
//       </div>

//       <Tabs defaultValue="checkin" className="w-full">
//         <TabsList className="grid w-full grid-cols-2 max-w-md">
//           <TabsTrigger value="checkin" className="gap-2">
//             <Plus className="w-4 h-4" />
//             Check-in
//           </TabsTrigger>
//           <TabsTrigger value="reports" className="gap-2">
//             <BarChart3 className="w-4 h-4" />
//             Laporan
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="checkin" className="space-y-4 mt-6">
//           <CheckinTab adminId={adminData?.id} />
//         </TabsContent>

//         <TabsContent value="reports" className="space-y-4 mt-6">
//           <ReportsTab />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
