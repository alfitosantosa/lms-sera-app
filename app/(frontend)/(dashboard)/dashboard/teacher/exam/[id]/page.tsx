"use client";

import {
  useChangeExamStatus,
  useGetExamById,
} from "@/app/(hooks)/hooks/Exam/useExam";
import { getErrorMessage } from "@/app/(types)";
import { EXAM_STATUS_LABELS } from "@/app/(types)/types/exam-types";
import { isExamApiError } from "@/components/exam/exam-shared";
import { ExamForm, toLocalDateTimeInput } from "@/components/exam/exam-form";
import { ExamQuestionBuilder } from "@/components/exam/exam-question-builder";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const examQuery = useGetExamById(id);
  const exam = examQuery.data && !isExamApiError(examQuery.data) ? examQuery.data : null;
  const changeStatus = useChangeExamStatus();
  const [confirmAction, setConfirmAction] = useState<"publish" | "close" | null>(
    null,
  );

  const handleStatusChange = async () => {
    if (!exam || !confirmAction) return;
    try {
      const result = await changeStatus.mutateAsync({
        id: exam.id,
        action: confirmAction,
      });
      if (isExamApiError(result))
        throw new Error(result.message);
      toast.success(
        confirmAction === "publish"
          ? "Ujian berhasil dipublikasikan"
          : "Ujian berhasil ditutup",
      );
      setConfirmAction(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

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

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/teacher/exam">
          <ArrowLeft className="mr-2 size-4" />
          Kembali ke Daftar Ujian
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{exam.title}</h1>
            <Badge variant={exam.status === "DRAFT" ? "secondary" : "default"}>
              {EXAM_STATUS_LABELS[exam.status] ?? exam.status}
            </Badge>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span>{exam.className ?? "Tanpa kelas"}</span>
            <span>•</span>
            <span>{exam.subjectName ?? "Tanpa mata pelajaran"}</span>
            <span>•</span>
            <span>{exam.questionCount} soal</span>
            <span>•</span>
            <span>{exam.totalPoints} poin</span>
            <span>•</span>
            <span>
              {exam.duration ? `${exam.duration} menit` : "Tanpa durasi"}
            </span>
            <span>•</span>
            <span>
              {exam.passingScore !== null
                ? `Nilai lulus ${exam.passingScore}`
                : "Nilai lulus belum diisi"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/teacher/exam/${exam.id}/preview`}>
              <Eye className="mr-2 size-4" />
              Preview
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/teacher/exam/${exam.id}/results`}>
              <BarChart3 className="mr-2 size-4" />
              Hasil
            </Link>
          </Button>
          {exam.status === "DRAFT" && (
            <Button onClick={() => setConfirmAction("publish")}>
              Publikasikan
            </Button>
          )}
          {exam.status === "PUBLISHED" && (
            <Button
              variant="outline"
              onClick={() => setConfirmAction("close")}
            >
              Tutup Ujian
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Soal</TabsTrigger>
          <TabsTrigger value="information">Informasi Ujian</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="pt-4">
          <ExamQuestionBuilder
            examId={exam.id}
            questions={exam.questions}
            disabled={exam.status !== "DRAFT"}
          />
        </TabsContent>

        <TabsContent value="information" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Ujian</CardTitle>
              <CardDescription>
                Perbarui judul, kelas, mata pelajaran, durasi, dan jadwal ujian.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExamForm
                mode="edit"
                examId={exam.id}
                defaultValues={{
                  title: exam.title,
                  description: exam.description ?? "",
                  classId: exam.classId ?? "",
                  subjectId: exam.subjectId ?? "",
                  duration: exam.duration,
                  passingScore: exam.passingScore,
                  startAt: toLocalDateTimeInput(exam.startAt),
                  endAt: toLocalDateTimeInput(exam.endAt),
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "publish"
                ? "Publikasikan ujian ini?"
                : "Tutup ujian ini?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "publish" ? (
                <>
                  Ujian &quot;{exam.title}&quot; akan dibuka untuk siswa.
                  Pastikan:
                  <span className="mt-2 block">
                    • Ujian memiliki minimal 1 soal.
                    <br />• Durasi ujian sudah diisi.
                    <br />• Nilai kelulusan sudah diisi.
                  </span>
                  Soal tidak dapat diubah setelah ujian dipublikasikan.
                </>
              ) : (
                `Ujian "${exam.title}" akan ditutup dan siswa tidak dapat lagi mengerjakannya.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleStatusChange();
              }}
              disabled={changeStatus.isPending}
            >
              {changeStatus.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {confirmAction === "publish" ? "Publikasikan" : "Tutup"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
