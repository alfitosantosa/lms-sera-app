"use server";
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const scheduleId = searchParams.get("scheduleId");

    if (!date || !scheduleId) {
        return NextResponse.json({ message: "Missing date or scheduleId parameters" }, { status: 400 });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const isSubmitted = await prisma.attendance.findFirst({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
            scheduleId: scheduleId,
        },
    });

    if (isSubmitted) {
        return NextResponse.json({ isSubmitted: true, data: isSubmitted });
    }
    return NextResponse.json({ isSubmitted: false, data: null });
}
