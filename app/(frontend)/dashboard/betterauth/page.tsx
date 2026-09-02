"use client";

import { useGetBetterAuth } from "@/app/(hooks)/hooks/Users/useBetterAuth";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { authClient, useSession } from "@/lib/authClients";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Copy, Eye, KeyRound, MoreHorizontal, Shield } from "lucide-react";
import Image from "next/image";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: string | null;
  userData?: {
    id: string;
    userId: string;
    academicYearId: string | null;
    address: string | null;
    avatarUrl: string | null;
    birthDate: string | null;
    birthPlace: string | null;
    classId: string | null;
    employeeId: string | null;
    endDate: string | null;
    enrollmentDate: string | null;
    gender: string | null;
    graduationDate: string | null;
    majorId: string | null;
    nik: string | null;
    nisn: string | null;
    parentPhone: string | null;
    position: string | null;
    relation: string | null;
    roleId: string;
    startDate: string | null;
    status: string;
    studentIds: [];
    email: string | null;
    name: string | null;
    role: { name: string };
  };
};

function DataTableBetterAuth() {
  const { data: session } = useSession();

  const { data, isLoading, error, refetch } = useGetBetterAuth();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = React.useState(false);
  const [userToChangePassword, setUserToChangePassword] = React.useState<{ id: string; name: string } | null>(null);
  const [userToChangeRole, setUserToChangeRole] = React.useState<{ id: string; name: string; currentRole: string } | null>(null);

  // Form states
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [selectedRole, setSelectedRole] = React.useState<"user" | "admin" | "teacher" | "student" | "parent" | "">("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Check if current user is admin
  const isAdmin = session?.user?.role === "admin";

  // Set User Password
  const handleSetPassword = async () => {
    if (!userToChangePassword) return;

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await authClient.admin.setUserPassword({
        newPassword: newPassword,
        userId: userToChangePassword.id,
      });

      if (error) {
        console.error("Error:", error);
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success(`Password for ${userToChangePassword.name} has been updated successfully`);
        setIsChangePasswordOpen(false);
        setNewPassword("");
        setConfirmPassword("");
        setUserToChangePassword(null);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set User Role
  const handleSetRole = async () => {
    if (!userToChangeRole || !selectedRole) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userToChangeRole.id,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to change role");
      } else {
        const data = await response.json();
        toast.success(`Role for ${userToChangeRole.name} has been updated to ${selectedRole}`);
        setIsChangeRoleOpen(false);
        setSelectedRole("");
        setUserToChangeRole(null);
        // Refresh data
        refetch();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "destructive";
      case "moderator":
        return "default";
      case "user":
        return "secondary";
      default:
        return "outline";
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "profile",
      header: "Avatar",
      cell: ({ row }) => (
        <Image src={row.original.image || "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png"} alt="Avatar" className="w-10 h-10 rounded-full object-cover" width={40} height={40} />
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.name}</div>;
      },
      filterFn: (row, id, value) => {
        const fullName = `${row.original.name}`.toLowerCase();
        return fullName.includes(value.toLowerCase());
      },
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-sm">{row.original.email || "-"}</div>,
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role || "user";
        return <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>;
      },
    },
    {
      id: "emailVerified",
      header: "Verified",
      cell: ({ row }) => {
        const verified = row.original.emailVerified;
        return <Badge variant={verified ? "default" : "secondary"}>{verified ? "Verified" : "Not Verified"}</Badge>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(user.id);
                  toast.success("User ID copied to clipboard");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy User ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user);
                  setIsDetailOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setUserToChangeRole({
                        id: user.id,
                        name: user.name,
                        currentRole: user.role || "user",
                      });
                      // map any non-admin role to "user" to match the API's allowed values
                      setSelectedRole(user.role === "admin" ? "admin" : user.role === "teacher" ? "teacher" : "user");
                      setIsChangeRoleOpen(true);
                    }}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Change Role
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setUserToChangePassword({ id: user.id, name: user.name });
                      setIsChangePasswordOpen(true);
                    }}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable<User>({
    data: (data ?? []) as unknown as User[],
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto my-8 p-6">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-destructive font-semibold">Error loading data</p>
                <p className="text-sm text-muted-foreground">{error.message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="min-h-screen max-w-7xl mx-auto my-8 p-6">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">BetterAuth Users</CardTitle>
              <CardDescription>Manage and view all BetterAuth users from the database.</CardDescription>
            </div>
            {isAdmin && (
              <Badge variant="destructive" className="h-6">
                <Shield className="mr-1 h-3 w-3" />
                Admin Access
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <div className="flex items-center py-4 gap-4">
            <Input placeholder="Search by name..." value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)} className="max-w-sm" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.original.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-muted-foreground text-sm">
              {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information about the user</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Image width={80} height={80} src={selectedUser.image || "https://icons.veryicon.com/png/o/miscellaneous/rookie-official-icon-gallery/225-default-avatar.png"} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                <div className="flex-1 space-y-1">
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)}>{selectedUser.role || "user"}</Badge>
                    <Badge variant={selectedUser.emailVerified ? "default" : "secondary"}>{selectedUser.emailVerified ? "Verified" : "Not Verified"}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="text-sm font-mono break-all">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-sm">{selectedUser.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedUser.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="text-sm">{selectedUser.role || "user"}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Activity</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Created At</p>
                    <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Updated At</p>
                    <p className="text-sm">{new Date(selectedUser.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedUser?.userData && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold">Additional Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUser.userData.parentPhone && (
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <p className="text-sm">{selectedUser.userData.parentPhone}</p>
                        </div>
                      )}
                      {selectedUser.userData.role?.name && (
                        <div>
                          <p className="text-sm text-muted-foreground">System Role</p>
                          <p className="text-sm">{selectedUser.userData.role.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{userToChangePassword?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={isSubmitting} />
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangePasswordOpen(false);
                setNewPassword("");
                setConfirmPassword("");
                setUserToChangePassword(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSetPassword} disabled={isSubmitting || !newPassword || !confirmPassword}>
              {isSubmitting ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isChangeRoleOpen} onOpenChange={setIsChangeRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for <strong>{userToChangeRole?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-select">Select Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as "user" | "admin" | "teacher" | "student" | "parent" | "")} disabled={isSubmitting}>
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current role: <strong>{userToChangeRole?.currentRole || "user"}</strong>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangeRoleOpen(false);
                setSelectedRole("");
                setUserToChangeRole(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSetRole} disabled={isSubmitting || !selectedRole}>
              {isSubmitting ? "Changing..." : "Change Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function UserDataTableBetterauth() {
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
  }

  // Render dashboard only after authorization is confirmed
  return <DataTableBetterAuth />;
}
