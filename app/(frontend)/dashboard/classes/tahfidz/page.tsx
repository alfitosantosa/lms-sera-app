"use client";

import { useCreateTahfidzGroup, useDeleteTahfidzGroup, useGetTahfidzGroup, useUpdateTahfidzGroup } from "@/app/(hooks)/hooks/TahfidzGroup/useTahfidzGroup";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { getErrorMessage, TahfidzGrade, TahfidzGradesArray } from "@/app/(types)";
import Loading from "@/components/loading";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/authClients";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Import hooks
// Type definitions
export type TahfidzGroupData = {
  id: string;
  name: string;
  grade: number;
  capacity: number;
  isActive: boolean;
  _count?: {
    students: number;
  };
};

// Form schema
const tahfidzGroupSchema = z.object({
  name: z.string().min(1, "Nama kelompok tahfidz wajib diisi"),
  grade: z.number().min(1, "Tingkat minimal 1").max(12, "Tingkat maksimal 12"),
  capacity: z.number().min(1, "Kapasitas minimal 1").max(50, "Kapasitas maksimal 50"),
});

type TahfidzGroupFormValues = z.infer<typeof tahfidzGroupSchema>;

// Create/Edit Dialog Component
function TahfidzGroupFormDialog({ open, onOpenChange, editData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; editData?: TahfidzGroupData | null; onSuccess: () => void }) {
  const createTahfidzGroup = useCreateTahfidzGroup();
  const updateTahfidzGroup = useUpdateTahfidzGroup();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TahfidzGroupFormValues>({
    resolver: zodResolver(tahfidzGroupSchema),
    defaultValues: {
      capacity: 40,
    },
  });

  React.useEffect(() => {
    if (editData) {
      reset({
        name: editData.name,
        grade: editData.grade,
        capacity: editData.capacity,
      });
    } else {
      reset({
        capacity: 40,
      });
    }
  }, [editData, reset]);

  const onSubmit = async (data: TahfidzGroupFormValues) => {
    try {
      if (editData) {
        await updateTahfidzGroup.mutateAsync({ id: editData.id, ...data });
        toast.success("Kelompok tahfidz berhasil diperbarui!");
      } else {
        await createTahfidzGroup.mutateAsync(data);
        toast.success("Kelompok tahfidz berhasil dibuat!");
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Kelompok Tahfidz" : "Tambah Kelompok Tahfidz Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kelompok</Label>
            <Input id="name" placeholder="Contoh: Tahfidz A" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Tingkat</Label>
            <Input id="grade" type="number" placeholder="10, 11, 12" {...register("grade", { valueAsNumber: true })} />
            {errors.grade && <p className="text-sm text-red-500">{errors.grade.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Kapasitas</Label>
            <Input id="capacity" type="number" placeholder="40" {...register("capacity", { valueAsNumber: true })} />
            {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createTahfidzGroup.isPending || updateTahfidzGroup.isPending}>
              {createTahfidzGroup.isPending || updateTahfidzGroup.isPending ?
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
function DeleteTahfidzGroupDialog({ open, onOpenChange, tahfidzGroupData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; tahfidzGroupData: TahfidzGroupData | null; onSuccess: () => void }) {
  const deleteTahfidzGroup = useDeleteTahfidzGroup();

  const handleDelete = async () => {
    if (!tahfidzGroupData) return;

    try {
      await deleteTahfidzGroup.mutateAsync(tahfidzGroupData.id);
      toast.success("Kelompok tahfidz berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kelompok Tahfidz</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus kelompok tahfidz <strong>{tahfidzGroupData?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteTahfidzGroup.isPending} className="bg-red-600 hover:bg-red-700">
            {deleteTahfidzGroup.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main DataTable Component
function TahfidzGroupDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedTahfidzGroup, setSelectedTahfidzGroup] = React.useState<TahfidzGroupData | null>(null);

  // Filter states
  const [gradeFilter, setGradeFilter] = React.useState<string>("all");

  const { data: tahfidzGroups = [], isLoading, refetch } = useGetTahfidzGroup();

  const handleSuccess = () => {
    refetch();
  };

  const columns: ColumnDef<TahfidzGroupData>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Nama Kelompok
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "grade",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Tingkat
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-medium">
          Kelas {row.getValue("grade")}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        return row.original.grade === parseInt(value);
      },
    },
    {
      accessorKey: "capacity",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Kapasitas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const capacity = row.getValue("capacity") as number;
        const studentCount = row.original._count?.students || 0;
        return (
          <div className="text-center">
            <span className="font-medium">{studentCount}</span>
            <span className="text-muted-foreground">/{capacity}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Aktif" : "Tidak Aktif"}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const tahfidzGroupData = row.original;

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(tahfidzGroupData.id)}>Copy ID Kelompok</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedTahfidzGroup(tahfidzGroupData);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedTahfidzGroup(tahfidzGroupData);
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
    data: tahfidzGroups,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Apply grade filter
  React.useEffect(() => {
    if (gradeFilter !== "all") {
      table.getColumn("grade")?.setFilterValue(gradeFilter);
    } else {
      table.getColumn("grade")?.setFilterValue(undefined);
    }
  }, [gradeFilter, table]);

  if (isLoading) {
    return <Loading />;
  }

  // Get unique grades for filter
  const uniqueGrades: TahfidzGradesArray = Array.from(new Set(tahfidzGroups.map((group: TahfidzGroupData) => group.grade))).sort() as TahfidzGradesArray;

  return (
    <>
      <div className="">
        <div className="font-bold text-3xl mb-6">Kelompok Tahfidz</div>
        <div className="mx-auto">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <Input placeholder="Cari nama kelompok..." value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} className="max-w-sm" />

              {/* Grade Filter */}
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">Semua Tingkat</option>
                {uniqueGrades.map((grade: TahfidzGrade) => (
                  <option key={grade} value={grade}>
                    Kelas {grade}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              {gradeFilter !== "all" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGradeFilter("all");
                    table.resetColumnFilters();
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset Filter
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kelompok
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
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
                      Tidak ada data kelompok tahfidz.
                    </TableCell>
                  </TableRow>
                }
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
            </div>
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

        {/* Dialogs */}
        <TahfidzGroupFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />

        <TahfidzGroupFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} editData={selectedTahfidzGroup} onSuccess={handleSuccess} />

        <DeleteTahfidzGroupDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} tahfidzGroupData={selectedTahfidzGroup} onSuccess={handleSuccess} />
      </div>
    </>
  );
}

export default function TahfidzGroupPage() {
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

  // Render page only after authorization is confirmed
  return <TahfidzGroupDataTable />;
}
