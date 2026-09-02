"use server";
// app/api/clerk-users/route.ts
import { authClient } from "@/lib/authClients";
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { userId, role } = await request.json();
  try {
    await authClient.admin.setRole({
      userId: userId, // id dari database
      role: role,
    });
    return NextResponse.json({ message: "Role assigned successfully" }, { status: 200 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
