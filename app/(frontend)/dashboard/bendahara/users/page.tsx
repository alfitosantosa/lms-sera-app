"use client";

import { useGetClassByIdMajor } from "@/app/(hooks)/hooks/Classes/useGetClassById";
import { useGetTahfidzGroup } from "@/app/(hooks)/hooks/TahfidzGroup/useTahfidzGroup";
import { useGetBetterAuth } from "@/app/(hooks)/hooks/Users/useBetterAuth";
import { useGetStudentByIdMajor } from "@/app/(hooks)/hooks/Users/useGetStudentById";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { majorTypes } from "@/app/(types)";
import { BetterAuthUser, DeleteUserBulkDialog, DeleteUserDialog, UserData } from "@/components/dialog/DialogUser";
import { StudentFormDialog } from "@/components/dialog/DialogUserBendahara";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "@/lib/authClients";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, BookOpen, ChevronDown, GraduationCap, Image as ImageIcon, Mail, MoreHorizontal, Pencil, Plus, Shield, Trash2, User } from "lucide-react";
import Image from "next/image";
import { unauthorized } from "next/navigation";
import * as React from "react";

// Import hooks
// Import dialog components
// Dashboard Component - Only rendered after role verification
function UserDashboard({ majorData }: { majorData: majorTypes }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Filter selections
  const [roleSelection, setRoleSelection] = React.useState<string | null>(null);
  const [classSelection, setClassSelection] = React.useState<string | null>(null);
  const [tahfidzGroupSelection, setTahfidzGroupSelection] = React.useState<string | null>(null);
  const [majorSelection, setMajorSelection] = React.useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteBulkDialogOpen, setDeleteBulkDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserData | null>(null);

  // Fetch data with proper error handling
  const { data: usersData = [], isLoading, refetch, error } = useGetStudentByIdMajor(majorData.id);
  const { data: betterAuthUsers = [] } = useGetBetterAuth();

  // Helper function to get betterAuth user info
  const getBetterAuthUserInfo = React.useCallback(
    (userId: string): BetterAuthUser | undefined => {
      return betterAuthUsers.find((user) => user.id === userId);
    },
    [betterAuthUsers],
  );

  // Get unique values for filters
  const uniqueRoles = React.useMemo(() => {
    return Array.from(new Set(usersData.map((user) => user.role?.name).filter(Boolean)));
  }, [usersData]);

  const { data: classesData, isLoading: isLoadingClasses } = useGetClassByIdMajor(majorData.id);

  const { data: tahfidzGroupsData, isLoading: isLoadingTahfidzGroups } = useGetTahfidzGroup();

  const uniqueMajors = React.useMemo(() => {
    return Array.from(new Set(usersData.map((user) => user.major?.name).filter(Boolean)));
  }, [usersData]);

  // Define columns with useMemo to prevent recreation
  const columns = React.useMemo<ColumnDef<UserData>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "avatarUrl",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              <ImageIcon className="mr-2 h-4 w-4" />
              Avatar
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const avatarUrl = row.original.avatarUrl || "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png";
          return <Image src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" width={40} height={40} />;
        },
      },
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              <User className="mr-2 h-4 w-4" />
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div>{row.original.name ?? "-"}</div>,
      },
      {
        accessorKey: "role",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              <Shield className="mr-2 h-4 w-4" />
              Role
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const role = row.original.role;
          if (!role) {
            return <Badge variant="secondary">-</Badge>;
          }
          return <Badge variant="secondary">{role.name}</Badge>;
        },
        sortingFn: (rowA, rowB) => {
          const roleA = rowA.original.role?.name || "";
          const roleB = rowB.original.role?.name || "";
          return roleA.localeCompare(roleB);
        },
        filterFn: (row, columnId, filterValue) => {
          if (typeof filterValue === "function") {
            return filterValue(row);
          }
          if (!filterValue) return true;
          const role = row.original.role;
          return role?.name === filterValue;
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              <Mail className="mr-2 h-4 w-4" />
              Email
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const email = row.getValue("email") as string;
          return <div className="lowercase">{email || "-"}</div>;
        },
      },
      {
        accessorKey: "class",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              <BookOpen className="mr-2 h-4 w-4" />
              Kelas
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const classData = row.original.class;
          return <div>{classData?.name || "-"}</div>;
        },
        sortingFn: (rowA, rowB) => {
          const classA = rowA.original.class?.name || "";
          const classB = rowB.original.class?.name || "";
          return classA.localeCompare(classB);
        },
        filterFn: (row, columnId, filterValue) => {
          if (typeof filterValue === "function") {
            return filterValue(row);
          }
          if (!filterValue) return true;
          const classData = row.original.class;
          return classData?.name === filterValue;
        },
      },
      {
        accessorKey: "tahfidzGroup",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              <BookOpen className="mr-2 h-4 w-4" />
              Tahfidz Group
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const tahfidzGroupData = row.original.tahfidzGroup;
          return <div>{(tahfidzGroupData as { name?: string } | null)?.name || "-"}</div>;
        },
        sortingFn: (rowA, rowB) => {
          const tahfidzA = (rowA.original.tahfidzGroup as { name?: string } | null)?.name || "";
          const tahfidzB = (rowB.original.tahfidzGroup as { name?: string } | null)?.name || "";
          return tahfidzA.localeCompare(tahfidzB);
        },
        filterFn: (row, columnId, filterValue) => {
          if (typeof filterValue === "function") {
            return filterValue(row);
          }
          if (!filterValue) return true;
          const tahfidzGroupData = row.original.tahfidzGroup;
          return tahfidzGroupData?.name === filterValue;
        },
      },
      {
        accessorKey: "major",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Branch
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const major = row.original.major;
          return <div>{major?.name || "-"}</div>;
        },
        sortingFn: (rowA, rowB) => {
          const majorA = rowA.original.major?.name || "";
          const majorB = rowB.original.major?.name || "";
          return majorA.localeCompare(majorB);
        },
        filterFn: (row, columnId, filterValue) => {
          if (typeof filterValue === "function") {
            return filterValue(row);
          }
          if (!filterValue) return true;
          const major = row.original.major;
          return major?.name === filterValue;
        },
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
          const status = row.original.status as string;
          const getStatusVariant = (status: string) => {
            switch (status?.toLowerCase()) {
              case "active":
                return "default";
              case "inactive":
                return "secondary";
              case "graduated":
                return "outline";
              default:
                return "secondary";
            }
          };

          const getStatusLabel = (status: string) => {
            switch (status?.toLowerCase()) {
              case "active":
                return "Aktif";
              case "inactive":
                return "Tidak Aktif";
              case "graduated":
                return "Lulus";
              default:
                return status || "-";
            }
          };

          return <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>;
        },
      },
      {
        accessorKey: "userId",
        header: ({ column }) => {
          return (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              BetterAuth
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const userId = row.getValue("userId") as string;

          if (!userId) {
            return <Badge variant="outline">No BetterAuth</Badge>;
          }

          return (
            <div className="flex items-center space-x-2">
              <Badge variant="default">Linked</Badge>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const userIdA = rowA.original.userId || "";
          const userIdB = rowB.original.userId || "";
          // Sort: linked items first, then empty
          if (!userIdA && userIdB) return 1;
          if (userIdA && !userIdB) return -1;
          return userIdA.localeCompare(userIdB);
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const userData = row.original;

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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userData.id)}>Copy ID User</DropdownMenuItem>
                {userData.id && <DropdownMenuItem onClick={() => navigator.clipboard.writeText(userData.id!)}>Copy User ID</DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(userData);
                    setEditDialogOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(userData);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-red-600"
                  disabled={true}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [getBetterAuthUserInfo, setSelectedUser, setEditDialogOpen, setDeleteDialogOpen],
  );

  // Initialize table
  const table = useReactTable({
    data: usersData as UserData[],
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

  // Filter handlers
  const handleRoleFilter = React.useCallback(
    (roleName: string | null) => {
      setRoleSelection(roleName);
      if (roleName) {
        table.getColumn("role")?.setFilterValue(roleName);
      } else {
        table.getColumn("role")?.setFilterValue("");
      }
    },
    [table],
  );

  const handleClassFilter = React.useCallback(
    (className: string | null) => {
      setClassSelection(className);
      if (className) {
        table.getColumn("class")?.setFilterValue(className);
      } else {
        table.getColumn("class")?.setFilterValue("");
      }
    },
    [table],
  );

  const handleTahfidzGroupFilter = React.useCallback(
    (tahfidzGroupName: string | null) => {
      setTahfidzGroupSelection(tahfidzGroupName);
      if (tahfidzGroupName) {
        table.getColumn("tahfidzGroup")?.setFilterValue(tahfidzGroupName);
      } else {
        table.getColumn("tahfidzGroup")?.setFilterValue("");
      }
    },
    [table],
  );

  const handleMajorFilter = React.useCallback(
    (majorName: string | null) => {
      setMajorSelection(majorName);
      if (majorName) {
        table.getColumn("major")?.setFilterValue(majorName);
      } else {
        table.getColumn("major")?.setFilterValue("");
      }
    },
    [table],
  );

  const handleSuccess = React.useCallback(async () => {
    try {
      setRowSelection({});
      setSelectedUser(null);
      await refetch();
    } catch (error) {
      console.error("Error refetching data:", error);
    }
  }, [refetch]);

  // Close dialog handlers
  const handleCloseCreateDialog = React.useCallback(() => {
    setCreateDialogOpen(false);
    setSelectedUser(null);
  }, []);

  const handleCloseEditDialog = React.useCallback(() => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  }, []);

  const handleCloseDeleteDialog = React.useCallback(() => {
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  }, []);

  const handleCloseBulkDeleteDialog = React.useCallback(() => {
    setDeleteBulkDialogOpen(false);
    setRowSelection({});
  }, []);

  const handleBulkDeleteClick = React.useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length > 0) {
      setDeleteBulkDialogOpen(true);
    }
  }, [table]);

  // Loading state
  if (isLoading || isLoadingClasses || isLoadingTahfidzGroups) {
    return <Loading />;
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen items-center justify-center h-32">
        <div className="text-center text-red-600">
          <p>Error loading users: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="font-bold text-3xl ">Users Menu</div>
      <Badge>{majorData.name}</Badge>
      <div className="flex items-start justify-between py-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Input placeholder="Cari nama user..." value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} className="max-w-sm" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {roleSelection || "Filter Role"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleRoleFilter(null)}>Semua Role</DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueRoles.map((roleName) => (
                <DropdownMenuItem key={String(roleName)} onClick={() => handleRoleFilter(roleName as string)}>
                  {roleName as string}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {classSelection || "Filter Kelas"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleClassFilter(null)}>Semua Kelas</DropdownMenuItem>
              <DropdownMenuSeparator />
              {classesData?.map((className) => (
                <DropdownMenuItem key={String(className?.name)} onClick={() => handleClassFilter(className?.name as string)}>
                  {className?.name as string}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {tahfidzGroupSelection || "Filter Tahfidz Group"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleTahfidzGroupFilter(null)}>Semua Tahfidz Group</DropdownMenuItem>
              <DropdownMenuSeparator />
              {tahfidzGroupsData?.map((tahfidzGroupName) => (
                <DropdownMenuItem key={String(tahfidzGroupName?.name)} onClick={() => handleTahfidzGroupFilter(tahfidzGroupName?.name as string)}>
                  {tahfidzGroupName?.name as string}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {majorSelection || "Filter Branch"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleMajorFilter(null)}>Semua Branch</DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueMajors.map((majorName) => (
                <DropdownMenuItem key={String(majorName)} onClick={() => handleMajorFilter(majorName as string)}>
                  {majorName as string}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                .filter((column) => column.getCanHide())
                .map((column) => {
                  const getColumnLabel = (columnId: string) => {
                    const labels: Record<string, string> = {
                      avatarUrl: "Avatar",
                      BetterAuthId: "BetterAuth Status",
                      name: "Nama",
                      email: "Email",
                      role: "Role",
                      class: "Kelas",
                      tahfidzGroup: "Tahfidz Group",
                      major: "Branch",
                      status: "Status",
                      user: "BetterAuth",
                    };
                    return labels[columnId] || columnId;
                  };

                  return (
                    <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                      {getColumnLabel(column.id)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDeleteClick} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Hapus {table.getFilteredSelectedRowModel().rows.length} User
            </Button>
          )}

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah User
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
                  Tidak ada data user.
                </TableCell>
              </TableRow>
            )}
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

      <StudentFormDialog majorId={majorData.id} open={createDialogOpen} onOpenChange={handleCloseCreateDialog} onSuccess={handleSuccess} />
      <StudentFormDialog open={editDialogOpen} onOpenChange={handleCloseEditDialog} editData={selectedUser} onSuccess={handleSuccess} majorId={majorData.id} />
      <DeleteUserDialog open={deleteDialogOpen} onOpenChange={handleCloseDeleteDialog} userData={selectedUser} onSuccess={handleSuccess} />
      <DeleteUserBulkDialog open={deleteBulkDialogOpen} onOpenChange={handleCloseBulkDeleteDialog} userDatas={table.getSelectedRowModel().rows.map((row) => row.original as UserData)} onSuccess={handleSuccess} />
    </div>
  );
}

// Main Component - Handles Authorization
export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;

  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;
  const majorData = userData?.major;

  // Show loading while checking authorization
  if (isPending || isLoadingUserData) {
    return <Loading />;
  }

  // Check if user is Admin
  if (userRole !== "Admin") {
    if (userRole !== "Bendahara") {
      unauthorized();
      return null;
    }
  }

  // Render dashboard only after authorization is confirmed
  return <UserDashboard majorData={majorData as majorTypes} />;
}
