"use client";

import { useGetAcademicYears } from "@/app/(hooks)/hooks/AcademicYears/useAcademicYear";
import { useGetClasses } from "@/app/(hooks)/hooks/Classes/useClass";
import { useGetMajors } from "@/app/(hooks)/hooks/Majors/useMajors";
import { useGetRoles } from "@/app/(hooks)/hooks/Roles/useRoles";
import { useGetTahfidzGroup } from "@/app/(hooks)/hooks/TahfidzGroup/useTahfidzGroup";
import { useGetBetterAuthWithoutUserData } from "@/app/(hooks)/hooks/Users/useBetterAuthWithoutUserData";
import { useBulkDeleteUserData } from "@/app/(hooks)/hooks/Users/useBulkUsersData";
import { useCreateUser, useDeleteUser, useGetUsers, useUpdateUser } from "@/app/(hooks)/hooks/Users/useUsers";
import { getErrorMessage, SelectOption, tahfidzGroupTypes } from "@/app/(types)";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Search, Upload, User, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Import hooks
// Type definitions
export type UserData = {
  tahfidzGroup: tahfidzGroupTypes;
  id: string;
  userId?: string;
  roleId: string;
  name: string;
  email?: string;
  avatarUrl?: string;

  // Student fields
  nisn?: string;
  birthPlace?: string;
  birthDate?: Date;
  nik?: string;
  address?: string;
  classId?: string;
  tahfidzGroupId?: string;
  academicYearId?: string;
  enrollmentDate?: Date;
  gender?: string;
  graduationDate?: Date;
  majorId?: string;
  parentPhone?: string;
  status?: string;

  // Teacher fields
  employeeId?: string;
  position?: string;
  startDate?: Date;
  endDate?: Date;

  // Parent fields
  studentIds?: string[];
  relation?: string;

  createdAt: string;
  updatedAt: string;

  // Relations
  role?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
  };
  major?: {
    id: string;
    name: string;
  };
  academicYear?: {
    year: string;
    id: string;
    name: string;
  };
};

// Betterauth user type
export type BetterAuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

// Form schema
const userSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Email tidak valid",
    }),
  roleId: z.string().min(1, "Role wajib dipilih"),
  userId: z.string().optional(),
  gender: z.string().optional(),
  avatarUrl: z.string().optional(),

  // Conditional fields based on role
  nisn: z.string().optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  nik: z.string().optional(),
  address: z.string().optional(),
  classId: z.string().optional(),
  tahfidzGroupId: z.string().optional(),
  academicYearId: z.string().optional(),
  majorId: z.string().optional(),
  parentPhone: z.string().optional(),
  status: z.string().min(1, "Status wajib diisi").default("active"),

  employeeId: z.string().optional(),
  position: z.string().optional(),

  studentIds: z.array(z.string()).optional(),
  relation: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

// Student Selector Component for Parent
function StudentSelector({ students, selectedStudentIds = [], onSelectionChange, disabled = false }: { students: UserData[]; selectedStudentIds?: string[]; onSelectionChange: (studentIds: string[]) => void; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) return students || [];

    return students.filter((student) => {
      const name = student.name.toLowerCase();
      const nisn = student.nisn?.toLowerCase() || "";
      const className = student.class?.name?.toLowerCase() || "";
      return name.includes(searchTerm.toLowerCase()) || nisn.includes(searchTerm.toLowerCase()) || className.includes(searchTerm.toLowerCase());
    });
  }, [students, searchTerm]);

  const selectedStudents = React.useMemo(() => {
    return students.filter((student) => selectedStudentIds.includes(student.id));
  }, [students, selectedStudentIds]);

  const toggleStudent = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      onSelectionChange(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      onSelectionChange([...selectedStudentIds, studentId]);
    }
  };

  const removeStudent = (studentId: string) => {
    onSelectionChange(selectedStudentIds.filter((id) => id !== studentId));
  };

  return (
    <div className="space-y-2">
      <Label>Siswa Yang Diasuh *</Label>

      {/* Selected Students Display */}
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
          {selectedStudents.map((student) => (
            <Badge key={student.id} variant="secondary" className="flex items-center gap-2 py-1.5 px-3">
              <div className="flex flex-col items-start">
                <span className="font-medium">{student.name}</span>
                <span className="text-xs text-muted-foreground">
                  NISN: {student.nisn} • {student.class?.name || "Tanpa Kelas"}
                </span>
              </div>
              <Button onClick={() => removeStudent(student.id)} disabled={disabled} className="ml-1 hover:bg-destructive/20 rounded-full p-0.5">
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Select Button */}
      <Button type="button" variant="outline" onClick={() => setOpen(true)} disabled={disabled} className="w-full justify-start">
        <Search className="h-4 w-4 mr-2" />
        {selectedStudents.length === 0 ? "Pilih Siswa" : `${selectedStudents.length} siswa dipilih`}
      </Button>

      {/* Student Selection Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pilih Siswa</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari nama, NISN, atau kelas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>

            {/* Student List */}
            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-md p-2">
              {filteredStudents.length === 0 ?
                <div className="text-center p-8 text-muted-foreground">{searchTerm ? "Tidak ada siswa yang cocok dengan pencarian" : "Tidak ada siswa tersedia"}</div>
              : filteredStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer" onClick={() => toggleStudent(student.id)}>
                    <Checkbox checked={selectedStudentIds.includes(student.id)} onCheckedChange={() => toggleStudent(student.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{student.name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          NISN: {student.nisn || "N/A"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {student.class?.name || "Tanpa Kelas"}
                        </Badge>
                        {student.academicYear && (
                          <Badge variant="outline" className="text-xs">
                            {student.academicYear.year}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Footer with count */}
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-sm text-muted-foreground">{selectedStudentIds.length} siswa dipilih</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Selesai
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Avatar Upload Component with Preview
function AvatarUpload({ currentAvatarUrl, onUploadSuccess, disabled = false }: { currentAvatarUrl?: string; onUploadSuccess: (url: string) => void; disabled?: boolean }) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(currentAvatarUrl || null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (currentAvatarUrl) {
      setPreviewUrl(currentAvatarUrl);
    }
  }, [currentAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File tidak boleh lebih dari 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    // Clear file input if present
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch {
        // ignore if setting value fails in some environments
      }
    }
    // Clear preview and notify parent (send empty string to indicate removal)
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

      // Pastikan fileUrl ada
      if (!data.fileUrl) {
        throw new Error("No file URL returned from server");
      }

      // Set preview dan callback
      setPreviewUrl(data.fileUrl);
      onUploadSuccess(data.fileUrl);
      toast.success("Avatar berhasil diunggah!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="picture">Avatar</Label>

      <div className="flex gap-4 items-start">
        {/* Preview */}
        <div className="relative">
          {previewUrl ?
            <div className="relative group">
              <Image src={previewUrl} alt="Avatar preview" width={20} height={20} className="w-24 h-24 rounded-full object-cover border-2" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Button type="button" size="sm" variant="ghost" className="text-white hover:text-white" onClick={() => setShowPreview(true)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          : <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          }
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <Input ref={fileInputRef} id="picture" type="file" accept="image/*" onChange={handleFileChange} disabled={disabled || isUploading} />

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleUpload} disabled={disabled || isUploading || !fileInputRef.current?.files?.[0]} className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Mengunggah..." : "Upload Avatar"}
            </Button>

            {previewUrl && (
              <Button type="button" variant="outline" onClick={handleRemove} disabled={disabled || isUploading}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">Format: JPG, PNG, GIF. Maksimal 5MB.</p>
        </div>
      </div>

      {/* Preview Dialog */}
      {previewUrl && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Preview Avatar</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <Image src={previewUrl} alt="Avatar preview" className="max-w-full max-h-[70vh] rounded-lg" width={500} height={500} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Betterauth User Selector Component
function BetterAuthSelector({ onSelect, selecteduserId, disabled = false }: { onSelect: (betterAuth: BetterAuthUser | null) => void; selecteduserId?: string; disabled?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const { data: betterAuthsData, isLoading: betterAuthsLoading } = useGetBetterAuthWithoutUserData();
  const betterAuths = (betterAuthsData ?? []) as BetterAuthUser[];

  const filteredbetterAuths = React.useMemo(() => {
    if (!searchTerm) return betterAuths;

    return betterAuths.filter((user: BetterAuthUser) => {
      const fullName = `${user.name}`.toLowerCase();
      const email = user?.email?.toLowerCase() || "";
      return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    });
  }, [betterAuths, searchTerm]);

  const selectedUser = React.useMemo(() => {
    if (!selecteduserId) return null;
    return betterAuths.find((user: BetterAuthUser) => user.id === selecteduserId);
  }, [betterAuths, selecteduserId]);

  const handleSelect = (betterAuth: BetterAuthUser) => {
    onSelect(betterAuth);
    setOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onSelect(null);
    setSearchTerm("");
  };

  return (
    <div className="space-y-2">
      <Label>Betterauth User (Opsional)</Label>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setOpen(true)} disabled={disabled || betterAuthsLoading} className="flex-1 justify-start">
          {betterAuthsLoading ?
            "Loading..."
          : selectedUser ?
            `${selectedUser.name} (${selectedUser.email})`
          : "Pilih Betterauth User"}
        </Button>
        {selectedUser && (
          <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={disabled}>
            Clear
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pilih Betterauth User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {betterAuthsLoading ?
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              : filteredbetterAuths.length === 0 ?
                <div className="text-center p-8 text-muted-foreground">{searchTerm ? "Tidak ada user yang cocok dengan pencarian" : "Tidak ada Betterauth user tersedia"}</div>
              : filteredbetterAuths.map((user: BetterAuthUser) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer" onClick={() => handleSelect(user)}>
                    <div className="flex">
                      {user.image ?
                        <Image src={user.image} alt={`${user.name}`} width={20} height={20} className="h-10 w-10 rounded-full" />
                      : <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email || "No email"}</p>
                    </div>
                    {selecteduserId === user.id && (
                      <div className="flex">
                        <Badge variant="default">Selected</Badge>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create/Edit Dialog Component
export function UserFormDialog({ open, onOpenChange, editData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; editData?: UserData | null; onSuccess: () => void }) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  // Fetch data inside the component
  const { data: users = [], isLoading: userLoading } = useGetUsers();
  const { data: roles = [], isLoading: rolesLoading } = useGetRoles();
  const { data: classes = [], isLoading: classesLoading } = useGetClasses();
  const { data: tahfidzGroups = [], isLoading: tahfidzGroupsLoading } = useGetTahfidzGroup();
  const { data: academicYears = [], isLoading: academicYearsLoading } = useGetAcademicYears();
  const { data: majors = [], isLoading: majorsLoading } = useGetMajors();

  const students = React.useMemo(() => {
    return users.filter((user) => user.role?.name.trim() === "Student");
  }, [users]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema as any),
    defaultValues: {
      status: "active",
      studentIds: [],
    },
  });

  const selectedRoleId = watch("roleId");
  const selecteduserId = watch("userId");
  const selectedStudentIds = watch("studentIds") || [];
  const selectedRole = roles.find((role) => role.id === selectedRoleId);

  React.useEffect(() => {
    if (editData) {
      setValue("name", editData.name);
      setValue("email", editData.email || "");
      setValue("roleId", editData.roleId);
      setValue("userId", editData.userId || "");
      setValue("gender", editData.gender || "");
      setValue("avatarUrl", editData.avatarUrl || "");
      setValue("nisn", editData.nisn || "");
      setValue("birthPlace", editData.birthPlace || "");
      setValue("birthDate", editData.birthDate ? new Date(editData.birthDate).toISOString().split("T")[0] : "");
      setValue("nik", editData.nik || "");
      setValue("address", editData.address || "");
      setValue("classId", editData.classId || "");
      setValue("tahfidzGroupId", editData.tahfidzGroupId || "");
      setValue("academicYearId", editData.academicYearId || "");
      setValue("majorId", editData.majorId || "");
      setValue("parentPhone", editData.parentPhone || "");
      setValue("status", editData.status || "active");
      setValue("employeeId", editData.employeeId || "");
      setValue("position", editData.position || "");
      setValue("studentIds", editData.studentIds || []);
      setValue("relation", editData.relation || "");
    } else {
      reset({
        status: "active",
        studentIds: [],
      });
    }
  }, [editData, setValue, reset]);

  const handlebetterAuthSelect = (betterAuth: BetterAuthUser | null) => {
    if (betterAuth) {
      setValue("userId", betterAuth.id);
      setValue("email", betterAuth.email || "");
      // setValue("name", betterAuth.name || "");
      // setValue("avatarUrl", betterAuth.image || "");
    } else {
      setValue("userId", "");
    }
  };

  const handleAvatarUpload = (url: string) => {
    setValue("avatarUrl", url);
  };

  const onSubmit = async (data: UserFormValues) => {
    try {
      // Prepare base data - HANYA field yang ada di UserData schema
      const submitData: Record<string, unknown> = {
        name: data.name,
        email: data.email || null,
        roleId: data.roleId || null,
        gender: data.gender || null,
        avatarUrl: data.avatarUrl || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        status: data.status,
        // Ubah string kosong ke null supaya backend tahu ini tidak ada nilai
        classId: data.classId && data.classId !== "" ? data.classId : null,
        tahfidzGroupId: data.tahfidzGroupId && data.tahfidzGroupId !== "" ? data.tahfidzGroupId : null,
        academicYearId: data.academicYearId && data.academicYearId !== "" ? data.academicYearId : null,
        majorId: data.majorId && data.majorId !== "" ? data.majorId : null,
      };

      // Add role-specific fields
      if (selectedRole?.name.trim() === "Student") {
        submitData.nisn = data.nisn || null;
        submitData.birthPlace = data.birthPlace || null;
        submitData.nik = data.nik || null;
        submitData.address = data.address || null;
        submitData.parentPhone = data.parentPhone || null;
        submitData.enrollmentDate = new Date();
      } else if (selectedRole?.name.trim() === "Teacher") {
        submitData.employeeId = data.employeeId || null;
        submitData.position = data.position || null;
        submitData.birthPlace = data.birthPlace || null;
        submitData.address = data.address || null;
        submitData.parentPhone = data.parentPhone || null;
        submitData.startDate = new Date();
      } else if (selectedRole?.name.trim() === "Parent") {
        submitData.studentIds = data.studentIds || [];
        submitData.relation = data.relation || null;
        submitData.address = data.address || null;
        submitData.parentPhone = data.parentPhone || null;
      } else if (selectedRole?.name.trim() === "Bendahara") {
        submitData.employeeId = data.employeeId || null;
        submitData.address = data.address || null;
        submitData.parentPhone = data.parentPhone || null;
        submitData.nik = data.nik || null;
      }

      // Handle Better Auth User connection
      // Hanya kirim userId jika ada dan tidak kosong
      if (data.userId && data.userId !== "") {
        submitData.userId = data.userId;
      }

      // PENTING: name dan email TIDAK dikirim ke UserData
      // Karena field ini ada di tabel User (Better Auth), bukan UserData

      if (editData) {
        await updateUser.mutateAsync({ id: editData.id, ...submitData });
        toast.success("User berhasil diperbarui!");
      } else {
        await createUser.mutateAsync(submitData);
        toast.success("User berhasil dibuat!");
      }
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error details:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const renderRoleSpecificFields = () => {
    if (!selectedRole) return null;

    switch (selectedRole.name.trim().toLowerCase()) {
      case "student":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nisn">NISN *</Label>
                <Input id="nisn" placeholder="1234567890" {...register("nisn")} />
                {errors.nisn && <p className="text-sm text-red-500">{errors.nisn.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nik">NIK *</Label>
                <Input id="nik" placeholder="3201234567890123" {...register("nik")} />
                {errors.nik && <p className="text-sm text-red-500">{errors.nik.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Tempat Lahir *</Label>
                <Input id="birthPlace" placeholder="Jakarta" {...register("birthPlace")} />
                {errors.birthPlace && <p className="text-sm text-red-500">{errors.birthPlace.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                <Input id="birthDate" type="date" {...register("birthDate")} />
                {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat *</Label>
              <Textarea id="address" placeholder="Alamat lengkap siswa" {...register("address")} />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Select onValueChange={(value) => setValue("classId", value === "none" ? undefined : value)} value={watch("classId") || "none"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Tidak ada —</SelectItem>
                    {classesLoading ?
                      <SelectItem value="" disabled>
                        Loading...
                      </SelectItem>
                    : classes.map((cls: SelectOption) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kelompok Tahfidz</Label>
                <Select onValueChange={(value) => setValue("tahfidzGroupId", value === "none" ? undefined : value)} value={watch("tahfidzGroupId") || "none"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelompok tahfidz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Tidak ada —</SelectItem>
                    {tahfidzGroupsLoading ?
                      <SelectItem value="" disabled>
                        Loading...
                      </SelectItem>
                    : tahfidzGroups.map((tahfidzGroup) => (
                        <SelectItem key={tahfidzGroup.id} value={tahfidzGroup.id}>
                          {tahfidzGroup.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Branch *</Label>
                <Select onValueChange={(value) => setValue("majorId", value)} value={watch("majorId")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {majorsLoading ?
                      <SelectItem value="" disabled>
                        Loading...
                      </SelectItem>
                    : majors.map((major) => (
                        <SelectItem key={major.id} value={major.id}>
                          {major.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tahun Akademik *</Label>
                <Select onValueChange={(value) => setValue("academicYearId", value)} value={watch("academicYearId")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun akademik" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYearsLoading ?
                      <SelectItem value="" disabled>
                        Loading...
                      </SelectItem>
                    : academicYears.map((year: any) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.year}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">No. HP Orang Tua</Label>
                <Input id="parentPhone" placeholder="08123456789" {...register("parentPhone")} />
              </div>
            </div>
          </>
        );

      case "teacher":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">ID Pegawai *</Label>
                <Input id="employeeId" placeholder="EMP001" {...register("employeeId")} />
                {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Jabatan</Label>
                <Input id="position" placeholder="Guru Matematika" {...register("position")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Tempat Lahir *</Label>
                <Input id="birthPlace" placeholder="Jakarta" {...register("birthPlace")} />
                {errors.birthPlace && <p className="text-sm text-red-500">{errors.birthPlace.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                <Input id="birthDate" type="date" {...register("birthDate")} />
                {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Alamat *</Label>
                <Textarea id="address" placeholder="Alamat lengkap guru" {...register("address")} />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">No. Hanphone</Label>
                <Input id="parentPhone" placeholder="08123456789" {...register("parentPhone")} />
              </div>
            </div>
          </>
        );

      case "parent":
        return (
          <>
            {/* Student Selection for Parent */}
            {userLoading ?
              <div className="flex items-center justify-center h-20 border rounded-md">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            : <StudentSelector students={students as UserData[]} selectedStudentIds={selectedStudentIds} onSelectionChange={(studentIds) => setValue("studentIds", studentIds)} disabled={createUser.isPending || updateUser.isPending} />}

            <div className="space-y-2">
              <Label>Hubungan *</Label>
              <Select onValueChange={(value) => setValue("relation", value)} value={watch("relation")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih hubungan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Ayah</SelectItem>
                  <SelectItem value="Mother">Ibu</SelectItem>
                  <SelectItem value="Guardian">Wali</SelectItem>
                </SelectContent>
              </Select>
              {errors.relation && <p className="text-sm text-red-500">{errors.relation.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 ">
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea id="address" placeholder="Alamat lengkap orang tua/wali" {...register("address")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">No. Hanphone</Label>
                <Input id="parentPhone" placeholder="08123456789" {...register("parentPhone")} />
              </div>
            </div>
          </>
        );

      case "bendahara":
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">ID Pegawai *</Label>
                <Input id="employeeId" placeholder="EMP001" {...register("employeeId")} />
                {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Jabatan</Label>
                <Input id="position" placeholder="Guru Matematika" {...register("position")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthPlace">Tempat Lahir *</Label>
                <Input id="birthPlace" placeholder="Jakarta" {...register("birthPlace")} />
                {errors.birthPlace && <p className="text-sm text-red-500">{errors.birthPlace.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir *</Label>
                <Input id="birthDate" type="date" {...register("birthDate")} />
                {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Alamat *</Label>
                <Textarea id="address" placeholder="Alamat lengkap guru" {...register("address")} />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentPhone">No. Hanphone</Label>
                <Input id="parentPhone" placeholder="08123456789" {...register("parentPhone")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Branch *</Label>
                <Select onValueChange={(value) => setValue("majorId", value)} value={watch("majorId")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {majorsLoading ?
                      <SelectItem value="" disabled>
                        Loading...
                      </SelectItem>
                    : majors.map((major) => (
                        <SelectItem key={major.id} value={major.id}>
                          {major.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Show loading state if any required data is still loading
  if (rolesLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editData ? "Edit User" : "Tambah User Baru"}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Memuat data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit User" : "Tambah User Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informasi Dasar</h3>

            {/* Betterauth User Selector */}
            <BetterAuthSelector onSelect={handlebetterAuthSelect} selecteduserId={selecteduserId} disabled={createUser.isPending || updateUser.isPending} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input id="name" placeholder="Masukkan nama lengkap" {...register("name")} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="user@example.com" {...register("email")} />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select onValueChange={(value) => setValue("roleId", value)} value={watch("roleId")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: any) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roleId && <p className="text-sm text-red-500">{errors.roleId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select onValueChange={(value) => setValue("gender", value)} value={watch("gender")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select onValueChange={(value) => setValue("status", value)} value={watch("status")}>
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

          {/* Avatar Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Foto Profil</h3>
            <AvatarUpload currentAvatarUrl={watch("avatarUrl")} onUploadSuccess={handleAvatarUpload} disabled={createUser.isPending || updateUser.isPending} />
          </div>

          {/* Role-specific fields */}
          {selectedRole && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informasi {selectedRole.name}</h3>
              {renderRoleSpecificFields()}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={createUser.isPending || updateUser.isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={createUser.isPending || updateUser.isPending}>
              {createUser.isPending || updateUser.isPending ?
                "Loading..."
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
export function DeleteUserDialog({ open, onOpenChange, userData, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; userData: UserData | null; onSuccess: () => void }) {
  const deleteUser = useDeleteUser();

  const handleDelete = async () => {
    if (!userData) return;

    try {
      await deleteUser.mutateAsync(userData.id);
      toast.success("User berhasil dihapus!");
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus user");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus User</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus user <strong>{userData?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteUser.isPending}>
            {deleteUser.isPending ? "Loading..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/// Delete Bulk Confirmation Dialog
export function DeleteUserBulkDialog({ open, onOpenChange, userDatas, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; userDatas: UserData[]; onSuccess: () => void }) {
  const deleteUser = useBulkDeleteUserData();

  const handleDelete = async () => {
    if (!userDatas || userDatas.length === 0) return;

    try {
      // Extract IDs for bulk delete
      const userIds = userDatas.map((user) => user.id);

      await deleteUser.mutateAsync(userIds);
      toast.success(`${userDatas.length} user berhasil dihapus!`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus user");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus {userDatas?.length || 0} User</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-sm">Apakah Anda yakin ingin menghapus user berikut? Tindakan ini tidak dapat dibatalkan.</p>

              {userDatas && userDatas.length > 0 && (
                <div className="max-h-60 overflow-y-auto space-y-2 rounded-md border p-3 bg-muted/30">
                  {userDatas.map((data) => (
                    <div key={data.id} className="flex items-center gap-3 p-2 rounded-md bg-background border">
                      {data.avatarUrl ?
                        <Image src={data.avatarUrl} alt={data.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      }

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{data.name}</p>
                        <div className="flex gap-2 mt-0.5">
                          {data.role && (
                            <Badge variant="outline" className="text-xs">
                              {data.role.name}
                            </Badge>
                          )}
                          {data.email && <span className="text-xs text-muted-foreground truncate">{data.email}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleteUser.isPending || !userDatas || userDatas.length === 0}>
            {deleteUser.isPending ? "Menghapus..." : `Hapus ${userDatas?.length || 0} User`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
