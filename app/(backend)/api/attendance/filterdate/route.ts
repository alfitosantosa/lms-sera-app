"use server";
import { handlePrismaError } from "@/lib/errorHandler/errorHandlerBackend";
import { prisma } from "@/lib/api/prisma";
import { resolveFoundation } from "@/lib/api/tenant";
import { type NextRequest, NextResponse } from "next/server";

//filter by date
export async function GET(request: NextRequest) {
  const t = await resolveFoundation(
    request,
    request.nextUrl.searchParams.get("foundationId"),
  );
  if (!t.ok) return t.response;

  const fromdate = request.nextUrl.searchParams.get("fromdate");
  const todate = request.nextUrl.searchParams.get("todate");
  const branchId = request.nextUrl.searchParams.get("branchId");

  if (!fromdate || !todate) {
    return NextResponse.json(
      { error: "Missing fromdate or todate query parameters" },
      { status: 400 },
    );
  }

  try {
    const startDate = new Date(fromdate);
    const endDate = new Date(todate);

    // Add 1 day to endDate to make sure we fetch data up to the end of the strict toDate
    // set start date only from 00:00:00 and end date only until 23:59:59
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Build where clause
    const whereClause: any = {
      date: {
        gte: startDate,
        lte: endDate,
      },
      schedule: { academicYear: { foundationId: t.foundationId } },
      student: { foundationId: t.foundationId },
    };

    // Filter by branch if provided (Pattern 3: Deep nested via Schedule → Class)
    if (branchId) {
      whereClause.schedule = {
        ...whereClause.schedule,
        class: {
          branchId: branchId,
        },
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: true,
        schedule: {
          include: {
            subject: true,
            class: {
              include: {
                branch: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(attendances);
  } catch (error) {
    return handlePrismaError(error);
  }
}
