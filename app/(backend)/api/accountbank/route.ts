// model AccountBank {
//   id            String    @id @default(uuid())
//   accountName   String
//   accountBank   String
//   accountNumber String
//   branchId       String
//   createdAt     DateTime  @default(now())
//   branchs        Branch     @relation(fields: [branchId], references: [id])
//   payments      Payment[]

//   @@map("account_bank")
// }
import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { resolveFoundation, tenantForbidden } from "@/lib/tenant";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const explicit = request.nextUrl.searchParams.get("foundationId");
  const t = await resolveFoundation(request, explicit);
  if (!t.ok) return t.response;

  try {
    const getAllAccountBank = await prisma.accountBank.findMany({
      where: {
        branchs: { foundationId: t.foundationId },
      },
      include: {
        branchs: true,
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
    const { accountName, accountBank, accountNumber, branchId } =
      await Request.json();

    const branch = await prisma.branch.findFirst({
      where: { id: branchId, foundationId: t.foundationId },
      select: { id: true },
    });
    if (!branch) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const createAccountBank = await prisma.accountBank.create({
      data: {
        accountName,
        accountBank,
        accountNumber,
        branchId,
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
    const { id, accountName, accountBank, accountNumber, branchId } =
      await Request.json();

    const [owned, branch] = await Promise.all([
      prisma.accountBank.findFirst({
        where: { id, branchs: { foundationId: t.foundationId } },
        select: { id: true },
      }),
      prisma.branch.findFirst({
        where: { id: branchId, foundationId: t.foundationId },
        select: { id: true },
      }),
    ]);
    if (!owned || !branch)
      return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const createAccountBank = await prisma.accountBank.update({
      where: { id },
      data: {
        accountName,
        accountBank,
        accountNumber,
        branchId,
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
    const owned = await prisma.accountBank.findFirst({
      where: { id, branchs: { foundationId: t.foundationId } },
      select: { id: true },
    });
    if (!owned) return tenantForbidden("Data tidak ditemukan di yayasan ini");

    const accountBank = await prisma.accountBank.delete({
      where: { id },
    });
    return NextResponse.json(accountBank);
  } catch (error) {
    return handlePrismaError(error);
  }
}
