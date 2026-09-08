import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { userId, foundationCode } = await request.json();
  console.log(userId);
  console.log(foundationCode);

  const getFoundationId = await prisma.foundation.findFirst({
    where: {
      foundationCode: foundationCode,
    },
  });

  const foundationId = getFoundationId?.id;

  const AssignUserFoundation = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      foundationId: foundationId,
    },
  });
  return Response.json({ AssignUserFoundation });
}
