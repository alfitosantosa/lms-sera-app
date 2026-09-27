"use client";

import {
  type ExamQuestionItemDTO,
  QUESTION_TYPE_LABELS,
} from "@/app/(types)/types/exam-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Pencil, Trash2 } from "lucide-react";
import { ExamQuestionImage } from "./exam-question-image";

/**
 * Kartu satu soal ujian. Dipakai guru (dengan aksi ubah/hapus) maupun
 * halaman pratinjau (`showAnswers` menampilkan kunci jawaban).
 */
export function ExamQuestionCard({
  item,
  showAnswers = false,
  disabled = false,
  onEdit,
  onDelete,
}: {
  item: ExamQuestionItemDTO;
  showAnswers?: boolean;
  disabled?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { question } = item;

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Soal {item.order}</Badge>
          <Badge variant="secondary">
            {QUESTION_TYPE_LABELS[question.type] ?? question.type}
          </Badge>
          <Badge variant="outline">{item.points} poin</Badge>

          {(onEdit || onDelete) && (
            <div className="ml-auto flex items-center gap-1">
              {onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  disabled={disabled}
                >
                  <Pencil className="mr-2 size-4" />
                  Ubah
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  disabled={disabled}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Hapus
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
          {question.question}
        </p>

        {question.imageUrl && (
          <ExamQuestionImage
            src={question.imageUrl}
            alt={`Gambar soal ${item.order}`}
          />
        )}

        {question.type === "ESSAY" ? (
          <p className="text-muted-foreground text-sm italic">
            Soal essay — jawaban siswa dinilai manual oleh guru.
          </p>
        ) : (
          <ul className="space-y-2">
            {question.options.map((option) => {
              const isKey = showAnswers && option.isCorrect === true;
              return (
                <li
                  key={option.id}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-2 text-sm",
                    isKey &&
                      "border-green-500/50 bg-green-50/60 dark:bg-green-950/20",
                  )}
                >
                  <Badge
                    variant={isKey ? "default" : "outline"}
                    className="mt-0.5 min-w-8 justify-center"
                  >
                    {option.option}
                  </Badge>
                  <span className="flex-1 whitespace-pre-wrap">
                    {option.text}
                  </span>
                  {isKey && (
                    <span className="flex shrink-0 items-center gap-1">
                      <Check className="size-4 text-green-600 dark:text-green-500" />
                      <Badge
                        variant="outline"
                        className="border-green-500/50 text-green-700 dark:text-green-400"
                      >
                        Kunci
                      </Badge>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
