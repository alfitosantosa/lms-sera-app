"use client";

import {
  EXAM_STATUS_LABELS,
  type ExamDetailDTO,
} from "@/app/(types)/types/exam-types";
import {
  useGetExamById,
  useGetStudentExams,
  useStartExam,
} from "@/app/(hooks)/hooks/Exam/useExam";
import {
  ExamStateSkeleton,
  ExamStateUnavailable,
  examErrorMessage,
  formatExamDateTime,
  isExamApiError,
} from "@/components/exam/exam-shared";
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
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, FileText, Trophy } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentExamDetailPage() {
  const { id: examId } = useParams<{ id: string }>();
  const router = useRouter();
  const detailQuery = useGetExamById(examId);
  const listQuery = useGetStudentExams();
  const startExam = useStartExam();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rawDetail = detailQuery.data;
  const detail: ExamDetailDTO | null =
    rawDetail && !isExamApiError(rawDetail) ? rawDetail : null;
  const listExams = Array.isArray(listQuery.data) ? listQuery.data : [];
  const myAttempt =
    detail?.myAttempt ??
    listExams.find((exam) => exam.id === examId)?.myAttempt ??
    null;
  const finished =
    myAttempt?.status === "SUBMITTED" || myAttempt?.status === "GRADED";
  const isLoading = detailQuery.isLoading || listQuery.isLoading;

  const handleStart = () => {
    startExam.mutate(examId, {
      onSuccess: (attempt) => {
        if (!attempt?.id) {
          toast.error(examErrorMessage(attempt, "Gagal memulai ujian"));
          return;
        }
        router.push(`/dashboard/student/exam/${examId}/attempt`);
      },
      onError: () => toast.error("Gagal memulai ujian. Silakan coba lagi."),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-8xl">
        <div className="mb-6 text-3xl font-semibold tracking-tight">Detail Ujian</div>
        <ExamStateSkeleton cards={2} />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="max-w-8xl">
        <div className="mb-6 text-3xl font-semibold tracking-tight">Detail Ujian</div>
        <ExamStateUnavailable
          message={examErrorMessage(
            rawDetail,
            "Ujian tidak tersedia atau tidak dapat diakses",
          )}
          onRetry={() => void detailQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-8xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{detail.title}</h1>
        <Badge variant={detail.status === "PUBLISHED" ? "default" : "secondary"}>
          {EXAM_STATUS_LABELS[detail.status] ?? detail.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Ujian</CardTitle>
          <CardDescription>
            {detail.subjectName ?? "Tanpa mata pelajaran"} ·{" "}
            {detail.className ?? "Tanpa kelas"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {detail.description && (
            <p className="whitespace-pre-wrap">{detail.description}</p>
          )}
          <Separator />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground size-4" />
              <span>{detail.questionCount} soal</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="text-muted-foreground size-4" />
              <span>KKM {detail.passingScore ?? "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground size-4" />
              <span>
                {detail.duration ? `${detail.duration} menit` : "Tanpa batas"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="text-muted-foreground size-4" />
              <span>Total {detail.totalPoints} poin</span>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-muted-foreground">Periode Ujian</p>
            <p className="font-medium">
              {formatExamDateTime(detail.startAt)} –{" "}
              {formatExamDateTime(detail.endAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tata Tertib</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            Waktu akan berjalan setelah Anda memulai. Pastikan koneksi stabil
            sebelum menekan tombol mulai.
          </p>
          <p>
            Jawaban tersimpan otomatis, tetapi tetap tekan tombol kumpulkan
            sebelum waktu habis.
          </p>
          <p>
            Ujian akan dikumpulkan otomatis ketika waktu habis dan jawaban tidak
            dapat diubah lagi.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard/student/exam">Kembali</Link>
        </Button>

        {finished ? (
          <Button asChild>
            <Link href={`/dashboard/student/exam/${examId}/result`}>
              Lihat Hasil
            </Link>
          </Button>
        ) : (
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Button size="lg" onClick={() => setConfirmOpen(true)}>
              {myAttempt?.status === "IN_PROGRESS"
                ? "Lanjutkan Ujian"
                : "Mulai Ujian"}
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Mulai ujian sekarang?</AlertDialogTitle>
                <AlertDialogDescription>
                  Waktu akan berjalan setelah Anda memulai. Anda tidak dapat
                  menghentikan waktu ujian.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleStart}
                  disabled={startExam.isPending}
                >
                  {startExam.isPending ? "Memulai..." : "Mulai Sekarang"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
