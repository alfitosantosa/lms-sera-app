import { assignmentSubmissionInputSchema } from "@/app/(types)";
import {
  assignmentErrorResponse,
  createSubmission,
  listSubmissions,
} from "@/lib/development/assignment.service";
import {
  developmentError,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/assignments/[id]/submission
 * Staf pengajar kelas melihat semua pengumpulan; siswa hanya miliknya.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  try {
    const data = await listSubmissions(actor, id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return assignmentErrorResponse(error);
  }
}

/**
 * POST /api/assignments/[id]/submission — siswa mengirim tugasnya sendiri.
 * Hanya tugas terbit di kelasnya, dan tidak lewat tenggat kecuali
 * `allowLateSubmission`. Duplikat → 409.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return developmentError("Body request tidak valid", 400);
  }

  const parsed = assignmentSubmissionInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const submission = await createSubmission(actor, id, parsed.data);
    return NextResponse.json(
      { success: true, data: submission },
      { status: 201 },
    );
  } catch (error) {
    return assignmentErrorResponse(error);
  }
}
