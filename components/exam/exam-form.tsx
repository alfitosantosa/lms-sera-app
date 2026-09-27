"use client";

import { useGetClasses } from "@/app/(hooks)/hooks/Classes/useClass";
import {
  useCreateExam,
  useUpdateExam,
} from "@/app/(hooks)/hooks/Exam/useExam";
import { useGetSubjects } from "@/app/(hooks)/hooks/Subjects/useSubjects";
import { getErrorMessage } from "@/app/(types)";
import {
  type ExamInputPayload,
  examInputSchema,
} from "@/app/(types)/types/exam-types";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isExamApiError } from "./exam-shared";

/** ISO string → nilai `input type="datetime-local"` (waktu lokal). */
export function toLocalDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoDateTime(local: string | null | undefined): string | null {
  if (!local) return null;
  const date = new Date(local);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

const toNullableNumber = (value: unknown) =>
  value === "" || value === null || value === undefined ? null : Number(value);

/**
 * Form metadata ujian (dipakai halaman buat & halaman detail).
 */
export function ExamForm({
  mode,
  examId,
  defaultValues,
  onCreated,
  onUpdated,
}: {
  mode: "create" | "edit";
  examId?: string;
  defaultValues?: Partial<ExamInputPayload>;
  onCreated?: (id: string) => void;
  onUpdated?: () => void;
}) {
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const classesQuery = useGetClasses();
  const subjectsQuery = useGetSubjects();
  const classes = Array.isArray(classesQuery.data) ? classesQuery.data : [];
  const subjects = Array.isArray(subjectsQuery.data) ? subjectsQuery.data : [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExamInputPayload>({
    resolver: zodResolver(examInputSchema),
    defaultValues: {
      title: "",
      description: "",
      classId: "",
      subjectId: "",
      duration: null,
      passingScore: null,
      startAt: "",
      endAt: "",
      ...defaultValues,
    },
  });

  const selectedClassId = watch("classId");
  const selectedSubjectId = watch("subjectId");

  const onSubmit = async (values: ExamInputPayload) => {
    const payload: ExamInputPayload = {
      title: values.title.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      classId: values.classId,
      subjectId: values.subjectId,
      duration: toNullableNumber(values.duration),
      passingScore: toNullableNumber(values.passingScore),
      startAt: toIsoDateTime(values.startAt),
      endAt: toIsoDateTime(values.endAt),
    };

    try {
      if (mode === "create") {
        const result = await createExam.mutateAsync(payload);
        if (isExamApiError(result))
          throw new Error(result.message);
        if (!result?.id)
          throw new Error("ID ujian tidak ditemukan pada respons server");
        toast.success("Ujian berhasil dibuat");
        onCreated?.(result.id);
      } else {
        if (!examId) throw new Error("ID ujian tidak ditemukan");
        const result = await updateExam.mutateAsync({ id: examId, ...payload });
        if (isExamApiError(result))
          throw new Error(result.message);
        toast.success("Ujian berhasil diperbarui");
        onUpdated?.();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () =>
        toast.error("Periksa kembali isian form"),
      )}
      className="space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="exam-title">Judul Ujian</Label>
        <Input
          id="exam-title"
          placeholder="Contoh: Ujian Tengah Semester Matematika"
          {...register("title")}
        />
        {errors.title && (
          <p className="text-destructive text-sm">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="exam-description">Deskripsi</Label>
        <Textarea
          id="exam-description"
          placeholder="Deskripsi atau petunjuk pengerjaan (opsional)"
          rows={3}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-destructive text-sm">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="exam-class">Kelas</Label>
          <Select
            value={selectedClassId}
            onValueChange={(value) =>
              setValue("classId", value, { shouldValidate: true })
            }
            disabled={classesQuery.isLoading}
          >
            <SelectTrigger id="exam-class" className="w-full">
              <SelectValue placeholder="Pilih kelas" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classId && (
            <p className="text-destructive text-sm">{errors.classId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-subject">Mata Pelajaran</Label>
          <Select
            value={selectedSubjectId}
            onValueChange={(value) =>
              setValue("subjectId", value, { shouldValidate: true })
            }
            disabled={subjectsQuery.isLoading}
          >
            <SelectTrigger id="exam-subject" className="w-full">
              <SelectValue placeholder="Pilih mata pelajaran" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subjectId && (
            <p className="text-destructive text-sm">
              {errors.subjectId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-duration">Durasi (menit)</Label>
          <Input
            id="exam-duration"
            type="number"
            min={1}
            max={600}
            placeholder="60"
            {...register("duration", { setValueAs: toNullableNumber })}
          />
          {errors.duration && (
            <p className="text-destructive text-sm">{errors.duration.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-passing-score">Nilai Kelulusan (0-100)</Label>
          <Input
            id="exam-passing-score"
            type="number"
            min={0}
            max={100}
            placeholder="75"
            {...register("passingScore", { setValueAs: toNullableNumber })}
          />
          {errors.passingScore && (
            <p className="text-destructive text-sm">
              {errors.passingScore.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-start-at">Mulai (opsional)</Label>
          <Input
            id="exam-start-at"
            type="datetime-local"
            {...register("startAt")}
          />
          {errors.startAt && (
            <p className="text-destructive text-sm">{errors.startAt.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="exam-end-at">Berakhir (opsional)</Label>
          <Input
            id="exam-end-at"
            type="datetime-local"
            {...register("endAt")}
          />
          {errors.endAt && (
            <p className="text-destructive text-sm">{errors.endAt.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
        {mode === "create" ? "Buat Ujian" : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
