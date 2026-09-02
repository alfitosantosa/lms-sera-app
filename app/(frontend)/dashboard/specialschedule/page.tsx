"use client";

import { useGetAcademicYears } from "@/app/(hooks)/hooks/AcademicYears/useAcademicYear";
import { useCreateSpecialSchedule, useDeleteSpecialSchedule, useGetSpecialSchedules, useUpdateSpecialSchedule } from "@/app/(hooks)/hooks/SpecialSchedules/useSpecialSchedule";
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
import { ArrowUpDown, Calendar, CalendarDays, ChevronDown, Eye, EyeOff, FileText, MoreHorizontal, Pencil, Plus, Search, Tag, Trash2, X } from "lucide-react";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Import hooks
// Type definitions
export type SpecialScheduleData = {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  eventType: string;
  isPublished: boolean;
  academicYearId: string;
  createdAt: string;
  updatedAt: string;
  academicYear?: {
    id: string;
    year: string;
    semester: string;
  };
};

// Form schema
const specialScheduleSchema = z.object({
  title: z.string().min(1, "Judul acara wajib diisi").max(100, "Judul maksimal 100 karakter"),
  description: z.string().optional(),
  eventDate: z.string().min(1, "Tanggal acara wajib diisi"),
  eventType: z.string().min(1, "Jenis acara wajib dipilih"),
  academicYearId: z.string().min(1, "Tahun akademik wajib dipilih"),
  isPublished: z.boolean().default(false),
});

type SpecialScheduleFormValues = z.infer<typeof specialScheduleSchema>;

// Event types
const EVENT_TYPES = [
  { value: "HOLIDAY", label: "Libur", color: "bg-red-100 text-red-800" },
  { value: "EXAM", label: "Ujian", color: "bg-orange-100 text-orange-800" },
  { value: "EVENT", label: "Acara Sekolah", color: "bg-blue-100 text-blue-800" },
  { value: "MEETING", label: "Rapat", color: "bg-green-100 text-green-800" },
  { value: "TRAINING", label: "Pelatihan", color: "bg-purple-100 text-purple-800" },
  { value: "OTHER", label: "Lainnya", color: "bg-gray-100 text-gray-800" },
];

// Mock toast function (replace with your actual toast implementation)

// Create/Edit Dialog Component
function SpecialScheduleFormDialog({ open, onOpenChange, editData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; editData?: SpecialScheduleData | null; onSuccess: () => void }) {
  const createSpecialSchedule = useCreateSpecialSchedule();
  const updateSpecialSchedule = useUpdateSpecialSchedule();
  const { data: academicYears = [] } = useGetAcademicYears();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<SpecialScheduleFormValues>({
    resolver: zodResolver(specialScheduleSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      eventType: "",
      academicYearId: "",
      isPublished: false,
    },
  });

  const selectedEventType = watch("eventType");
  const selectedAcademicYearId = watch("academicYearId");
  const isPublished = watch("isPublished");

  React.useEffect(() => {
    if (editData) {
      setValue("title", editData.title);
      setValue("description", editData.description || "");
      setValue("eventDate", editData.eventDate.split("T")[0]);
      setValue("eventType", editData.eventType);
      setValue("academicYearId", editData.academicYearId);
      setValue("isPublished", editData.isPublished);
    } else {
      reset({
        isPublished: false,
      });
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: SpecialScheduleFormValues) => {
    try {
      const submitData = {
        ...data,
        eventDate: new Date(data.eventDate).toISOString(),
        description: data.description || undefined,
      };

      if (editData) {
        await updateSpecialSchedule.mutateAsync({ id: editData.id, ...submitData } as any);
        toast.success("Acara khusus berhasil diperbarui!");
      } else {
        await createSpecialSchedule.mutateAsync(submitData as any);
        toast.success("Acara khusus berhasil dibuat!");
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || "Terjadi kesalahan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Acara Khusus" : "Tambah Acara Khusus Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Acara</Label>
            <Input id="title" placeholder="Contoh: Ujian Tengah Semester" {...register("title")} />
            {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Jenis Acara</Label>
              <Select value={selectedEventType || ""} onValueChange={(value) => setValue("eventType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis Acara" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${type.color.split(" ")[0]}`}></div>
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.eventType && <p className="text-sm text-red-500">{errors.eventType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate">Tanggal Acara</Label>
              <Input id="eventDate" type="date" {...register("eventDate")} />
              {errors.eventDate && <p className="text-sm text-red-500">{errors.eventDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tahun Akademik</Label>
            <Select value={selectedAcademicYearId || ""} onValueChange={(value) => setValue("academicYearId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tahun Akademik" />
              </SelectTrigger>
              <SelectContent>
                {academicYears?.map((year: any) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.year} - {year.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.academicYearId && <p className="text-sm text-red-500">{errors.academicYearId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea id="description" placeholder="Tambahkan deskripsi atau catatan untuk acara ini..." rows={3} {...register("description")} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isPublished"
              checked={isPublished}
              onCheckedChange={(checked) => {
                setValue("isPublished", checked);
              }}
            />
            <Label htmlFor="isPublished">Publikasikan acara</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createSpecialSchedule.isPending || updateSpecialSchedule.isPending}>
              {createSpecialSchedule.isPending || updateSpecialSchedule.isPending ?
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
function DeleteSpecialScheduleDialog({ open, onOpenChange, specialScheduleData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; specialScheduleData: SpecialScheduleData | null; onSuccess: () => void }) {
  const deleteSpecialSchedule = useDeleteSpecialSchedule();

  const handleDelete = async () => {
    if (!specialScheduleData) return;

    try {
      await deleteSpecialSchedule.mutateAsync(specialScheduleData.id as any);
      toast.success("Acara khusus berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || "Gagal menghapus acara khusus");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Acara Khusus</AlertDialogTitle>
          <AlertDialogDescription>Apakah Anda yakin ingin menghapus acara "{specialScheduleData?.title}"? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteSpecialSchedule.isPending} className="bg-red-600 hover:bg-red-700">
            {deleteSpecialSchedule.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SpecialScheduleDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedSpecialSchedule, setSelectedSpecialSchedule] = React.useState<SpecialScheduleData | null>(null);

  // Filter states
  const [eventTypeFilter, setEventTypeFilter] = React.useState<string>("all");
  const [publishStatusFilter, setPublishStatusFilter] = React.useState<boolean | null>(null);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  const { data: specialSchedules = [], isLoading, refetch } = useGetSpecialSchedules();

  const handleSuccess = () => {
    refetch();
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get event type badge helper
  const getEventTypeBadge = (eventType: string) => {
    const type = EVENT_TYPES.find((t) => t.value === eventType);
    return type || EVENT_TYPES.find((t) => t.value === "OTHER");
  };

  // Custom global filter function
  const globalFilterFn = React.useCallback((row: any, columnId: string, filterValue: string) => {
    if (!filterValue) return true;

    const searchValue = filterValue.toLowerCase();
    const schedule = row.original;
    const eventType = EVENT_TYPES.find((type) => type.value === schedule.eventType);

    // Search in multiple fields
    const searchableText = [schedule.title, schedule.description, eventType?.label, schedule.academicYear?.year, schedule.academicYear?.semester].filter(Boolean).join(" ").toLowerCase();

    return searchableText.includes(searchValue);
  }, []);

  const columns: ColumnDef<SpecialScheduleData>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <FileText className="mr-2 h-4 w-4" />
            Judul Acara
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue("title")}</div>
          {row.original.description && (
            <div
              className="text-sm text-muted-foreground"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "eventType",
      accessorKey: "eventType",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Tag className="mr-2 h-4 w-4" />
            Jenis Acara
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const eventType = getEventTypeBadge(row.getValue("eventType"));
        return (
          <Badge className={eventType?.color} variant="outline">
            {eventType?.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        return row.original.eventType === value;
      },
    },
    {
      id: "eventDate",
      accessorKey: "eventDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <CalendarDays className="mr-2 h-4 w-4" />
            Tanggal Acara
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="text-sm">{formatDate(row.getValue("eventDate"))}</div>,
    },
    {
      id: "isPublished",
      accessorKey: "isPublished",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <Eye className="mr-2 h-4 w-4" />
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const isPublished = row.getValue("isPublished");
        return (
          <Badge variant={isPublished ? "default" : "secondary"}>
            {isPublished ?
              <>
                <Eye className="mr-1 h-3 w-3" />
                Dipublikasi
              </>
            : <>
                <EyeOff className="mr-1 h-3 w-3" />
                Draft
              </>
            }
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (value === "all") return true;
        return value === "published" ? row.original.isPublished : !row.original.isPublished;
      },
    },
    {
      id: "academicYear",
      accessorFn: (row) => `${row.academicYear?.year}` || "",
      header: "Tahun Akademik",
      cell: ({ row }) => <div className="text-sm">{row.original.academicYear?.year}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const specialScheduleData = row.original;

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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(specialScheduleData.id)}>Copy ID Acara</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSpecialSchedule(specialScheduleData);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedSpecialSchedule(specialScheduleData);
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
    data: specialSchedules,
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

  // Apply event type filter
  React.useEffect(() => {
    if (eventTypeFilter !== "all") {
      table.getColumn("eventType")?.setFilterValue(eventTypeFilter);
    } else {
      table.getColumn("eventType")?.setFilterValue(undefined);
    }
  }, [eventTypeFilter, table]);

  // Apply publish status filter
  React.useEffect(() => {
    if (publishStatusFilter !== null) {
      table.getColumn("isPublished")?.setFilterValue(publishStatusFilter);
    } else {
      table.getColumn("isPublished")?.setFilterValue(undefined);
    }
  }, [publishStatusFilter, table]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="mx-auto my-8 p-6 max-w-7xl min-h-screen">
        <div className="font-bold text-3xl mb-6">Acara Khusus</div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari acara, jenis, atau tahun akademik..." value={globalFilter ?? ""} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm pl-8" disabled={isLoading} />
            </div>

            {/* Event Type Filter */}
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Jenis Acara" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {EVENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${type.color.split(" ")[0]}`}></div>
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Publish Status Filter */}
            <Select
              value={
                publishStatusFilter === null ? "all"
                : publishStatusFilter ?
                  "published"
                : "draft"
              }
              onValueChange={(value) => {
                if (value === "all") {
                  setPublishStatusFilter(null);
                } else {
                  setPublishStatusFilter(value === "published");
                }
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Dipublikasi</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(globalFilter || eventTypeFilter !== "all" || publishStatusFilter !== null) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGlobalFilter("");
                  setEventTypeFilter("all");
                  setPublishStatusFilter(null);
                  table.resetColumnFilters();
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Reset Filter
              </Button>
            )}
          </div>

          <div className="flex flex-wrap space-x-2  md:mt-0">
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
                          case "title":
                            return "Judul Acara";
                          case "eventType":
                            return "Jenis Acara";
                          case "eventDate":
                            return "Tanggal Acara";
                          case "isPublished":
                            return "Status";
                          case "academicYear":
                            return "Tahun Akademik";
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
                Tambah Acara
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(globalFilter || eventTypeFilter !== "all" || publishStatusFilter !== null) && (
          <div className="flex items-center space-x-2 py-2">
            <span className="text-sm text-muted-foreground">Filter aktif:</span>
            {globalFilter && (
              <Badge variant="secondary" className="gap-1">
                Pencarian: {globalFilter}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setGlobalFilter("")} />
              </Badge>
            )}
            {eventTypeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Jenis: {EVENT_TYPES.find((t) => t.value === eventTypeFilter)?.label}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setEventTypeFilter("all")} />
              </Badge>
            )}
            {publishStatusFilter !== null && (
              <Badge variant="secondary" className="gap-1">
                Status: {publishStatusFilter ? "Dipublikasi" : "Draft"}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setPublishStatusFilter(null)} />
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
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">{globalFilter || eventTypeFilter !== "all" || publishStatusFilter !== null ? "Tidak ada acara yang sesuai dengan filter." : "Tidak ada acara khusus yang ditemukan."}</p>
                      {(globalFilter || eventTypeFilter !== "all" || publishStatusFilter !== null) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGlobalFilter("");
                            setEventTypeFilter("all");
                            setPublishStatusFilter(null);
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
        <div className="flex mt-2 justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Sebelumnya
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Selanjutnya
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <SpecialScheduleFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />

      <SpecialScheduleFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} editData={selectedSpecialSchedule} onSuccess={handleSuccess} />

      <DeleteSpecialScheduleDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} specialScheduleData={selectedSpecialSchedule} onSuccess={handleSuccess} />
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
  return <SpecialScheduleDataTable />;
}
