"use client";

import {
  QUESTION_TYPE_LABELS,
  type ExamQuestionItemDTO,
} from "@/app/(types)/types/exam-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type ExamAnswerValue = {
  selectedOptionId: string | null;
  answerText: string | null;
};

type ExamAnswerInputProps = {
  question: ExamQuestionItemDTO;
  value: ExamAnswerValue;
  disabled?: boolean;
  onSelectOption: (optionId: string) => void;
  onChangeText: (text: string) => void;
};

/** Label Bahasa Indonesia untuk opsi soal benar/salah. */
const TRUE_FALSE_OPTION_LABELS: Record<string, string> = {
  True: "Benar",
  False: "Salah",
};

/**
 * Input jawaban siswa (controlled oleh halaman attempt).
 * Komponen ini hanya melaporkan perubahan; tidak pernah mengirim/mengumpulkan ujian.
 */
export function ExamAnswerInput({
  question,
  value,
  disabled = false,
  onSelectOption,
  onChangeText,
}: ExamAnswerInputProps) {
  const { id: questionId, type, options } = question.question;

  if (type === "ESSAY") {
    return (
      <div className="space-y-2">
        <Label htmlFor={`answer-${questionId}`}>Jawaban Anda</Label>
        <Textarea
          id={`answer-${questionId}`}
          rows={6}
          value={value.answerText ?? ""}
          disabled={disabled}
          onChange={(event) => onChangeText(event.target.value)}
          placeholder="Tulis jawaban Anda di sini..."
        />
      </div>
    );
  }

  const isTrueFalse = type === "TRUE_FALSE";

  return (
    <div
      role="radiogroup"
      aria-label={QUESTION_TYPE_LABELS[type] ?? "Pilihan jawaban"}
      className="space-y-2"
    >
      {options.map((option) => {
        const selected = value.selectedOptionId === option.id;
        const label = isTrueFalse
          ? (TRUE_FALSE_OPTION_LABELS[option.option] ?? option.text)
          : option.text;

        return (
          <Button
            key={option.id}
            type="button"
            variant={selected ? "default" : "outline"}
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onSelectOption(option.id)}
            className="h-auto w-full justify-start gap-3 py-3 text-left whitespace-normal"
          >
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                selected
                  ? "border-primary-foreground/40 bg-primary-foreground/15"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              {selected
                ? <Check className="size-3.5" />
                : isTrueFalse
                  ? label.charAt(0)
                  : option.option}
            </span>
            <span className="flex-1">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
