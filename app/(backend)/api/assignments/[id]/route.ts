import { assignmentUpdateSchema } from "@/app/(types)";
import {
  assertAssignmentVisible,
  assignmentErrorResponse,
  deleteAssignment,
  findAssignment,
  updateAssignment,
} from "@/lib/development/assignment.service";
import {
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/assignments/[id] — staf pengajar kelas, atau siswa kelas tsb. */
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  try {
    const assignment = await findAssignment(actor, id);
    await assertAssignmentVisible(actor, assignment);
    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    return assignmentErrorResponse(error);
  }
}

/** PATCH /api/assignments/[id] */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return developmentError("Body request tidak valid", 400);
  }

  const parsed = assignmentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const assignment = await updateAssignment(actor, id, parsed.data);
    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    return assignmentErrorResponse(error);
  }
}

/** DELETE /api/assignments/[id] — hapus lunak (`isActive: false`). */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const assignment = await deleteAssignment(actor, id);
    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    return assignmentErrorResponse(error);
  }
}
