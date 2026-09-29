"use client";

import {
  reportUpdateSchema,
  type ReportUpdateInput,
  type StudentReportDTO,
} from "@/app/(types)";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";

/** Jeda autosave — cukup lama agar tidak satu PATCH per ketikan (§55 autosave). */
const AUTOSAVE_DELAY_MS = 1500;

/**
 * Form narasi rapor. Validasi resmi memakai `reportUpdateSchema` yang sama
 * dengan API route, jadi bentuk body tidak bisa melenceng dari kontrak server.
 */
export function useReportCardForm(
  report: StudentReportDTO | undefined,
): UseFormReturn<ReportUpdateInput> {
  const form = useForm<ReportUpdateInput>({
    resolver: zodResolver(reportUpdateSchema),
    defaultValues: {
      teacherNarrative: "",
      homeroomNote: "",
      principalNote: "",
    },
  });

  const reportId = report?.id;
  useEffect(() => {
    if (!report) return;
    // Jangan timpa suntingan guru yang belum tersimpan (refetch setelah simpan
    // bisa datang saat masih ada ketikan baru).
    if (form.formState.isDirty) return;
    form.reset({
      teacherNarrative: report.teacherNarrative ?? "",
      homeroomNote: report.homeroomNote ?? "",
      principalNote: report.principalNote ?? "",
    });
  }, [form, report, reportId]);

  return form;
}

export type ReportCardEditorProps = {
  form: UseFormReturn<ReportUpdateInput>;
  /** Narasi hanya boleh diubah pada `DRAFT`/`REVIEW`. */
  editable: boolean;
  isSaving?: boolean;
  /** Dipanggil oleh autosave dan tombol simpan. */
  onSave: (values: ReportUpdateInput) => unknown;
  /** Menampilkan tombol simpan manual di dalam form. */
  showSaveButton?: boolean;
};

export function ReportCardEditor({
  form,
  editable,
  isSaving = false,
  onSave,
  showSaveButton = true,
}: ReportCardEditorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = form;

  // Autosave: hanya saat form berubah, editable, dan tidak sedang menyimpan.
  // Kunci serialisasi dipakai sebagai dependensi supaya identitas objek baru
  // dari `watch()` tidak terus-menerus menunda timer.
  const watchedKey = JSON.stringify(watch());
  useEffect(() => {
    if (!editable || !isDirty || isSaving) return;
    const timer = setTimeout(() => {
      void handleSubmit(onSave)();
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // `watchedKey` sengaja jadi dependensi — setiap perubahan menunda timer.
  }, [watchedKey, editable, isDirty, isSaving, handleSubmit, onSave]);

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(onSave)}
      onKeyDown={(event) => {
        // Ctrl/Cmd+S menyimpan tanpa menunggu autosave.
        if ((event.metaKey || event.ctrlKey) && event.key === "s") {
          event.preventDefault();
          void handleSubmit(onSave)();
        }
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="teacherNarrative">Narasi Guru</Label>
        <Textarea
          id="teacherNarrative"
          rows={6}
          placeholder="Narasi perkembangan ananda pada periode ini..."
          disabled={!editable || isSaving}
          {...register("teacherNarrative")}
        />
        {errors.teacherNarrative && (
          <p className="text-destructive text-xs">
            {errors.teacherNarrative.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="homeroomNote">Catatan Wali Kelas</Label>
        <Textarea
          id="homeroomNote"
          rows={3}
          placeholder="Catatan wali kelas (opsional)..."
          disabled={!editable || isSaving}
          {...register("homeroomNote")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="principalNote">Catatan Kepala Sekolah</Label>
        <Textarea
          id="principalNote"
          rows={3}
          placeholder="Catatan kepala sekolah (opsional)..."
          disabled={!editable || isSaving}
          {...register("principalNote")}
        />
      </div>

      {!editable && (
        <p className="text-muted-foreground text-xs">
          Rapor sudah dikunci pada tahap ini — narasi tidak dapat diubah.
        </p>
      )}

      {showSaveButton && editable && (
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Simpan Draft
          </Button>
          <span className="text-muted-foreground text-xs">
            Perubahan tersimpan otomatis.
          </span>
        </div>
      )}
    </form>
  );
}
