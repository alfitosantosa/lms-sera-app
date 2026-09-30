"use client";

import { type StudentExamResultDTO } from "@/app/(types)/types/exam-types";
import { ExamQuestionImage } from "@/components/exam/exam-question-image";
import { formatExamDateTime } from "@/components/exam/exam-shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

type ExamResultProps = {
  result: StudentExamResultDTO;
};

/** Ringkasan nilai + review per soal untuk siswa. */
export function ExamResult({ result }: ExamResultProps) {
  const waiting = result.needsManualGrading || result.passed === null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Nilai Anda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-muted-foreground text-sm">Skor</p>
              <p className="text-3xl font-semibold tracking-tight">
                {result.score ?? "-"} / {result.maxScore}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Persentase</p>
              <p className="text-3xl font-semibold tracking-tight">
                {result.percentage}%
              </p>
            </div>
            <Badge
              variant={
                waiting ? "secondary" : result.passed ? "outline" : "destructive"
              }
              className={cn(
                !waiting &&
                  result.passed &&
                  "border-success-border bg-success-surface text-success-strong",
              )}
            >
              {waiting
                ? "Menunggu penilaian"
                : result.passed
                  ? "Lulus"
                  : "Tidak Lulus"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Nilai kelulusan: {result.passingScore ?? "-"} · Dikumpulkan:{" "}
            {formatExamDateTime(result.submittedAt)}
          </p>
          {result.needsManualGrading && (
            <p className="text-caution text-sm">
              Sebagian soal essay masih menunggu penilaian guru.
            </p>
          )}
        </CardContent>
      </Card>

      {result.answers.map((answer) => {
        const waitingAnswer = answer.isCorrect === null;

        return (
          <Card key={answer.questionId}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">Soal {answer.order}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{answer.points} poin</Badge>
                  {waitingAnswer ? (
                    <Badge variant="secondary">Menunggu penilaian guru</Badge>
                  ) : answer.isCorrect ? (
                    <Badge
                      variant="outline"
                      className="border-success-border bg-success-surface text-success-strong"
                    >
                      <CheckCircle2 /> Benar
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle /> Salah
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium whitespace-pre-wrap">{answer.question}</p>

              {answer.imageUrl && (
                <ExamQuestionImage
                  src={answer.imageUrl}
                  alt={`Gambar soal ${answer.order}`}
                />
              )}

              {answer.type === "ESSAY" ? (
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Jawaban Anda</p>
                  <p className="bg-muted border-border rounded-2xl border p-3 text-sm whitespace-pre-wrap">
                    {answer.answerText?.trim()
                      ? answer.answerText
                      : "Tidak dijawab"}
                  </p>
                  {waitingAnswer && (
                    <p className="text-caution text-sm">
                      Jawaban essay menunggu penilaian guru.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    className={cn(
                      "border-border flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3 text-sm",
                      answer.isCorrect === false &&
                        "border-destructive-border bg-destructive-surface",
                    )}
                  >
                    <span className="text-muted-foreground">Jawaban Anda</span>
                    <span className="font-medium">
                      {answer.selectedOptionLabel ?? "Tidak dijawab"}
                    </span>
                  </div>
                  {answer.correctOptionLabel && (
                    <div className="border-success-border bg-success-surface flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3 text-sm">
                      <span className="text-muted-foreground">
                        Kunci Jawaban
                      </span>
                      <span className="font-medium">
                        {answer.correctOptionLabel}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {!waitingAnswer && answer.earnedPoints !== null && (
                <p className="text-muted-foreground text-sm">
                  Poin diperoleh: {answer.earnedPoints} / {answer.points}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
