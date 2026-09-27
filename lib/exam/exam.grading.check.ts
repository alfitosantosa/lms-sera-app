import assert from "node:assert/strict";
import {
  gradeAttempt,
  isPassed,
  toPercentage,
  type GradableQuestion,
} from "./exam.grading";

// Jalankan: bun run lib/exam/exam.grading.check.ts

const questions: GradableQuestion[] = [
  { questionId: "q1", type: "MULTIPLE_CHOICE", points: 5, correctOptionId: "o1b" },
  { questionId: "q2", type: "TRUE_FALSE", points: 5, correctOptionId: "o2a" },
  { questionId: "q3", type: "MULTIPLE_CHOICE", points: 10, correctOptionId: "o3a" },
  { questionId: "q4", type: "ESSAY", points: 10, correctOptionId: null },
];

const result = gradeAttempt(questions, [
  { questionId: "q1", selectedOptionId: "o1b", answerText: null }, // benar 5
  { questionId: "q2", selectedOptionId: "o2b", answerText: null }, // salah 0
  { questionId: "q3", selectedOptionId: "o3a", answerText: null }, // benar 10
  // q4 tidak dijawab -> tidak dinilai, bukan manual
]);

assert.equal(result.maxScore, 30, "maxScore = jumlah bobot semua soal ujian");
assert.equal(result.totalScore, 15, "hanya pilihan ganda/benar-salah yang dihitung");
assert.equal(result.needsManualGrading, false, "essay tanpa jawaban tidak minta koreksi");
assert.equal(result.graded.length, 3, "soal tanpa jawaban diskip");
assert.deepEqual(
  result.graded.map((g) => [g.questionId, g.isCorrect, g.points]),
  [
    ["q1", true, 5],
    ["q2", false, 0],
    ["q3", true, 10],
  ],
);

const withEssay = gradeAttempt(questions, [
  { questionId: "q4", selectedOptionId: null, answerText: "  jawaban essay  " },
]);
assert.equal(withEssay.needsManualGrading, true, "essay terjawab menunggu koreksi");
assert.equal(withEssay.totalScore, 0, "essay tidak menambah skor otomatis");
assert.deepEqual(withEssay.graded, [{ questionId: "q4", isCorrect: null, points: null }]);

const empty = gradeAttempt(questions, []);
assert.equal(empty.totalScore, 0);
assert.equal(empty.maxScore, 30);
assert.equal(empty.graded.length, 0);

// selectedOptionId tanpa kunci (data rusak) tidak dianggap benar
const noKey = gradeAttempt(
  [{ questionId: "q9", type: "MULTIPLE_CHOICE", points: 3, correctOptionId: null }],
  [{ questionId: "q9", selectedOptionId: "o9a", answerText: null }],
);
assert.equal(noKey.totalScore, 0, "tanpa kunci jawaban tidak ada poin");

assert.equal(toPercentage(15, 20), 75);
assert.equal(toPercentage(null, 20), 0, "belum ada skor -> 0%");
assert.equal(toPercentage(5, 0), 0, "maxScore 0 tidak boleh divide by zero");
assert.equal(isPassed(15, 20, 75), true, "75% lulus di ambang 75");
assert.equal(isPassed(14, 20, 75), false, "70% tidak lulus");
assert.equal(isPassed(15, 20, null), null, "passingScore kosong -> belum bisa dinilai");
assert.equal(isPassed(null, 20, 75), null, "skor kosong -> belum bisa dinilai");
assert.equal(isPassed(15, 20, 75, true), null, "essay menunggu koreksi -> belum lulus");

console.log("exam.grading self-check: OK");
