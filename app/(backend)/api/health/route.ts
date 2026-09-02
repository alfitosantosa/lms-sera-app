import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const getPrismaStatus = await prisma.$transaction(async () => {
      await prisma.user.findFirstOrThrow;
      return true;
    });
    console.log(getPrismaStatus);

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        prisma: getPrismaStatus ? "connected" : "not connected",
        environment: process.env.NODE_ENV,
        database: "connected",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
