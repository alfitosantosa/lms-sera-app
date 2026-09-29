import {
  developmentError,
  resolveDevelopmentActor,
} from "@/lib/development/development.guard";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { createPaginationResponse, getPaginationQuery } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Notifikasi in-app untuk aktor yang sedang login.
 *
 * Identitas **selalu** dari sesi: `Notification.userId` adalah `UserData.id`
 * aktor, tidak pernah dari parameter klien — jadi tidak ada cara membaca atau
 * menandai notifikasi milik orang lain.
 */

/** GET /api/notifications?isRead=&page=&limit= — hanya milik aktor. */
export async function GET(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  const { page, limit, skip } = getPaginationQuery(request);
  const userId = actor.userDataId;
  if (!userId) {
    return NextResponse.json({
      success: true,
      unreadCount: 0,
      ...createPaginationResponse([], 0, page, limit),
    });
  }

  const isReadParam = new URL(request.url).searchParams.get("isRead");
  const isRead =
    isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;
  const where = { userId, ...(isRead === undefined ? {} : { isRead }) };

  try {
    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      unreadCount,
      ...createPaginationResponse(data, total, page, limit),
    });
  } catch (error) {
    return handlePrismaError(error);
  }
}

/** PATCH /api/notifications — tandai satu notifikasi milik aktor sebagai dibaca. */
export async function PATCH(request: NextRequest) {
  const actorResult = await resolveDevelopmentActor(request);
  if (!actorResult.ok) return actorResult.response;
  const { actor } = actorResult;

  if (!actor.userDataId) {
    return developmentError("Akun belum terhubung ke data pengguna", 404);
  }

  const body = (await request.json().catch(() => null)) as {
    id?: string;
  } | null;
  const id = body?.id?.trim();
  if (!id) return developmentError("id notifikasi wajib diisi", 400);

  try {
    // `userId` di klausa where (bukan hanya di body) yang membuat penandaan
    // notifikasi milik orang lain mustahil — bukan sekadar 403.
    const { count } = await prisma.notification.updateMany({
      where: { id, userId: actor.userDataId },
      data: { isRead: true, readAt: new Date() },
    });
    if (count === 0) return developmentError("Notifikasi tidak ditemukan", 404);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaError(error);
  }
}
