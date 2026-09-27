"use client";

import {
  useAddQuestion,
  useDeleteQuestion,
  useUpdateQuestion,
} from "@/app/(hooks)/hooks/Exam/useExam";
import { getErrorMessage } from "@/app/(types)";
import {
  type ExamQuestionItemDTO,
  QUESTION_TYPE_LABELS,
  type QuestionTypes,
  questionInputSchema,
} from "@/app/(types)/types/exam-types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DialogDescription,
  DialogFooter,
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
import { cn } from "@/lib/utils";
import { Info, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExamImageUpload } from "./exam-image-upload";
import { ExamQuestionCard } from "./exam-question-card";
import { isExamApiError } from "./exam-shared";

type DraftOption = { option: string; text: string; isCorrect: boolean };

const OPTION_KEYS = ["A", "B", "C", "D", "E", "F"];
const MIN_OPTIONS = 2;

function seedOptions(type: QuestionTypes): DraftOption[] {
  if (type === "TRUE_FALSE") {
    return [
      { option: "True", text: "Benar", isCorrect: false },
      { option: "False", text: "Salah", isCorrect: false },
    ];
  }
  if (type === "MULTIPLE_CHOICE") {
    return OPTION_KEYS.slice(0, 4).map((option) => ({
      option,
      text: "",
      isCorrect: false,
    }));
  }
  return [];
}

function QuestionForm({
  examId,
  editing,
  onDone,
  onCancel,
}: {
  examId: string;
  editing: ExamQuestionItemDTO | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const addQuestion = useAddQuestion();
  const updateQuestion = useUpdateQuestion();

  const [type, setType] = useState<QuestionTypes>(
    editing ? editing.question.type : "MULTIPLE_CHOICE",
  );
  const [questionText, setQuestionText] = useState(
    editing ? editing.question.question : "",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    editing ? editing.question.imageUrl : null,
  );
  const [points, setPoints] = useState(editing ? String(editing.points) : "1");
  const [options, setOptions] = useState<DraftOption[]>(() =>
    editing
      ? editing.question.options.map((option) => ({
          option: option.option,
          text: option.text,
          isCorrect: option.isCorrect === true,
        }))
      : seedOptions("MULTIPLE_CHOICE"),
  );

  const isSaving = addQuestion.isPending || updateQuestion.isPending;

  const handleTypeChange = (next: QuestionTypes) => {
    setType(next);
    setOptions(seedOptions(next));
  };

  const setCorrectOption = (index: number, checked: boolean) => {
    setOptions((previous) =>
      previous.map((option, current) => ({
        ...option,
        isCorrect:
          current === index
            ? checked
            : checked
              ? false
              : option.isCorrect,
      })),
    );
  };

  const updateOptionText = (index: number, text: string) => {
    setOptions((previous) =>
      previous.map((option, current) =>
        current === index ? { ...option, text } : option,
      ),
    );
  };

  const addOption = () => {
    setOptions((previous) => [
      ...previous,
      {
        option: OPTION_KEYS[previous.length] ?? String(previous.length + 1),
        text: "",
        isCorrect: false,
      },
    ]);
  };

  const removeOption = (index: number) => {
    setOptions((previous) => previous.filter((_, current) => current !== index));
  };

  const handleSubmit = async () => {
    // Baris opsi yang dikosongkan (mis. seed A-D yang tidak dipakai) diabaikan,
    // supaya guru cukup mengisi opsi yang dipakai.
    const filledOptions = options
      .map((option) => ({
        option: option.option,
        text: option.text.trim(),
        isCorrect: option.isCorrect,
      }))
      .filter((option) => option.text.length > 0);

    const parsed = questionInputSchema.safeParse({
      type,
      question: questionText.trim(),
      imageUrl,
      points: points.trim() === "" ? 0 : Number(points),
      options: type === "ESSAY" ? [] : filledOptions,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    try {
      if (editing) {
        const result = await updateQuestion.mutateAsync({
          examId,
          questionId: editing.question.id,
          ...parsed.data,
        });
        if (isExamApiError(result))
          throw new Error(result.message);
        toast.success("Soal berhasil diperbarui");
      } else {
        const result = await addQuestion.mutateAsync({
          examId,
          ...parsed.data,
        });
        if (isExamApiError(result))
          throw new Error(result.message);
        toast.success("Soal berhasil ditambahkan");
      }
      onDone();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="question-type">Tipe Soal</Label>
          <Select
            value={type}
            onValueChange={(value) => handleTypeChange(value as QuestionTypes)}
          >
            <SelectTrigger id="question-type" className="w-full">
              <SelectValue placeholder="Pilih tipe soal" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="question-points">Poin</Label>
          <Input
            id="question-points"
            type="number"
            min={1}
            max={100}
            value={points}
            onChange={(event) => setPoints(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="question-text">Pertanyaan</Label>
        <Textarea
          id="question-text"
          value={questionText}
          onChange={(event) => setQuestionText(event.target.value)}
          placeholder="Tulis pertanyaan..."
          rows={3}
        />
      </div>

      <ExamImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        disabled={isSaving}
      />

      {type === "ESSAY" ? (
        <Alert>
          <Info />
          <AlertTitle>Soal Essay</AlertTitle>
          <AlertDescription>
            Soal essay tidak memerlukan pilihan jawaban dan dinilai manual.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Pilihan Jawaban</Label>
            <span className="text-muted-foreground text-xs">
              Tandai tepat satu jawaban benar
            </span>
          </div>

          {options.map((option, index) => (
            <div
              key={`${option.option}-${index}`}
              className={cn(
                "flex items-center gap-3 rounded-md border p-2",
                option.isCorrect &&
                  "border-green-500/50 bg-green-50/60 dark:bg-green-950/20",
              )}
            >
              <Checkbox
                checked={option.isCorrect}
                onCheckedChange={(checked) =>
                  setCorrectOption(index, checked === true)
                }
                aria-label={`Tandai opsi ${option.option} sebagai jawaban benar`}
              />
              <Badge variant="outline" className="min-w-8 justify-center">
                {option.option}
              </Badge>
              <Input
                value={option.text}
                onChange={(event) =>
                  updateOptionText(index, event.target.value)
                }
                placeholder={`Teks opsi ${option.option}`}
              />
              {type === "MULTIPLE_CHOICE" && options.length > MIN_OPTIONS && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                  aria-label={`Hapus opsi ${option.option}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}

          {type === "MULTIPLE_CHOICE" && options.length < OPTION_KEYS.length && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <Plus className="mr-2 size-4" />
              Tambah Opsi
            </Button>
          )}

          {type === "TRUE_FALSE" && (
            <p className="text-muted-foreground text-xs">
              Opsi Benar dan Salah sudah disiapkan otomatis.
            </p>
          )}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
          {editing ? "Simpan Perubahan" : "Tambah Soal"}
        </Button>
      </DialogFooter>
    </div>
  );
}

/**
 * Penyusun soal ujian: daftar soal + form tambah/ubah/hapus.
 * Nonaktif saat ujian tidak berstatus draft (aturan backend).
 */
export function ExamQuestionBuilder({
  examId,
  questions,
  disabled = false,
}: {
  examId: string;
  questions: ExamQuestionItemDTO[];
  disabled?: boolean;
}) {
  const deleteQuestion = useDeleteQuestion();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExamQuestionItemDTO | null>(null);
  const [deleting, setDeleting] = useState<ExamQuestionItemDTO | null>(null);

  const sorted = [...questions].sort((a, b) => a.order - b.order);
  const totalPoints = sorted.reduce((sum, item) => sum + item.points, 0);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const result = await deleteQuestion.mutateAsync({
        examId,
        questionId: deleting.question.id,
      });
      if (isExamApiError(result))
        throw new Error(result.message);
      toast.success("Soal berhasil dihapus");
      setDeleting(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Daftar Soal</h3>
          <Badge variant="secondary">{sorted.length} soal</Badge>
          <Badge variant="outline">{totalPoints} poin</Badge>
        </div>
        <Button
          type="button"
          disabled={disabled}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Tambah Soal
        </Button>
      </div>

      {disabled && (
        <Alert>
          <Info />
          <AlertTitle>Soal terkunci</AlertTitle>
          <AlertDescription>
            Soal hanya dapat diubah saat ujian berstatus draft.
          </AlertDescription>
        </Alert>
      )}

      {sorted.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
          Belum ada soal pada ujian ini.
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((item) => (
            <ExamQuestionCard
              key={item.examQuestionId}
              item={item}
              showAnswers
              disabled={disabled}
              onEdit={() => {
                setEditing(item);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(item)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Ubah Soal ${editing.order}` : "Tambah Soal"}
            </DialogTitle>
            <DialogDescription>
              Lengkapi pertanyaan, poin, dan pilihan jawaban.
            </DialogDescription>
          </DialogHeader>
          <QuestionForm
            key={editing?.question.id ?? "new"}
            examId={examId}
            editing={editing}
            onDone={() => {
              setFormOpen(false);
              setEditing(null);
            }}
            onCancel={() => {
              setFormOpen(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus soal ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Soal {deleting?.order} akan dihapus dari ujian ini. Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={deleteQuestion.isPending}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
