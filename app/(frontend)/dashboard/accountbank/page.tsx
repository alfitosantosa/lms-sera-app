"use client";

import { useCreateAccountBank, useDeleteAccountBank, useGetAccountBank, useUpdateAccountBank } from "@/app/(hooks)/hooks/AccountBank/useAccountBank";
import { useGetMajors } from "@/app/(hooks)/hooks/Majors/useMajors";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { AccountBankTypes } from "@/app/(types)/types/accountbank-types";
import Loading from "@/components/loading";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/authClients";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, Building2, ChevronDown, CreditCard, Landmark, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Form schema
const accountBankSchema = z.object({
  accountName: z.string().min(1, "Nama pemilik akun wajib diisi"),
  accountBank: z.string().min(1, "Nama bank wajib diisi"),
  accountNumber: z.string().min(1, "Nomor rekening wajib diisi"),
  majorId: z.string().min(1, "Jurusan wajib dipilih"),
});

type AccountBankFormValues = z.infer<typeof accountBankSchema>;

// Common Indonesian banks list
const indonesianBanks = ["BCA", "BRI", "BNI", "Mandiri", "BTN", "CIMB Niaga", "Danamon", "Permata", "Maybank", "Muamalat", "OCBC NISP", "Panin Bank", "Bank Syariah Indonesia (BSI)", "Bank Mega", "Bank Bukopin", "Bank Sinarmas", "Lainnya"];

// Statistics Card Component
function StatisticsCards({ accounts }: { accounts: AccountBankTypes[] }) {
  const totalAccounts = accounts.length;

  // Unique banks
  const uniqueBanks = new Set(accounts.map((a) => a.accountBank)).size;

  // Unique majors
  const uniqueMajors = new Set(accounts.map((a) => a.majorId)).size;

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Rekening</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAccounts}</div>
          <p className="text-xs text-muted-foreground">Total rekening terdaftar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jenis Bank</CardTitle>
          <Landmark className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{uniqueBanks}</div>
          <p className="text-xs text-muted-foreground">Bank berbeda terdaftar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Branch Terdaftar</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{uniqueMajors}</div>
          <p className="text-xs text-muted-foreground">Branch memiliki rekening</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Create/Edit Dialog Component
function AccountBankFormDialog({ open, onOpenChange, editData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; editData?: AccountBankTypes | null; onSuccess: () => void }) {
  const createAccountBank = useCreateAccountBank();
  const updateAccountBank = useUpdateAccountBank();

  // Get majors from hook
  const { data: majors = [] } = useGetMajors();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AccountBankFormValues>({
    resolver: zodResolver(accountBankSchema),
    defaultValues: {
      accountName: "",
      accountBank: "",
      accountNumber: "",
      majorId: "",
    },
  });

  const selectedBank = watch("accountBank");
  const selectedMajorId = watch("majorId");

  React.useEffect(() => {
    if (editData) {
      setValue("accountName", editData.accountName);
      setValue("accountBank", editData.accountBank);
      setValue("accountNumber", editData.accountNumber);
      setValue("majorId", editData.majorId);
    } else {
      reset({
        accountName: "",
        accountBank: "",
        accountNumber: "",
        majorId: "",
      });
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: AccountBankFormValues) => {
    try {
      if (editData) {
        await updateAccountBank.mutateAsync({ id: editData.id, ...data });
        toast.success("Rekening berhasil diperbarui!");
      } else {
        await createAccountBank.mutateAsync(data);
        toast.success("Rekening berhasil ditambahkan!");
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan rekening";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Rekening Bank" : "Tambah Rekening Bank Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Nama Pemilik Rekening</Label>
            <Input id="accountName" placeholder="Masukkan nama pemilik rekening" {...register("accountName")} />
            {errors.accountName && <p className="text-sm text-red-500">{errors.accountName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Nama Bank</Label>
            <Select value={selectedBank} onValueChange={(value) => setValue("accountBank", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Bank" />
              </SelectTrigger>
              <SelectContent>
                {indonesianBanks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.accountBank && <p className="text-sm text-red-500">{errors.accountBank.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Nomor Rekening</Label>
            <Input id="accountNumber" placeholder="Masukkan nomor rekening" {...register("accountNumber")} />
            {errors.accountNumber && <p className="text-sm text-red-500">{errors.accountNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Jurusan</Label>
            <Select value={selectedMajorId} onValueChange={(value) => setValue("majorId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Branch" />
              </SelectTrigger>
              <SelectContent>
                {majors.map((major) => (
                  <SelectItem key={major.id} value={major.id}>
                    {major.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.majorId && <p className="text-sm text-red-500">{errors.majorId.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createAccountBank.isPending || updateAccountBank.isPending}>
              {createAccountBank.isPending || updateAccountBank.isPending ?
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
function DeleteAccountBankDialog({ open, onOpenChange, accountData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; accountData: AccountBankTypes | null; onSuccess: () => void }) {
  const deleteAccountBank = useDeleteAccountBank();

  const handleDelete = async () => {
    if (!accountData) return;

    try {
      await deleteAccountBank.mutateAsync(accountData.id);
      toast.success("Rekening berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus rekening";
      toast.error(errorMessage);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Rekening Bank</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus rekening atas nama <strong>{accountData?.accountName}</strong> di <strong>{accountData?.accountBank}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteAccountBank.isPending} className="bg-red-600 hover:bg-red-700">
            {deleteAccountBank.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main Dashboard Component
function AccountBankDashboard() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState<AccountBankTypes | null>(null);

  const { data: accounts = [], isLoading, refetch } = useGetAccountBank();

  const handleSuccess = () => {
    refetch();
  };

  const columns: ColumnDef<AccountBankTypes>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "accountName",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nama Pemilik
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("accountName")}</div>,
    },
    {
      accessorKey: "accountBank",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Bank
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          {row.getValue("accountBank")}
        </div>
      ),
    },
    {
      accessorKey: "accountNumber",
      header: "Nomor Rekening",
      cell: ({ row }) => <div className="font-mono">{row.getValue("accountNumber")}</div>,
    },
    {
      id: "majorName",
      header: "Branch",
      accessorFn: (row) => row.majors?.name,
      cell: ({ row }) => {
        return <div>{row.original.majors?.name || "-"}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Dibuat
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        return (
          <div>
            {new Date(date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const accountData = row.original;

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(accountData.accountNumber)}>Copy Nomor Rekening</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAccount(accountData);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedAccount(accountData);
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
    data: accounts,
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
        <div className="mb-6">
          <h1 className="font-bold text-3xl mb-2">Dashboard Rekening Bank</h1>
          <p className="text-muted-foreground">Kelola rekening bank untuk setiap jurusan</p>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards accounts={accounts} />

        <div className="mx-auto">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Cari nama pemilik rekening..."
                value={(table.getColumn("accountName")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("accountName")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
              <Input placeholder="Cari nama bank..." value={(table.getColumn("accountBank")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("accountBank")?.setFilterValue(event.target.value)} className="max-w-sm" />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
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
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Rekening
              </Button>
            </div>
          </div>

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
                      Tidak ada data rekening bank.
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
        <AccountBankFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />

        <AccountBankFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} editData={selectedAccount} onSuccess={handleSuccess} />

        <DeleteAccountBankDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} accountData={selectedAccount} onSuccess={handleSuccess} />
      </div>
    </>
  );
}

export default function AccountBankDashboardPage() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  // Show loading while checking authorization
  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check if user is Admin or Bendahara
  if (userRole !== "Admin" && userRole !== "Bendahara") {
    unauthorized();
    return null;
  }

  return <AccountBankDashboard />;
}
