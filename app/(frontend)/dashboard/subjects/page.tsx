"use client";

import { useGetMajors } from "@/app/(hooks)/hooks/Majors/useMajors";
import { useCreateSubject, useDeleteSubject, useGetSubjects, useUpdateSubject } from "@/app/(hooks)/hooks/Subjects/useSubjects";
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
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/authClients";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, BookOpen, ChevronDown, FileText, GraduationCap, Hash, MoreHorizontal, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Import hooks
// Type definitions
export type SubjectData = {
  id: string;
  code: string;
  name: string;
  description?: string;
  majorId?: string;
  credits: number;
  isActive: boolean;
  major?: {
    id: string;
    name: string;
  };
};

// Form schema
const subjectSchema = z.object({
  code: z.string().min(1, "Kode mata pelajaran wajib diisi").max(10, "Kode maksimal 10 karakter"),
  name: z.string().min(1, "Nama mata pelajaran wajib diisi"),
  description: z.string().optional(),
  majorId: z.string().optional(),
  credits: z.number().min(1, "SKS minimal 1").max(10, "SKS maksimal 10"),
  isActive: z.boolean().default(true),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

// Create/Edit Dialog Component
function SubjectFormDialog({ open, onOpenChange, editData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; editData?: SubjectData | null; onSuccess: () => void }) {
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const { data: majors = [] } = useGetMajors();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema as any),
    defaultValues: {
      credits: 2,
      isActive: true,
    },
  });

  const selectedMajorId = watch("majorId");
  const isActive = watch("isActive");
  const credits = watch("credits");

  React.useEffect(() => {
    if (editData) {
      setValue("code", editData.code);
      setValue("name", editData.name);
      setValue("description", editData.description || "");
      setValue("majorId", editData.majorId || "");
      setValue("credits", editData.credits);
      setValue("isActive", editData.isActive);
    } else {
      reset({
        credits: 2,
        isActive: true,
      });
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: SubjectFormValues) => {
    try {
      const submitData = {
        ...data,
        majorId: data.majorId || null,
        description: data.description || null,
      };

      if (editData) {
        await updateSubject.mutateAsync({ id: editData.id, ...submitData } as any);
        toast.success("Mata pelajaran berhasil diperbarui!");
      } else {
        await createSubject.mutateAsync(submitData as any);
        toast.success("Mata pelajaran berhasil dibuat!");
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
          <DialogTitle>{editData ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode Mata Pelajaran</Label>
              <Input id="code" placeholder="Contoh: MTK01" {...register("code")} />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">SKS</Label>
              <Input id="credits" type="number" min="1" max="10" {...register("credits", { valueAsNumber: true })} />
              {errors.credits && <p className="text-sm text-red-500">{errors.credits.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama Mata Pelajaran</Label>
            <Input id="name" placeholder="Contoh: Matematika Dasar" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Jurusan</Label>
            <Select value={selectedMajorId || "all"} onValueChange={(value) => setValue("majorId", value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jurusan (Opsional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jurusan</SelectItem>
                {majors?.map((major: any) => (
                  <SelectItem key={major.id} value={major.id}>
                    {major.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" placeholder="Deskripsi mata pelajaran..." rows={3} {...register("description")} />
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={isActive} onCheckedChange={(checked) => setValue("isActive", checked)} />
            <Label>Mata pelajaran aktif</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createSubject.isPending || updateSubject.isPending}>
              {createSubject.isPending || updateSubject.isPending ?
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
function DeleteSubjectDialog({ open, onOpenChange, subjectData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; subjectData: SubjectData | null; onSuccess: () => void }) {
  const deleteSubject = useDeleteSubject();

  const handleDelete = async () => {
    if (!subjectData) return;

    try {
      await deleteSubject.mutateAsync(subjectData.id as any);
      toast.success("Mata pelajaran berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus mata pelajaran");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Mata Pelajaran</AlertDialogTitle>
          <AlertDialogDescription>Apakah Anda yakin ingin menghapus mata pelajaran "{subjectData?.name}"? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteSubject.isPending} className="bg-red-600 hover:bg-red-700">
            {deleteSubject.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main DataTable Component
function SubjectDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSubject, setSelectedSubject] = React.useState<SubjectData | null>(null);

  // Filter states
  const [majorFilter, setMajorFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const { data: subjects = [], isLoading, refetch } = useGetSubjects();
  const { data: majors = [] } = useGetMajors();

  const handleSuccess = () => {
    refetch();
  };

  // Custom global filter function
  const globalFilterFn = React.useCallback((row: any, columnId: string, filterValue: string) => {
    if (!filterValue) return true;

    const searchValue = filterValue.toLowerCase();
    const subject = row.original;
    const major = subject.major;

    // Search in multiple fields
    const searchableText = [subject.code, subject.name, subject.description, major?.name, subject.credits.toString()].filter(Boolean).join(" ").toLowerCase();

    return searchableText.includes(searchValue);
  }, []);

  const columns: ColumnDef<SubjectData>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Hash className="mr-2 h-4 w-4" />
            Kode
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("code")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Nama Mata Pelajaran
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="font-medium">{row.getValue("name")}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground truncate" title={row.original.description}>
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },

    {
      id: "major",
      accessorFn: (row) => row.major?.name || "Semua Jurusan",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <GraduationCap className="mr-2 h-4 w-4" />
            Jurusan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const major = row.original.major;
        return (
          <div>
            {major ?
              <Badge variant="outline">{major.name}</Badge>
            : <Badge variant="secondary">Semua Jurusan</Badge>}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        if (value === "none") return !row.original.majorId;
        return row.original.majorId === value;
      },
    },
    {
      accessorKey: "credits",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            SKS
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="default">{row.getValue("credits")} SKS</Badge>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600" : "bg-gray-600"}>
            {isActive ? "Aktif" : "Tidak Aktif"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        if (value === "active") return row.getValue("isActive") === true;
        if (value === "inactive") return row.getValue("isActive") === false;
        return true;
      },
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
        const subjectData = row.original;

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(subjectData.id)}>Copy ID Mata Pelajaran</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(subjectData.code)}>Copy Kode Mata Pelajaran</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSubject(subjectData);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSubject(subjectData);
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

  const table = useReactTable<SubjectData>({
    data: subjects as SubjectData[],
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

  // Apply major filter
  React.useEffect(() => {
    if (majorFilter !== "all") {
      table.getColumn("major")?.setFilterValue(majorFilter);
    } else {
      table.getColumn("major")?.setFilterValue(undefined);
    }
  }, [majorFilter, table]);

  // Apply status filter
  React.useEffect(() => {
    if (statusFilter !== "all") {
      table.getColumn("isActive")?.setFilterValue(statusFilter);
    } else {
      table.getColumn("isActive")?.setFilterValue(undefined);
    }
  }, [statusFilter, table]);

  if (isLoading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  return (
    <>
      <div className="mx-auto my-8 p-6 max-w-7xl min-h-screen">
        <div className="font-bold text-3xl mb-6">Data Mata Pelajaran</div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari kode, nama, atau deskripsi..." value={globalFilter ?? ""} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm pl-8" disabled={isLoading} />
            </div>

            {/* Major Filter */}
            <Select value={majorFilter} onValueChange={setMajorFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter Jurusan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jurusan</SelectItem>
                <SelectItem value="none">Tanpa Jurusan</SelectItem>
                {majors?.map((major: any) => (
                  <SelectItem key={major.id} value={major.id}>
                    {major.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(globalFilter || majorFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGlobalFilter("");
                  setMajorFilter("all");
                  setStatusFilter("all");
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
                          case "code":
                            return "Kode";
                          case "name":
                            return "Nama Mata Pelajaran";
                          case "major":
                            return "Jurusan";
                          case "credits":
                            return "SKS";
                          case "isActive":
                            return "Status";
                          case "description":
                            return "Deskripsi";
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
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Mata Pelajaran
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(globalFilter || majorFilter !== "all" || statusFilter !== "all") && (
          <div className="flex items-center space-x-2 py-2">
            <span className="text-sm text-muted-foreground">Filter aktif:</span>
            {globalFilter && (
              <Badge variant="secondary" className="gap-1">
                Pencarian: {globalFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setGlobalFilter("")} />
              </Badge>
            )}
            {majorFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Jurusan: {majorFilter === "none" ? "Tanpa Jurusan" : majors?.find((m: any) => m.id === majorFilter)?.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setMajorFilter("all")} />
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFilter === "active" ? "Aktif" : "Tidak Aktif"}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
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
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">{globalFilter || majorFilter !== "all" || statusFilter !== "all" ? "Tidak ada data yang sesuai dengan filter." : "Tidak ada data mata pelajaran yang ditemukan."}</p>
                      {(globalFilter || majorFilter !== "all" || statusFilter !== "all") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGlobalFilter("");
                            setMajorFilter("all");
                            setStatusFilter("all");
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
            {table.getFilteredRowModel().rows.length !== subjects.length && <span className="ml-2">(difilter dari {subjects.length} total)</span>}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Total Mata Pelajaran</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{subjects.length}</p>
            {table.getFilteredRowModel().rows.length !== subjects.length && <p className="text-sm text-muted-foreground">({table.getFilteredRowModel().rows.length} terfilter)</p>}
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-green-600"></div>
              <h3 className="font-semibold">Aktif</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{table.getFilteredRowModel().rows.filter((row) => row.original.isActive === true).length}</p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-gray-600"></div>
              <h3 className="font-semibold">Tidak Aktif</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{table.getFilteredRowModel().rows.filter((row) => row.original.isActive === false).length}</p>
          </div>

          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Total SKS</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{table.getFilteredRowModel().rows.reduce((total, row) => total + row.original.credits, 0)}</p>
          </div>
        </div>

        {/* Dialogs */}
        <SubjectFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />

        <SubjectFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} editData={selectedSubject} onSuccess={handleSuccess} />

        <DeleteSubjectDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} subjectData={selectedSubject} onSuccess={handleSuccess} />
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

  // Check if user is Admin
  if (userRole !== "Admin") {
    unauthorized();
    return null;
  }

  // Render dashboard only after authorization is confirmed
  return <SubjectDataTable />;
}
