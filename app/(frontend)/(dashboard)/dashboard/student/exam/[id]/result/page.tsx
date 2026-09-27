"use client";

import {
  useGetExamResult,
  useGetExamSession,
  useGetStudentExams,
} from "@/app/(hooks)/hooks/Exam/useExam";
import { ExamResult } from "@/components/exam/exam-result";
import {
  ExamStateSkeleton,
  ExamStateUnavailable,
  isExamApiError,
} from "@/components/exam/exam-shared";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentExamResultPage() {
  const { id: examId } = useParams<{ id: string }>();
  const router = useRouter();
  const attemptUrl = `/dashboard/student/exam/${examId}/attempt`;

  const sessionQuery = useGetExamSession(examId);
  const listQuery = useGetStudentExams();

  const session =
    sessionQuery.data && !isExamApiError(sessionQuery.data)
      ? sessionQuery.data
      : null;
  const listExams = Array.isArray(listQuery.data) ? listQuery.data : [];
  const listAttempt =
    listExams.find((exam) => exam.id === examId)?.myAttempt ?? null;

  const attemptId = session?.attempt?.id ?? listAttempt?.id ?? "";
  const attemptStatus = session?.attempt?.status ?? listAttempt?.status ?? null;

  const resultQuery = useGetExamResult(examId, attemptId);

  const result =
    resultQuery.data && !isExamApiError(resultQuery.data)
      ? resultQuery.data
      : null;

  // Attempt yang masih berjalan tidak punya hasil: kembalikan ke halaman ujian.
  useEffect(() => {
    if (attemptStatus === "IN_PROGRESS") router.replace(attemptUrl);
  }, [attemptStatus, attemptUrl, router]);

  if (attemptStatus === "IN_PROGRESS") {
    return (
      <div className="max-w-8xl">
        <div className="mb-6 text-3xl font-bold">Hasil Ujian</div>
        <ExamStateUnavailable
          message="Ujian belum selesai dikerjakan"
          backHref={attemptUrl}
          backLabel="Lanjutkan Ujian"
        />
      </div>
    );
  }

  const isLoading =
    sessionQuery.isLoading ||
    listQuery.isLoading ||
    (attemptId !== "" && resultQuery.isLoading);

  if (isLoading) {
    return (
      <div className="max-w-8xl">
        <div className="mb-6 text-3xl font-bold">Hasil Ujian</div>
        <ExamStateSkeleton cards={2} />
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="max-w-8xl">
        <div className="mb-6 text-3xl font-bold">Hasil Ujian</div>
        <ExamStateUnavailable message="Anda belum mengerjakan ujian ini" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-8xl">
        <div className="mb-6 text-3xl font-bold">Hasil Ujian</div>
        <ExamStateUnavailable
          message={
            isExamApiError(resultQuery.data)
              ? resultQuery.data.message
              : "Hasil ujian belum tersedia"
          }
          onRetry={() => void resultQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-8xl space-y-4">
      <h1 className="text-3xl font-bold">{result.examTitle}</h1>
      <ExamResult result={result} />
    </div>
  );
}
