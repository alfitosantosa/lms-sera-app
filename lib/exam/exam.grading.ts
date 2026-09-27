import type { QuestionTypes } from "@/app/(types)/types/exam-types";

export type GradableQuestion = {
  questionId: string;
  type: QuestionTypes;
  /** Bobot soal di dalam ujian (ExamQuestion.points) — sumber kebenaran skor. */
  points: number;
  /** id opsi yang benar; null untuk essay/tidak ada kunci. */
  correctOptionId: string | null;
};

export type GradableAnswer = {
  questionId: string;
  selectedOptionId: string | null;
  answerText: string | null;
};

export type GradedAnswer = {
  questionId: string;
  isCorrect: boolean | null;
  points: number | null;
};

export type GradingResult = {
  graded: GradedAnswer[];
  totalScore: number;
  maxScore: number;
  /** True bila ada soal essay yang sudah dijawab dan menunggu penilaian manual. */
  needsManualGrading: boolean;
};

/**
 * Auto-grading pilihan ganda & benar/salah. Essay tidak dinilai otomatis
 * (`isCorrect`/`points` = null) dan menandai attempt butuh penilaian manual.
 * Hanya jawaban yang sudah tersimpan yang dinilai; soal kosong = 0 poin.
 */
export function gradeAttempt(
  questions: GradableQuestion[],
  answers: GradableAnswer[],
): GradingResult {
  const answerByQuestionId: Record<string, GradableAnswer> = {};
  for (const answer of answers) {
    answerByQuestionId[answer.questionId] = answer;
  }

  const graded: GradedAnswer[] = [];
  let totalScore = 0;
  let maxScore = 0;
  let needsManualGrading = false;

  for (const question of questions) {
    maxScore += question.points;
    const answer = answerByQuestionId[question.questionId];
    if (!answer) continue;

    if (question.type === "ESSAY") {
      if (answer.answerText?.trim()) needsManualGrading = true;
      graded.push({ questionId: question.questionId, isCorrect: null, points: null });
      continue;
    }

    const isCorrect =
      Boolean(question.correctOptionId) &&
      answer.selectedOptionId === question.correctOptionId;
    const points = isCorrect ? question.points : 0;
    totalScore += points;
    graded.push({ questionId: question.questionId, isCorrect, points });
  }

  return { graded, totalScore, maxScore, needsManualGrading };
}

/** Persentase skor (0-100). maxScore 0 -> 0. */
export function toPercentage(score: number | null, maxScore: number): number {
  if (score === null || maxScore <= 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/**
 * Status lulus. `null` bila belum ada skor atau passingScore tidak diset
 * atau masih menunggu penilaian essay.
 */
export function isPassed(
  score: number | null,
  maxScore: number,
  passingScore: number | null,
  needsManualGrading = false,
): boolean | null {
  if (score === null || passingScore === null || needsManualGrading) return null;
  return toPercentage(score, maxScore) >= passingScore;
}
