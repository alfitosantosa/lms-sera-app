"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

import { useGetAttendanceByIdStudent } from "@/app/(hooks)/hooks/Attendances/useAttendaceByIdStudent";
import { useGetSchedules } from "@/app/(hooks)/hooks/Schedules/useSchedules";
import { useGetStudentById } from "@/app/(hooks)/hooks/Users/useGetStudentById";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/lib/authClients";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  AlertCircle,
  ArrowUpDown,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  GraduationCap,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";


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
  };
};

// Status mapping
const STATUS_MAP = {
  present: {
    label: "Hadir",
    color: "bg-success-chip text-success-strong",
    icon: CheckCircle,
  },
  absent: {
    label: "Tidak Hadir",
    color: "bg-destructive-chip text-destructive-strong",
    icon: XCircle,
  },
  late: {
    label: "Terlambat",
    color: "bg-warning-chip text-warning-strong",
    icon: Clock,
  },
  excused: {
    label: "Izin",
    color: "bg-info-chip text-info-strong",
    icon: AlertCircle,
  },
  sick: {
    label: "Sakit",
    color: "bg-tertiary-chip text-tertiary-strong",
    icon: AlertCircle,
  },
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

// Main DataTable Component
export default function AttendanceDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [globalFilter, setGlobalFilter] = useState<string>("");

  // Get session from Better Auth
  const { data: session, isPending } = useSession();

  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const {
    data: attendances = [],
    isLoading,
    refetch,
  } = useGetAttendanceByIdStudent(userData?.id ?? "");
  const { data: schedules = [] } = useGetSchedules();
  const { data: studentData } = useGetStudentById(userData?.id ?? "");

  const handleSuccess = () => {
    refetch();
  };

  // Get unique classes from schedules
  const uniqueClasses = useMemo(() => {
    const classes = schedules
      .filter((schedule: any) => schedule.class)
      .map((schedule: any) => schedule.class)
      .filter(
        (cls: any, index: number, arr: any[]) =>
          arr.findIndex((c: any) => c.id === cls.id) === index,
      );
    return classes;
  }, [schedules]);

  // Get unique subjects from schedules
  const uniqueSubjects = useMemo(() => {
    const subjects = schedules
      .filter((schedule: any) => schedule.subject)
      .map((schedule: any) => schedule.subject)
      .filter(
        (subject: any, index: number, arr: any[]) =>
          arr.findIndex((s: any) => s.id === subject.id) === index,
      );
    return subjects;
  }, [schedules]);

  // Custom global filter function
  const globalFilterFn = useCallback(
    (row: any, columnId: string, filterValue: string) => {
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
    },
    [],
  );

  // Custom date filter function
  const dateFilterFn = useCallback(
    (row: any, columnId: string, filterValue: string) => {
      if (!filterValue) return true;

      const attendanceDate = new Date(row.original.date)
        .toISOString()
        .split("T")[0];
      return attendanceDate === filterValue;
    },
    [],
  );

  // Custom class filter function
  const classFilterFn = useCallback(
    (row: any, columnId: string, filterValue: string) => {
      if (filterValue === "all") return true;

      // Find the schedule for this attendance
      const scheduleId = row.original.scheduleId;
      const schedule = schedules.find((s: any) => s.id === scheduleId);

      return schedule?.class?.id === filterValue;
    },
    [schedules],
  );

  // Custom subject filter function
  const subjectFilterFn = useCallback(
    (row: any, columnId: string, filterValue: string) => {
      if (filterValue === "all") return true;

      // Find the schedule for this attendance
      const scheduleId = row.original.scheduleId;
      const schedule = schedules.find((s: any) => s.id === scheduleId);

      return schedule?.subject?.id === filterValue;
    },
    [schedules],
  );

  const columns: ColumnDef<AttendanceData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "date",
      accessorFn: (row) => row.date,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
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
      accessorFn: (row) => row.student?.name || studentData?.name || "",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <Users className="mr-2 h-4 w-4" />
            Siswa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.student?.name ||
              studentData?.name ||
              "Nama tidak tersedia"}
          </div>
          {(row.original.student?.email || studentData?.email) && (
            <div className="text-muted-foreground text-sm">
              {row.original.student?.email || studentData?.email}
            </div>
          )}
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
            <div className="flex items-center gap-2 font-medium">
              <BookOpen className="text-info h-4 w-4" />
              {schedule.subject?.name}
              {schedule.subject?.code && (
                <Badge variant="outline" className="text-xs">
                  {schedule.subject.code}
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground text-sm">
              {schedule.class?.name} • {schedule.teacher?.name}
            </div>
            <div className="text-muted-foreground text-xs">
              {DAYS_MAP[schedule.dayOfWeek as keyof typeof DAYS_MAP]}{" "}
              {schedule.startTime}-{schedule.endTime}
              {schedule.room && ` • ${schedule.room}`}
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        // Handle both class and subject filters
        if (value === "all") return true;

        const scheduleId = row.original.scheduleId;
        const schedule = schedules.find((s: any) => s.id === scheduleId);

        // Check if it's a class filter or subject filter based on the column
        if (id === "schedule") {
          return schedule?.class?.id === value;
        }

        return true;
      },
    },
    {
      id: "subject",
      header: "Mata Pelajaran",
      cell: ({ row }) => {
        const scheduleId = row.original.scheduleId;
        const schedule = schedules.find((s: any) => s.id === scheduleId);

        if (!schedule?.subject) return "-";

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-medium">
              <GraduationCap className="text-success h-4 w-4" />
              {schedule.subject.name}
            </div>
            {schedule.subject.code && (
              <Badge variant="outline" className="text-xs">
                {schedule.subject.code}
              </Badge>
            )}
          </div>
        );
      },
      filterFn: subjectFilterFn,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
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
            {notes ? (
              <div className="truncate text-sm" title={notes}>
                {notes}
              </div>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable<AttendanceData>({
    data: attendances as AttendanceData[],
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
  useEffect(() => {
    if (statusFilter !== "all") {
      table.getColumn("status")?.setFilterValue(statusFilter);
    } else {
      table.getColumn("status")?.setFilterValue(undefined);
    }
  }, [statusFilter, table]);

  // Apply class filter
  useEffect(() => {
    if (classFilter !== "all") {
      table.getColumn("schedule")?.setFilterValue(classFilter);
    } else {
      table.getColumn("schedule")?.setFilterValue(undefined);
    }
  }, [classFilter, table]);

  // Apply subject filter
  useEffect(() => {
    if (subjectFilter !== "all") {
      table.getColumn("subject")?.setFilterValue(subjectFilter);
    } else {
      table.getColumn("subject")?.setFilterValue(undefined);
    }
  }, [subjectFilter, table]);

  // Apply date filter
  useEffect(() => {
    if (dateFilter) {
      table.getColumn("date")?.setFilterValue(dateFilter);
    } else {
      table.getColumn("date")?.setFilterValue(undefined);
    }
  }, [dateFilter, table]);

  // Calculate statistics
  const stats = useMemo(() => {
    const filteredAttendances = table
      .getFilteredRowModel()
      .rows.map((row) => row.original);

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

  return (
    <>
      <div className="mx-auto my-8 min-h-screen max-w-7xl p-6">
        <div className="mb-2 text-3xl font-bold">Data Kehadiran Siswa</div>
        {studentData && (
          <div className="bg-info-surface border-info-border mb-6 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Users className="text-info h-6 w-6" />
              <div>
                <h2 className="text-info-strong text-xl font-semibold">
                  {studentData.name}
                </h2>
                {studentData.email && (
                  <p className="text-info-strong text-sm">
                    {studentData.email}
                  </p>
                )}
                {studentData.id && (
                  <p className="text-info-strong text-sm">
                    NIS: {studentData.nisn}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-4">
          <div className="flex flex-wrap items-center space-x-2 gap-y-2">
            {/* Global Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Cari mata pelajaran, kelas, atau catatan..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="max-w-sm pl-8"
                disabled={isLoading}
              />
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

            {/* Subject Filter */}
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                {uniqueSubjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{subject.name}</span>
                      {subject.code && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          {subject.code}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Class Filter */}
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {uniqueClasses.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{cls.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[150px]"
              placeholder="Filter Tanggal"
            />

            {/* Clear Filters */}
            {(globalFilter ||
              statusFilter !== "all" ||
              classFilter !== "all" ||
              subjectFilter !== "all" ||
              dateFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGlobalFilter("");
                  setStatusFilter("all");
                  setClassFilter("all");
                  setSubjectFilter("all");
                  setDateFilter("");
                  table.resetColumnFilters();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Reset Filter
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
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
                        case "subject":
                          return "Mata Pelajaran";
                        case "status":
                          return "Status";
                        case "notes":
                          return "Catatan";
                        default:
                          return columnId;
                      }
                    };

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {getColumnLabel(column.id)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Active Filters Display */}
        {(globalFilter ||
          statusFilter !== "all" ||
          classFilter !== "all" ||
          subjectFilter !== "all" ||
          dateFilter) && (
          <div className="flex items-center space-x-2 py-2">
            <span className="text-muted-foreground text-sm">Filter aktif:</span>
            {globalFilter && (
              <Badge variant="secondary" className="gap-1">
                Pencarian: {globalFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setGlobalFilter("")}
                />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Status:{" "}
                {STATUS_MAP[statusFilter as keyof typeof STATUS_MAP]?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setStatusFilter("all")}
                />
              </Badge>
            )}
            {subjectFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Mata Pelajaran:{" "}
                {uniqueSubjects?.find((s: any) => s.id === subjectFilter)?.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setSubjectFilter("all")}
                />
              </Badge>
            )}
            {classFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Kelas:{" "}
                {uniqueClasses?.find((c: any) => c.id === classFilter)?.name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setClassFilter("all")}
                />
              </Badge>
            )}
            {dateFilter && (
              <Badge variant="secondary" className="gap-1">
                Tanggal: {new Date(dateFilter).toLocaleDateString("id-ID")}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setDateFilter("")}
                />
              </Badge>
            )}
          </div>
        )}

        <div className="w-full overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <CheckCircle className="text-muted-foreground h-8 w-8" />
                      <p className="text-muted-foreground">
                        {globalFilter ||
                        statusFilter !== "all" ||
                        classFilter !== "all" ||
                        subjectFilter !== "all" ||
                        dateFilter
                          ? "Tidak ada data kehadiran yang sesuai dengan filter."
                          : "Tidak ada data kehadiran yang ditemukan."}
                      </p>
                      {(globalFilter ||
                        statusFilter !== "all" ||
                        classFilter !== "all" ||
                        subjectFilter !== "all" ||
                        dateFilter) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGlobalFilter("");
                            setStatusFilter("all");
                            setClassFilter("all");
                            setSubjectFilter("all");
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
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-muted-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} dari{" "}
            {table.getFilteredRowModel().rows.length} baris dipilih.
            {table.getFilteredRowModel().rows.length !== attendances.length && (
              <span className="ml-2">
                (difilter dari {attendances.length} total)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
              {table.getPageCount()}
            </p>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-info h-5 w-5" />
              <h3 className="font-semibold">Total Kehadiran</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.total}</p>
            {table.getFilteredRowModel().rows.length !== attendances.length && (
              <p className="text-muted-foreground text-sm">
                ({table.getFilteredRowModel().rows.length} terfilter)
              </p>
            )}
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-success h-5 w-5" />
              <h3 className="font-semibold">Hadir</h3>
            </div>
            <p className="text-success mt-2 text-2xl font-bold">
              {stats.present}
            </p>
            <p className="text-muted-foreground text-sm">
              {stats.total > 0
                ? `${Math.round((stats.present / stats.total) * 100)}%`
                : "0%"}
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="text-destructive h-5 w-5" />
              <h3 className="font-semibold">Tidak Hadir</h3>
            </div>
            <p className="text-destructive mt-2 text-2xl font-bold">
              {stats.absent}
            </p>
            <p className="text-muted-foreground text-sm">
              {stats.total > 0
                ? `${Math.round((stats.absent / stats.total) * 100)}%`
                : "0%"}
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-warning h-5 w-5" />
              <h3 className="font-semibold">Terlambat</h3>
            </div>
            <p className="text-warning mt-2 text-2xl font-bold">{stats.late}</p>
            <p className="text-muted-foreground text-sm">
              {stats.total > 0
                ? `${Math.round((stats.late / stats.total) * 100)}%`
                : "0%"}
            </p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-info h-5 w-5" />
              <h3 className="font-semibold">Izin dan sakit</h3>
            </div>
            <p className="text-info mt-2 text-2xl font-bold">
              {stats.excused + stats.sick}
            </p>
            <p className="text-muted-foreground text-sm">
              {stats.total > 0
                ? `${Math.round(((stats.excused + stats.sick) / stats.total) * 100)}%`
                : "0%"}
            </p>
          </div>
        </div>
      </div>

      {/* Dialogs */}
    </>
  );
}
