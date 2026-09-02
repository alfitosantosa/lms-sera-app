// model SurahQuran {
//   id          String    @id @default(cuid())
//   name        String
//   nameLatin   String
//   verseCount  Int
//   revelationPlace String
//   tahfidzRecords TahfidzRecord[]

//   @@map("surah_quran")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const surahs = await prisma.surahQuran.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(surahs);
  } catch (error) {
    console.error("Error fetching surahs:", error);
    return NextResponse.json({ error: "Failed to fetch surahs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.data)) {
      return NextResponse.json({ error: "data must be an array" }, { status: 400 });
    }

    const newSurah = await prisma.surahQuran.createMany({
      data: body.data,
      skipDuplicates: true,
    });

    return NextResponse.json(newSurah);
  } catch (error) {
    return handlePrismaError(error);
  }
}
