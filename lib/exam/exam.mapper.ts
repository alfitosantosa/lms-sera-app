import type {
  AttemptStatusTypes,
  ExamAttemptSummaryDTO,
  ExamDetailDTO,
  ExamListItemDTO,
  ExamQuestionItemDTO,
  ExamQuestionOptionDTO,
  ExamStatusTypes,
  QuestionTypes,
  StudentExamAnswerDTO,
  StudentExamResultAnswerDTO,
  StudentExamResultDTO,
  StudentExamSessionDTO,
} from "@/app/(types)/types/exam-types";
import { isPassed, toPercentage } from "./exam.grading";

// ---------------------------------------------------------------------------
// Bentuk baris Prisma yang dibutuhkan mapper (struktural, bukan tipe generated
// supaya route bisa memakai `select` seminimal mungkin).
// ---------------------------------------------------------------------------

export type RawQuestionOption = {
  id: string;
  option: string;
  text: string;
  isCorrect: boolean;
};

export type RawQuestion = {
  id: string;
  type: QuestionTypes;
  question: string;
  imageUrl: string | null;
  points: number;
  options: RawQuestionOption[];
};

export type RawExamQuestion = {
  id: string;
  order: number;
  points: number;
  question: RawQuestion;
};

export type RawExamRow = {
  id: string;
  title: string;
  description: string | null;
  status: ExamStatusTypes;
  duration: number | null;
  passingScore: number | null;
  startAt: Date | null;
  endAt: Date | null;
  createdAt: Date;
  classId: string | null;
  subjectId: string | null;
  /** Proyeksi ringan untuk list; detail route boleh mengirim baris penuh. */
  questions: { points: number }[];
  _count?: { attempts: number };
};

export type RawAttemptRow = {
  id: string;
  examId: string;
  attemptNumber: number;
  status: AttemptStatusTypes;
  score: number | null;
  startedAt: Date;
  submittedAt: Date | null;
};

export type RawAnswerRow = {
  questionId: string;
  selectedOptionId: string | null;
  answerText: string | null;
  isCorrect?: boolean | null;
  points?: number | null;
};

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

const CODE_AS_LABEL: Record<string, true> = { True: true, False: true };

/** Label opsi siap tampil: "A. Jakarta" untuk pilihan ganda, "Benar" untuk B/S. */
function optionLabel(option: RawQuestionOption | undefined): string | null {
  if (!option) return null;
  return CODE_AS_LABEL[option.option] ? option.text : `${option.option}. ${option.text}`;
}

/** `hideAnswers` = true untuk siswa: kunci jawaban tidak pernah dikirim. */
export function toExamQuestionItem(
  row: RawExamQuestion,
  hideAnswers = false,
): ExamQuestionItemDTO {
  return {
    examQuestionId: row.id,
    order: row.order,
    points: row.points,
    question: {
      id: row.question.id,
      type: row.question.type,
      question: row.question.question,
      imageUrl: row.question.imageUrl,
      points: row.question.points,
      options: row.question.options.map((option): ExamQuestionOptionDTO =>
        hideAnswers
          ? { id: option.id, option: option.option, text: option.text }
          : {
              id: option.id,
              option: option.option,
              text: option.text,
              isCorrect: option.isCorrect,
            },
      ),
    },
  };
}

export function toExamListDTO(params: {
  exam: RawExamRow;
  className: string | null;
  subjectName: string | null;
  myAttempt?: ExamAttemptSummaryDTO | null;
}): ExamListItemDTO {
  const { exam } = params;
  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    status: exam.status,
    duration: exam.duration,
    passingScore: exam.passingScore,
    startAt: exam.startAt ? exam.startAt.toISOString() : null,
    endAt: exam.endAt ? exam.endAt.toISOString() : null,
    createdAt: exam.createdAt.toISOString(),
    classId: exam.classId,
    className: params.className,
    subjectId: exam.subjectId,
    subjectName: params.subjectName,
    questionCount: exam.questions.length,
    totalPoints: exam.questions.reduce((sum, q) => sum + q.points, 0),
    attemptCount: exam._count?.attempts ?? 0,
    ...(params.myAttempt === undefined ? {} : { myAttempt: params.myAttempt }),
  };
}

export function toExamDetailDTO(params: {
  exam: RawExamRow;
  questions: RawExamQuestion[];
  className: string | null;
  subjectName: string | null;
}): ExamDetailDTO {
  return {
    ...toExamListDTO({
      exam: params.exam,
      className: params.className,
      subjectName: params.subjectName,
    }),
    questions: params.questions.map((row) => toExamQuestionItem(row)),
  };
}

export function toAttemptSummary(
  attempt: RawAttemptRow,
  maxScore: number,
  passingScore: number | null,
  needsManualGrading = false,
): ExamAttemptSummaryDTO {
  return {
    id: attempt.id,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    score: attempt.score,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
    passed: isPassed(attempt.score, maxScore, passingScore, needsManualGrading),
  };
}

/** Sesi mengerjakan ujian untuk siswa (tanpa kunci jawaban). */
export function toStudentSessionDTO(params: {
  attempt: RawAttemptRow;
  exam: {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    passingScore: number | null;
    endAt: Date | null;
    className: string | null;
    subjectName: string | null;
  };
  questions: RawExamQuestion[];
  answers: RawAnswerRow[];
  remainingSeconds: number | null;
}): StudentExamSessionDTO {
  const answers: StudentExamAnswerDTO[] = params.answers.map((answer) => ({
    questionId: answer.questionId,
    selectedOptionId: answer.selectedOptionId,
    answerText: answer.answerText,
  }));

  return {
    attempt: {
      id: params.attempt.id,
      examId: params.attempt.examId,
      attemptNumber: params.attempt.attemptNumber,
      status: params.attempt.status,
      startedAt: params.attempt.startedAt.toISOString(),
      submittedAt: params.attempt.submittedAt
        ? params.attempt.submittedAt.toISOString()
        : null,
      score: params.attempt.score,
    },
    exam: {
      id: params.exam.id,
      title: params.exam.title,
      description: params.exam.description,
      duration: params.exam.duration,
      passingScore: params.exam.passingScore,
      endAt: params.exam.endAt ? params.exam.endAt.toISOString() : null,
      className: params.exam.className,
      subjectName: params.exam.subjectName,
    },
    maxScore: params.questions.reduce((sum, q) => sum + q.points, 0),
    questions: params.questions.map((row) => toExamQuestionItem(row, true)),
    answers,
    remainingSeconds: params.remainingSeconds,
  };
}

/** Hasil ujian siswa, termasuk pembahasan (kunci) setelah submit. */
export function toStudentResultDTO(params: {
  attempt: RawAttemptRow;
  exam: { title: string; passingScore: number | null };
  questions: RawExamQuestion[];
  answers: RawAnswerRow[];
  needsManualGrading: boolean;
}): StudentExamResultDTO {
  const answerByQuestionId: Record<string, RawAnswerRow> = {};
  for (const answer of params.answers) {
    answerByQuestionId[answer.questionId] = answer;
  }

  const maxScore = params.questions.reduce((sum, q) => sum + q.points, 0);

  const answers: StudentExamResultAnswerDTO[] = params.questions.map((row) => {
    const answer = answerByQuestionId[row.question.id];
    const correctOption = row.question.options.find((o) => o.isCorrect);
    const selectedOption = row.question.options.find(
      (o) => o.id === answer?.selectedOptionId,
    );
    return {
      questionId: row.question.id,
      order: row.order,
      type: row.question.type,
      question: row.question.question,
      imageUrl: row.question.imageUrl,
      points: row.points,
      earnedPoints: answer?.points ?? null,
      isCorrect: answer?.isCorrect ?? null,
      selectedOptionId: answer?.selectedOptionId ?? null,
      correctOptionId: correctOption ? correctOption.id : null,
      selectedOptionLabel: optionLabel(selectedOption),
      correctOptionLabel: optionLabel(correctOption),
      answerText: answer?.answerText ?? null,
    };
  });

  return {
    attemptId: params.attempt.id,
    examId: params.attempt.examId,
    examTitle: params.exam.title,
    status: params.attempt.status,
    attemptNumber: params.attempt.attemptNumber,
    score: params.attempt.score,
    maxScore,
    percentage: toPercentage(params.attempt.score, maxScore),
    passingScore: params.exam.passingScore,
    passed: isPassed(
      params.attempt.score,
      maxScore,
      params.exam.passingScore,
      params.needsManualGrading,
    ),
    needsManualGrading: params.needsManualGrading,
    submittedAt: params.attempt.submittedAt
      ? params.attempt.submittedAt.toISOString()
      : null,
    answers,
  };
}
