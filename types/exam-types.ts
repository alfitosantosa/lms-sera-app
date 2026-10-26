import { z } from "zod";

// =====================================================
// ENUMS (mirror prisma enums)
// =====================================================

export const examStatusSchema = z.enum(["DRAFT", "PUBLISHED", "CLOSED"]);
export const questionTypeSchema = z.enum([
  "MULTIPLE_CHOICE",
  "TRUE_FALSE",
  "ESSAY",
]);
export const attemptStatusSchema = z.enum([
  "IN_PROGRESS",
  "SUBMITTED",
  "GRADED",
]);

export type ExamStatusTypes = z.infer<typeof examStatusSchema>;
export type QuestionTypes = z.infer<typeof questionTypeSchema>;
export type AttemptStatusTypes = z.infer<typeof attemptStatusSchema>;

/** Label Bahasa Indonesia untuk dropdown/select. */
export const QUESTION_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Pilihan Ganda",
  TRUE_FALSE: "Benar/Salah",
  ESSAY: "Essay",
};

export const EXAM_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Dipublikasikan",
  CLOSED: "Ditutup",
};

// =====================================================
// INPUT SCHEMAS (trust boundary — dipakai API route)
// =====================================================

export const questionOptionInputSchema = z.object({
  option: z.string().min(1, "Label opsi wajib diisi"),
  text: z.string().min(1, "Teks opsi wajib diisi"),
  isCorrect: z.boolean().default(false),
});

export const questionInputSchema = z
  .object({
    type: questionTypeSchema,
    question: z.string().min(1, "Pertanyaan wajib diisi"),
    imageUrl: z.url("URL gambar tidak valid").nullish(),
    // Nilai ini disalin ke ExamQuestion.points saat soal ditambahkan ke ujian.
    points: z.number().int().min(1, "Poin minimal 1").max(100).default(1),
    options: z.array(questionOptionInputSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.type === "ESSAY") {
      if (data.options.length > 0) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message: "Soal essay tidak boleh memiliki pilihan jawaban",
        });
      }
      return;
    }

    const minOptions = data.type === "TRUE_FALSE" ? 2 : 2;
    if (data.options.length < minOptions) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message:
          data.type === "TRUE_FALSE"
            ? "Soal benar/salah wajib memiliki opsi Benar dan Salah"
            : "Soal pilihan ganda minimal memiliki 2 opsi",
      });
    }

    const correctCount = data.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Harus ada tepat 1 jawaban benar",
      });
    }
  });

/** Payload create/update ujian. `duration` & `passingScore` divalidasi saat publish. */
export const examInputSchema = z.object({
  title: z.string().min(1, "Judul ujian wajib diisi"),
  description: z.string().nullish(),
  classId: z.string().min(1, "Kelas wajib dipilih"),
  subjectId: z.string().min(1, "Mata pelajaran wajib dipilih"),
  majorId: z.string().nullish(),
  duration: z.number().int().min(1, "Durasi minimal 1 menit").max(600).nullish(),
  passingScore: z.number().int().min(0).max(100).nullish(),
  startAt: z.string().nullish(),
  endAt: z.string().nullish(),
});

export const examUpdateSchema = examInputSchema.partial();

/**
 * Payload autosave jawaban. Kedua field kosong = hapus jawaban (clear).
 */
export const answerInputSchema = z.object({
  questionId: z.string().min(1, "questionId wajib diisi"),
  selectedOptionId: z.string().nullish(),
  answerText: z.string().nullish(),
});

export type ExamInputPayload = z.infer<typeof examInputSchema>;
export type ExamUpdatePayload = z.infer<typeof examUpdateSchema>;
export type QuestionInputPayload = z.infer<typeof questionInputSchema>;
export type AnswerInputPayload = z.infer<typeof answerInputSchema>;

// =====================================================
// DTOs (read model — dipakai hooks & komponen UI)
// =====================================================

export type ExamQuestionOptionDTO = {
  id: string;
  option: string;
  text: string;
  /** Hanya dikirim ke teacher; siswa tidak pernah menerima field ini. */
  isCorrect?: boolean;
};

export type ExamQuestionDTO = {
  id: string;
  type: QuestionTypes;
  question: string;
  imageUrl: string | null;
  points: number;
  options: ExamQuestionOptionDTO[];
};

/** Soal di dalam konteks sebuah ujian (order + bobot milik ujian). */
export type ExamQuestionItemDTO = {
  examQuestionId: string;
  order: number;
  points: number;
  question: ExamQuestionDTO;
};

/** Ringkasan attempt milik siswa untuk daftar ujian. */
export type ExamAttemptSummaryDTO = {
  id: string;
  attemptNumber: number;
  status: AttemptStatusTypes;
  score: number | null;
  submittedAt: string | null;
  startedAt: string;
  passed: boolean | null;
};

export type ExamListItemDTO = {
  id: string;
  title: string;
  description: string | null;
  status: ExamStatusTypes;
  duration: number | null;
  passingScore: number | null;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  classId: string | null;
  className: string | null;
  subjectId: string | null;
  subjectName: string | null;
  questionCount: number;
  totalPoints: number;
  attemptCount: number;
  /** Student: attempt miliknya sendiri. */
  myAttempt?: ExamAttemptSummaryDTO | null;
};

export type ExamDetailDTO = ExamListItemDTO & {
  questions: ExamQuestionItemDTO[];
};

/** Satu baris tabel hasil ujian untuk teacher. */
export type ExamResultRowDTO = {
  attemptId: string;
  studentId: string;
  studentName: string;
  nisn: string | null;
  className: string | null;
  status: AttemptStatusTypes;
  score: number | null;
  submittedAt: string | null;
  /** True bila masih ada jawaban essay yang menunggu koreksi guru. */
  needsManualGrading: boolean;
  passed: boolean | null;
};

export type ExamResultsDTO = {
  exam: {
    id: string;
    title: string;
    status: ExamStatusTypes;
    passingScore: number | null;
    maxScore: number;
  };
  /** Siswa di kelas ujian yang belum memiliki attempt (untuk menandai belum mengerjakan). */
  notAttempted: {
    studentId: string;
    studentName: string;
    nisn: string | null;
  }[];
  rows: ExamResultRowDTO[];
};

// ---------- Student session (take exam) ----------

export type StudentExamAnswerDTO = {
  questionId: string;
  selectedOptionId: string | null;
  answerText: string | null;
};

export type StudentExamSessionDTO = {
  attempt: {
    id: string;
    examId: string;
    attemptNumber: number;
    status: AttemptStatusTypes;
    startedAt: string;
    submittedAt: string | null;
    score: number | null;
  };
  exam: {
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    passingScore: number | null;
    endAt: string | null;
    className: string | null;
    subjectName: string | null;
  };
  maxScore: number;
  /** Soal tanpa kunci jawaban. */
  questions: ExamQuestionItemDTO[];
  answers: StudentExamAnswerDTO[];
  /** Sisa waktu dalam detik; null bila ujian tanpa durasi. */
  remainingSeconds: number | null;
};

export type StudentExamResultAnswerDTO = {
  questionId: string;
  order: number;
  type: QuestionTypes;
  question: string;
  imageUrl: string | null;
  points: number;
  earnedPoints: number | null;
  isCorrect: boolean | null;
  selectedOptionId: string | null;
  correctOptionId: string | null;
  /** Label siap tampil (mis. "A. Jakarta" / "Benar"); null bila tidak dijawab. */
  selectedOptionLabel: string | null;
  correctOptionLabel: string | null;
  answerText: string | null;
};

export type StudentExamResultDTO = {
  attemptId: string;
  examId: string;
  examTitle: string;
  status: AttemptStatusTypes;
  attemptNumber: number;
  score: number | null;
  maxScore: number;
  percentage: number;
  passingScore: number | null;
  passed: boolean | null;
  /** True bila masih ada soal essay yang belum dinilai manual. */
  needsManualGrading: boolean;
  submittedAt: string | null;
  answers: StudentExamResultAnswerDTO[];
};

export type SaveAnswerPayload = {
  examId: string;
  attemptId: string;
  questionId: string;
  selectedOptionId?: string | null;
  answerText?: string | null;
};
