"use client";

import { useGetClasses } from "@/app/(hooks)/hooks/Classes/useClass";
import { useGetStudents } from "@/app/(hooks)/hooks/Users/useStudents";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { useGetTypeViolations } from "@/app/(hooks)/hooks/Violations/useTypeViolations";
import { useCreateViolation, useDeleteViolation, useUpdateViolation } from "@/app/(hooks)/hooks/Violations/useViolations";
import { useGetViolationsByIdTeacher } from "@/app/(hooks)/hooks/Violations/useViolationsByIdTeacher";
import { ViolationTypes } from "@/app/(types)";
import Loading from "@/components/loading";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/authClients";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { AlertTriangle, ArrowUpDown, Calendar, Check, ChevronDown, MoreHorizontal, Pencil, Plus, Search, Trash2, User, X } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Import hooks
// Type definitions
export type ViolationData = {
  id: string;
  studentId: string;
  violationTypeId: string;
  classId: string;
  description?: string;
  status: string;
  reportedBy: string;
  createdAt: string;
  date: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  student?: {
    id: string;
    name: string;
    email: string;
  };
  violationType?: {
    id: string;
    name: string;
    points: number;
    category: string;
  };
  class?: {
    id: string;
    name: string;
    grade: number;
  };
};

// Searchable Student Select Component
interface SearchableStudentSelectProps {
  students: any[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function SearchableStudentSelect({ students, value, onValueChange, placeholder = "Pilih siswa...", disabled = false, className }: SearchableStudentSelectProps): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter students based on search by name OR email
  const [filteredStudents, setFilteredStudents] = React.useState(students);

  React.useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((student) => {
        const searchValue = searchTerm.toLowerCase();
        return student.name.toLowerCase().includes(searchValue) || (student.email && student.email.toLowerCase().includes(searchValue));
      });
      setFilteredStudents(filtered);
    }
  }, [students, searchTerm]);

  // Find selected student
  const selectedStudent = React.useMemo(() => {
    if (!value) return null;
    return students.find((student) => student.id === value) || null;
  }, [students, value]);

  const handleSelect = (student: any) => {
    onValueChange(student.id);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onValueChange("");
    setSearchTerm("");
  };

  React.useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open]);

  React.useEffect(() => {
    if (value && !students.some((student) => student.id === value)) {
      onValueChange("");
    }
  }, [value, students, onValueChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between h-auto min-h-10 px-3 py-2", !selectedStudent && "text-muted-foreground", className)} disabled={disabled}>
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {selectedStudent ? (
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="font-medium truncate w-full">{selectedStudent.name}</span>
                <span className="text-xs text-muted-foreground truncate w-full">{selectedStudent.email}</span>
              </div>
            ) : (
              <span className="truncate">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {selectedStudent && !disabled && <X className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" onClick={handleClear} />}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <CommandInput
              placeholder="Cari nama siswa..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandEmpty className="py-6 text-center text-sm">{searchTerm ? "Tidak ada siswa yang ditemukan" : "Tidak ada data siswa"}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {filteredStudents.map((student) => (
              <CommandItem key={student.id} value={student.name} onSelect={() => handleSelect(student)} className="cursor-pointer">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate">{student.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{student.email}</span>
                  </div>
                  <Check className={cn("ml-2 h-4 w-4", value === student.id ? "opacity-100" : "opacity-0")} />
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Form schema
const violationSchema = z.object({
  studentId: z.string().min(1, "Siswa wajib dipilih"),
  violationTypeId: z.string().min(1, "Jenis pelanggaran wajib dipilih"),
  classId: z.string().min(1, "Kelas wajib dipilih"),
  description: z.string().optional(),
  status: z.string().min(1, "Status wajib dipilih"),
  reportedBy: z.string().min(1, "Pelapor wajib diisi"),
  date: z.string().min(1, "Tanggal kejadian wajib diisi"),
  resolutionDate: z.string().optional(),
  resolutionNotes: z.string().optional(),
});

type ViolationFormValues = z.infer<typeof violationSchema>;

// Predefined status options
const violationStatuses = [
  { value: "active", label: "Aktif" },
  { value: "resolved", label: "Selesai" },
  { value: "pending", label: "Pending" },
  { value: "dismissed", label: "Dibatalkan" },
];

// Create/Edit Dialog Component
function ViolationFormDialog({ open, onOpenChange, editData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; editData?: ViolationData | null; onSuccess: () => void }) {
  const createViolation = useCreateViolation();
  const updateViolation = useUpdateViolation();
  const { data: violationTypes } = useGetTypeViolations();
  const { data: classes } = useGetClasses();
  const { data: usersData = [], isLoading: usersLoading } = useGetStudents();

  // Filter students from users data (role.name === "Student")
  const students = React.useMemo(() => {
    return usersData.filter((user: any) => user?.role?.name === "Student");
  }, [usersData]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ViolationFormValues>({
    resolver: zodResolver(violationSchema),
    defaultValues: {
      status: "active",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const watchedValues = watch();
  const selectedStudentId = watchedValues.studentId;
  const selectedViolationTypeId = watchedValues.violationTypeId;
  const selectedClassId = watchedValues.classId;
  const selectedStatus = watchedValues.status;

  React.useEffect(() => {
    if (editData) {
      setValue("studentId", editData.studentId);
      setValue("violationTypeId", editData.violationTypeId);
      setValue("classId", editData.classId);
      setValue("description", editData.description || "");
      setValue("status", editData.status);
      setValue("reportedBy", editData.reportedBy);
      setValue("date", editData.date.split("T")[0]);
      setValue("resolutionDate", editData.resolutionDate ? editData.resolutionDate.split("T")[0] : "");
      setValue("resolutionNotes", editData.resolutionNotes || "");
    } else {
      reset({
        status: "active",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: ViolationFormValues) => {
    try {
      const formattedData = {
        ...data,
        date: new Date(data.date).toISOString(),
        resolutionDate: data.resolutionDate ? new Date(data.resolutionDate).toISOString() : null,
      };

      if (editData) {
        await updateViolation.mutateAsync({ id: editData.id, ...formattedData } as Parameters<typeof updateViolation.mutateAsync>[0]);
        toast.success("Pelanggaran berhasil diperbarui!");
      } else {
        await createViolation.mutateAsync(formattedData);
        toast.success("Pelanggaran berhasil dibuat!");
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
          <DialogTitle>{editData ? "Edit Pelanggaran" : "Tambah Pelanggaran Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Siswa</Label>
              {usersLoading ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              ) : (
                <SearchableStudentSelect students={students} value={selectedStudentId} onValueChange={(value) => setValue("studentId", value)} placeholder="Cari nama siswa..." className="w-full" />
              )}
              {errors.studentId && <p className="text-sm text-red-500">{errors.studentId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={selectedClassId} onValueChange={(value) => setValue("classId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((classItem: any) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && <p className="text-sm text-red-500">{errors.classId.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Jenis Pelanggaran</Label>
            <Select value={selectedViolationTypeId} onValueChange={(value) => setValue("violationTypeId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis Pelanggaran" />
              </SelectTrigger>
              <SelectContent>
                {violationTypes?.map((violation: any) => (
                  <SelectItem key={violation.id} value={violation.id}>
                    {violation.name} ({violation.points} poin)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.violationTypeId && <p className="text-sm text-red-500">{errors.violationTypeId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Tambahan</Label>
            <Textarea id="description" placeholder="Deskripsi detail kejadian..." rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportedBy">Dilaporkan Oleh</Label>
              <Input id="reportedBy" placeholder="Nama guru/staff" {...register("reportedBy")} />
              {errors.reportedBy && <p className="text-sm text-red-500">{errors.reportedBy.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal Kejadian</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                {violationStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
          </div>

          {(selectedStatus === "resolved" || editData?.status === "resolved") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="resolutionDate">Tanggal Penyelesaian</Label>
                <Input id="resolutionDate" type="date" {...register("resolutionDate")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolutionNotes">Catatan Penyelesaian</Label>
                <Textarea id="resolutionNotes" placeholder="Catatan tentang penyelesaian..." rows={3} {...register("resolutionNotes")} />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createViolation.isPending || updateViolation.isPending}>
              {createViolation.isPending || updateViolation.isPending ? "Menyimpan..." : editData ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog
function DeleteViolationDialog({ open, onOpenChange, violationData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; violationData: ViolationData | null; onSuccess: () => void }) {
  const deleteViolation = useDeleteViolation();

  const handleDelete = async () => {
    if (!violationData) return;

    try {
      await deleteViolation.mutateAsync(violationData.id);
      toast.success("Pelanggaran berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus pelanggaran");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pelanggaran</AlertDialogTitle>
          <AlertDialogDescription>Apakah Anda yakin ingin menghapus pelanggaran ini? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteViolation.isPending} className="bg-red-600 hover:bg-red-700">
            {deleteViolation.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Main DataTable Component
function ViolationDataTable() {
  const { data: session } = useSession();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedViolation, setSelectedViolation] = React.useState<ViolationData | null>(null);

  // Additional filter states
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [classFilter, setClassFilter] = React.useState<string>("all");
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const { data: user } = useGetUserByIdBetterAuth(session?.user.id || "");
  const teacherId = user?.id || "";
  const { data: violations = [], isLoading, refetch } = useGetViolationsByIdTeacher(teacherId);

  // const { data: violations = [], isLoading, refetch } = useGetViolations();
  const { data: classes } = useGetClasses();

  const handleSuccess = () => {
    refetch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-600";
      case "resolved":
        return "bg-green-600";
      case "pending":
        return "bg-yellow-600";
      case "dismissed":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    const found = violationStatuses.find((s) => s.value === status);
    return found ? found.label : status;
  };

  // Custom global filter function
  const globalFilterFn = React.useCallback((row: any, columnId: string, filterValue: string) => {
    if (!filterValue) return true;

    const searchValue = filterValue.toLowerCase();
    const student = row.original.student;
    const violationType = row.original.violationType;
    const classData = row.original.class;
    const reportedBy = row.original.reportedBy;
    const description = row.original.description;

    // Search in multiple fields
    const searchableText = [student?.name, student?.email, violationType?.name, classData?.name, reportedBy, description, getStatusLabel(row.original.status)].filter(Boolean).join(" ").toLowerCase();

    return searchableText.includes(searchValue);
  }, []);

  const columns: ColumnDef<ViolationData>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "student",
      accessorFn: (row) => row.student?.name || "Unknown Student",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <User className="mr-2 h-4 w-4" />
            Siswa
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const student = row.original.student;
        return (
          <div>
            <div className="font-medium">{student?.name || "Unknown Student"}</div>
            <div className="text-sm text-muted-foreground">{student?.email}</div>
          </div>
        );
      },
      enableGlobalFilter: true,
    },
    {
      id: "class",
      accessorFn: (row) => row.class?.name || "Unknown Class",
      header: "Kelas",
      cell: ({ row }) => {
        const classData = row.original.class;
        return <div>{classData?.name || "Unknown Class"}</div>;
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        return row.original.classId === value;
      },
    },
    {
      id: "violationType",
      accessorFn: (row) => row.violationType?.name || "Unknown Violation",
      header: "Jenis Pelanggaran",
      cell: ({ row }) => {
        const violationType = row.original.violationType;
        return (
          <div className="max-w-xs">
            <div className="font-medium">{violationType?.name || "Unknown Violation"}</div>
            {violationType?.points && (
              <Badge variant="secondary" className="mt-1">
                {violationType.points} poin
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Calendar className="mr-2 h-4 w-4" />
            Tanggal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{formatDate(row.getValue("date"))}</div>,
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
        const status = row.getValue("status") as string;
        return <Badge className={`text-white ${getStatusBadgeColor(status)}`}>{getStatusLabel(status)}</Badge>;
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        return row.getValue("status") === value;
      },
    },
    {
      accessorKey: "reportedBy",
      header: "Dilaporkan Oleh",
      cell: ({ row }) => <div>{row.getValue("reportedBy")}</div>,
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
        const violationData = row.original;

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(violationData.id)}>Copy ID Pelanggaran</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedViolation(violationData);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedViolation(violationData);
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

  const table = useReactTable<ViolationData>({
    data: violations as ViolationData[],
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

  // Apply status filter
  React.useEffect(() => {
    if (statusFilter !== "all") {
      table.getColumn("status")?.setFilterValue(statusFilter);
    } else {
      table.getColumn("status")?.setFilterValue(undefined);
    }
  }, [statusFilter, table]);

  // Apply class filter
  React.useEffect(() => {
    if (classFilter !== "all") {
      table.getColumn("class")?.setFilterValue(classFilter);
    } else {
      table.getColumn("class")?.setFilterValue(undefined);
    }
  }, [classFilter, table]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="">
        <div className="font-bold text-3xl mb-2">Data Pelanggaran</div>
        <p>Data Berdasarkan kelas yang Anda ampu</p>
        <div className="mx-auto">
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-wrap gap-2 space-x-2 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari siswa, kelas, pelanggaran..." value={globalFilter ?? ""} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm pl-8" disabled={isLoading} />
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {violationStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kelas</SelectItem>
                    {classes?.map((classItem: any) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                {/* Clear all filters button */}
                {(globalFilter || statusFilter !== "all" || classFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGlobalFilter("");
                      setStatusFilter("all");
                      setClassFilter("all");
                      table.resetColumnFilters();
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:mt-0">
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
                        return (
                          <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                            {column.id === "student"
                              ? "Siswa"
                              : column.id === "class"
                                ? "Kelas"
                                : column.id === "violationType"
                                  ? "Jenis Pelanggaran"
                                  : column.id === "date"
                                    ? "Tanggal"
                                    : column.id === "status"
                                      ? "Status"
                                      : column.id === "reportedBy"
                                        ? "Dilaporkan Oleh"
                                        : column.id === "description"
                                          ? "Deskripsi"
                                          : column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Pelanggaran
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(globalFilter || statusFilter !== "all" || classFilter !== "all") && (
            <div className="flex items-center space-x-2 py-2">
              <span className="text-sm text-muted-foreground">Filter aktif:</span>
              {globalFilter && (
                <Badge variant="secondary" className="gap-1">
                  Pencarian: {globalFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setGlobalFilter("")} />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {getStatusLabel(statusFilter)}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                </Badge>
              )}
              {classFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Kelas: {classes?.find((c: any) => c.id === classFilter)?.name}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setClassFilter("all")} />
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
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">{globalFilter || statusFilter !== "all" || classFilter !== "all" ? "Tidak ada data yang sesuai dengan filter." : "Tidak ada data pelanggaran yang ditemukan."}</p>
                        {(globalFilter || statusFilter !== "all" || classFilter !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setGlobalFilter("");
                              setStatusFilter("all");
                              setClassFilter("all");
                              table.resetColumnFilters();
                            }}
                          >
                            Reset Filter
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
              {table.getFilteredRowModel().rows.length !== violations.length && <span className="ml-2">(difilter dari {violations.length} total)</span>}
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
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Total Pelanggaran</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{violations.length}</p>
              {table.getFilteredRowModel().rows.length !== violations.length && <p className="text-sm text-muted-foreground">({table.getFilteredRowModel().rows.length} terfilter)</p>}
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-600"></div>
                <h3 className="font-semibold">Aktif</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{table.getFilteredRowModel().rows.filter((row) => row.original.status === "active").length}</p>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                <h3 className="font-semibold">Selesai</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{table.getFilteredRowModel().rows.filter((row) => row.original.status === "resolved").length}</p>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-yellow-600"></div>
                <h3 className="font-semibold">Pending</h3>
              </div>
              <p className="text-2xl font-bold mt-2">{table.getFilteredRowModel().rows.filter((row) => row.original.status === "pending").length}</p>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <ViolationFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />

        <ViolationFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} editData={selectedViolation} onSuccess={handleSuccess} />

        <DeleteViolationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} violationData={selectedViolation} onSuccess={handleSuccess} />
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

  // Check if user is Admin and Teacher
  if (userRole !== "Teacher") {
    if (userRole !== "Admin") {
      if (userRole !== "Head Of School") {
        unauthorized();
        return null;
      }
    }
  }

  // Render dashboard only after authorization is confirmed
  return <ViolationDataTable />;
}
