// model AccountBank {
//   id            String    @id @default(uuid())
//   accountName   String
//   accountBank   String
//   accountNumber String
//   majorId       String
//   createdAt     DateTime  @default(now())
//   majors        Major     @relation(fields: [majorId], references: [id])
//   payments      Payment[]

//   @@map("account_bank")
// }
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  try {
    const getAllAccountBank = await prisma.accountBank.findMany({
      where: {
        majors: { foundationId: t.foundationId },
      },
      include: {
        majors: true,
      },
    });
    return NextResponse.json(getAllAccountBank);
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}

export async function POST(Request: NextRequest) {
  const t = await resolveFoundation(Request);
  if (!t.ok) return t.response;

  try {
    const { accountName, accountBank, accountNumber, majorId } = await Request.json();

    const major = await prisma.major.findFirst({ where: { id: majorId, foundationId: t.foundationId }, select: { id: true } });
    if (!major) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const createAccountBank = await prisma.accountBank.create({
      data: {
        accountName,
        accountBank,
        accountNumber,
        majorId,
      },
    });
    return NextResponse.json(createAccountBank);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(Request: NextRequest) {
  const t = await resolveFoundation(Request);
  if (!t.ok) return t.response;

  try {
    const { id, accountName, accountBank, accountNumber, majorId } = await Request.json();

    const [owned, major] = await Promise.all([
      prisma.accountBank.findFirst({ where: { id, majors: { foundationId: t.foundationId } }, select: { id: true } }),
      prisma.major.findFirst({ where: { id: majorId, foundationId: t.foundationId }, select: { id: true } }),
    ]);
    if (!owned || !major) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const createAccountBank = await prisma.accountBank.update({
      where: { id },
      data: {
        accountName,
        accountBank,
        accountNumber,
        majorId,
      },
    });
    return NextResponse.json(createAccountBank);
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const t = await resolveFoundation(request);
  if (!t.ok) return t.response;

  const { id } = await request.json();

  try {
    const owned = await prisma.accountBank.findFirst({ where: { id, majors: { foundationId: t.foundationId } }, select: { id: true } });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const accountBank = await prisma.accountBank.delete({
      where: { id },
    });
    return NextResponse.json(accountBank);
  } catch (error) {
    return handlePrismaError(error);
  }
}
