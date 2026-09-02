"use client";

import { useGetClasses } from "@/app/(hooks)/hooks/Classes/useClass";
import { useGetStudentById } from "@/app/(hooks)/hooks/Users/useGetStudentById";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { useGetViolationsByIdStudent } from "@/app/(hooks)/hooks/Violations/useViolationsByIdStudent";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/authClients";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { AlertTriangle, ArrowUpDown, Calendar, ChevronDown, MoreHorizontal, Search, User, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";

export type ViolationData = {
  id: string;
  studentId: string;
  violationTypeId: string;
  classId: string;
  description?: string;
  status: string;
  reportedBy: string;
  createdAt: string;
  date: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  student?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
  violationType?: {
    id: string;
    name: string;
    points: number;
    category: string;
  };
  class?: {
    id: string;
    name: string;
    grade: number;
  };
};

const violationStatuses = [
  { value: "active", label: "Aktif" },
  { value: "resolved", label: "Selesai" },
  { value: "pending", label: "Pending" },
  { value: "dismissed", label: "Dibatalkan" },
];

export default function ViolationDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [classFilter, setClassFilter] = React.useState<string>("all");
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  // Get session from Better Auth
  const { data: session, isPending } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const { data: violations = [], isLoading } = useGetViolationsByIdStudent(userData?.id ?? "");
  const { data: classes } = useGetClasses();
  const { data: dataStudent } = useGetStudentById(userData?.id ?? "");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-600";
      case "resolved":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-600";
      case "dismissed":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    const found = violationStatuses.find((s) => s.value === status);
    return found ? found.label : status;
  };

  const globalFilterFn = React.useCallback((row: any, columnId: string, filterValue: string) => {
    if (!filterValue) return true;
    const searchValue = filterValue.toLowerCase();
    const student = row.original.student;
    const violationType = row.original.violationType;
    const classData = row.original.class;
    const reportedBy = row.original.reportedBy;
    const description = row.original.description;
    const searchableText = [student?.name, student?.email, violationType?.name, classData?.name, reportedBy, description, getStatusLabel(row.original.status)].filter(Boolean).join(" ").toLowerCase();
    return searchableText.includes(searchValue);
  }, []);

  const columns: ColumnDef<ViolationData>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "student",
      accessorFn: (row) => row.student?.name || "Unknown Student",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <User className="mr-2 h-4 w-4" />
            Siswa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div>
            <div className="font-medium">{student?.name || "Unknown Student"}</div>
            <div className="text-sm text-muted-foreground">{student?.email}</div>
          </div>
        );
      },
      enableGlobalFilter: true,
    },
    {
      id: "class",
      accessorFn: (row) => row.class?.name || "Unknown Class",
      header: "Kelas",
      cell: ({ row }) => {
        const classData = row.original.class;
        return <div>{classData?.name || "Unknown Class"}</div>;
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        return row.original.classId === value;
      },
    },
    {
      id: "violationType",
      accessorFn: (row) => row.violationType?.name || "Unknown Violation",
      header: "Jenis Pelanggaran",
      cell: ({ row }) => {
        const violationType = row.original.violationType;
        return (
          <div className="max-w-xs">
            <div className="font-medium">{violationType?.name || "Unknown Violation"}</div>
            {violationType?.points && (
              <Badge variant="secondary" className="mt-1">
                {violationType.points} poin
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Calendar className="mr-2 h-4 w-4" />
            Tanggal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{formatDate(row.getValue("date"))}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge className={`text-white ${getStatusBadgeColor(status)}`}>{getStatusLabel(status)}</Badge>;
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        return row.getValue("status") === value;
      },
    },
    {
      accessorKey: "reportedBy",
      header: "Dilaporkan Oleh",
      cell: ({ row }) => <div>{row.getValue("reportedBy")}</div>,
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <div className="max-w-xs truncate" title={description}>
            {description || "-"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const violationData = row.original;
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(violationData.id)}>Copy ID Pelanggaran</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const violationRows: ViolationData[] = Array.isArray(violations) ? (violations as ViolationData[]) : [];

  const table = useReactTable<ViolationData>({
    data: violationRows,
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

  React.useEffect(() => {
    if (statusFilter !== "all") {
      table.getColumn("status")?.setFilterValue(statusFilter);
    } else {
      table.getColumn("status")?.setFilterValue(undefined);
    }
  }, [statusFilter, table]);

  React.useEffect(() => {
    if (classFilter !== "all") {
      table.getColumn("class")?.setFilterValue(classFilter);
    } else {
      table.getColumn("class")?.setFilterValue(undefined);
    }
  }, [classFilter, table]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="mx-auto my-8 p-6 max-w-7xl">
        <div className="font-bold text-3xl mb-6">Data Pelanggaran</div>

        {dataStudent && (
          <div className="bg-card rounded-lg border p-6 mb-6">
            <div className="flex items-center space-x-4">
              <Image className="rounded-full " src={dataStudent.avatarUrl ?? "/avatar-placeholder.png"} alt="Avatar" width={50} height={50} />

              <div className="flex-1">
                <h2 className="text-xl font-semibold">{dataStudent.name || "Nama Siswa"}</h2>
                <p className="text-muted-foreground">{dataStudent.email || "Email tidak tersedia"}</p>
                {dataStudent.class && (
                  <Badge variant="secondary" className="mt-2">
                    Kelas: {dataStudent.class.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-wrap  items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari siswa, kelas, pelanggaran..." value={globalFilter ?? ""} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm pl-8" />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-35">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {violationStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {classes?.map((classItem: any) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(globalFilter || statusFilter !== "all" || classFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGlobalFilter("");
                    setStatusFilter("all");
                    setClassFilter("all");
                    table.resetColumnFilters();
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset Filter
                </Button>
              )}
            </div>

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
                    return (
                      <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                        {column.id === "student"
                          ? "Siswa"
                          : column.id === "class"
                            ? "Kelas"
                            : column.id === "violationType"
                              ? "Jenis Pelanggaran"
                              : column.id === "date"
                                ? "Tanggal"
                                : column.id === "status"
                                  ? "Status"
                                  : column.id === "reportedBy"
                                    ? "Dilaporkan Oleh"
                                    : column.id === "description"
                                      ? "Deskripsi"
                                      : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {(globalFilter || statusFilter !== "all" || classFilter !== "all") && (
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
                  Status: {getStatusLabel(statusFilter)}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                </Badge>
              )}
              {classFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Kelas: {classes?.find((c: any) => c.id === classFilter)?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setClassFilter("all")} />
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">{globalFilter || statusFilter !== "all" || classFilter !== "all" ? "Tidak ada data yang sesuai dengan filter." : "Tidak ada data pelanggaran yang ditemukan."}</p>
                        {(globalFilter || statusFilter !== "all" || classFilter !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGlobalFilter("");
                              setStatusFilter("all");
                              setClassFilter("all");
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
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
              {table.getFilteredRowModel().rows.length !== violations.length && <span className="ml-2">(difilter dari {violations.length} total)</span>}
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Total Pelanggaran</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{violations.length}</p>
              {table.getFilteredRowModel().rows.length !== violations.length && <p className="text-sm text-muted-foreground">({table.getFilteredRowModel().rows.length} terfilter)</p>}
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-600"></div>
                <h3 className="font-semibold">Aktif</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{table.getFilteredRowModel().rows.filter((row) => row.original.status === "active").length}</p>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                <h3 className="font-semibold">Selesai</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{table.getFilteredRowModel().rows.filter((row) => row.original.status === "resolved").length}</p>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-yellow-600"></div>
                <h3 className="font-semibold">Pending</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{table.getFilteredRowModel().rows.filter((row) => row.original.status === "pending").length}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
