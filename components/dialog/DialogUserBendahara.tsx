"use client";
import { useState, useEffect, useMemo, useRef, ChangeEvent } from "react";

import { useGetAcademicYears } from "@/app/(hooks)/hooks/AcademicYears/useAcademicYear";
import { useGetClassByIdBranch } from "@/app/(hooks)/hooks/Classes/useGetClassById";
import { useGetRoles } from "@/app/(hooks)/hooks/Roles/useRoles";
import { useGetTahfidzGroup } from "@/app/(hooks)/hooks/TahfidzGroup/useTahfidzGroup";
import {
  useCreateUser,
  useUpdateUser,
} from "@/app/(hooks)/hooks/Users/useUsers";
import { getErrorMessage } from "@/app/(types)";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Upload, User, X } from "lucide-react";
import Image from "next/image";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────
export type StudentData = {
  id: string;
  name: string;
  email?: string;
  gender?: string;
  avatarUrl?: string;
  nisn?: string;
  nik?: string;
  birthPlace?: string;
  birthDate?: Date | string;
  address?: string;
  classId?: string;
  tahfidzGroupId?: string;
  academicYearId?: string;
  parentPhone?: string;
  status?: string;
  branchId?: string;
  roleId?: string;
};

export type StudentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  branchId: string;
  branchName?: string;
  // ← tambahan untuk edit
  editData?: StudentData | null;
};

// ─── Form Schema ──────────────────────────────────────────────────────────────
const studentSchema = z.object({
  name: z
    .string()
    .min(1, "Nama wajib diisi")
    .max(100, "Nama maksimal 100 karakter"),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Email tidak valid",
    }),
  gender: z.string().min(1, "Jenis kelamin wajib dipilih"),
  avatarUrl: z.string().optional(),
  nisn: z.string().min(1, "NISN wajib diisi"),
  nik: z.string().optional(),
  birthPlace: z.string().min(1, "Tempat lahir wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  address: z.string().min(1, "Alamat wajib diisi"),
  classId: z.string().min(1, "Kelas wajib dipilih"),
  tahfidzGroupId: z.string().optional(),
  academicYearId: z.string().min(1, "Tahun akademik wajib dipilih"),
  parentPhone: z.string().optional(),
  status: z.string().default("active"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

// ─── Avatar Upload Component ──────────────────────────────────────────────────
function AvatarUpload({
  currentAvatarUrl,
  onUploadSuccess,
  disabled = false,
}: {
  currentAvatarUrl?: string;
  onUploadSuccess: (url: string) => void;
  disabled?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatarUrl || null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File tidak boleh lebih dari 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
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
    onUploadSuccess("");
    toast.success("Avatar dihapus");
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
        throw new Error(errorData.message || "Failed to upload avatar");
      }
      const data = await res.json();
      if (!data.fileUrl) throw new Error("No file URL returned from server");
      setPreviewUrl(data.fileUrl);
      onUploadSuccess(data.fileUrl);
      toast.success("Avatar berhasil diunggah!");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>Foto Profil</Label>
      <div className="flex items-start gap-4">
        <div className="relative shrink-0">
          {previewUrl ? (
            <div className="group relative">
              <Image
                src={previewUrl}
                alt="Avatar preview"
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border-2 object-cover"
              />
              <div className="bg-navy/50 absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed">
              <User className="text-muted-foreground h-10 w-10" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleUpload}
              disabled={
                disabled || isUploading || !fileInputRef.current?.files?.[0]
              }
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Mengunggah..." : "Upload Avatar"}
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                disabled={disabled || isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Format: JPG, PNG, GIF. Maksimal 5MB.
          </p>
        </div>
      </div>

      {previewUrl && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview Avatar</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <Image
                src={previewUrl}
                alt="Avatar preview"
                className="max-h-[70vh] max-w-full rounded-lg"
                width={500}
                height={500}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Main Student Form Dialog ─────────────────────────────────────────────────
export function StudentFormDialog({
  open,
  onOpenChange,
  onSuccess,
  branchId,
  branchName,
  editData,
}: StudentFormDialogProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const isEditMode = !!editData;
  const isPending = createUser.isPending || updateUser.isPending;

  const { data: classes = [], isLoading: classesLoading } =
    useGetClassByIdBranch(branchId);
  const { data: academicYears = [], isLoading: academicYearsLoading } =
    useGetAcademicYears();
  const { data: tahfidzGroups = [], isLoading: tahfidzGroupsLoading } =
    useGetTahfidzGroup();
  const { data: roles = [] } = useGetRoles();

  const studentRoleId = useMemo(
    () => roles.find((r) => r.name.trim() === "Student")?.id ?? "",
    [roles],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<StudentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(studentSchema as any),
    defaultValues: { status: "active" },
  });

  // ── Populate form when editData changes ──────────────────────────────────
  useEffect(() => {
    if (open && editData) {
      setValue("name", editData.name ?? "");
      setValue("email", editData.email ?? "");
      setValue("gender", editData.gender ?? "");
      setValue("avatarUrl", editData.avatarUrl ?? "");
      setValue("nisn", editData.nisn ?? "");
      setValue("nik", editData.nik ?? "");
      setValue("birthPlace", editData.birthPlace ?? "");
      setValue(
        "birthDate",
        editData.birthDate
          ? new Date(editData.birthDate).toISOString().split("T")[0]
          : "",
      );
      setValue("address", editData.address ?? "");
      setValue("classId", editData.classId ?? "");
      setValue("tahfidzGroupId", editData.tahfidzGroupId ?? "none");
      setValue("academicYearId", editData.academicYearId ?? "");
      setValue("parentPhone", editData.parentPhone ?? "");
      setValue("status", editData.status ?? "active");
    } else if (open && !editData) {
      // reset for create mode
      reset({ status: "active" });
    }
  }, [open, editData, setValue, reset]);

  // ── Reset on close ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) reset({ status: "active" });
  }, [open, reset]);

  const handleAvatarUpload = (url: string) => setValue("avatarUrl", url);

  const onSubmit = async (data: StudentFormValues) => {
    if (!studentRoleId) {
      toast.error("Role 'Student' tidak ditemukan. Hubungi administrator.");
      return;
    }
    if (!branchId) {
      toast.error("Branch ID tidak tersedia.");
      return;
    }

    try {
      const baseData = {
        name: data.name,
        email: data.email || null,
        gender: data.gender,
        avatarUrl: data.avatarUrl || null,
        nisn: data.nisn,
        nik: data.nik || null,
        birthPlace: data.birthPlace,
        birthDate: new Date(data.birthDate),
        address: data.address,
        classId: data.classId,
        tahfidzGroupId:
          data.tahfidzGroupId && data.tahfidzGroupId !== "none"
            ? data.tahfidzGroupId
            : null,
        academicYearId: data.academicYearId,
        parentPhone: data.parentPhone || null,
        status: data.status,
      };

      if (isEditMode && editData) {
        // ── UPDATE ──────────────────────────────────────────────────────
        await updateUser.mutateAsync({
          id: editData.id,
          ...baseData,
          // branchId & roleId tidak boleh berubah saat edit
          branchId,
          roleId: editData.roleId ?? studentRoleId,
        });
        toast.success("Data siswa berhasil diperbarui!");
      } else {
        // ── CREATE ──────────────────────────────────────────────────────
        await createUser.mutateAsync({
          ...baseData,
          roleId: studentRoleId,
          branchId,
          enrollmentDate: new Date(),
        });
        toast.success("Siswa berhasil ditambahkan!");
      }

      reset({ status: "active" });
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditMode ? "Edit Data Siswa" : "Tambah Siswa Baru"}
            {branchName && (
              <Badge variant="secondary" className="ml-1 font-normal">
                {branchName}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Auto-assigned info banner ── */}
          <div className="border-border bg-muted/50 rounded-lg border px-4 py-3">
            <p className="text-foreground text-sm font-medium">
              Informasi Auto-Assign
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Role:{" "}
              <span className="text-foreground font-semibold">Student</span> ·
              Branch:{" "}
              <span className="text-foreground font-semibold">
                {branchName ?? branchId}
              </span>
              {isEditMode && <span className="ml-2">· Mode: Edit</span>}
            </p>
          </div>

          {/* ── Section: Informasi Dasar ── */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              Informasi Dasar
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-destructive text-sm">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email{" "}
                  <span className="text-muted-foreground text-xs">
                    (opsional)
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="siswa@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Jenis Kelamin <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(v) => setValue("gender", v)}
                  value={watch("gender")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-destructive text-sm">
                    {errors.gender.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  onValueChange={(v) => setValue("status", v)}
                  value={watch("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="graduated">Sudah Lulus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ── Section: Identitas ── */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              Identitas
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nisn">
                  NISN <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nisn"
                  placeholder="1234567890"
                  {...register("nisn")}
                />
                {errors.nisn && (
                  <p className="text-destructive text-sm">
                    {errors.nisn.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">
                  NIK{" "}
                  <span className="text-muted-foreground text-xs">
                    (opsional)
                  </span>
                </Label>
                <Input
                  id="nik"
                  placeholder="3201234567890123"
                  {...register("nik")}
                />
                {errors.nik && (
                  <p className="text-destructive text-sm">
                    {errors.nik.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthPlace">
                  Tempat Lahir <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthPlace"
                  placeholder="Jakarta"
                  {...register("birthPlace")}
                />
                {errors.birthPlace && (
                  <p className="text-destructive text-sm">
                    {errors.birthPlace.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">
                  Tanggal Lahir <span className="text-destructive">*</span>
                </Label>
                <Input id="birthDate" type="date" {...register("birthDate")} />
                {errors.birthDate && (
                  <p className="text-destructive text-sm">
                    {errors.birthDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Alamat <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                placeholder="Alamat lengkap siswa"
                rows={2}
                {...register("address")}
              />
              {errors.address && (
                <p className="text-destructive text-sm">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentPhone">
                No. HP Orang Tua{" "}
                <span className="text-muted-foreground text-xs">
                  (opsional)
                </span>
              </Label>
              <Input
                id="parentPhone"
                placeholder="08123456789"
                {...register("parentPhone")}
              />
            </div>
          </div>

          {/* ── Section: Akademik ── */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              Akademik
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Kelas <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(v) => setValue("classId", v)}
                  value={watch("classId")}
                  disabled={classesLoading || !branchId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !branchId
                          ? "Branch belum tersedia"
                          : classesLoading
                            ? "Memuat kelas..."
                            : "Pilih kelas"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length === 0 && !classesLoading ? (
                      <div className="text-muted-foreground px-3 py-4 text-center text-sm">
                        Tidak ada kelas untuk branch ini
                      </div>
                    ) : (
                      classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.classId && (
                  <p className="text-destructive text-sm">
                    {errors.classId.message}
                  </p>
                )}
                {!classesLoading && classes.length > 0 && (
                  <p className="text-muted-foreground text-xs">
                    {classes.length} kelas tersedia untuk branch ini
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Tahun Akademik <span className="text-destructive">*</span>
                </Label>
                <Select
                  onValueChange={(v) => setValue("academicYearId", v)}
                  value={watch("academicYearId")}
                  disabled={academicYearsLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        academicYearsLoading
                          ? "Memuat..."
                          : "Pilih tahun akademik"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academicYearId && (
                  <p className="text-destructive text-sm">
                    {errors.academicYearId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Kelompok Tahfidz{" "}
                <span className="text-muted-foreground text-xs">
                  (opsional)
                </span>
              </Label>
              <Select
                onValueChange={(v) =>
                  setValue("tahfidzGroupId", v === "none" ? undefined : v)
                }
                value={watch("tahfidzGroupId") || "none"}
                disabled={tahfidzGroupsLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      tahfidzGroupsLoading
                        ? "Memuat..."
                        : "Pilih kelompok tahfidz"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Tidak ada —</SelectItem>
                  {tahfidzGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Section: Foto Profil ── */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
              Foto Profil
            </h3>
            <AvatarUpload
              currentAvatarUrl={watch("avatarUrl")}
              onUploadSuccess={handleAvatarUpload}
              disabled={isPending}
            />
          </div>

          {/* ── Footer ── */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Menyimpan..."
                : isEditMode
                  ? "Perbarui Siswa"
                  : "Simpan Siswa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
