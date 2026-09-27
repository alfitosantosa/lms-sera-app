"use client";

import {
  QUESTION_TYPE_LABELS,
  type ExamQuestionItemDTO,
  type SaveAnswerPayload,
} from "@/app/(types)/types/exam-types";
import {
  useGetExamSession,
  useGetStudentExams,
  useSaveAnswer,
  useSubmitExam,
} from "@/app/(hooks)/hooks/Exam/useExam";
import {
  ExamAnswerInput,
  type ExamAnswerValue,
} from "@/components/exam/exam-answer-input";
import { ExamQuestionImage } from "@/components/exam/exam-question-image";
import { ExamQuestionNav } from "@/components/exam/exam-question-nav";
import { ExamTimer } from "@/components/exam/exam-timer";
import {
  ExamStateSkeleton,
  ExamStateUnavailable,
  examErrorMessage,
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const AUTOSAVE_DELAY_MS = 600;

type SaveStatus = "saving" | "saved" | "error";

function SaveIndicator({
  status,
  onRetry,
}: {
  status?: SaveStatus;
  onRetry: () => void;
}) {
  if (status === "saving") {
    return (
      <span className="text-muted-foreground flex items-center gap-1 text-xs">
        <Loader2 className="size-3 animate-spin" /> Menyimpan...
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="text-success flex items-center gap-1 text-xs">
        <Check className="size-3" /> Tersimpan
      </span>
    );
  }
  if (status === "error") {
    return (
      <Button
        type="button"
        size="xs"
        variant="outline"
        className="border-destructive-border text-destructive-strong"
        onClick={onRetry}
      >
        Gagal menyimpan, coba lagi
      </Button>
    );
  }
  return null;
}

export default function StudentExamAttemptPage() {
  const { id: examId } = useParams<{ id: string }>();
  const router = useRouter();
  const resultUrl = `/dashboard/student/exam/${examId}/result`;

  const sessionQuery = useGetExamSession(examId);
  const rawSession = sessionQuery.data;
  const session = rawSession && !isExamApiError(rawSession) ? rawSession : null;
  const attemptId = session?.attempt?.id ?? "";
  const attemptStatus = session?.attempt?.status ?? null;
  const maxScore = session?.maxScore ?? 0;
  const questions = useMemo<ExamQuestionItemDTO[]>(
    () => session?.questions ?? [],
    [session],
  );

  const saveAnswer = useSaveAnswer();
  const submitExam = useSubmitExam();

  const [answers, setAnswers] = useState<Record<string, ExamAnswerValue>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expired, setExpired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);

  const timersRef = useRef<Record<string, number>>({});
  const dirtyRef = useRef<Record<string, SaveAnswerPayload>>({});
  const inflightRef = useRef<Record<string, Promise<unknown>>>({});
  const knownRef = useRef<Record<string, ExamAnswerValue>>({});
  const initializedRef = useRef(false);
  const submitOnceRef = useRef(false);
  const saveRef = useRef(saveAnswer.mutateAsync);
  const submitRef = useRef(submitExam.mutateAsync);

  useEffect(() => {
    saveRef.current = saveAnswer.mutateAsync;
    submitRef.current = submitExam.mutateAsync;
  }, [saveAnswer.mutateAsync, submitExam.mutateAsync]);

  // Muat jawaban tersimpan sekali, agar jawaban tetap ada setelah reload.
  useEffect(() => {
    if (!session || initializedRef.current) return;
    const initial: Record<string, ExamAnswerValue> = {};
    for (const answer of session.answers) {
      initial[answer.questionId] = {
        selectedOptionId: answer.selectedOptionId,
        answerText: answer.answerText,
      };
    }
    setAnswers(initial);
    knownRef.current = { ...initial };
    initializedRef.current = true;
  }, [session]);

  const persist = useCallback((payload: SaveAnswerPayload) => {
    knownRef.current[payload.questionId] = {
      selectedOptionId: payload.selectedOptionId ?? null,
      answerText: payload.answerText ?? null,
    };
    const promise = saveRef
      .current(payload)
      .then(
        (response) => {
          setSaveStatus((prev) => ({
            ...prev,
            [payload.questionId]: isExamApiError(response) ? "error" : "saved",
          }));
        },
        () => {
          setSaveStatus((prev) => ({
            ...prev,
            [payload.questionId]: "error",
          }));
        },
      )
      .finally(() => {
        delete inflightRef.current[payload.questionId];
      });

    inflightRef.current[payload.questionId] = promise;
    return promise;
  }, []);

  /** Simpan dengan debounce ±600ms per soal; navigasi tidak pernah ditahan. */
  const scheduleSave = useCallback(
    (payload: SaveAnswerPayload) => {
      const questionId = payload.questionId;

      // Jawaban kosong tetap dikirim agar server menghapus jawaban tersimpan;
      // request dilewati hanya bila jawaban memang sudah kosong sejak awal.
      const known = knownRef.current[questionId];
      const wasEmpty =
        !known || (!known.selectedOptionId && !known.answerText?.trim());
      if (
        wasEmpty &&
        !payload.selectedOptionId &&
        !payload.answerText?.trim()
      ) {
        window.clearTimeout(timersRef.current[questionId]);
        delete timersRef.current[questionId];
        delete dirtyRef.current[questionId];
        setSaveStatus((prev) => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
        return;
      }

      dirtyRef.current[questionId] = payload;
      setSaveStatus((prev) => ({ ...prev, [questionId]: "saving" }));

      window.clearTimeout(timersRef.current[questionId]);
      timersRef.current[questionId] = window.setTimeout(() => {
        delete timersRef.current[questionId];
        const queued = dirtyRef.current[questionId];
        if (!queued) return;
        delete dirtyRef.current[questionId];
        void persist(queued);
      }, AUTOSAVE_DELAY_MS);
    },
    [persist],
  );

  const flushPending = useCallback(async () => {
    for (const timer of Object.values(timersRef.current)) window.clearTimeout(timer);
    timersRef.current = {};
    const queued = Object.values(dirtyRef.current);
    dirtyRef.current = {};
    await Promise.allSettled(queued.map((payload) => persist(payload)));
    await Promise.allSettled(Object.values(inflightRef.current));
  }, [persist]);

  // Saat meninggalkan halaman, kirim jawaban yang masih tertahan tanpa menahan navigasi.
  useEffect(() => {
    return () => {
      for (const timer of Object.values(timersRef.current)) window.clearTimeout(timer);
      timersRef.current = {};
      for (const payload of Object.values(dirtyRef.current)) void persist(payload);
      dirtyRef.current = {};
    };
  }, [persist]);

  const submit = useCallback(
    async (auto: boolean) => {
      if (submitOnceRef.current) return;
      submitOnceRef.current = true;
      setIsSubmitting(true);
      if (auto) setExpired(true);

      await flushPending();

      try {
        const response = await submitRef.current({ examId, attemptId });
        if (isExamApiError(response)) {
          submitOnceRef.current = false;
          setIsSubmitting(false);
          toast.error(response.message);
          return;
        }
        toast.success(
          auto
            ? "Waktu habis. Ujian dikumpulkan."
            : "Ujian berhasil dikumpulkan.",
        );
        router.replace(resultUrl);
      } catch {
        submitOnceRef.current = false;
        setIsSubmitting(false);
        toast.error("Gagal mengumpulkan ujian. Silakan coba lagi.");
      }
    },
    [attemptId, examId, flushPending, resultUrl, router],
  );

  // Attempt yang sudah dikumpulkan/dinilai tidak boleh dibuka lagi di halaman ini.
  useEffect(() => {
    if (attemptStatus && attemptStatus !== "IN_PROGRESS") {
      router.replace(resultUrl);
    }
  }, [attemptStatus, resultUrl, router]);

  // Setelah submit, endpoint sesi mengembalikan 404 (tidak ada attempt berjalan),
  // sehingga status attempt tidak lagi tersedia dari sesi. Pakai daftar ujian siswa
  // agar halaman ini tetap mengarah ke halaman hasil (termasuk saat di-reload).
  const submittedAttempt = useGetStudentExams().data?.find(
    (exam) => exam.id === examId,
  )?.myAttempt;
  useEffect(() => {
    if (
      sessionQuery.isSuccess &&
      !session &&
      submittedAttempt &&
      submittedAttempt.status !== "IN_PROGRESS"
    ) {
      router.replace(resultUrl);
    }
  }, [sessionQuery.isSuccess, session, submittedAttempt, resultUrl, router]);

  const handleSelectOption = useCallback(
    (questionId: string, optionId: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { selectedOptionId: optionId, answerText: null },
      }));
      scheduleSave({
        examId,
        attemptId,
        questionId,
        selectedOptionId: optionId,
        answerText: null,
      });
    },
    [attemptId, examId, scheduleSave],
  );

  const handleChangeText = useCallback(
    (questionId: string, text: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: { selectedOptionId: null, answerText: text },
      }));
      scheduleSave({ examId, attemptId, questionId, answerText: text });
    },
    [attemptId, examId, scheduleSave],
  );

  const answeredIds = useMemo(
    () =>
      questions
        .filter((item) => {
          const answer = answers[item.question.id];
          return Boolean(
            answer && (answer.selectedOptionId || answer.answerText?.trim()),
          );
        })
        .map((item) => item.question.id),
    [answers, questions],
  );

  const currentQuestion = questions[currentIndex];
  const currentValue: ExamAnswerValue = currentQuestion
    ? (answers[currentQuestion.question.id] ?? {
        selectedOptionId: null,
        answerText: null,
      })
    : { selectedOptionId: null, answerText: null };

  const retryCurrentSave = () => {
    if (!currentQuestion) return;
    void persist({
      examId,
      attemptId,
      questionId: currentQuestion.question.id,
      selectedOptionId: currentValue.selectedOptionId,
      answerText: currentValue.answerText,
    });
  };

  if (sessionQuery.isLoading) {
    return (
      <div className="max-w-8xl">
        <div className="mb-6 text-3xl font-bold">Mengerjakan Ujian</div>
        <ExamStateSkeleton cards={2} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-8xl">
        <div className="mb-6 text-3xl font-bold">Mengerjakan Ujian</div>
        <ExamStateUnavailable
          message={examErrorMessage(
            rawSession,
            "Ujian tidak tersedia atau tidak dapat diakses",
          )}
          onRetry={() => void sessionQuery.refetch()}
        />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-8xl">
        <div className="mb-6 text-3xl font-bold">{session.exam.title}</div>
        <ExamStateUnavailable message="Ujian ini belum memiliki soal" />
      </div>
    );
  }

  return (
    <div className="max-w-8xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{session.exam.title}</h1>
        <p className="text-muted-foreground text-sm">
          {session.exam.subjectName ?? "Tanpa mata pelajaran"} ·{" "}
          {session.exam.className ?? "Tanpa kelas"} · {questions.length} soal ·
          total {maxScore} poin
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">
                Soal {currentIndex + 1} dari {questions.length}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {QUESTION_TYPE_LABELS[currentQuestion.question.type] ??
                    currentQuestion.question.type}
                </Badge>
                <Badge variant="secondary">
                  {currentQuestion.points} poin
                </Badge>
                <SaveIndicator
                  status={saveStatus[currentQuestion.question.id]}
                  onRetry={retryCurrentSave}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium whitespace-pre-wrap">
              {currentQuestion.question.question}
            </p>

            {currentQuestion.question.imageUrl && (
              <ExamQuestionImage
                src={currentQuestion.question.imageUrl}
                alt={`Gambar soal ${currentIndex + 1}`}
              />
            )}

            <ExamAnswerInput
              question={currentQuestion}
              value={currentValue}
              disabled={expired}
              onSelectOption={(optionId) =>
                handleSelectOption(currentQuestion.question.id, optionId)
              }
              onChangeText={(text) =>
                handleChangeText(currentQuestion.question.id, text)
              }
            />

            {expired && (
              <p className="text-destructive-strong text-sm">
                Waktu habis. Jawaban tidak dapat diubah lagi.
              </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
              >
                <ChevronLeft /> Sebelumnya
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={currentIndex >= questions.length - 1}
                onClick={() =>
                  setCurrentIndex((index) =>
                    Math.min(questions.length - 1, index + 1),
                  )
                }
              >
                Berikutnya <ChevronRight />
              </Button>
            </div>
          </CardContent>
        </Card>

        <aside className="order-first space-y-4 lg:order-none lg:sticky lg:top-4 lg:self-start">
          <ExamTimer
            initialSeconds={session.remainingSeconds}
            onExpire={() => void submit(true)}
          />

          <ExamQuestionNav
            questions={questions}
            currentIndex={currentIndex}
            answeredIds={answeredIds}
            onSelect={setCurrentIndex}
            disabled={expired}
          />

          <AlertDialog
            open={submitConfirmOpen}
            onOpenChange={setSubmitConfirmOpen}
          >
            <Button
              className="w-full"
              disabled={isSubmitting}
              onClick={() => setSubmitConfirmOpen(true)}
            >
              {isSubmitting ? "Mengumpulkan..." : "Kumpulkan Ujian"}
            </Button>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Kumpulkan ujian sekarang?</AlertDialogTitle>
                <AlertDialogDescription>
                  {questions.length - answeredIds.length > 0
                    ? `Masih ada ${questions.length - answeredIds.length} soal yang belum dijawab. `
                    : ""}
                  Jawaban tidak dapat diubah setelah ujian dikumpulkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void submit(false)}
                  disabled={isSubmitting}
                >
                  Kumpulkan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </aside>
      </div>
    </div>
  );
}
