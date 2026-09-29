import {
  developmentError,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { assessmentErrorResponse } from "@/lib/development/assessment.service";
import { getDevelopmentMe } from "@/lib/development/parent-portal.service";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET /api/development/me
 *
 * Ringkasan portal untuk aktor yang sedang login. **Identitas selalu dari
 * sesi** — endpoint ini tidak menerima `studentId`/`parentId`/`foundationId`
 * dari klien, jadi tidak ada cara menimpanya dari luar. Orang tua menerima
 * anak-anaknya (`UserData.studentIds`), siswa menerima dirinya sendiri; semua
 * query tersaring `foundationId` aktor dan tiap bagian memakai jalur yang sudah
 * menegakkan aturan visibilitas (`parentVisible`, rapor `PUBLISHED`).
 */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  if (!actor.isParent && !actor.isStudent) {
    return developmentError(
      "Halaman ini hanya untuk orang tua dan siswa",
      403,
    );
  }

  try {
    const data = await getDevelopmentMe(actor);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return assessmentErrorResponse(error);
  }
}
