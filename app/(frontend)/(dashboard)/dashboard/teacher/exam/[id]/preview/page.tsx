"use client";

import { useGetExamById } from "@/app/(hooks)/hooks/Exam/useExam";
import { EXAM_STATUS_LABELS } from "@/app/(types)/types/exam-types";
import { isExamApiError } from "@/components/exam/exam-shared";
import { ExamQuestionCard } from "@/components/exam/exam-question-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ExamPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const examQuery = useGetExamById(id);
  const exam = examQuery.data && !isExamApiError(examQuery.data) ? examQuery.data : null;

  if (examQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!exam) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Ujian tidak ditemukan</CardTitle>
          <CardDescription>
            Ujian mungkin sudah dihapus atau bukan milik sekolah Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard/teacher/exam">
              <ArrowLeft className="mr-2 size-4" />
              Kembali ke Daftar Ujian
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const questions = [...exam.questions].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/teacher/exam/${exam.id}`}>
            <ArrowLeft className="mr-2 size-4" />
            Kembali ke Detail Ujian
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/teacher/exam/${exam.id}`}>
            <Pencil className="mr-2 size-4" />
            Ubah Ujian
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{exam.title}</CardTitle>
            <Badge variant={exam.status === "DRAFT" ? "secondary" : "default"}>
              {EXAM_STATUS_LABELS[exam.status] ?? exam.status}
            </Badge>
          </div>
          <CardDescription>
            {exam.className ?? "Tanpa kelas"} •{" "}
            {exam.subjectName ?? "Tanpa mata pelajaran"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span>{exam.questionCount} soal</span>
            <span>•</span>
            <span>{exam.totalPoints} poin</span>
            <span>•</span>
            <span>
              {exam.duration ? `Durasi ${exam.duration} menit` : "Tanpa durasi"}
            </span>
            <span>•</span>
            <span>
              {exam.passingScore !== null
                ? `Nilai lulus ${exam.passingScore}`
                : "Nilai lulus belum diisi"}
            </span>
          </div>

          {exam.description && (
            <p className="text-sm whitespace-pre-wrap">{exam.description}</p>
          )}

          <Alert>
            <Eye />
            <AlertTitle>Mode Pratinjau</AlertTitle>
            <AlertDescription>
              Tampilan soal seperti yang dilihat siswa. Kunci jawaban ditandai
              &quot;Kunci&quot; dan hanya terlihat oleh guru.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {questions.length === 0 ? (
        <div className="text-muted-foreground rounded-3xl border border-dashed p-8 text-center text-sm">
          Belum ada soal pada ujian ini.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((item) => (
            <ExamQuestionCard
              key={item.examQuestionId}
              item={item}
              showAnswers
            />
          ))}
        </div>
      )}
    </div>
  );
}
