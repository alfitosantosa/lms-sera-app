"use client";

import { type ExamQuestionItemDTO } from "@/app/(types)/types/exam-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ExamQuestionNavProps = {
  questions: ExamQuestionItemDTO[];
  currentIndex: number;
  answeredIds: string[];
  onSelect: (index: number) => void;
  disabled?: boolean;
};

/** Grid nomor soal: menandai soal terjawab & soal aktif, klik untuk pindah. */
export function ExamQuestionNav({
  questions,
  currentIndex,
  answeredIds,
  onSelect,
  disabled = false,
}: ExamQuestionNavProps) {
  const answered = new Set(answeredIds);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Navigasi Soal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-6 gap-2 lg:grid-cols-5">
          {questions.map((item, index) => {
            const isAnswered = answered.has(item.question.id);
            const isCurrent = index === currentIndex;

            return (
              <Button
                key={item.examQuestionId}
                type="button"
                size="sm"
                variant={isAnswered ? "default" : "outline"}
                aria-current={isCurrent ? "true" : undefined}
                aria-label={`Soal ${index + 1}${isAnswered ? ", sudah dijawab" : ", belum dijawab"}`}
                disabled={disabled}
                onClick={() => onSelect(index)}
                className={cn(
                  "w-full px-0",
                  isCurrent && "ring-primary ring-2 ring-offset-2",
                )}
              >
                {index + 1}
              </Button>
            );
          })}
        </div>
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>
            Terjawab {answered.size} dari {questions.length} soal
          </span>
          <span className="flex items-center gap-1">
            <span className="bg-primary inline-block size-3 rounded" />
            sudah dijawab
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
