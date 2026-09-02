"use client";

import { useCreatePaymentType, useDeletePaymentType, useGetPaymentTypeByIdMajor, useUpdatePaymentType } from "@/app/(hooks)/hooks/Payments/usePaymentType";
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
import { errorHandlerFrontend } from "@/lib/errorHandlerFrontend";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// ============================================================================
// Type Definitions
// ============================================================================

export type PaymentTypeData = {
  id: string;
  name: string;
  description: string;
  amount: number | string;
  quantity: number | string;
  subtotal: number | string;
  isFixedAmount: boolean;
  isFixedQuantity: boolean;
  owner: string;
  skuType: string;
  majorId: string;
  isMonthly: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type PaymentTypeFormValues = z.infer<typeof paymentTypeSchema>;

// ============================================================================
// Constants & Schemas
// ============================================================================

const SKUTYPE_OPTIONS = [
  { value: "SPP", label: "SPP" },
  { value: "Buku", label: "Buku" },
  { value: "Seragam", label: "Seragam" },
  { value: "Kegiatan", label: "Kegiatan" },
  { value: "Catering", label: "Catering" },
  { value: "Lainnya", label: "Lainnya" },
] as const;

const OWNER_OPTIONS = [
  { value: "Sekolah", label: "Sekolah" },
  { value: "Koperasi", label: "Koperasi" },
] as const;

const COLUMN_LABELS = {
  name: "Nama Transaksi",
  description: "Deskripsi",
  amount: "Jumlah",
  quantity: "Quantity",
  subtotal: "Subtotal",
  isFixedAmount: "Fixed Amount",
  isFixedQuantity: "Fixed Qty",
  isMonthly: "Tipe",
  isActive: "Status",
} as const;

const paymentTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama jenis pembayaran wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.number().min(0, "Jumlah minimal 0"),
  subtotal: z.number().min(0, "Jumlah minimal 0"),
  owner: z.string().min(1, "Jenis peruntukan wajib diisi"),
  majorId: z.string().min(1, "ID Branch wajib diisi"),
  skuType: z.string().min(1, "SKU Type wajib diisi"),
  quantity: z.number().min(0, "Jumlah minimal 0"),
  isMonthly: z.boolean(),
  isActive: z.boolean(),
  isFixedAmount: z.boolean(),
  isFixedQuantity: z.boolean(),
});

const DEFAULT_FORM_VALUES: Partial<PaymentTypeFormValues> = {
  amount: 0,
  quantity: 0,
  subtotal: 0,
  isMonthly: false,
  isActive: true,
  isFixedAmount: false,
  isFixedQuantity: false,
  owner: "",
  name: "",
  description: "",
  skuType: "",
};

// ============================================================================
// Utility Functions
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const parseToFloat = (value: number | string) => {
  return typeof value === "string" ? Number.parseFloat(value) || 0 : value || 0;
};

const getColumnLabel = (columnId: string): string => {
  return COLUMN_LABELS[columnId as keyof typeof COLUMN_LABELS] || columnId;
};

// ============================================================================
// Badge Components
// ============================================================================

const StatusBadge = ({ isActive }: { isActive: boolean }) => <Badge className={`text-white ${isActive ? "bg-green-600" : "bg-gray-600"}`}>{isActive ? "Aktif" : "Nonaktif"}</Badge>;

const TypeBadge = ({ isMonthly }: { isMonthly: boolean }) => <Badge className={`text-white ${isMonthly ? "bg-blue-600" : "bg-purple-600"}`}>{isMonthly ? "Bulanan" : "Sekali Bayar"}</Badge>;

const FixedBadge = ({ isFixed }: { isFixed: boolean }) => <Badge className={`text-white ${isFixed ? "bg-blue-500" : "bg-gray-400"}`}>{isFixed ? "Tetap" : "Tidak Tetap"}</Badge>;

// ============================================================================
// Form Dialog Component
// ============================================================================

function PaymentTypeFormDialog({ open, onOpenChange, editData, onSuccess, id }: { id: string; open: boolean; onOpenChange: (open: boolean) => void; editData?: PaymentTypeData | null; onSuccess: () => void }) {
  const createPaymentType = useCreatePaymentType();
  const updatePaymentType = useUpdatePaymentType();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PaymentTypeFormValues>({
    resolver: zodResolver(paymentTypeSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const [isMonthly, isActive, isFixedAmount, isFixedQuantity, amount, quantity] = watch(["isMonthly", "isActive", "isFixedAmount", "isFixedQuantity", "amount", "quantity"]);

  // Auto-calculate subtotal
  React.useEffect(() => {
    const a = Number(amount) || 0;
    const q = Number(quantity) || 0;
    setValue("subtotal", a * q);
  }, [amount, quantity, setValue]);

  // Populate form when editing or auto-assign majorId
  React.useEffect(() => {
    if (editData) {
      setValue("id", editData.id);
      setValue("majorId", editData.majorId);
      setValue("name", editData.name);
      setValue("description", editData.description);
      setValue("amount", parseToFloat(editData.amount));
      setValue("isMonthly", editData.isMonthly);
      setValue("isActive", editData.isActive);
      setValue("quantity", parseToFloat(editData.quantity));
      setValue("isFixedAmount", editData.isFixedAmount);
      setValue("isFixedQuantity", editData.isFixedQuantity);
      setValue("owner", editData.owner);
      setValue("skuType", editData.skuType);
      setValue("subtotal", parseToFloat(editData.subtotal));
    } else {
      reset(DEFAULT_FORM_VALUES);
      // Auto-assign majorId from props
      if (id) {
        setValue("majorId", id as string);
      }
    }
  }, [editData, setValue, reset, id]);

  const onSubmit = async (data: PaymentTypeFormValues) => {
    try {
      const payload = {
        ...data,
      };

      if (editData) {
        await updatePaymentType.mutateAsync(payload);
        toast.success("Jenis Transaksi berhasil diperbarui!");
      } else {
        await createPaymentType.mutateAsync(payload);
        toast.success("Jenis Transaksi berhasil dibuat!");
      }

      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      errorHandlerFrontend(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Jenis Pembayaran" : "Tambah Jenis Pembayaran Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden majorId field - auto-assigned */}
          <input type="hidden" {...register("majorId")} />

          {/* Owner Selection */}
          <div className="space-y-2">
            <Label htmlFor="owner">Jenis Peruntukan</Label>
            <Select value={watch("owner")} onValueChange={(value) => setValue("owner", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih jenis peruntukan" />
              </SelectTrigger>
              <SelectContent>
                {OWNER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.owner && <p className="text-sm text-red-500">{errors.owner.message}</p>}
          </div>

          {/* SKU Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="skuType">Jenis SKU</Label>
            <Select value={watch("skuType")} onValueChange={(value) => setValue("skuType", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih jenis SKU" />
              </SelectTrigger>
              <SelectContent>
                {SKUTYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.skuType && <p className="text-sm text-red-500">{errors.skuType.message}</p>}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Jenis Pembayaran</Label>
            <Input id="name" placeholder="Contoh: SPP Bulanan" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" placeholder="Deskripsi detail pembayaran..." rows={3} {...register("description")} />
            {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Fixed Amount Toggle + Amount Input */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="isFixedAmount">Edit Amount</Label>
              <p className="text-sm text-muted-foreground">Aktifkan untuk Mengunci jumlah pembayaran</p>
            </div>
            <Switch id="isFixedAmount" checked={isFixedAmount} onCheckedChange={(checked) => setValue("isFixedAmount", checked)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Pembayaran (Rp)</Label>
            <Input id="amount" type="number" placeholder="0" {...register("amount", { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>

          {/* Fixed Quantity Toggle + Quantity Input */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="isFixedQuantity">Edit Quantity</Label>
              <p className="text-sm text-muted-foreground">Aktifkan untuk Mengunci jumlah quantity</p>
            </div>
            <Switch id="isFixedQuantity" checked={isFixedQuantity} onCheckedChange={(checked) => setValue("isFixedQuantity", checked)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah Quantity</Label>
            <Input id="quantity" type="number" placeholder="0" {...register("quantity", { valueAsNumber: true })} />
            {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
          </div>

          {/* Subtotal Display */}
          <div className="space-y-2">
            <Label htmlFor="subtotal">Jumlah Subtotal</Label>
            <Input id="subtotal" disabled placeholder="0" {...register("subtotal", { valueAsNumber: true })} />
            {errors.subtotal && <p className="text-sm text-red-500">{errors.subtotal.message}</p>}
          </div>

          {/* Monthly Payment Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="isMonthly">Pembayaran Bulanan</Label>
              <p className="text-sm text-muted-foreground">Aktifkan jika pembayaran dilakukan setiap bulan</p>
            </div>
            <Switch id="isMonthly" checked={isMonthly} onCheckedChange={(checked) => setValue("isMonthly", checked)} />
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Status Aktif</Label>
              <p className="text-sm text-muted-foreground">Jenis pembayaran aktif dapat digunakan</p>
            </div>
            <Switch id="isActive" checked={isActive} onCheckedChange={(checked) => setValue("isActive", checked)} />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createPaymentType.isPending || updatePaymentType.isPending}>
              {createPaymentType.isPending || updatePaymentType.isPending ?
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

// ============================================================================
// Delete Dialog Component
// ============================================================================

function DeletePaymentTypeDialog({ open, onOpenChange, paymentTypeData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; paymentTypeData: PaymentTypeData | null; onSuccess: () => void }) {
  const deletePaymentType = useDeletePaymentType();

  const handleDelete = async () => {
    if (!paymentTypeData) return;
    console.log(paymentTypeData.id);

    try {
      await deletePaymentType.mutateAsync(paymentTypeData.id);
      toast.success("Jenis pembayaran berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      errorHandlerFrontend(error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Jenis Pembayaran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus jenis pembayaran <strong>{paymentTypeData?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          {/* <AlertDialogAction onClick={handleDelete} disabled={deletePaymentType.isPending} className="bg-red-600 hover:bg-red-700">
            {deletePaymentType.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>   */}
          <AlertDialogAction onClick={handleDelete} disabled={true} className="bg-red-600 hover:bg-red-700">
            {deletePaymentType.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================================================
// Table Columns Definition
// ============================================================================

const createColumns = (onEdit: (data: PaymentTypeData) => void, onDelete: (data: PaymentTypeData) => void): ColumnDef<PaymentTypeData>[] => [
  {
    id: "select",
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nama Pembayaran
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
    accessorKey: "owner",
    header: "Peruntukan",
    cell: ({ row }) => <div>{row.getValue("owner")}</div>,
  },
  {
    accessorKey: "skuType",
    header: "Jenis SKU",
    cell: ({ row }) => <div>{row.getValue("skuType")}</div>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Jumlah
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseToFloat(row.getValue("amount"));
      return <div className="font-medium">{formatCurrency(amount)}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <div className="text-center">{row.getValue("quantity")}</div>,
  },
  {
    accessorKey: "subtotal",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Subtotal
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const subtotal = parseToFloat(row.getValue("subtotal"));
      return <div className="font-medium">{formatCurrency(subtotal)}</div>;
    },
  },
  {
    accessorKey: "isFixedAmount",
    header: "Fixed Amount",
    cell: ({ row }) => <FixedBadge isFixed={row.getValue("isFixedAmount")} />,
  },
  {
    accessorKey: "isFixedQuantity",
    header: "Fixed Qty",
    cell: ({ row }) => <FixedBadge isFixed={row.getValue("isFixedQuantity")} />,
  },
  {
    accessorKey: "isMonthly",
    header: "Tipe",
    cell: ({ row }) => <TypeBadge isMonthly={row.getValue("isMonthly")} />,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => <StatusBadge isActive={row.getValue("isActive")} />,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>Copy ID Pembayaran</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// ============================================================================
// Main DataTable Component
// ============================================================================

function PaymentTypeDataTable({ userMajorData }: { userMajorData: { id: string; name: string } }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isReady, setIsReady] = React.useState(false);

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = React.useState<PaymentTypeData | null>(null);

  // Fetch payment types for the specific branch
  const { data: paymentTypes = [], isLoading, refetch } = useGetPaymentTypeByIdMajor(userMajorData.id);

  // Wait for async data to load before rendering
  React.useEffect(() => {
    if (!isLoading && userMajorData) {
      setIsReady(true);
    }
  }, [isLoading, userMajorData]);

  // Filter by branch ID - only after data is ready
  const filteredPaymentTypes = React.useMemo(() => {
    if (!userMajorData.id || !isReady) return [];
    return paymentTypes;
  }, [paymentTypes, isReady]);

  const handleSuccess = () => {
    refetch();
  };

  const handleEdit = React.useCallback((data: PaymentTypeData) => {
    setSelectedPaymentType(data);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = React.useCallback((data: PaymentTypeData) => {
    setSelectedPaymentType(data);
    setDeleteDialogOpen(true);
  }, []);

  const columns = React.useMemo(() => createColumns(handleEdit, handleDelete), [handleEdit, handleDelete]);

  const table = useReactTable({
    data: filteredPaymentTypes as PaymentTypeData[],
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

  if (isLoading || !isReady) {
    return <Loading />;
  }

  return (
    <div className="">
      <div className="font-bold text-3xl mb-3">Jenis Tagihan</div>
      <Badge>{userMajorData.name}</Badge>
      {/* Filter and Actions Bar */}
      <div className="flex items-center justify-between py-4">
        <Input placeholder="Cari nama pembayaran..." value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} className="max-w-sm" />

        <div className="flex items-center space-x-2">
          {/* Column Visibility Dropdown */}
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
                .map((column) => (
                  <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {getColumnLabel(column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Button */}
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Jenis Tagihan
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
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
                  Tidak ada data jenis pembayaran.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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

      {/* Dialogs */}
      <PaymentTypeFormDialog open={createDialogOpen} id={userMajorData.id} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />

      <PaymentTypeFormDialog open={editDialogOpen} id={userMajorData.id} onOpenChange={setEditDialogOpen} editData={selectedPaymentType} onSuccess={handleSuccess} />

      <DeletePaymentTypeDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} paymentTypeData={selectedPaymentType} onSuccess={handleSuccess} />
    </div>
  );
}

// ============================================================================
// Authorization Wrapper Component
// ============================================================================

export default function PaymentTypeTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;
  const userMajorData = userData?.major;

  // Wait for all data to load before rendering
  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check authorization
  if (userRole !== "Admin" && userRole !== "Bendahara") {
    unauthorized();
    return null;
  }

  // Check if bendahara has a major assigned

  if (!userMajorData) {
    return (
      <div className="text-center">
        <p className="text-red-600">User tidak memiliki data jurusan.</p>
      </div>
    );
  }
  return <PaymentTypeDataTable userMajorData={userMajorData} />;
}
