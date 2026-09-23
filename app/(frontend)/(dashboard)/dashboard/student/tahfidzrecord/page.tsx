"use client";
import { useState, useEffect, useCallback } from "react";

import { useGetTahfidzRecords } from "@/app/(hooks)/hooks/TahfidzRecord/useTahfidzRecord";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ArrowUpDown,
  BookOpen,
  CalendarDays,
  ChevronDown,
  FileText,
  MoreHorizontal,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import { unauthorized } from "next/navigation";


// ─── Types ────────────────────────────────────────────────────────────────────
export type SurahQuranData = {
  id: string;
  name: string;
  nameLatin: string;
  verseCount: number;
  revelationPlace: string;
};

export type StudentData = {
  id: string;
  name: string;
};

export type TeacherData = {
  id: string;
  name: string;
};

export type TahfidzRecordData = {
  id: string;
  studentId?: string;
  teacherId?: string;
  surahQuranId?: string;
  startVerse?: number;
  endVerse?: number;
  grade?: string;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  student?: StudentData;
  teacher?: TeacherData;
  surah?: SurahQuranData;
};

// ─── Grade Badge ──────────────────────────────────────────────────────────────
const gradeColor: Record<string, string> = {
  A: "bg-success-solid",
  B: "bg-info-solid",
  C: "bg-warning-solid",
  D: "bg-caution-solid",
  E: "bg-destructive-solid",
};

function GradeBadge({ grade }: { grade?: string }) {
  if (!grade) return <span className="text-muted-foreground">-</span>;
  return (
    <Badge
      className={`${gradeColor[grade.toUpperCase()] ?? "bg-muted-foreground"} font-bold text-white`}
    >
      {grade}
    </Badge>
  );
}

// ─── Main DataTable ───────────────────────────────────────────────────────────
function TahfidzRecordDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  // Get session from Better Auth
  const { data: session, isPending } = useSession();

  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const {
    data: records = [],
    isLoading,
    refetch,
  } = useGetTahfidzRecords(userData?.id ?? "");

  const globalFilterFn = useCallback(
    (row: any, _columnId: string, filterValue: string) => {
      if (!filterValue) return true;
      const r = row.original as TahfidzRecordData;
      const text = [
        r.surah?.name,
        r.surah?.nameLatin,
        r.student?.name,
        r.teacher?.name,
        r.grade,
        r.notes,
        r.startVerse?.toString(),
        r.endVerse?.toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(filterValue.toLowerCase());
    },
    [],
  );

  const columns: ColumnDef<TahfidzRecordData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "student",
      accessorFn: (row) => row.student?.name ?? "-",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <User className="mr-2 h-4 w-4" />
          Siswa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.student?.name ?? "-"}</div>
      ),
    },
    {
      id: "teacher",
      accessorFn: (row) => row.teacher?.name ?? "-",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <User className="mr-2 h-4 w-4" />
          Guru
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.teacher?.name ?? "-"}
        </div>
      ),
    },
    {
      id: "surah",
      accessorFn: (row) => row.surah?.name ?? "-",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Surah
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const surah = row.original.surah;
        return (
          <div>
            {surah ? (
              <>
                <div className="font-medium">{surah.name}</div>
                <div className="text-muted-foreground text-xs">
                  {surah.nameLatin}
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
            {row.original.startVerse != null &&
              row.original.endVerse != null && (
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Ayat {row.original.startVerse} – {row.original.endVerse}
                </div>
              )}
          </div>
        );
      },
    },
    {
      id: "revelationPlace",
      accessorFn: (row) => row.surah?.revelationPlace ?? "-",
      header: "Turun",
      cell: ({ row }) => {
        const place = row.original.surah?.revelationPlace;
        if (!place) return <span className="text-muted-foreground">-</span>;
        return (
          <Badge variant="outline" className="text-xs">
            {place}
          </Badge>
        );
      },
    },
    {
      accessorKey: "grade",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <Star className="mr-2 h-4 w-4" />
          Nilai
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <GradeBadge grade={row.getValue("grade")} />,
      filterFn: (row, _id, value) => {
        if (value === "all") return true;
        if (value === "none") return !row.original.grade;
        return row.original.grade === value;
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const d = row.getValue("date") as string;
        if (!d) return <span className="text-muted-foreground">-</span>;
        return (
          <span>
            {format(new Date(d), "dd MMM yyyy", { locale: localeId })}
          </span>
        );
      },
    },
    {
      accessorKey: "notes",
      header: "Catatan",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string;
        return (
          <div
            className="text-muted-foreground max-w-xs truncate"
            title={notes}
          >
            {notes || "-"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const rec = row.original;
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(rec.id)}
              >
                Copy ID Rekaman
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: records as TahfidzRecordData[],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  useEffect(() => {
    table
      .getColumn("grade")
      ?.setFilterValue(gradeFilter !== "all" ? gradeFilter : undefined);
  }, [gradeFilter, table]);

  if (isLoading) return <Loading />;

  const filteredRows = table.getFilteredRowModel().rows;
  const totalRecords = (records as any[]).length;

  const columnLabels: Record<string, string> = {
    student: "Siswa",
    teacher: "Guru",
    surah: "Surah",
    revelationPlace: "Turun",
    grade: "Nilai",
    date: "Tanggal",
    notes: "Catatan",
  };

  return (
    <div className="max-w-8xl">
      <div className="mb-6 text-3xl font-bold">Data Rekaman Tahfidz</div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-y-3 py-4">
        <div className="flex flex-wrap items-center space-x-2 gap-y-2">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder="Cari surah, siswa, guru..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm pl-8"
            />
          </div>

          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter Nilai" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Nilai</SelectItem>
              <SelectItem value="none">Belum Dinilai</SelectItem>
              {["A", "B", "C", "D", "E"].map((g) => (
                <SelectItem key={g} value={g}>
                  Nilai {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(globalFilter || gradeFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGlobalFilter("");
                setGradeFilter("all");
                table.resetColumnFilters();
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Reset Filter
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Kolom <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((c) => c.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(!!v)}
                  >
                    {columnLabels[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filter badges */}
      {(globalFilter || gradeFilter !== "all") && (
        <div className="flex flex-wrap items-center space-x-2 gap-y-1 py-2">
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
          {gradeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Nilai: {gradeFilter === "none" ? "Belum Dinilai" : gradeFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setGradeFilter("all")}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
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
                    <FileText className="text-muted-foreground h-8 w-8" />
                    <p className="text-muted-foreground">
                      {globalFilter || gradeFilter !== "all"
                        ? "Tidak ada data yang sesuai dengan filter."
                        : "Tidak ada rekaman tahfidz yang ditemukan."}
                    </p>
                    {(globalFilter || gradeFilter !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setGlobalFilter("");
                          setGradeFilter("all");
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

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {filteredRows.length} baris dipilih.
          {filteredRows.length !== totalRecords && (
            <span className="ml-2">(difilter dari {totalRecords} total)</span>
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

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-info h-5 w-5" />
            <h3 className="font-semibold">Total Rekaman</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">{totalRecords}</p>
          {filteredRows.length !== totalRecords && (
            <p className="text-muted-foreground text-sm">
              ({filteredRows.length} terfilter)
            </p>
          )}
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className="bg-success-solid h-3 w-3 rounded-full" />
            <h3 className="font-semibold">Nilai A</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {filteredRows.filter((r) => r.original.grade === "A").length}
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className="bg-warning-solid h-3 w-3 rounded-full" />
            <h3 className="font-semibold">Belum Dinilai</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {filteredRows.filter((r) => !r.original.grade).length}
          </p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <User className="text-tertiary h-5 w-5" />
            <h3 className="font-semibold">Jumlah Siswa</h3>
          </div>
          <p className="mt-2 text-2xl font-bold">
            {
              new Set(
                filteredRows.map((r) => r.original.studentId).filter(Boolean),
              ).size
            }
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Wrapper ─────────────────────────────────────────────────────────────
export default function TahfidzRecordPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading: isLoadingUserData } =
    useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  if (isPending || isLoadingUserData) return <Loading />;
  if (userRole !== "Student") {
    unauthorized();
    return null;
  }

  return <TahfidzRecordDataTable />;
}
