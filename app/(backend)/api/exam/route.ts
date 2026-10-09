import { examInputSchema, examStatusSchema } from "@/app/(types)/types/exam-types";
import {
  examError,
  requireStaff,
  requireStudent,
  resolveExamActor,
} from "@/lib/exam/exam.guard";
import {
  toAttemptSummary,
  toExamDetailDTO,
  toExamListDTO,
} from "@/lib/exam/exam.mapper";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { resolveClassNames, resolveSubjectNames } from "./examService";

const EXAM_LIST_SELECT = {
  id: true,
  title: true,
  description: true,
  status: true,
  duration: true,
  passingScore: true,
  startAt: true,
  endAt: true,
  createdAt: true,
  classId: true,
  subjectId: true,
  questions: { select: { points: true } },
  _count: { select: { attempts: true } },
} as const;

const MY_ATTEMPT_SELECT = {
  id: true,
  examId: true,
  attemptNumber: true,
  status: true,
  score: true,
  startedAt: true,
  submittedAt: true,
} as const;

/**
 * GET /api/exam — daftar ujian yayasan (staff).
 * GET /api/exam?scope=student — ujian kelas siswa + attempt miliknya.
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveExamActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const scope = request.nextUrl.searchParams.get("scope");

  try {
    if (scope === "student") {
      const denied = requireStudent(actor);
      if (denied) return denied;
      if (!actor.userDataId) {
        return examError("Akun belum terhubung ke data sekolah", 403);
      }
      const studentId = actor.userDataId;

      const userData = await prisma.userData.findUnique({
        where: { id: studentId },
        select: { classId: true },
      });
      if (!userData?.classId) return NextResponse.json([]);

      const exams = await prisma.exam.findMany({
        where: {
          foundationId: actor.foundationId,
          status: "PUBLISHED",
          classId: userData.classId,
        },
        select: {
          ...EXAM_LIST_SELECT,
          attempts: {
            where: { studentId },
            orderBy: { attemptNumber: "desc" },
            take: 1,
            select: MY_ATTEMPT_SELECT,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const classNames = await resolveClassNames(
        exams.map((exam) => exam.classId),
        actor.foundationId,
      );
      const subjectNames = await resolveSubjectNames(
        exams.map((exam) => exam.subjectId),
        actor.foundationId,
      );

      return NextResponse.json(
        exams.map((exam) => {
          const attempt = exam.attempts[0];
          const maxScore = exam.questions.reduce((sum, q) => sum + q.points, 0);
          return toExamListDTO({
            exam,
            className: exam.classId ? (classNames[exam.classId] ?? null) : null,
            subjectName: exam.subjectId
              ? (subjectNames[exam.subjectId] ?? null)
              : null,
            myAttempt: attempt
              ? toAttemptSummary(attempt, maxScore, exam.passingScore)
              : null,
          });
        }),
      );
    }

    const denied = requireStaff(actor);
    if (denied) return denied;

    const statusParam = request.nextUrl.searchParams.get("status");
    const classId = request.nextUrl.searchParams.get("classId");
    const subjectId = request.nextUrl.searchParams.get("subjectId");

    let status: "DRAFT" | "PUBLISHED" | "CLOSED" | undefined;
    if (statusParam) {
      const parsed = examStatusSchema.safeParse(statusParam);
      if (!parsed.success) return examError("Status ujian tidak valid", 400);
      status = parsed.data;
    }

    const exams = await prisma.exam.findMany({
      where: {
        foundationId: actor.foundationId,
        ...(status ? { status } : {}),
        ...(classId ? { classId } : {}),
        ...(subjectId ? { subjectId } : {}),
      },
      select: EXAM_LIST_SELECT,
      orderBy: { createdAt: "desc" },
    });

    const classNames = await resolveClassNames(
      exams.map((exam) => exam.classId),
      actor.foundationId,
    );
    const subjectNames = await resolveSubjectNames(
      exams.map((exam) => exam.subjectId),
      actor.foundationId,
    );

    return NextResponse.json(
      exams.map((exam) =>
        toExamListDTO({
          exam,
          className: exam.classId ? (classNames[exam.classId] ?? null) : null,
          subjectName: exam.subjectId
            ? (subjectNames[exam.subjectId] ?? null)
            : null,
        }),
      ),
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** POST /api/exam — buat ujian baru (staff), selalu berstatus DRAFT. */
export async function POST(request: NextRequest) {
  const actorResult = await resolveExamActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;
  if (!actor.userDataId) {
    return examError("Akun belum terhubung ke data sekolah", 403);
  }
  const createdBy = actor.userDataId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return examError("Body request tidak valid", 400);
  }

  const parsed = examInputSchema.safeParse(body);
  if (!parsed.success) return examError(parsed.error.issues[0].message, 400);
  const payload = parsed.data;

  let startAt: Date | null = null;
  if (payload.startAt) {
    const parsedStart = new Date(payload.startAt);
    if (Number.isNaN(parsedStart.getTime())) {
      return examError("Tanggal mulai tidak valid", 400);
    }
    startAt = parsedStart;
  }

  let endAt: Date | null = null;
  if (payload.endAt) {
    const parsedEnd = new Date(payload.endAt);
    if (Number.isNaN(parsedEnd.getTime())) {
      return examError("Tanggal selesai tidak valid", 400);
    }
    endAt = parsedEnd;
  }

  if (startAt && endAt && endAt <= startAt) {
    return examError("Tanggal selesai harus setelah tanggal mulai", 400);
  }

  try {
    const [ownedClass, ownedSubject] = await Promise.all([
      prisma.class.findFirst({
        where: {
          id: payload.classId,
          branch: { foundationId: actor.foundationId },
        },
        select: { id: true, name: true },
      }),
      prisma.subject.findFirst({
        where: {
          id: payload.subjectId,
          OR: [{ branch: { foundationId: actor.foundationId } }, { branchId: null }],
        },
        select: { id: true, name: true },
      }),
    ]);

    if (!ownedClass || !ownedSubject) {
      return examError(
        "Kelas atau mata pelajaran tidak ditemukan di yayasan ini",
        403,
      );
    }

    const created = await prisma.exam.create({
      data: {
        foundationId: actor.foundationId,
        createdBy,
        title: payload.title,
        description: payload.description ?? null,
        classId: payload.classId,
        subjectId: payload.subjectId,
        majorId: payload.majorId ?? null,
        duration: payload.duration ?? null,
        passingScore: payload.passingScore ?? null,
        status: "DRAFT",
        startAt,
        endAt,
      },
    });

    return NextResponse.json(
      toExamDetailDTO({
        exam: { ...created, questions: [], _count: { attempts: 0 } },
        questions: [],
        className: ownedClass.name,
        subjectName: ownedSubject.name,
      }),
      { status: 201 },
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}
