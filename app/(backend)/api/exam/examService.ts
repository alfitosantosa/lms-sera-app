import type { ExamDetailDTO } from "@/app/(types)/types/exam-types";
import { toExamDetailDTO, toExamQuestionItem } from "@/lib/exam/exam.mapper";
import { prisma } from "@/lib/api/prisma";

/** Nama kelas milik yayasan, dibatch sekali query (hindari N+1 per baris). */
export async function resolveClassNames(
  ids: (string | null)[],
  foundationId: string,
): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return {};

  const rows = await prisma.class.findMany({
    where: { id: { in: unique }, branch: { foundationId } },
    select: { id: true, name: true },
  });
  return Object.fromEntries(rows.map((row) => [row.id, row.name]));
}

/** Nama mata pelajaran milik yayasan atau global (branchId null). */
export async function resolveSubjectNames(
  ids: (string | null)[],
  foundationId: string,
): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return {};

  const rows = await prisma.subject.findMany({
    where: {
      id: { in: unique },
      OR: [{ branch: { foundationId } }, { branchId: null }],
    },
    select: { id: true, name: true },
  });
  return Object.fromEntries(rows.map((row) => [row.id, row.name]));
}

/**
 * Detail ujian tenant-scoped. `hideAnswers` = true untuk siswa
 * (kunci jawaban tidak pernah ikut terkirim).
 */
export async function loadExamDetail(
  examId: string,
  foundationId: string,
  hideAnswers = false,
): Promise<ExamDetailDTO | null> {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, foundationId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { question: { include: { options: true } } },
      },
      _count: { select: { attempts: true } },
    },
  });
  if (!exam) return null;

  const [classNames, subjectNames] = await Promise.all([
    resolveClassNames([exam.classId], foundationId),
    resolveSubjectNames([exam.subjectId], foundationId),
  ]);

  const className = exam.classId ? (classNames[exam.classId] ?? null) : null;
  const subjectName = exam.subjectId
    ? (subjectNames[exam.subjectId] ?? null)
    : null;

  if (!hideAnswers) {
    return toExamDetailDTO({ exam, questions: exam.questions, className, subjectName });
  }

  return {
    ...toExamDetailDTO({ exam, questions: [], className, subjectName }),
    questions: exam.questions.map((row) => toExamQuestionItem(row, true)),
  };
}
