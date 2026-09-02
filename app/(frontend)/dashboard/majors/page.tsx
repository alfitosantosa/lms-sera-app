"use client";

import { useCreateMajor, useDeleteMajor, useGetMajors, useUpdateMajor } from "@/app/(hooks)/hooks/Majors/useMajors";
import { useGetUserByIdBetterAuth } from "@/app/(hooks)/hooks/Users/useUsersByIdBetterAuth";
import { getErrorMessage, majorTypes } from "@/app/(types)";
import Loading from "@/components/loading";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/authClients";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Eye, MoreHorizontal, Pencil, PenLine, Plus, Search, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import { unauthorized } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────
export type MajorData = {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  description: string | null;
  isActive: boolean;
  adminName: string;
  signatureUrl: string;
  _count: {
    classes: number;
    students: number;
    subjects: number;
    paymenttype: number;
  };
};

// ─── Schema ───────────────────────────────────────────────────────────────────
const majorSchema = z.object({
  code: z.string().min(1, "Kode Branch wajib diisi").max(10, "Kode maksimal 10 karakter"),
  name: z.string().min(1, "Nama Branch wajib diisi").max(100, "Nama maksimal 100 karakter"),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean(),
  adminName: z.string().optional(),
  signatureUrl: z.string().optional(),
});

type MajorFormValues = z.infer<typeof majorSchema>;

// ─── SignatureUpload Component ────────────────────────────────────────────────
// Mengikuti pola AvatarUpload persis, disesuaikan untuk tanda tangan
function SignatureUpload({ currentSignatureUrl, onUploadSuccess, disabled = false }: { currentSignatureUrl?: string; onUploadSuccess: (url: string) => void; disabled?: boolean }) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(currentSignatureUrl || null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync ketika prop berubah (mis. saat edit)
  React.useEffect(() => {
    setPreviewUrl(currentSignatureUrl || null);
  }, [currentSignatureUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File tidak boleh lebih dari 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, dll.)");
      return;
    }
    // Tampilkan preview lokal sebelum upload
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch {
        /* ignore */
      }
    }
    setPreviewUrl(null);
    setShowPreview(false);
    onUploadSuccess(""); // beritahu parent bahwa tanda tangan dihapus
    toast.success("Tanda tangan dihapus");
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Silakan pilih file terlebih dahulu");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_FILESERVER_URL}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal mengupload file");
      }
      const data = await res.json();
      if (!data.fileUrl) throw new Error("URL file tidak ditemukan dalam respons server");
      setPreviewUrl(data.fileUrl);
      onUploadSuccess(data.fileUrl);
      toast.success("Tanda tangan berhasil diunggah!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>
        Tanda Tangan Bendahara <span className="text-muted-foreground text-xs">(opsional)</span>
      </Label>

      <div className="flex gap-4 items-start">
        {/* Preview area */}
        <div className="relative shrink-0">
          {previewUrl ?
            <div className="relative group">
              {/* Tanda tangan ditampilkan dalam kotak persegi panjang landscape */}
              <div className="w-36 h-20 rounded-md border-2 overflow-hidden bg-white flex items-center justify-center">
                <Image src={previewUrl} alt="Preview tanda tangan" width={144} height={80} className="object-contain w-full h-full" />
              </div>
              {/* Overlay hover untuk preview fullscreen */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                <Button type="button" size="sm" variant="ghost" className="text-white hover:text-white h-7 w-7 p-0" onClick={() => setShowPreview(true)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          : /* Placeholder ketika belum ada tanda tangan */
            <div className="w-36 h-20 rounded-md bg-muted flex flex-col items-center justify-center border-2 border-dashed gap-1">
              <PenLine className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Belum ada</span>
            </div>
          }
        </div>

        {/* Upload controls */}
        <div className="flex-1 space-y-2">
          <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} disabled={disabled || isUploading} />

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleUpload} disabled={disabled || isUploading || !fileInputRef.current?.files?.[0]} className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Mengunggah..." : "Upload Tanda Tangan"}
            </Button>

            {previewUrl && (
              <Button type="button" variant="outline" onClick={handleRemove} disabled={disabled || isUploading} title="Hapus tanda tangan">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">Disarankan: latar belakang putih/transparan. Format JPG, PNG. Maks. 5MB.</p>
        </div>
      </div>

      {/* Fullscreen preview dialog */}
      {previewUrl && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Preview Tanda Tangan</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg min-h-32">
              <Image src={previewUrl} alt="Preview tanda tangan" className="max-w-full max-h-64 object-contain rounded" width={400} height={200} />
            </div>
            <p className="text-xs text-center text-muted-foreground">Tanda tangan akan muncul di dokumen resmi seperti kwitansi.</p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── MajorFormDialog ──────────────────────────────────────────────────────────
function MajorFormDialog({ open, onOpenChange, editData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; editData?: MajorData | null; onSuccess: () => void }) {
  const createMajor = useCreateMajor();
  const updateMajor = useUpdateMajor();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<MajorFormValues>({
    resolver: zodResolver(majorSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      address: "",
      phone: "",
      adminName: "",
      signatureUrl: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");
  const signatureUrl = watch("signatureUrl");

  React.useEffect(() => {
    if (editData) {
      setValue("code", editData.code);
      setValue("name", editData.name);
      setValue("description", editData.description || "");
      setValue("address", editData.address || "");
      setValue("phone", editData.phone || "");
      setValue("isActive", editData.isActive);
      setValue("adminName", editData.adminName || "");
      setValue("signatureUrl", editData.signatureUrl || "");
    } else {
      reset({
        code: "",
        name: "",
        description: "",
        phone: "",
        address: "",
        adminName: "",
        signatureUrl: "",
        isActive: true,
      });
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data: MajorFormValues) => {
    try {
      if (editData) {
        await updateMajor.mutateAsync({
          ...data,
          id: editData.id,
        });
        toast.success("Branch berhasil diperbarui!");
      } else {
        await createMajor.mutateAsync(data);
        toast.success("Branch berhasil dibuat!");
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Branch" : "Tambah Branch Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ── Informasi Utama ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Kode Branch <span className="text-red-500">*</span>
              </Label>
              <Input id="code" placeholder="SMAIT001" {...register("code")} />
              {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch id="isActive" checked={isActive} onCheckedChange={(checked) => setValue("isActive", checked)} />
                <Label htmlFor="isActive" className="cursor-pointer font-normal">
                  {isActive ? "Aktif" : "Tidak Aktif"}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Branch <span className="text-red-500">*</span>
            </Label>
            <Input id="name" placeholder={`Contoh: SMA IT ${process.env.NEXT_PUBLIC_CLIENT_NAME?.toUpperCase()}`} {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Deskripsi <span className="text-muted-foreground text-xs">(opsional)</span>
            </Label>
            <Textarea id="description" placeholder="Deskripsi singkat tentang Branch..." rows={2} {...register("description")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Alamat <span className="text-muted-foreground text-xs">(opsional)</span>
            </Label>
            <Textarea id="address" placeholder="Alamat lengkap branch..." rows={2} {...register("address")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">
                No. Telepon <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <Input id="phone" placeholder="(021) 77833598" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName">
                Bendahara <span className="text-muted-foreground text-xs">(opsional)</span>
              </Label>
              <Input id="adminName" placeholder="Nama bendahara..." {...register("adminName")} />
            </div>
          </div>

          <Separator />

          {/* ── Upload Tanda Tangan ── */}
          <SignatureUpload currentSignatureUrl={signatureUrl || ""} onUploadSuccess={(url) => setValue("signatureUrl", url)} disabled={createMajor.isPending || updateMajor.isPending} />

          {/* Hidden field untuk menyimpan URL ke form state */}
          <input type="hidden" {...register("signatureUrl")} />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={createMajor.isPending || updateMajor.isPending}>
              {createMajor.isPending || updateMajor.isPending ?
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

// ─── MajorDetailDialog ────────────────────────────────────────────────────────
function MajorDetailDialog({ open, onOpenChange, majorData }: { open: boolean; onOpenChange: (open: boolean) => void; majorData: MajorData | null }) {
  if (!majorData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Branch</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Header info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Kode Branch</p>
              <p className="font-mono font-bold text-lg">{majorData.code}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Status</p>
              <Badge variant={majorData.isActive ? "default" : "secondary"} className="mt-1">
                {majorData.isActive ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Nama Branch</p>
            <p className="font-semibold text-base">{majorData.name}</p>
          </div>

          {majorData.description && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Deskripsi</p>
              <p className="text-sm">{majorData.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {majorData.address && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Alamat</p>
                <p className="text-sm">{majorData.address}</p>
              </div>
            )}
            {majorData.phone && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Telepon</p>
                <p className="text-sm">{majorData.phone}</p>
              </div>
            )}
            {majorData.adminName && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Bendahara</p>
                <p className="text-sm font-medium">{majorData.adminName}</p>
              </div>
            )}
          </div>

          {/* Tanda tangan preview */}
          {majorData.signatureUrl && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tanda Tangan Bendahara</p>
              <div className="inline-flex p-3 bg-gray-50 rounded-lg border">
                <Image src={majorData.signatureUrl} alt="Tanda tangan bendahara" width={200} height={80} className="object-contain max-h-20" />
              </div>
            </div>
          )}

          <Separator />

          {/* Statistik */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Statistik</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Kelas", value: majorData._count?.classes ?? 0, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Siswa", value: majorData._count?.students ?? 0, color: "text-green-600", bg: "bg-green-50" },
                { label: "Mata Pelajaran", value: majorData._count?.subjects ?? 0, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Jenis Tagihan", value: majorData._count?.paymenttype ?? 0, color: "text-orange-600", bg: "bg-orange-50" },
              ].map((stat) => (
                <div key={stat.label} className={`text-center p-3 rounded-lg ${stat.bg} border`}>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => onOpenChange(false)}>Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── DeleteMajorDialog ────────────────────────────────────────────────────────
function DeleteMajorDialog({ open, onOpenChange, majorData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; majorData: MajorData | null; onSuccess: () => void }) {
  const deleteMajor = useDeleteMajor();

  const handleDelete = async () => {
    if (!majorData) return;
    try {
      await deleteMajor.mutateAsync(majorData.id);
      toast.success("Branch berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const hasRelatedData = majorData && ((majorData._count?.classes ?? 0) > 0 || (majorData._count?.students ?? 0) > 0 || (majorData._count?.subjects ?? 0) > 0);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Branch</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {hasRelatedData ?
                <div className="space-y-2">
                  <p>
                    Branch <strong>{majorData?.name}</strong> memiliki data terkait:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    {majorData?._count?.classes ?
                      <li>{majorData._count.classes} kelas</li>
                    : null}
                    {majorData?._count?.students ?
                      <li>{majorData._count.students} siswa</li>
                    : null}
                    {majorData?._count?.subjects ?
                      <li>{majorData._count.subjects} mata pelajaran</li>
                    : null}
                  </ul>
                  <p className="text-red-600 font-medium text-sm">Menghapus Branch akan menghapus semua data terkait. Tindakan ini tidak dapat dibatalkan.</p>
                </div>
              : <p>
                  Apakah Anda yakin ingin menghapus branch <strong>{majorData?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                </p>
              }
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteMajor.isPending} className="bg-red-600 hover:bg-red-700">
            {deleteMajor.isPending ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── MajorDataTable ───────────────────────────────────────────────────────────
function MajorDataTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [selectedMajor, setSelectedMajor] = React.useState<MajorData | null>(null);

  const { data: majors = [], isLoading, refetch } = useGetMajors();
  const handleSuccess = () => refetch();

  const columns: ColumnDef<MajorData>[] = [
    {
      id: "select",
      header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="Select all" />,
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Kode <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono font-medium text-sm">{row.getValue("code")}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Nama Branch <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => <div className="max-w-[180px] truncate text-sm text-muted-foreground">{(row.getValue("description") as string) || "-"}</div>,
    },
    {
      accessorKey: "address",
      header: "Alamat",
      cell: ({ row }) => <div className="max-w-[160px] truncate text-sm text-muted-foreground">{(row.getValue("address") as string) || "-"}</div>,
    },
    {
      accessorKey: "phone",
      header: "Telepon",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{(row.getValue("phone") as string) || "-"}</div>,
    },
    {
      accessorKey: "adminName",
      header: "Bendahara",
      cell: ({ row }) => <div className="text-sm text-muted-foreground">{(row.getValue("adminName") as string) || "-"}</div>,
    },
    {
      accessorKey: "signatureUrl",
      header: "Tanda Tangan",
      cell: ({ row }) => {
        const url = row.getValue("signatureUrl") as string;
        if (!url) {
          return <span className="text-xs text-muted-foreground italic">Belum ada</span>;
        }
        return (
          <div className="w-16 h-8 bg-gray-50 rounded border overflow-hidden flex items-center justify-center">
            <Image src={url} alt="Tanda tangan" width={64} height={32} className="object-contain w-full h-full" />
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <Badge variant={(row.getValue("isActive") as boolean) ? "default" : "secondary"}>{(row.getValue("isActive") as boolean) ? "Aktif" : "Tidak Aktif"}</Badge>,
    },
    {
      id: "stats",
      header: "Statistik",
      cell: ({ row }) => {
        const m = row.original;
        return (
          <div className="text-xs space-y-0.5">
            <div className="flex gap-2">
              <span className="text-blue-600 font-medium">{m._count?.classes ?? 0}K</span>
              <span className="text-green-600 font-medium">{m._count?.students ?? 0}S</span>
              <span className="text-purple-600 font-medium">{m._count?.subjects ?? 0}MP</span>
              <span className="text-orange-600 font-medium">{m._count?.paymenttype ?? 0}TP</span>
            </div>
            <div className="text-muted-foreground">Kelas · Siswa · MaPel · TiPem</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const m = row.original;
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
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(m.id)}>Copy ID Branch</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedMajor(m);
                  setDetailDialogOpen(true);
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedMajor(m);
                  setEditDialogOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedMajor(m);
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
    data: majors,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
  });

  if (isLoading) return <Loading />;

  return (
    <div className="">
      <div className="font-bold text-3xl mb-6">Branch</div>

      <div className="flex items-center justify-between py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau kode Branch..." value={(table.getColumn("name")?.getFilterValue() as string) ?? ""} onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)} className="max-w-sm pl-10" />
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
                .filter((c) => c.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Branch
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Tidak ada data Branch.
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
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
      <MajorFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={handleSuccess} />
      <MajorFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} editData={selectedMajor} onSuccess={handleSuccess} />
      <MajorDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} majorData={selectedMajor} />
      <DeleteMajorDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} majorData={selectedMajor} onSuccess={handleSuccess} />
    </div>
  );
}

// ─── Auth Wrapper ─────────────────────────────────────────────────────────────
export default function UserDataTable() {
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const { data: userData, isLoading: isLoadingUserData } = useGetUserByIdBetterAuth(userId as string);
  const userRole = userData?.role?.name;

  if (isPending || isLoadingUserData) return <Loading />;
  if (userRole !== "Admin") {
    unauthorized();
    return null;
  }

  return <MajorDataTable />;
}
