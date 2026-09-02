"use client";

import { useCreateAttendance, useDeleteAttendance, useUpdateAttendance } from "@/app/(hooks)/hooks/Attendances/useAttendance";
import { useGetAttendanceByIdSchedule } from "@/app/(hooks)/hooks/Attendances/useAttendanceByIdShcedule";
import { useGetSchedules } from "@/app/(hooks)/hooks/Schedules/useSchedules";
import { useGetStudents } from "@/app/(hooks)/hooks/Users/useStudents";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { UserDataTypes } from "@/app/(types)";
import { attendanceTypes } from "@/app/(types)/types/attendance-types";
import Loading from "@/components/loading";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/authClients";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { AlertCircle, ArrowUpDown, Calendar, CheckCircle, ChevronDown, Clock, Download, MoreHorizontal, Pencil, Search, Trash2, Users, X, XCircle } from "lucide-react";
import { unauthorized, useParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Import hooks
// Type definitions
export type AttendanceData = {
  id: string;
  studentId: string;
  scheduleId: string;
  status: string;
  notes?: string;
  date: string;
  createdAt: string;
  schedule?: {
    id: string;
    class?: {
      id: string;
      name: string;
    };
    subject?: {
      id: string;
      name: string;
      code: string;
    };
    teacher?: {
      id: string;
      name: string;
    };
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room?: string;
  };
  student?: {
    id: string;
    name: string;
    email?: string;
    nisn?: string;
  };
};

// Form schema
const attendanceSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  scheduleId: z.string().min(1, "Jadwal wajib dipilih"),
  status: z.enum(["present", "absent", "late", "excused"], {
    error: "Status kehadiran wajib dipilih",
  }),
  notes: z.string().optional(),
  date: z.string().min(1, "Tanggal wajib diisi"),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

// Status mapping
const STATUS_MAP = {
  present: { label: "Hadir", color: "bg-green-100 text-green-800", icon: CheckCircle },
  absent: { label: "Tidak Hadir", color: "bg-red-100 text-red-800", icon: XCircle },
  late: { label: "Terlambat", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  excused: { label: "Izin", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  sick: { label: "Sakit", color: "bg-purple-100 text-purple-800", icon: AlertCircle },
};

// Days mapping
const DAYS_MAP = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

// Create/Edit Dialog Component
function AttendanceFormDialog({ open, onOpenChange, editData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; editData?: attendanceTypes | null; onSuccess: () => void }) {
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();

  const { data: students = [] } = useGetStudents();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      status: "present",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const selectedStudentId = watch("studentId");
  const selectedScheduleId = watch("scheduleId");
  const selectedStatus = watch("status");
  const selectedDate = watch("date");

  React.useEffect(() => {
    if (editData) {
      setValue("studentId", editData.studentId);
      setValue("scheduleId", editData.scheduleId);
      setValue("status", editData.status as any);
      setValue("notes", editData.notes || "");
      setValue("date", editData.date.split("T")[0]);
    } else {
      reset({
        status: "present",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: AttendanceFormValues) => {
    try {
      const submitData = {
        ...data,
        date: new Date(data.date).toISOString(),
        notes: data.notes || null,
      };

      if (editData) {
        await updateAttendance.mutateAsync({ id: editData.id, ...submitData });
        toast.success("Kehadiran berhasil diperbarui!");
      } else {
        await createAttendance.mutateAsync(submitData);
        toast.success("Kehadiran berhasil dicatat!");
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Kehadiran" : "Catat Kehadiran Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Siswa</Label>
              <Select value={selectedStudentId || ""} onValueChange={(value) => setValue("studentId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Siswa" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studentId && <p className="text-sm text-red-500">{errors.studentId.message}</p>}
            </div>

            {/* <div className="space-y-2">
              <Label>Jadwal</Label>
              <Select value={selectedScheduleId || ""} onValueChange={(value) => setValue("scheduleId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jadwal" />
                </SelectTrigger>
                <SelectContent>
                  {schedules?.map((schedule: any) => (
                    <SelectItem key={schedule.id} value={schedule.id}>
                      {schedule.class?.name} - {schedule.subject?.name} ({DAYS_MAP[schedule.dayOfWeek as keyof typeof DAYS_MAP]} {schedule.startTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.scheduleId && <p className="text-sm text-red-500">{errors.scheduleId.message}</p>}
            </div> */}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status Kehadiran</Label>
              <Select value={selectedStatus || ""} onValueChange={(value) => setValue("status", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_MAP).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center space-x-2">
                        <config.icon className="h-4 w-4" />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div> */}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea id="notes" placeholder="Tambahkan catatan kehadiran..." {...register("notes")} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createAttendance.isPending || updateAttendance.isPending}>
              {createAttendance.isPending || updateAttendance.isPending ?
                "Menyimpan..."
              : editData ?
                "Perbarui"
              : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog
function DeleteAttendanceDialog({ open, onOpenChange, attendanceData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; attendanceData: attendanceTypes | null; onSuccess: () => void }) {
  const deleteAttendance = useDeleteAttendance();

  const handleDelete = async () => {
    if (!attendanceData) return;

    try {
      await deleteAttendance.mutateAsync(attendanceData.id);
      toast.success("Data kehadiran berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus data kehadiran");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Data Kehadiran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus data kehadiran "{attendanceData?.student?.name}" untuk mata pelajaran "{attendanceData?.schedule?.subject?.name}" pada tanggal{" "}
            {attendanceData?.date ? new Date(attendanceData.date).toLocaleDateString("id-ID") : ""}? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteAttendance.isPending} className="bg-red-600 hover:bg-red-700">
            {deleteAttendance.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main DataTable Component
function AttendanceDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedAttendance, setSelectedAttendance] = React.useState<attendanceTypes | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [classFilter, setClassFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("");
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const params = useParams();

  const { data: attendances = [], isLoading, refetch } = useGetAttendanceByIdSchedule(params.id as string);
  const { data: schedules = [] } = useGetSchedules();

  const handleSuccess = () => {
    refetch();
  };

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      // Dynamically import xlsx library
      const XLSX = await import("xlsx");

      // Get selected rows
      const selectedRows = table.getFilteredSelectedRowModel().rows;

      if (selectedRows.length === 0) {
        toast.error("Pilih minimal satu data untuk diekspor");
        return;
      }

      // Create worksheet data
      const wsData = [
        // Header row
        ["Tanggal", "Hari", "Nama Siswa", "Email Siswa", "NISN", "Kelas", "Mata Pelajaran", "Kode Mapel", "Guru Pengajar", "Waktu Mulai", "Waktu Selesai", "Ruangan", "Status Kehadiran", "Catatan"],
      ];

      // Add data rows
      selectedRows.forEach((row) => {
        const attendance = row.original;
        const schedule = schedules.find((s: any) => s.id === attendance.scheduleId);
        const date = new Date(attendance.date);

        wsData.push([
          date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          DAYS_MAP[date.getDay() as keyof typeof DAYS_MAP] || "",
          attendance.student?.name || "",
          attendance.student?.email || "",
          attendance.student?.nisn || "",
          schedule?.class?.name || "",
          schedule?.subject?.name || "",
          schedule?.subject?.code || "",
          schedule?.teacher?.name || "",
          schedule?.startTime || "",
          schedule?.endTime || "",
          schedule?.room || "",
          STATUS_MAP[attendance.status as keyof typeof STATUS_MAP]?.label || attendance.status,
          attendance.notes || "",
        ]);
      });

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws["!cols"] = [
        { wch: 12 }, // Tanggal
        { wch: 10 }, // Hari
        { wch: 25 }, // Nama Siswa
        { wch: 25 }, // Email Siswa
        { wch: 12 }, // NISN
        { wch: 15 }, // Kelas
        { wch: 25 }, // Mata Pelajaran
        { wch: 12 }, // Kode Mapel
        { wch: 25 }, // Guru Pengajar
        { wch: 12 }, // Waktu Mulai
        { wch: 12 }, // Waktu Selesai
        { wch: 15 }, // Ruangan
        { wch: 15 }, // Status Kehadiran
        { wch: 35 }, // Catatan
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Data Kehadiran");

      // Generate filename with current date
      const filename = `data-kehadiran-${new Date().toISOString().split("T")[0]}.xlsx`;

      // Generate Excel file
      XLSX.writeFile(wb, filename);

      toast.success(`Berhasil mengekspor ${selectedRows.length} data kehadiran`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Gagal mengekspor data ke Excel");
    }
  };

  // Get unique classes from schedules
  const uniqueClasses = React.useMemo(() => {
    const classes = schedules
      .filter((schedule: any) => schedule.class)
      .map((schedule: any) => schedule.class)
      .filter((cls: any, index: number, arr: any[]) => arr.findIndex((c: any) => c.id === cls.id) === index);
    return classes;
  }, [schedules]);

  // Custom global filter function
  const globalFilterFn = React.useCallback((row: any, columnId: string, filterValue: string) => {
    if (!filterValue) return true;

    const searchValue = filterValue.toLowerCase();
    const attendance = row.original;

    // Search in multiple fields
    const searchableText = [
      attendance.student?.name,
      attendance.schedule?.subject?.name,
      attendance.schedule?.subject?.code,
      attendance.schedule?.class?.name,
      attendance.schedule?.teacher?.name,
      STATUS_MAP[attendance.status as keyof typeof STATUS_MAP]?.label,
      attendance.notes,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchValue);
  }, []);

  // Custom date filter function
  const dateFilterFn = React.useCallback((row: any, columnId: string, filterValue: string) => {
    if (!filterValue) return true;

    const attendanceDate = new Date(row.original.date).toISOString().split("T")[0];
    return attendanceDate === filterValue;
  }, []);

  // Custom class filter function
  const classFilterFn = React.useCallback(
    (row: any, columnId: string, filterValue: string) => {
      if (filterValue === "all") return true;

      // Find the schedule for this attendance
      const scheduleId = row.original.scheduleId;
      const schedule = schedules.find((s: any) => s.id === scheduleId);

      return schedule?.class?.id === filterValue;
    },
    [schedules],
  );

  const columns: ColumnDef<attendanceTypes>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "date",
      accessorFn: (row) => row.date,
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Calendar className="mr-2 h-4 w-4" />
            Tanggal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return (
          <div className="font-medium">
            {date.toLocaleDateString("id-ID", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.date);
        const dateB = new Date(rowB.original.date);
        return dateA.getTime() - dateB.getTime();
      },
      filterFn: dateFilterFn,
    },
    {
      id: "student",
      accessorFn: (row) => row.student?.name || "",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Users className="mr-2 h-4 w-4" />
            Siswa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.student?.name}</div>
          {row.original.student?.email && <div className="text-sm text-muted-foreground">{row.original.student.email}</div>}
        </div>
      ),
    },
    {
      id: "schedule",
      header: "Jadwal Pelajaran",
      cell: ({ row }) => {
        // Ambil data jadwal dari schedules, bukan dari attendance
        const scheduleId = row.original.scheduleId;
        const schedule = schedules.find((s: any) => s.id === scheduleId);

        if (!schedule) return "-";

        return (
          <div className="space-y-1">
            <div className="font-medium">{schedule.subject?.name}</div>
            <div className="text-sm text-muted-foreground">
              {schedule.class?.name} • {schedule.teacher?.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {DAYS_MAP[schedule.dayOfWeek as keyof typeof DAYS_MAP]} {schedule.startTime}-{schedule.endTime}
              {schedule.room && ` • ${schedule.room}`}
            </div>
          </div>
        );
      },
      filterFn: classFilterFn,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.original.status as keyof typeof STATUS_MAP;
        const statusConfig = STATUS_MAP[status];
        const Icon = statusConfig?.icon || CheckCircle;

        return (
          <Badge className={statusConfig?.color}>
            <Icon className="mr-1 h-3 w-3" />
            {statusConfig?.label || status}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        return row.original.status === value;
      },
    },
    {
      accessorKey: "notes",
      header: "Catatan",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string;
        return (
          <div className="max-w-[200px]">
            {notes ?
              <div className="text-sm truncate" title={notes}>
                {notes}
              </div>
            : <span className="text-muted-foreground">-</span>}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const attendanceData = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(attendanceData.id)}>Copy ID Kehadiran</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAttendance(attendanceData);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAttendance(attendanceData);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: attendances,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Apply status filter
  React.useEffect(() => {
    if (statusFilter !== "all") {
      table.getColumn("status")?.setFilterValue(statusFilter);
    } else {
      table.getColumn("status")?.setFilterValue(undefined);
    }
  }, [statusFilter, table]);

  // Apply class filter
  React.useEffect(() => {
    if (classFilter !== "all") {
      table.getColumn("schedule")?.setFilterValue(classFilter);
    } else {
      table.getColumn("schedule")?.setFilterValue(undefined);
    }
  }, [classFilter, table]);

  // Apply date filter
  React.useEffect(() => {
    if (dateFilter) {
      table.getColumn("date")?.setFilterValue(dateFilter);
    } else {
      table.getColumn("date")?.setFilterValue(undefined);
    }
  }, [dateFilter, table]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const filteredAttendances = table.getFilteredRowModel().rows.map((row) => row.original);

    return {
      total: filteredAttendances.length,
      present: filteredAttendances.filter((a) => a.status === "present").length,
      absent: filteredAttendances.filter((a) => a.status === "absent").length,
      late: filteredAttendances.filter((a) => a.status === "late").length,
      excused: filteredAttendances.filter((a) => a.status === "excused").length,
      sick: filteredAttendances.filter((a) => a.status === "sick").length,
    };
  }, [table.getFilteredRowModel().rows]);

  if (isLoading) {
    return <Loading />;
  }
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  return (
    <>
      <div className="mx-auto my-8 p-6 max-w-7xl min-hscreen">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <div>
            <div className="font-bold text-4xl md:text-3xl">Data Kehadiran Siswa</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="px-3 py-1.5 text-sm font-medium">
                Kelas: {classFilter !== "all" ? uniqueClasses?.find((c: any) => c.id === classFilter)?.name : schedules.find((s: any) => s.id === (attendances[0]?.scheduleId || ""))?.class?.name || "-"}
              </Badge>
              <Badge className="px-3 py-1.5 text-sm font-medium">Mata Pelajaran: {schedules.find((s: any) => s.id === (attendances[0]?.scheduleId || ""))?.subject?.name || "-"}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari siswa, mata pelajaran, atau kelas..." value={globalFilter ?? ""} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm pl-8" disabled={isLoading} />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(STATUS_MAP).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center space-x-2">
                      <config.icon className="h-4 w-4" />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Class Filter */}
            {/* <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {uniqueClasses?.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}

            {/* Date Filter */}
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-[150px]" placeholder="Filter Tanggal" />

            {/* Clear Filters */}
            {(globalFilter || statusFilter !== "all" || classFilter !== "all" || dateFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGlobalFilter("");
                  setStatusFilter("all");
                  setClassFilter("all");
                  setDateFilter("");
                  table.resetColumnFilters();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Reset Filter
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-2 items-center space-x-2">
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Kolom <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      const getColumnLabel = (columnId: string) => {
                        switch (columnId) {
                          case "date":
                            return "Tanggal";
                          case "student":
                            return "Siswa";
                          case "schedule":
                            return "Jadwal Pelajaran";
                          case "status":
                            return "Status";
                          case "notes":
                            return "Catatan";
                          default:
                            return columnId;
                        }
                      };

                      return (
                        <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                          {getColumnLabel(column.id)}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              {/* Export Excel Button - Show when rows are selected */}
              {selectedRowsCount > 0 && (
                <Button variant="default" onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel ({selectedRowsCount})
                </Button>
              )}
            </div>

            {/* <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Catat Kehadiran
            </Button> */}
          </div>
        </div>

        {/* Active Filters Display */}
        {(globalFilter || statusFilter !== "all" || classFilter !== "all" || dateFilter) && (
          <div className="flex items-center space-x-2 py-2">
            <span className="text-sm text-muted-foreground">Filter aktif:</span>
            {globalFilter && (
              <Badge variant="secondary" className="gap-1">
                Pencarian: {globalFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setGlobalFilter("")} />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Status: {STATUS_MAP[statusFilter as keyof typeof STATUS_MAP]?.label}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
              </Badge>
            )}
            {classFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Kelas: {uniqueClasses?.find((c: any) => c.id === classFilter)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setClassFilter("all")} />
              </Badge>
            )}
            {dateFilter && (
              <Badge variant="secondary" className="gap-1">
                Tanggal: {new Date(dateFilter).toLocaleDateString("id-ID")}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setDateFilter("")} />
              </Badge>
            )}
          </div>
        )}

        <div className="rounded-md border w-full overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ?
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              : <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {globalFilter || statusFilter !== "all" || classFilter !== "all" || dateFilter ? "Tidak ada data kehadiran yang sesuai dengan filter." : "Tidak ada data kehadiran yang ditemukan."}
                      </p>
                      {(globalFilter || statusFilter !== "all" || classFilter !== "all" || dateFilter) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGlobalFilter("");
                            setStatusFilter("all");
                            setClassFilter("all");
                            setDateFilter("");
                            table.resetColumnFilters();
                          }}
                        >
                          Reset Filter
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
            {table.getFilteredRowModel().rows.length !== attendances.length && <span className="ml-2">(difilter dari {attendances.length} total)</span>}
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
            </p>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Selanjutnya
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Total Kehadiran</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
            {table.getFilteredRowModel().rows.length !== attendances.length && <p className="text-sm text-muted-foreground">({table.getFilteredRowModel().rows.length} terfilter)</p>}
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Hadir</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-600">{stats.present}</p>
            <p className="text-sm text-muted-foreground">{stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : "0%"}</p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold">Tidak Hadir</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-red-600">{stats.absent}</p>
            <p className="text-sm text-muted-foreground">{stats.total > 0 ? `${Math.round((stats.absent / stats.total) * 100)}%` : "0%"}</p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Terlambat</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-600">{stats.late}</p>
            <p className="text-sm text-muted-foreground">{stats.total > 0 ? `${Math.round((stats.late / stats.total) * 100)}%` : "0%"}</p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Izin dan sakit</h3>
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-600">{stats.excused + stats.sick}</p>
            <p className="text-sm text-muted-foreground">{stats.total > 0 ? `${Math.round(((stats.excused + stats.sick) / stats.total) * 100)}%` : "0%"}</p>
          </div>
        </div>

        {/* Dialogs */}
        <AttendanceFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />

        <AttendanceFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} editData={selectedAttendance} onSuccess={handleSuccess} />

        <DeleteAttendanceDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} attendanceData={selectedAttendance} onSuccess={handleSuccess} />
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
      return null;
      unauthorized();
    }
  }

  // Render dashboard only after authorization is confirmed
  return <AttendanceDataTable />;
}
