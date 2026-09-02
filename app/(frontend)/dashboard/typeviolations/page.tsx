"use client";

import { useGetAcademicYears } from "@/app/(hooks)/hooks/AcademicYears/useAcademicYear";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { useCreateTypeViolation, useDeleteTypeViolation, useGetTypeViolations, useUpdateTypeViolation } from "@/app/(hooks)/hooks/Violations/useTypeViolations";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Import hooks
// Type definitions
export type ViolationTypeData = {
  id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  academicYearId: string;
  academicYear?: {
    id: string;
    year: string;
  };
  violations?: any[];
};

// Form schema
const violationTypeSchema = z.object({
  name: z.string().min(1, "Nama pelanggaran wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  points: z.number().min(1, "Poin minimal 1").max(100, "Poin maksimal 100"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  academicYearId: z.string().min(1, "Tahun ajaran wajib dipilih"),
});

type ViolationTypeFormValues = z.infer<typeof violationTypeSchema>;

// Predefined categories
const violationCategories = [
  { value: "KEDISIPLINAN", label: "Kedisiplinan" },
  { value: "AKADEMIK", label: "Akademik" },
  { value: "SOSIAL", label: "Sosial" },
  { value: "KETERTIBAN", label: "Ketertiban" },
  { value: "MORAL", label: "Moral" },
];

// Create/Edit Dialog Component
function ViolationTypeFormDialog({ open, onOpenChange, editData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; editData?: ViolationTypeData | null; onSuccess: () => void }) {
  const createViolationType = useCreateTypeViolation();
  const updateViolationType = useUpdateTypeViolation();
  const { data: academicYears } = useGetAcademicYears();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ViolationTypeFormValues>({
    resolver: zodResolver(violationTypeSchema),
    defaultValues: {
      points: 5,
    },
  });

  const selectedCategory = watch("category");
  const selectedAcademicYearId = watch("academicYearId");

  React.useEffect(() => {
    if (editData) {
      setValue("name", editData.name);
      setValue("description", editData.description);
      setValue("points", editData.points);
      setValue("category", editData.category);
      setValue("academicYearId", editData.academicYearId);
    } else {
      reset({
        points: 5,
      });
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: ViolationTypeFormValues) => {
    try {
      if (editData) {
        await updateViolationType.mutateAsync({ id: editData.id, ...data } as any);
        toast.success("Jenis pelanggaran berhasil diperbarui!");
      } else {
        await createViolationType.mutateAsync(data as any);
        toast.success("Jenis pelanggaran berhasil dibuat!");
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Jenis Pelanggaran" : "Tambah Jenis Pelanggaran Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Pelanggaran</Label>
            <Input id="name" placeholder="Contoh: Terlambat Masuk Sekolah" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" placeholder="Deskripsi detail pelanggaran..." rows={3} {...register("description")} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Poin Pelanggaran</Label>
            <Input id="points" type="number" placeholder="5" {...register("points", { valueAsNumber: true })} />
            {errors.points && <p className="text-sm text-red-500">{errors.points.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={selectedCategory} onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {violationCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tahun Ajaran</Label>
            <Select value={selectedAcademicYearId} onValueChange={(value) => setValue("academicYearId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun Ajaran" />
              </SelectTrigger>
              <SelectContent>
                {academicYears?.map((year: any) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.academicYearId && <p className="text-sm text-red-500">{errors.academicYearId.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createViolationType.isPending || updateViolationType.isPending}>
              {createViolationType.isPending || updateViolationType.isPending ?
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
function DeleteViolationTypeDialog({ open, onOpenChange, violationTypeData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; violationTypeData: ViolationTypeData | null; onSuccess: () => void }) {
  const deleteViolationType = useDeleteTypeViolation();

  const handleDelete = async () => {
    if (!violationTypeData) return;

    try {
      await deleteViolationType.mutateAsync(violationTypeData.id as any);
      toast.success("Jenis pelanggaran berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus jenis pelanggaran");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Jenis Pelanggaran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus jenis pelanggaran <strong>{violationTypeData?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteViolationType.isPending} className="bg-red-600 hover:bg-red-700">
            {deleteViolationType.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main DataTable Component
function ViolationTypeDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedViolationType, setSelectedViolationType] = React.useState<ViolationTypeData | null>(null);

  const { data: violationTypes = [], isLoading, refetch } = useGetTypeViolations();

  const handleSuccess = () => {
    refetch();
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "KEDISIPLINAN":
        return "bg-blue-600";
      case "AKADEMIK":
        return "bg-green-600";
      case "SOSIAL":
        return "bg-purple-600";
      case "KETERTIBAN":
        return "bg-orange-600";
      case "MORAL":
        return "bg-red-600";
      default:
        return "bg-gray-600";
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = violationCategories.find((cat) => cat.value === category);
    return found ? found.label : category;
  };

  const getPointsBadgeColor = (points: number) => {
    if (points <= 10) return "bg-green-600";
    if (points <= 25) return "bg-yellow-600";
    if (points <= 50) return "bg-orange-600";
    return "bg-red-600";
  };

  const columns: ColumnDef<ViolationTypeData>[] = [
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
            Nama Pelanggaran
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium max-w-xs">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.getValue("description")}>
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Kategori
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return <Badge className={`text-white ${getCategoryBadgeColor(category)}`}>{getCategoryLabel(category)}</Badge>;
      },
    },
    {
      accessorKey: "points",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Poin
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const points = row.getValue("points") as number;
        return <Badge className={`text-white ${getPointsBadgeColor(points)}`}>{points} poin</Badge>;
      },
    },
    {
      accessorKey: "academicYear",
      header: "Tahun Ajaran",
      cell: ({ row }) => {
        const academicYear = row.getValue("academicYear") as ViolationTypeData["academicYear"];
        return <div>{academicYear?.year || "-"}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const violationTypeData = row.original;

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(violationTypeData.id)}>Copy ID Pelanggaran</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedViolationType(violationTypeData);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedViolationType(violationTypeData);
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
    data: violationTypes,
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="">
        <div className="font-bold text-3xl">Jenis Pelanggaran</div>
        <div className="mx-auto">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <Input placeholder="Cari nama pelanggaran..." value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} className="max-w-sm" />
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
                      return (
                        <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                          {column.id === "name" ?
                            "Nama Pelanggaran"
                          : column.id === "description" ?
                            "Deskripsi"
                          : column.id === "category" ?
                            "Kategori"
                          : column.id === "points" ?
                            "Poin"
                          : column.id === "academicYear" ?
                            "Tahun Ajaran"
                          : column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Jenis Pelanggaran
              </Button>
            </div>
          </div>

          <div className="rounded-md border w-max-7xl">
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
                      Tidak ada data jenis pelanggaran.
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
        <ViolationTypeFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />

        <ViolationTypeFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} editData={selectedViolationType} onSuccess={handleSuccess} />

        <DeleteViolationTypeDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} violationTypeData={selectedViolationType} onSuccess={handleSuccess} />
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
  return <ViolationTypeDataTable />;
}
