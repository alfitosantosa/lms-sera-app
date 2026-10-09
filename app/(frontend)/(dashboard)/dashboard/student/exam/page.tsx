"use client";

import { type ExamListItemDTO } from "@/app/(types)/types/exam-types";
import {
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/shadCN/utils";
import {
  BookOpen,
  ClipboardList,
  Clock,
  FileText,
  Timer,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function AttemptStatusBadge({ exam }: { exam: ExamListItemDTO }) {
  const attempt = exam.myAttempt;
  if (!attempt) {
    return <Badge variant="secondary">Belum dikerjakan</Badge>;
  }

  if (attempt.status === "IN_PROGRESS") {
    return <Badge variant="default">Sedang dikerjakan</Badge>;
  }

  return (
    <Badge
      variant={attempt.passed === false ? "destructive" : "outline"}
      className={cn(
        attempt.passed &&
          "border-success-border bg-success-surface text-success-strong",
      )}
    >
      {attempt.passed === true
        ? "Lulus"
        : attempt.passed === false
          ? "Tidak Lulus"
          : "Menunggu penilaian"}
    </Badge>
  );
}

export default function StudentExamListPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetStudentExams();
  const startExam = useStartExam();
  const [startingId, setStartingId] = useState<string | null>(null);

  const exams: ExamListItemDTO[] = Array.isArray(data) ? data : [];
  const errorMessage = isExamApiError(data)
    ? data.message
    : isError
      ? "Gagal memuat daftar ujian"
      : null;

  const handleStart = (examId: string) => {
    setStartingId(examId);
    startExam.mutate(examId, {
      onSuccess: (attempt) => {
        if (!attempt?.id) {
          toast.error(examErrorMessage(attempt, "Gagal memulai ujian"));
          return;
        }
        router.push(`/dashboard/student/exam/${examId}/attempt`);
      },
      onError: () => toast.error("Gagal memulai ujian. Silakan coba lagi."),
      onSettled: () => setStartingId(null),
    });
  };

  return (
    <div className="max-w-8xl">
      <div className="mb-6 text-3xl font-semibold tracking-tight">Ujian Saya</div>

      {isLoading ? (
        <ExamStateSkeleton />
      ) : errorMessage ? (
        <ExamStateUnavailable
          message={errorMessage}
          backHref="/dashboard"
          backLabel="Kembali ke Dasbor"
          onRetry={() => void refetch()}
        />
      ) : exams.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>Belum ada ujian tersedia</EmptyTitle>
            <EmptyDescription>
              Ujian yang dipublikasikan untuk kelas Anda akan muncul di sini.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((exam) => {
            const attempt = exam.myAttempt;
            const inProgress = attempt?.status === "IN_PROGRESS";
            const finished =
              attempt?.status === "SUBMITTED" || attempt?.status === "GRADED";

            return (
              <Card key={exam.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <AttemptStatusBadge exam={exam} />
                  </div>
                  <CardDescription>
                    {exam.subjectName ?? "Tanpa mata pelajaran"} ·{" "}
                    {exam.className ?? "Tanpa kelas"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 text-sm">
                  <div className="text-muted-foreground grid grid-cols-2 gap-3">
                    <span className="flex items-center gap-2">
                      <FileText className="size-4" /> {exam.questionCount} soal
                    </span>
                    <span className="flex items-center gap-2">
                      <Timer className="size-4" />{" "}
                      {exam.duration ? `${exam.duration} menit` : "Tanpa batas"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Trophy className="size-4" /> KKM{" "}
                      {exam.passingScore ?? "-"}
                    </span>
                    <span className="flex items-center gap-2">
                      <BookOpen className="size-4" /> Total {exam.totalPoints}{" "}
                      poin
                    </span>
                  </div>

                  <div className="text-muted-foreground flex items-start gap-2">
                    <Clock className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {formatExamDateTime(exam.startAt)} –{" "}
                      {formatExamDateTime(exam.endAt)}
                    </span>
                  </div>

                  {finished && attempt && (
                    <div className="bg-muted flex items-center justify-between rounded-3xl border p-3">
                      <span>Nilai</span>
                      <span className="font-semibold">
                        {attempt.score ?? "-"}
                        {attempt.passed === null ? " (menunggu penilaian)" : ""}
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/dashboard/student/exam/${exam.id}`}>Detail</Link>
                  </Button>

                  {finished ? (
                    <Button asChild className="flex-1">
                      <Link
                        href={`/dashboard/student/exam/${exam.id}/result`}
                      >
                        Lihat Hasil
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      disabled={startingId === exam.id}
                      onClick={() => handleStart(exam.id)}
                    >
                      {startingId === exam.id
                        ? "Memulai..."
                        : inProgress
                          ? "Lanjutkan"
                          : "Kerjakan"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
