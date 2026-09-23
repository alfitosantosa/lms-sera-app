"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

import { useGetBranchs } from "@/app/(hooks)/hooks/Branchs/useBranchs";
import {
  useCreatePaymentType,
  useDeletePaymentType,
  useGetPaymentTypes,
  useUpdatePaymentType,
} from "@/app/(hooks)/hooks/Payments/usePaymentType";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/authClients";
import { zodResolver } from "@hookform/resolvers/zod";
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
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { unauthorized } from "next/navigation";

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
  isMonthly: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  branchId: string;
  branch: {
    name: string;
  };
};

type PaymentTypeFormValues = z.infer<typeof paymentTypeSchema>;

// ============================================================================
// Constants & Schemas
// ============================================================================

const OWNER_OPTIONS = [
  { value: "Sekolah", label: "Sekolah" },
  { value: "Koperasi", label: "Koperasi" },
] as const;

const COLUMN_LABELS = {
  name: "Nama Pembayaran",
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
  name: z.string().min(1, "Nama jenis pembayaran wajib diisi"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  amount: z.number().min(0, "Jumlah minimal 0"),
  subtotal: z.number().min(0, "Jumlah minimal 0"),
  isMonthly: z.boolean(),
  isActive: z.boolean(),
  quantity: z.number().min(0, "Jumlah minimal 0"),
  isFixedAmount: z.boolean(),
  isFixedQuantity: z.boolean(),
  owner: z.string(),
  branchId: z.string().min(1, "Branch wajib dipilih"),
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
  branchId: "",
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

const parseToFloat = (value: string | number): number => {
  return parseFloat(value as any) || 0;
};

const getColumnLabel = (columnId: string): string => {
  return COLUMN_LABELS[columnId as keyof typeof COLUMN_LABELS] || columnId;
};

// ============================================================================
// Badge Components
// ============================================================================

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <Badge
    className={`text-white ${isActive ? "bg-success-solid" : "bg-muted-foreground"}`}
  >
    {isActive ? "Aktif" : "Nonaktif"}
  </Badge>
);

const TypeBadge = ({ isMonthly }: { isMonthly: boolean }) => (
  <Badge
    className={`text-white ${isMonthly ? "bg-info-solid" : "bg-tertiary-solid"}`}
  >
    {isMonthly ? "Bulanan" : "Sekali Bayar"}
  </Badge>
);

const FixedBadge = ({ isFixed }: { isFixed: boolean }) => (
  <Badge
    className={`text-white ${isFixed ? "bg-info-solid" : "bg-muted-foreground"}`}
  >
    {isFixed ? "Tetap" : "Tidak Tetap"}
  </Badge>
);

// ============================================================================
// Form Dialog Component
// ============================================================================

function PaymentTypeFormDialog({
  open,
  onOpenChange,
  editData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: PaymentTypeData | null;
  onSuccess: () => void;
}) {
  const createPaymentType = useCreatePaymentType();
  const updatePaymentType = useUpdatePaymentType();
  const { data: branchs = [], isLoading: branchsLoading } = useGetBranchs();

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

  const [
    isMonthly,
    isActive,
    isFixedAmount,
    isFixedQuantity,
    amount,
    quantity,
  ] = watch([
    "isMonthly",
    "isActive",
    "isFixedAmount",
    "isFixedQuantity",
    "amount",
    "quantity",
  ]);

  // Auto-calculate subtotal
  useEffect(() => {
    const a = Number(amount) || 0;
    const q = Number(quantity) || 0;
    setValue("subtotal", a * q);
  }, [amount, quantity, setValue]);

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setValue("branchId", editData.branchId);
      setValue("name", editData.name);
      setValue("description", editData.description);
      setValue("amount", parseToFloat(editData.amount));
      setValue("isMonthly", editData.isMonthly);
      setValue("isActive", editData.isActive);
      setValue("quantity", parseToFloat(editData.quantity));
      setValue("isFixedAmount", editData.isFixedAmount);
      setValue("isFixedQuantity", editData.isFixedQuantity);
      setValue("owner", editData.owner);
      setValue("subtotal", parseToFloat(editData.subtotal));
    } else {
      reset(DEFAULT_FORM_VALUES);
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: PaymentTypeFormValues) => {
    try {
      const payload = {
        ...data,
      };

      if (editData) {
        await updatePaymentType.mutateAsync({
          id: editData.id,
          ...payload,
        } as any);
        toast.success("Jenis pembayaran berhasil diperbarui!");
      } else {
        await createPaymentType.mutateAsync(payload as any);
        toast.success("Jenis pembayaran berhasil dibuat!");
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
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData
              ? "Edit Jenis Pembayaran"
              : "Tambah Jenis Pembayaran Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Branch/Branch Selection */}
          <div className="space-y-2">
            <Label htmlFor="branchId">Branch *</Label>
            <Select
              value={watch("branchId")}
              onValueChange={(value) => setValue("branchId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih branch" />
              </SelectTrigger>
              <SelectContent>
                {branchsLoading ? (
                  <SelectItem value="" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  branchs.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.branchId && (
              <p className="text-destructive text-sm">
                {errors.branchId.message}
              </p>
            )}
          </div>

          {/* Owner Selection */}
          <div className="space-y-2">
            <Label htmlFor="owner">Jenis Peruntukan</Label>
            <Select
              value={watch("owner")}
              onValueChange={(value) => setValue("owner", value)}
            >
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
            {errors.owner && (
              <p className="text-destructive text-sm">{errors.owner.message}</p>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Jenis Pembayaran</Label>
            <Input
              id="name"
              placeholder="Contoh: SPP Bulanan"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi detail pembayaran..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Fixed Amount Toggle + Amount Input */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="isFixedAmount">Edit Amount</Label>
              <p className="text-muted-foreground text-sm">
                Jika Aktif maka tidak bisa di ubah pada saat pembayaran
              </p>
            </div>
            <Switch
              id="isFixedAmount"
              checked={isFixedAmount}
              onCheckedChange={(checked) => setValue("isFixedAmount", checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah Pembayaran (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-destructive text-sm">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Fixed Quantity Toggle + Quantity Input */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="isFixedQuantity">Edit Quantity</Label>
              <p className="text-muted-foreground text-sm">
                Jika Aktif maka tidak bisa di ubah saat pembayaran
              </p>
            </div>
            <Switch
              id="isFixedQuantity"
              checked={isFixedQuantity}
              onCheckedChange={(checked) =>
                setValue("isFixedQuantity", checked)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Jumlah Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-destructive text-sm">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Subtotal Display */}
          <div className="space-y-2">
            <Label htmlFor="subtotal">Jumlah Subtotal</Label>
            <Input
              id="subtotal"
              disabled
              placeholder="0"
              {...register("subtotal", { valueAsNumber: true })}
            />
            {errors.subtotal && (
              <p className="text-destructive text-sm">
                {errors.subtotal.message}
              </p>
            )}
          </div>

          {/* Monthly Payment Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="isMonthly">Pembayaran Bulanan</Label>
              <p className="text-muted-foreground text-sm">
                Aktifkan jika pembayaran dilakukan setiap bulan
              </p>
            </div>
            <Switch
              id="isMonthly"
              checked={isMonthly}
              onCheckedChange={(checked) => setValue("isMonthly", checked)}
            />
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Status Aktif</Label>
              <p className="text-muted-foreground text-sm">
                Jenis pembayaran aktif dapat digunakan
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                createPaymentType.isPending || updatePaymentType.isPending
              }
            >
              {createPaymentType.isPending || updatePaymentType.isPending
                ? "Menyimpan..."
                : editData
                  ? "Perbarui"
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

function DeletePaymentTypeDialog({
  open,
  onOpenChange,
  paymentTypeData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentTypeData: PaymentTypeData | null;
  onSuccess: () => void;
}) {
  const deletePaymentType = useDeletePaymentType();

  const handleDelete = async () => {
    if (!paymentTypeData) return;
    console.log(paymentTypeData.id);

    try {
      await deletePaymentType.mutateAsync(paymentTypeData.id);
      toast.success("Jenis pembayaran berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus jenis pembayaran");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Jenis Pembayaran</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus jenis pembayaran{" "}
            <strong>{paymentTypeData?.name}</strong>? Tindakan ini tidak dapat
            dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePaymentType.isPending}
            className="bg-destructive-solid hover:bg-destructive-solid/90"
          >
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

const createColumns = (
  onEdit: (data: PaymentTypeData) => void,
  onDelete: (data: PaymentTypeData) => void,
): ColumnDef<PaymentTypeData>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama Pembayaran
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="max-w-xs font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "owner",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Jenis Peruntukan
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="max-w-xs font-medium">{row.getValue("owner")}</div>
    ),
  },
  {
    accessorKey: "branch.name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Branch
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const branch = row.original.branch;
      return <div className="font-medium">{branch?.name || "-"}</div>;
    },
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
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
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
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("quantity")}</div>
    ),
  },
  {
    accessorKey: "subtotal",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
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
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(row.original.id)}
          >
            Copy ID Pembayaran
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(row.original)}
            className="text-destructive"
          >
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

function PaymentTypeDataTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [branchSelection, setBranchSelection] = useState<string | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] =
    useState<PaymentTypeData | null>(null);

  const { data: paymentTypes = [], isLoading, refetch } = useGetPaymentTypes();
  const { data: branchs = [] } = useGetBranchs();

  // Filter payment types by selected branch
  const filteredPaymentTypes = useMemo(() => {
    if (!branchSelection) return paymentTypes;
    return paymentTypes.filter((pt) => pt.branchId === branchSelection);
  }, [paymentTypes, branchSelection]);

  const handleSuccess = () => {
    refetch();
  };

  const handleEdit = useCallback((data: PaymentTypeData) => {
    setSelectedPaymentType(data);
    setEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((data: PaymentTypeData) => {
    setSelectedPaymentType(data);
    setDeleteDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete],
  );

  const table = useReactTable<PaymentTypeData>({
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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="">
      <div className="mb-6 text-3xl font-bold">Jenis Tagihan</div>

      {/* Filter and Actions Bar */}
      <div className="flex items-center justify-between py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Cari nama pembayaran..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {branchSelection
                  ? branchs.find((m: any) => m.id === branchSelection)?.name
                  : "Filter Branch"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setBranchSelection(null)}>
                Semua Branch
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {branchs.map((branch: any) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => setBranchSelection(branch.id)}
                >
                  {branch.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* //filter branch */}

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
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Button */}
          <Button disabled={true} onClick={() => setCreateDialogOpen(true)}>
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
                  Tidak ada data jenis pembayaran.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} dari{" "}
          {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
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

      {/* Dialogs */}
      <PaymentTypeFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      <PaymentTypeFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        editData={selectedPaymentType}
        onSuccess={handleSuccess}
      />

      <DeletePaymentTypeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        paymentTypeData={selectedPaymentType}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

// ============================================================================
// Authorization Wrapper Component
// ============================================================================

export default function PaymentTypeTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } =
    useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;
  console.log(userData);

  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  if (userRole !== "Admin") {
    unauthorized();
    return null;
  }

  return <PaymentTypeDataTable />;
}
