"use client";

import { useState } from "react";

import {
  type AssessmentPeriodDTO,
  type AssessmentPeriodInput,
  type DevelopmentAreaDTO,
  type DevelopmentAreaInput,
  type DevelopmentIndicatorInput,
  ASSESSMENT_PERIOD_STATUS_LABELS,
} from "@/app/(types)";
import {
  developmentAreaInputSchema,
  developmentIndicatorInputSchema,
  assessmentScaleInputSchema,
} from "@/app/(types)/types/development-types";
import { useGetAcademicYears } from "@/app/(hooks)/hooks/AcademicYears/useAcademicYear";
import {
  useBootstrapDevelopment,
  useCreateArea,
  useCreateIndicator,
  useCreatePeriod,
  useCreateScale,
  useDeletePeriod,
  useGetAreas,
  useGetIndicators,
  useGetPeriods,
  useGetScales,
  useUpdatePeriod,
} from "@/app/(hooks)/hooks/Development/useDevelopmentConfig";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/authClients";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { unauthorized } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const periodFormSchema = z
  .object({
    academicYearId: z.string().optional(),
    name: z.string().min(1, "Nama periode wajib diisi"),
    semester: z.coerce.number().int().min(1).max(2),
    startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
    endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
    status: z.enum(["DRAFT", "OPEN", "LOCKED", "PUBLISHED"]),
  })
  .refine((v) => v.endDate > v.startDate, {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["endDate"],
  });
type PeriodFormValues = z.infer<typeof periodFormSchema>;

function formatDate(value: string) {
  try {
    return format(new Date(value), "d MMM yyyy", { locale: localeId });
  } catch {
    return value;
  }
}

// ─── Periode ──────────────────────────────────────────────────────────────────

function PeriodDialog({
  open,
  onOpenChange,
  editData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: AssessmentPeriodDTO | null;
}) {
  const createPeriod = useCreatePeriod();
  const updatePeriod = useUpdatePeriod();
  const { data: academicYears } = useGetAcademicYears();

  const form = useForm<PeriodFormValues>({
    resolver: zodResolver(periodFormSchema as never),
    defaultValues: {
      academicYearId: "",
      name: "",
      semester: 1,
      startDate: "",
      endDate: "",
      status: "DRAFT",
    },
    values: editData
      ? {
          academicYearId: editData.academicYearId ?? "",
          name: editData.name,
          semester: editData.semester,
          startDate: editData.startDate.slice(0, 10),
          endDate: editData.endDate.slice(0, 10),
          status: editData.status,
        }
      : undefined,
  });

  const onSubmit = async (values: PeriodFormValues) => {
    const data: AssessmentPeriodInput = {
      academicYearId: values.academicYearId || undefined,
      name: values.name,
      semester: values.semester,
      startDate: new Date(values.startDate),
      endDate: new Date(values.endDate),
      status: values.status,
    };
    try {
      if (editData) {
        await updatePeriod.mutateAsync({ id: editData.id, data });
        toast.success("Periode berhasil diperbarui");
      } else {
        await createPeriod.mutateAsync(data);
        toast.success("Periode berhasil dibuat");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan",
      );
    }
  };

  const years = (academicYears ?? []) as { id: string; year: string }[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Ubah Periode" : "Tambah Periode"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Periode</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Semester 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academicYearId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun Ajaran (opsional)</FormLabel>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(v) =>
                      field.onChange(v === "none" ? "" : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih tahun ajaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Tidak ditentukan</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ASSESSMENT_PERIOD_STATUS_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Simpan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PeriodTab() {
  const { data: periods, isLoading } = useGetPeriods();
  const deletePeriod = useDeletePeriod();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState<AssessmentPeriodDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssessmentPeriodDTO | null>(
    null,
  );

  const rows = periods ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Kelola periode penilaian perkembangan siswa.
        </p>
        <Button
          onClick={() => {
            setEditData(null);
            setDialogOpen(true);
          }}
        >
          Tambah Periode
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tahun Ajaran</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Belum ada periode.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((period) => (
                <TableRow key={period.id}>
                  <TableCell className="font-medium">{period.name}</TableCell>
                  <TableCell>{period.academicYear?.year ?? "-"}</TableCell>
                  <TableCell>{period.semester}</TableCell>
                  <TableCell>
                    {formatDate(period.startDate)} -{" "}
                    {formatDate(period.endDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {ASSESSMENT_PERIOD_STATUS_LABELS[period.status] ??
                        period.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditData(period);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(period)}
                    >
                      <Trash2 className="text-destructive h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PeriodDialog
        key={editData?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editData={editData}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus periode?</AlertDialogTitle>
            <AlertDialogDescription>
              Periode &quot;{deleteTarget?.name}&quot; akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteTarget) return;
                try {
                  await deletePeriod.mutateAsync(deleteTarget.id);
                  toast.success("Periode berhasil dihapus");
                } catch {
                  toast.error("Gagal menghapus periode");
                } finally {
                  setDeleteTarget(null);
                }
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Area ─────────────────────────────────────────────────────────────────────

function AreaTab() {
  const { data: areas, isLoading } = useGetAreas();
  const createArea = useCreateArea();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<DevelopmentAreaInput>({
    resolver: zodResolver(developmentAreaInputSchema as never),
    defaultValues: {
      name: "",
      description: "",
      order: 0,
      isActive: true,
    },
  });

  const onSubmit = async (values: DevelopmentAreaInput) => {
    try {
      await createArea.mutateAsync(values);
      toast.success("Area berhasil dibuat");
      form.reset();
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan",
      );
    }
  };

  const rows = areas ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Area perkembangan (mis. Bahasa, Kognitif).
        </p>
        <Button onClick={() => setDialogOpen(true)}>Tambah Area</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Urutan</TableHead>
              <TableHead>Nama Area</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-center">Jumlah Indikator</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Belum ada area.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((area: DevelopmentAreaDTO) => (
                <TableRow key={area.id}>
                  <TableCell>{area.order}</TableCell>
                  <TableCell className="font-medium">{area.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {area.description ?? "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {area._count?.indicators ?? 0}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={area.isActive ? "default" : "secondary"}>
                      {area.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Area</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Area</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Bahasa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (opsional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 items-end gap-4">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urutan</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(v === true)}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Aktif</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Indikator ────────────────────────────────────────────────────────────────

function IndicatorTab() {
  const { data: areas } = useGetAreas();
  const [areaId, setAreaId] = useState<string>("");
  const { data: indicators, isLoading } = useGetIndicators(
    areaId ? { areaId } : undefined,
  );
  const createIndicator = useCreateIndicator();
  const [dialogOpen, setDialogOpen] = useState(false);

  const areaList = (areas ?? []) as DevelopmentAreaDTO[];

  const form = useForm<DevelopmentIndicatorInput>({
    resolver: zodResolver(developmentIndicatorInputSchema as never),
    defaultValues: {
      developmentAreaId: "",
      code: "",
      name: "",
      description: "",
      order: 0,
      isActive: true,
    },
  });

  const onSubmit = async (values: DevelopmentIndicatorInput) => {
    try {
      await createIndicator.mutateAsync({
        ...values,
        developmentAreaId: values.developmentAreaId || areaId,
      });
      toast.success("Indikator berhasil dibuat");
      form.reset({ ...form.getValues(), name: "", code: "" });
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan",
      );
    }
  };

  const rows = indicators ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Area:</span>
          <Select
            value={areaId || "all"}
            onValueChange={(v) => setAreaId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Semua area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua area</SelectItem>
              {areaList.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            form.reset({
              developmentAreaId: areaId,
              code: "",
              name: "",
              description: "",
              order: 0,
              isActive: true,
            });
            setDialogOpen(true);
          }}
          disabled={areaList.length === 0}
        >
          Tambah Indikator
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode</TableHead>
              <TableHead>Nama Indikator</TableHead>
              <TableHead>Area</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Belum ada indikator.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((indicator) => (
                <TableRow key={indicator.id}>
                  <TableCell>{indicator.code ?? "-"}</TableCell>
                  <TableCell className="font-medium">
                    {indicator.name}
                  </TableCell>
                  <TableCell>{indicator.developmentArea?.name ?? "-"}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={indicator.isActive ? "default" : "secondary"}
                    >
                      {indicator.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Indikator</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="developmentAreaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih area" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {areaList.map((area) => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode (opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: BHS-1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urutan</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Indikator</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (opsional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Skala ────────────────────────────────────────────────────────────────────

function ScaleTab() {
  const { data: scales, isLoading } = useGetScales();
  const createScale = useCreateScale();
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof assessmentScaleInputSchema>>({
    resolver: zodResolver(assessmentScaleInputSchema as never),
    defaultValues: {
      code: "",
      label: "",
      description: "",
      value: 1,
      color: "#3b82f6",
      order: 0,
      isActive: true,
    },
  });

  const onSubmit = async (
    values: z.infer<typeof assessmentScaleInputSchema>,
  ) => {
    try {
      await createScale.mutateAsync(values);
      toast.success("Skala berhasil disimpan");
      form.reset();
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Terjadi kesalahan",
      );
    }
  };

  const rows = scales ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Skala capaian perkembangan (mis. BB, MB, BSH, BSB).
        </p>
        <Button onClick={() => setDialogOpen(true)}>Tambah Skala</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Urutan</TableHead>
              <TableHead>Kode</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="text-center">Nilai</TableHead>
              <TableHead className="text-center">Warna</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Belum ada skala.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((scale) => (
                <TableRow key={scale.id}>
                  <TableCell>{scale.order}</TableCell>
                  <TableCell className="font-medium">{scale.code}</TableCell>
                  <TableCell>{scale.label}</TableCell>
                  <TableCell className="text-center">{scale.value}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className="inline-block h-4 w-4 rounded-full border"
                      style={{ backgroundColor: scale.color ?? undefined }}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={scale.isActive ? "default" : "secondary"}>
                      {scale.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Skala</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: BSH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nilai</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Berkembang Sesuai Harapan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (opsional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 items-end gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warna</FormLabel>
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          value={field.value || "#3b82f6"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urutan</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(v) => field.onChange(v === true)}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Aktif</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function DevelopmentConfig() {
  const bootstrap = useBootstrapDevelopment();

  const handleBootstrap = async () => {
    try {
      const result = await bootstrap.mutateAsync();
      const created = result?.created;
      toast.success(
        created
          ? `Default dimuat: ${created.areas} area, ${created.indicators} indikator, ${created.scales} skala`
          : "Default berhasil dimuat",
      );
    } catch {
      toast.error("Gagal memuat data default");
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Pengembangan Siswa — Konfigurasi
          </h1>
          <p className="text-muted-foreground text-sm">
            Atur periode, area, indikator, dan skala penilaian perkembangan.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleBootstrap}
          disabled={bootstrap.isPending}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Muat Default
        </Button>
      </div>

      <Tabs defaultValue="periode" className="w-full">
        <TabsList>
          <TabsTrigger value="periode">Periode</TabsTrigger>
          <TabsTrigger value="area">Area</TabsTrigger>
          <TabsTrigger value="indikator">Indikator</TabsTrigger>
          <TabsTrigger value="skala">Skala</TabsTrigger>
        </TabsList>
        <TabsContent value="periode" className="mt-4">
          <PeriodTab />
        </TabsContent>
        <TabsContent value="area" className="mt-4">
          <AreaTab />
        </TabsContent>
        <TabsContent value="indikator" className="mt-4">
          <IndicatorTab />
        </TabsContent>
        <TabsContent value="skala" className="mt-4">
          <ScaleTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DevelopmentConfigPage() {
  const { data: session, isPending } = useSession();
  const { data: userData, isLoading } = useGetUserByIdBetterAuth(
    session?.user?.id ?? "",
  );

  if (isPending || isLoading) return <Loading />;

  const role = userData?.role?.name?.toLowerCase() ?? "";
  if (!role.includes("admin")) {
    unauthorized();
    return null;
  }

  return <DevelopmentConfig />;
}
