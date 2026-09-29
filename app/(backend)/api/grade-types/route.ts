import { gradeTypeInputSchema } from "@/app/(types)";
import {
  ADMIN_ROLE_NAMES,
  developmentError,
  requireStaff,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * `GradeType` global (tanpa `foundationId`, dipakai bersama
 * `GradeConfiguration`). Kode unik diturunkan dari nama; bila bentrok diberi
 * sufiks angka.
 */
async function uniqueGradeTypeCode(name: string): Promise<string> {
  const base =
    name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "TIPE";

  let code = base;
  for (let suffix = 2; suffix <= 100; suffix += 1) {
    const taken = await prisma.gradeType.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!taken) return code;
    code = `${base}-${suffix}`;
  }
  return `${base}-${Date.now().toString(36).toUpperCase()}`;
}

/**
 * GET /api/grade-types
 * Daftar jenis penilaian aktif. **Tidak** melakukan seed: seeding default
 * "Tugas" hanya lewat `POST /api/grade-types/bootstrap` (eksplisit), supaya
 * GET tidak pernah menulis ke tabel global `grade_types`.
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  try {
    const data = await prisma.gradeType.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** POST /api/grade-types — hanya admin: `GradeType` global untuk semua yayasan. */
export async function POST(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const denied = requireStaff(actor);
  if (denied) return denied;

  if (ADMIN_ROLE_NAMES[actor.roleName] !== true) {
    return developmentError(
      "Hanya admin yang dapat menambah jenis penilaian",
      403,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return developmentError("Body request tidak valid", 400);
  }

  const parsed = gradeTypeInputSchema.safeParse(body);
  if (!parsed.success) {
    return developmentError(parsed.error.issues[0].message, 400);
  }

  try {
    const data = await prisma.gradeType.create({
      data: {
        ...parsed.data,
        description: parsed.data.description ?? null,
        code: await uniqueGradeTypeCode(parsed.data.name),
      },
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
