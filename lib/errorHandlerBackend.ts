import { Prisma } from "@/prisma/generated/client";
import { NextResponse } from "next/server";

export function handlePrismaError(error: unknown): NextResponse {
  // 1. Cek jika error dari Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json({ success: false, message: "Data sudah ada (Duplikat)" }, { status: 409 });
      case "P2003":
        return NextResponse.json({ success: false, message: "Data masih digunakan oleh data lain" }, { status: 400 });
      case "P2025":
        return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
      default:
        console.error("Prisma Error:", error.code, error.message);
        return NextResponse.json({ success: false, message: `Kesalahan database: ${error.code}` }, { status: 500 });
    }
  }

  // 2. Cek jika error JavaScript biasa
  if (error instanceof Error) {
    console.error(error); // Tetap log untuk kebutuhan debugging di server
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }

  // 3. Fallback jika error tidak dikenali
  return NextResponse.json({ success: false, message: "Terjadi kesalahan tidak diketahui" }, { status: 500 });
}
