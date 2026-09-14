"use client";

import {
  useCreateRole,
  useDeleteRole,
  useGetRoles,
  useUpdateRole,
} from "@/app/(hooks)/hooks/Roles/useRoles";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { RoleDataTypes, RolesInputData } from "@/app/(types)";
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
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Import hooks (Anda perlu membuat hooks ini sesuai dengan API backend)
// Type definitions
type RoleData = RoleDataTypes;

// Form schema
const roleSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Nama role wajib diisi")
    .max(50, "Nama role maksimal 50 karakter"),
  description: z.string().optional(),
  isActive: z.boolean(),
  permissions: z.array(z.string()).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

// Available permissions (sesuaikan dengan sistem Anda)
const availablePermissions = [
  // ========== Core Routes ==========
  { id: "/", label: "Home" },
  { id: "/dashboard", label: "Dashboard Management" },
  { id: "/dashboard/profile", label: "Profile" },

  // ========== Foundation & Reports ==========
  { id: "/dashboard/foundation", label: "Foundation Management" },
  { id: "/dashboard/reports", label: "Reports Management" },

  // ========== Admin Master ==========
  {
    id: "/dashboard/admin/master/academicyear",
    label: "Academic Year Management",
  },
  { id: "/dashboard/admin/master/roles", label: "Roles Management" },
  { id: "/dashboard/admin/master/betterauth", label: "BetterAuth Management" },
  { id: "/dashboard/admin/master/users", label: "Users Management" },
  { id: "/dashboard/admin/master/majors", label: "Major Management" },
  { id: "/dashboard/admin/master/classes", label: "Class Management" },
  {
    id: "/dashboard/admin/master/classes/tahfidz",
    label: "Tahfidz Group Management",
  },
  { id: "/dashboard/admin/master/subjects", label: "Subject Management" },

  // ========== Admin Academic ==========
  { id: "/dashboard/admin/academic/schedules", label: "Schedule Management" },
  {
    id: "/dashboard/admin/academic/specialschedule",
    label: "Special Schedule",
  },
  {
    id: "/dashboard/admin/academic/tahfidzrecord",
    label: "Tahfidz Record Management",
  },

  // ========== Admin Discipline ==========
  {
    id: "/dashboard/admin/discipline/typeviolations",
    label: "Type Violation Management",
  },

  // ========== Admin Finance ==========
  {
    id: "/dashboard/admin/finance/paymenttypes",
    label: "Payment Types Management",
  },
  { id: "/dashboard/admin/finance/payments", label: "Payment Management" },
  {
    id: "/dashboard/admin/finance/billing",
    label: "Data Tagihan (Admin)",
  },
  {
    id: "/dashboard/admin/finance/accountbank",
    label: "Akun Bank Management",
  },
  {
    id: "/dashboard/admin/finance/studentinformation",
    label: "Student Information",
  },
  {
    id: "/dashboard/admin/finance/payments/chart",
    label: "Dashboard Transaksi",
  },
  {
    id: "/dashboard/admin/finance/billing/chart",
    label: "Dashboard Tagihan",
  },
  {
    id: "/dashboard/admin/finance/accountbank/chart",
    label: "Dashboard Saldo",
  },

  // ========== Admin Utility ==========
  { id: "/dashboard/admin/utility/upload/users", label: "Upload Users" },
  {
    id: "/dashboard/admin/utility/upload/schedules",
    label: "Upload Schedules",
  },
  { id: "/dashboard/admin/utility/botwa", label: "Botwa Management" },

  // ========== Admin Attendance ==========
  { id: "/dashboard/admin/attendance", label: "Attendance for Admin Backup" },

  // ========== Treasurer Routes ==========
  {
    id: "/dashboard/treasurer/users",
    label: "Data Siswa (Bendahara)",
  },
  {
    id: "/dashboard/treasurer/class",
    label: "Data kelas (Bendahara)",
  },
  {
    id: "/dashboard/treasurer/paymenttype",
    label: "Jenis Tagihan (Bendahara)",
  },
  {
    id: "/dashboard/treasurer/payment",
    label: "Pembayaran (Bendahara)",
  },
  {
    id: "/dashboard/treasurer/billing",
    label: "Data Billing (Bendahara)",
  },
  {
    id: "/dashboard/treasurer/billing/upload",
    label: "Upload Billing (Bendahara)",
  },
  {
    id: "/dashboard/treasurer/users/upload",
    label: "Upload Data Users (Bendahara)",
  },
  {
    id: "/dashboard/treasurer/studentinformation",
    label: "Student Information (Bendahara)",
  },

  // ========== Teacher Routes ==========
  { id: "/dashboard/teacher/schedule", label: "Schedule for Teacher" },
  { id: "/dashboard/teacher/schedule/[id]", label: "Teacher Schedule Detail" },
  {
    id: "/dashboard/teacher/attendance/[id]",
    label: "Teacher Attendance Detail",
  },
  {
    id: "/dashboard/teacher/attendance/tahfidz/[id]",
    label: "Tahfidz Attendance Detail",
  },
  {
    id: "/dashboard/teacher/tahfidzrecord/[idTahfidzGroup]",
    label: "Tahfidz Record by Group",
  },

  // ========== Student Routes ==========
  { id: "/dashboard/student/payment", label: "Payment for Student" },
  { id: "/dashboard/student/attendance", label: "Attendance for Student" },
  { id: "/dashboard/student/schedule", label: "Schedule for Student" },
  {
    id: "/dashboard/student/tahfidzrecord",
    label: "Tahfidz Record For Student",
  },

  // ========== Parent Routes ==========
  { id: "/dashboard/parent", label: "Dashboard Parent" },

  // ========== Attendance Routes ==========
  { id: "/dashboard/attendance", label: "Attendance Management" },
  { id: "/dashboard/attendance/teacher", label: "Attendance for Principal" },
  {
    id: "/dashboard/attendance/teacher/input",
    label: "Teacher Attendance Input",
  },
  { id: "/dashboard/recapattendance", label: "Recap Attendance Student" },
  {
    id: "/dashboard/recapattendance/class",
    label: "Recap Attendance Class",
  },

  // ========== Calendar Routes ==========
  { id: "/dashboard/calender", label: "Calendar for User" },
  { id: "/dashboard/calender/teacher", label: "Calendar for Teacher" },
  { id: "/dashboard/calender/student", label: "Calendar for Student" },
  {
    id: "/dashboard/calender/list/teacher",
    label: "Calendar List for Teacher",
  },
  {
    id: "/dashboard/calender/list/student",
    label: "Calendar List for Student",
  },

  // ========== Violations Routes ==========
  { id: "/dashboard/violations", label: "Violation Management" },
  { id: "/dashboard/violations/teacher", label: "Violation for Teacher" },
  { id: "/dashboard/violations/student", label: "Violation for Student" },

  // ========== Top-Level Alternative Routes (may be duplicates) ==========
  { id: "/dashboard/majors", label: "Majors (Top-level)" },
  { id: "/dashboard/payments", label: "Payments (Top-level)" },

  // ========== Test/Debug Pages (should be restricted) ==========
  { id: "/dashboard/test/date", label: "🔧 Date Test Page (Dev Only)" },
  { id: "/dashboard/middleware", label: "🔧 Middleware Debug (Dev Only)" },
];

// Create/Edit Dialog Component
function RoleFormDialog({
  open,
  onOpenChange,
  editData,
  onSuccess,
  foundationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: RoleDataTypes | null;
  onSuccess: () => void;
  foundationId?: string;
}) {
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    string[]
  >([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      isActive: true,
      permissions: [],
    },
  });

  const isActive = watch("isActive");

  React.useEffect(() => {
    if (editData) {
      setValue("name", editData.name);
      setValue("description", editData.description || "");
      setValue("isActive", editData.isActive);
      setValue("permissions", editData.permissions || []);
      setSelectedPermissions(editData.permissions || []);
    } else {
      reset({
        isActive: true,
        permissions: [],
      });
      setSelectedPermissions([]);
    }
  }, [editData, setValue, reset]);

  const handlePermissionToggle = (permissionId: string) => {
    const newPermissions = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((p) => p !== permissionId)
      : [...selectedPermissions, permissionId];

    setSelectedPermissions(newPermissions);
    setValue("permissions", newPermissions);
  };

  const onSubmit = async (data: RoleFormValues) => {
    const submitData = {
      ...data,
      permissions: selectedPermissions,
    };

    if (editData) {
      await updateRole.mutateAsync({
        id: editData.id,
        name: submitData.name,
        description: submitData.description,
        isActive: submitData.isActive,
        permissions: submitData.permissions,
      });
      toast.success("Role berhasil diperbarui!");
    } else {
      const now = new Date().toISOString();
      const createData: RolesInputData = {
        ...submitData,
        foundationId,
        createdAt: now,
        updatedAt: now,
      };
      await createRole.mutateAsync(createData);
      toast.success("Role berhasil dibuat!");
    }
    reset();
    setSelectedPermissions([]);
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Role" : "Tambah Role Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Role</Label>
            <Input
              id="name"
              placeholder="Contoh: Admin, User, Manager"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi role dan tanggung jawabnya..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", !!checked)}
            />
            <Label htmlFor="isActive">Role Aktif</Label>
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
              {availablePermissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() =>
                      handlePermissionToggle(permission.id)
                    }
                  />
                  <Label htmlFor={permission.id} className="text-sm">
                    {permission.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

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
              disabled={createRole.isPending || updateRole.isPending}
            >
              {createRole.isPending || updateRole.isPending
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

// Delete Confirmation Dialog
function DeleteRoleDialog({
  open,
  onOpenChange,
  roleData,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleData: RoleData | null;
  onSuccess: () => void;
}) {
  const deleteRole = useDeleteRole();

  const handleDelete = async () => {
    if (!roleData) return;
    await deleteRole.mutateAsync(roleData.id);
    toast.success("Role berhasil dihapus!");
    onOpenChange(false);
    onSuccess();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Role</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus role{" "}
            <strong>{roleData?.name}</strong>?
            {roleData?._count?.userData && roleData._count.userData > 0 && (
              <span className="block mt-2 text-warning">
                Peringatan: Role ini sedang digunakan oleh{" "}
                {roleData._count.userData} user.
              </span>
            )}
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteRole.isPending}
            className="bg-destructive-solid hover:bg-destructive-solid/90"
          >
            {deleteRole.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main DataTable Component
function RoleDataTable({ foundationId }: { foundationId?: string }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<RoleData | null>(null);

  const { data: roles = [], isLoading, refetch } = useGetRoles();

  const handleSuccess = () => {
    refetch();
  };

  const columns: ColumnDef<RoleData>[] = [
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
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <Shield className="mr-2 h-4 w-4" />
            Nama Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
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
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Aktif" : "Tidak Aktif"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        const permissions = (row.getValue("permissions") as string[]) || [];
        return (
          <div className="flex flex-wrap gap-1">
            {permissions.length > 0 ? (
              permissions.slice(0, 3).map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  {availablePermissions.find((p) => p.id === permission)
                    ?.label || permission}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">Tidak ada</span>
            )}
            {permissions.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{permissions.length - 3} lainnya
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <Users className="mr-2 h-4 w-4" />
            Users
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const userCount = row.original._count?.userData || 0;
        return (
          <div className="text-center">
            <Badge variant="secondary" className="font-medium">
              {userCount} users
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const roleData = row.original;

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
                onClick={() => navigator.clipboard.writeText(roleData.id)}
              >
                Copy ID Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRole(roleData);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedRole(roleData);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive"
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
    data: roles,
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
        <div className="font-bold text-3xl">Roles Menu</div>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Cari nama role..."
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
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
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Role
            </Button>
          </div>
        </div>

        <div className="rounded-md border ">
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
                    Tidak ada data role.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
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
        <RoleFormDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleSuccess}
          foundationId={foundationId}
        />

        <RoleFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          editData={selectedRole}
          onSuccess={handleSuccess}
          foundationId={foundationId}
        />

        <DeleteRoleDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          roleData={selectedRole}
          onSuccess={handleSuccess}
        />
      </div>
    </>
  );
}

export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } =
    useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;
  const foundationId = userData?.foundationId;

  // Show loading while checking authorization
  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // // Only Admins and Yayasan can manage roles
  // if (userRole !== "Admin" && userRole !== "Yayasan") {
  //   unauthorized();
  //   return null;
  // }

  // Render dashboard only after authorization is confirmed
  return <RoleDataTable foundationId={foundationId as string} />;
}
