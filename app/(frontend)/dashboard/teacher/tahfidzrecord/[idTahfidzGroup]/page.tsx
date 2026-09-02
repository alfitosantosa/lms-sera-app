"use client";

import { useGetQuranSurah } from "@/app/(hooks)/hooks/TahfidzRecord/useQuranSurah";
import { useCreateTahfidzRecord, useDeleteTahfidzRecord, useGetTahfidzRecordByIdTeacher, useUpdateTahfidzRecord } from "@/app/(hooks)/hooks/TahfidzRecord/useTahfidzRecord";
import { useGetStudentByIdTahfidzGroup } from "@/app/(hooks)/hooks/Users/useStudents";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
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
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowUpDown, BookOpen, CalendarDays, ChevronDown, FileText, MoreHorizontal, Pencil, Plus, Search, Star, Trash2, User, X } from "lucide-react";
import { unauthorized, useParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
  A: "bg-green-600",
  B: "bg-blue-500",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  E: "bg-red-600",
};

function GradeBadge({ grade }: { grade?: string }) {
  if (!grade) return <span className="text-muted-foreground">-</span>;
  return <Badge className={`${gradeColor[grade.toUpperCase()] ?? "bg-gray-500"} text-white font-bold`}>{grade}</Badge>;
}

// ─── Form Schema ──────────────────────────────────────────────────────────────
const tahfidzSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  teacherId: z.string().optional(),
  surahQuranId: z.string().min(1, "Surah wajib dipilih"),
  startVerse: z.number().min(1, "Ayat awal minimal 1"),
  endVerse: z.number().min(1, "Ayat akhir minimal 1"),
  grade: z.string().optional(),
  date: z.string().min(1, "Tanggal wajib diisi"),
  notes: z.string().optional(),
});
type TahfidzFormValues = z.infer<typeof tahfidzSchema>;

// ─── Form Dialog ──────────────────────────────────────────────────────────────
function TahfidzFormDialog({
  open,
  onOpenChange,
  editData,
  onSuccess,
  allStudents,
  quranSurah,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: TahfidzRecordData | null;
  onSuccess: () => void;
  allStudents: StudentData[];
  quranSurah: SurahQuranData[];
}) {
  const createRecord = useCreateTahfidzRecord();
  const updateRecord = useUpdateTahfidzRecord();
  const { data: session } = useSession();
  const { data: teacherUserData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");
  const teacherId = teacherUserData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<TahfidzFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tahfidzSchema as any),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      startVerse: 1,
      endVerse: 1,
    },
  });

  const selectedStudentId = watch("studentId");
  const selectedSurahId = watch("surahQuranId");
  const selectedGrade = watch("grade");

  // Find selected surah to show verse count hint
  const selectedSurah = React.useMemo(() => quranSurah?.find((s) => s.id === selectedSurahId), [quranSurah, selectedSurahId]);

  React.useEffect(() => {
    if (editData) {
      setValue("studentId", editData.studentId || "");
      setValue("teacherId", editData.teacherId || teacherId || "");
      setValue("surahQuranId", editData.surahQuranId || "");
      setValue("startVerse", editData.startVerse ?? 1);
      setValue("endVerse", editData.endVerse ?? 1);
      setValue("grade", editData.grade || "");
      setValue("date", editData.date ? new Date(editData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
      setValue("notes", editData.notes || "");
    } else {
      reset({ date: new Date().toISOString().split("T")[0], startVerse: 1, endVerse: 1, teacherId: teacherId || "" });
    }
  }, [editData, setValue, reset, teacherId]);

  const onSubmit = async (data: TahfidzFormValues) => {
    try {
      // Ensure studentId is set - it's required
      if (!data.studentId) {
        toast.error("Siswa wajib dipilih");
        return;
      }

      // Ensure surahQuranId is set - it's required
      if (!data.surahQuranId) {
        toast.error("Surah wajib dipilih");
        return;
      }

      const submitData = {
        studentId: data.studentId,
        teacherId: data.teacherId || null,
        surahQuranId: data.surahQuranId,
        startVerse: data.startVerse,
        endVerse: data.endVerse,
        grade: data.grade || null,
        notes: data.notes || null,
        date: new Date(data.date).toISOString(),
      };

      if (editData) {
        await updateRecord.mutateAsync({ id: editData.id, ...submitData });
        toast.success("Rekaman tahfidz berhasil diperbarui!");
      } else {
        await createRecord.mutateAsync(submitData);
        toast.success("Rekaman tahfidz berhasil dibuat!");
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Rekaman Tahfidz" : "Tambah Rekaman Tahfidz Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Student & Teacher */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Siswa</Label>
              <Select value={selectedStudentId || ""} onValueChange={(v) => setValue("studentId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Siswa" />
                </SelectTrigger>
                <SelectContent>
                  {allStudents?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studentId && <p className="text-sm text-red-500">{errors.studentId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Guru</Label>
              <Input value={session?.user?.name || "Memuat..."} disabled className="bg-muted" />
              <input type="hidden" {...register("teacherId")} value={teacherId || ""} />
            </div>
          </div>

          {/* Surah & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Surah</Label>
              <Select
                value={selectedSurahId || ""}
                onValueChange={(v) => {
                  setValue("surahQuranId", v);
                  // Reset verses when surah changes
                  setValue("startVerse", 1);
                  setValue("endVerse", 1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Surah" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {quranSurah?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.nameLatin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSurah && (
                <p className="text-xs text-muted-foreground">
                  {selectedSurah.revelationPlace} · {selectedSurah.verseCount} ayat
                </p>
              )}
              {errors.surahQuranId && <p className="text-sm text-red-500">{errors.surahQuranId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>
          </div>

          {/* Start & End Verse */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startVerse">
                Ayat Awal
                {selectedSurah && <span className="ml-1 text-xs text-muted-foreground">(maks. {selectedSurah.verseCount})</span>}
              </Label>
              <Input id="startVerse" type="number" min="1" max={selectedSurah?.verseCount} {...register("startVerse", { valueAsNumber: true })} />
              {errors.startVerse && <p className="text-sm text-red-500">{errors.startVerse.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endVerse">
                Ayat Akhir
                {selectedSurah && <span className="ml-1 text-xs text-muted-foreground">(maks. {selectedSurah.verseCount})</span>}
              </Label>
              <Input id="endVerse" type="number" min="1" max={selectedSurah?.verseCount} {...register("endVerse", { valueAsNumber: true })} />
              {errors.endVerse && <p className="text-sm text-red-500">{errors.endVerse.message}</p>}
            </div>
          </div>

          {/* Grade */}
          <div className="space-y-2">
            <Label>Nilai</Label>
            <Select value={selectedGrade || "none"} onValueChange={(v) => setValue("grade", v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Nilai (Opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Belum dinilai</SelectItem>
                {["A", "B", "C", "D", "E"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea id="notes" placeholder="Catatan tambahan..." rows={3} {...register("notes")} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createRecord.isPending || updateRecord.isPending}>
              {createRecord.isPending || updateRecord.isPending ?
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

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteTahfidzDialog({ open, onOpenChange, recordData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; recordData: TahfidzRecordData | null; onSuccess: () => void }) {
  const deleteRecord = useDeleteTahfidzRecord();

  const handleDelete = async () => {
    if (!recordData) return;
    try {
      await deleteRecord.mutateAsync({ id: recordData.id, studentId: recordData.studentId });
      toast.success("Rekaman tahfidz berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus rekaman tahfidz";
      toast.error(errorMessage);
    }
  };

  const surahLabel = recordData?.surah ? `${recordData.surah.name} (${recordData.surah.nameLatin})` : "-";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Rekaman Tahfidz</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus rekaman tahfidz surah "{surahLabel}" milik {recordData?.student?.name ?? "siswa ini"}? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteRecord.isPending} className="bg-red-600 hover:bg-red-700">
            {deleteRecord.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main DataTable ───────────────────────────────────────────────────────────
function TahfidzRecordDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [gradeFilter, setGradeFilter] = React.useState<string>("all");

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<TahfidzRecordData | null>(null);

  const { data: session } = useSession();
  const { data: userData } = useGetUserByIdBetterAuth(session?.user?.id ?? "");

  const { data: records = [], isLoading, refetch } = useGetTahfidzRecordByIdTeacher(userData?.id as string);
  // get data tahfidz by tahfidz group
  console.log(records);

  const params = useParams();
  const { data: allStudents = [] } = useGetStudentByIdTahfidzGroup(params.idTahfidzGroup as string);
  // const { data: allStudents = [] } = useGetStudents();
  const { data: quranSurah = [] } = useGetQuranSurah();

  const handleSuccess = () => refetch();

  const globalFilterFn = React.useCallback((row: { original: TahfidzRecordData }, _columnId: string, filterValue: string) => {
    if (!filterValue) return true;
    const r = row.original as TahfidzRecordData;
    const text = [r.surah?.name, r.surah?.nameLatin, r.student?.name, r.teacher?.name, r.grade, r.notes, r.startVerse?.toString(), r.endVerse?.toString()].filter(Boolean).join(" ").toLowerCase();
    return text.includes(filterValue.toLowerCase());
  }, []);

  const columns: ColumnDef<TahfidzRecordData>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "student",
      accessorFn: (row) => row.student?.name ?? "-",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <User className="mr-2 h-4 w-4" />
          Siswa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.student?.name ?? "-"}</div>,
    },
    {
      id: "teacher",
      accessorFn: (row) => row.teacher?.name ?? "-",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <User className="mr-2 h-4 w-4" />
          Guru
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-muted-foreground">{row.original.teacher?.name ?? "-"}</div>,
    },
    {
      id: "surah",
      accessorFn: (row) => row.surah?.name ?? "-",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <BookOpen className="mr-2 h-4 w-4" />
          Surah
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const surah = row.original.surah;
        return (
          <div>
            {surah ?
              <>
                <div className="font-medium">{surah.name}</div>
                <div className="text-xs text-muted-foreground">{surah.nameLatin}</div>
              </>
            : <span className="text-muted-foreground">-</span>}
            {row.original.startVerse != null && row.original.endVerse != null && (
              <div className="text-xs text-muted-foreground mt-0.5">
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
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
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
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          <CalendarDays className="mr-2 h-4 w-4" />
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const d = row.getValue("date") as string;
        if (!d) return <span className="text-muted-foreground">-</span>;
        return <span>{format(new Date(d), "dd MMM yyyy", { locale: localeId })}</span>;
      },
    },
    {
      accessorKey: "notes",
      header: "Catatan",
      cell: ({ row }) => {
        const notes = row.getValue("notes") as string;
        return (
          <div className="max-w-xs truncate text-muted-foreground" title={notes}>
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(rec.id)}>Copy ID Rekaman</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRecord(rec);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRecord(rec);
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
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
  });

  React.useEffect(() => {
    table.getColumn("grade")?.setFilterValue(gradeFilter !== "all" ? gradeFilter : undefined);
  }, [gradeFilter, table]);

  if (isLoading) return <Loading />;

  const filteredRows = table.getFilteredRowModel().rows;
  const totalRecords = (records as TahfidzRecordData[]).length;

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
    <div className="">
      <div className="font-bold text-3xl mb-6">Data Rekaman Tahfidz</div>

      {/* Toolbar */}
      <div className="flex items-center justify-between py-4 flex-wrap gap-y-3">
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari surah, siswa, guru..." value={globalFilter ?? ""} onChange={(e) => setGlobalFilter(e.target.value)} className="max-w-sm pl-8" />
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
                  <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(v) => column.toggleVisibility(!!v)}>
                    {columnLabels[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Rekaman
          </Button>
        </div>
      </div>

      {/* Active filter badges */}
      {(globalFilter || gradeFilter !== "all") && (
        <div className="flex items-center space-x-2 py-2 flex-wrap gap-y-1">
          <span className="text-sm text-muted-foreground">Filter aktif:</span>
          {globalFilter && (
            <Badge variant="secondary" className="gap-1">
              Pencarian: {globalFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setGlobalFilter("")} />
            </Badge>
          )}
          {gradeFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Nilai: {gradeFilter === "none" ? "Belum Dinilai" : gradeFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setGradeFilter("all")} />
            </Badge>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border w-full overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                ))}
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
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">{globalFilter || gradeFilter !== "all" ? "Tidak ada data yang sesuai dengan filter." : "Tidak ada rekaman tahfidz yang ditemukan."}</p>
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
            }
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} dari {filteredRows.length} baris dipilih.
          {filteredRows.length !== totalRecords && <span className="ml-2">(difilter dari {totalRecords} total)</span>}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Total Rekaman</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{totalRecords}</p>
          {filteredRows.length !== totalRecords && <p className="text-sm text-muted-foreground">({filteredRows.length} terfilter)</p>}
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-600" />
            <h3 className="font-semibold">Nilai A</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{filteredRows.filter((r) => r.original.grade === "A").length}</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <h3 className="font-semibold">Belum Dinilai</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{filteredRows.filter((r) => !r.original.grade).length}</p>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Jumlah Siswa</h3>
          </div>
          <p className="text-2xl font-bold mt-2">{new Set(filteredRows.map((r) => r.original.studentId).filter(Boolean)).size}</p>
        </div>
      </div>

      {/* Dialogs */}
      <TahfidzFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} allStudents={allStudents} quranSurah={quranSurah} />
      <TahfidzFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} editData={selectedRecord} onSuccess={handleSuccess} allStudents={allStudents} quranSurah={quranSurah} />
      <DeleteTahfidzDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} recordData={selectedRecord} onSuccess={handleSuccess} />
    </div>
  );
}

// ─── Auth Wrapper ─────────────────────────────────────────────────────────────
export default function TahfidzRecordPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  if (isPending || isLoadingUserData) return <Loading />;
  if (userRole !== "Admin") {
    if (userRole !== "Teacher") {
      unauthorized();
      return null;
    }
  }
  return <TahfidzRecordDataTable />;
}
