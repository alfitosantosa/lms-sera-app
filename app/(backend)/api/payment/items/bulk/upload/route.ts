// model PaymentItems {
//   id              String      @id @default(uuid())
//   paymentId       String?
//   studentId       String
//   paymentTypeId   String
//   quantity        Int
//   amount          Int
//   subtotal        Int
//   isPaid          Boolean     @default(false)
//   month           String
//   name            String
//   year            String
//   skuType         String
//   payment         Payment?    @relation(fields: [paymentId], references: [id], onDelete: SetNull)
//   PaymentType     PaymentType @relation(fields: [paymentTypeId], references: [id])
//   student         UserData    @relation(fields: [studentId], references: [id])
//   createdAt       DateTime             @default(now())
//   updatedAt       DateTime             @updatedAt

//   @@map("payment_items")
// }

import { handlePrismaError } from "@/lib/errorHandlerBackend";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface PaymentItemsInput {
  studentId: string;
  paymentTypeId: string;
  quantity: number;
  amount: number;
  subtotal: number;
  isPaid?: boolean;
  month: string;
  name: string;
  year: string;
  skuType: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentItemsInput[] = await request.json();

    // Validate input is array and not empty
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: "Body harus berupa array dan tidak boleh kosong" }, { status: 400 });
    }

    // Validate required fields per item
    const requiredFields = ["studentId", "paymentTypeId", "quantity", "amount", "subtotal", "month", "year", "name", "skuType"] as const;

    const validationErrors: Array<{ index: number; message: string }> = [];

    body.forEach((item, index) => {
      // Check missing fields
      const missing = requiredFields.filter((field) => !item[field]);
      if (missing.length > 0) {
        validationErrors.push({
          index,
          message: `Missing fields: ${missing.join(", ")}`,
        });
      }

      // Validate numeric fields
      if (isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
        validationErrors.push({
          index,
          message: "quantity harus berupa angka positif",
        });
      }

      if (isNaN(Number(item.amount)) || Number(item.amount) < 0) {
        validationErrors.push({
          index,
          message: "amount harus berupa angka non-negatif",
        });
      }

      if (isNaN(Number(item.subtotal)) || Number(item.subtotal) < 0) {
        validationErrors.push({
          index,
          message: "subtotal harus berupa angka non-negatif",
        });
      }

      // Validate month and year format
      if (!/^\d{2}$/.test(item.month)) {
        validationErrors.push({
          index,
          message: "month harus format MM (01-12)",
        });
      }

      if (!/^\d{4}$/.test(item.year)) {
        validationErrors.push({
          index,
          message: "year harus format YYYY",
        });
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Validation errors", details: validationErrors }, { status: 400 });
    }

    // Get all unique studentIds and paymentTypeIds for batch validation
    const studentIds = [...new Set(body.map((item) => item.studentId))];
    const paymentTypeIds = [...new Set(body.map((item) => item.paymentTypeId))];

    // Validate all students exist
    const existingStudents = await prisma.userData.findMany({
      where: { id: { in: studentIds } },
      select: { id: true },
    });
    const existingStudentIds = new Set(existingStudents.map((s) => s.id));

    const missingStudents = studentIds.filter((id) => !existingStudentIds.has(id));
    if (missingStudents.length > 0) {
      return NextResponse.json({ error: `Student tidak ditemukan: ${missingStudents.join(", ")}` }, { status: 400 });
    }

    // Validate all payment types exist
    const existingPaymentTypes = await prisma.paymentType.findMany({
      where: { id: { in: paymentTypeIds } },
      select: { id: true },
    });
    const existingPaymentTypeIds = new Set(existingPaymentTypes.map((pt) => pt.id));

    const missingPaymentTypes = paymentTypeIds.filter((id) => !existingPaymentTypeIds.has(id));
    if (missingPaymentTypes.length > 0) {
      return NextResponse.json(
        {
          error: `PaymentType tidak ditemukan: ${missingPaymentTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Create payment items
    const result = await prisma.paymentItems.createMany({
      data: body.map((item) => ({
        studentId: item.studentId,
        paymentTypeId: item.paymentTypeId,
        quantity: Number(item.quantity),
        amount: Number(item.amount),
        subtotal: Number(item.subtotal),
        isPaid: item.isPaid ?? false,
        month: item.month,
        name: item.name,
        year: item.year,
        skuType: item.skuType,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: "Payment items berhasil dibuat",
        count: result.count,
        skipped: body.length - result.count,
        total: body.length,
      },
      { status: 201 },
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}

// Optional: GET endpoint untuk fetch payment items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const limit = parseInt(searchParams.get("limit") ?? "100");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where: Record<string, string> = {};

    if (studentId) where.studentId = studentId;
    if (month) where.month = month;
    if (year) where.year = year;

    const [items, total] = await Promise.all([
      prisma.paymentItems.findMany({
        where,
        include: {
          student: true,
          PaymentType: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.paymentItems.count({ where }),
    ]);

    return NextResponse.json(
      {
        data: items,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return handlePrismaError(error);
  }
}
