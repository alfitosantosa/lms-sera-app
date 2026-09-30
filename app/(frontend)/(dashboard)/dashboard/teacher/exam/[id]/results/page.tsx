"use client";

import { useGetExamResults } from "@/app/(hooks)/hooks/Exam/useExam";
import { EXAM_STATUS_LABELS } from "@/app/(types)/types/exam-types";
import { isExamApiError } from "@/components/exam/exam-shared";
import { ExamResultsTable } from "@/components/exam/exam-results-table";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ExamResultsPage() {
  const { id } = useParams<{ id: string }>();
  const resultsQuery = useGetExamResults(id);
  const results = resultsQuery.data && !isExamApiError(resultsQuery.data) ? resultsQuery.data : null;

  if (resultsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!results) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Hasil ujian tidak tersedia</CardTitle>
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
        <Link href={`/dashboard/teacher/exam/${results.exam.id}`}>
          <ArrowLeft className="mr-2 size-4" />
          Kembali ke Detail Ujian
        </Link>
      </Button>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{results.exam.title}</h1>
          <Badge
            variant={results.exam.status === "DRAFT" ? "secondary" : "default"}
          >
            {EXAM_STATUS_LABELS[results.exam.status] ?? results.exam.status}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          Total poin maksimal {results.exam.maxScore}
          {results.exam.passingScore !== null
            ? ` • Nilai lulus ${results.exam.passingScore}`
            : ""}
        </p>
      </div>

      <ExamResultsTable data={results} />
    </div>
  );
}
