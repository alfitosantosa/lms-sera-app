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
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const getAllAccountBank = await prisma.accountBank.findMany({
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
  try {
    const { accountName, accountBank, accountNumber, majorId } = await Request.json();

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
  try {
    const { id, accountName, accountBank, accountNumber, majorId } = await Request.json();

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
  const { id } = await request.json();

  try {
    const accountBank = await prisma.accountBank.delete({
      where: { id },
    });
    return NextResponse.json(accountBank);
  } catch (error) {
    return handlePrismaError(error);
  }
}
