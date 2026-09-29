import { getWhatsAppConfig, sendWhatsAppMessage } from "@/lib/botwa";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (!getWhatsAppConfig()) {
    return NextResponse.json(
      { success: false, error: "Evolution API configuration missing" },
      { status: 500 },
    );
  }

  const { number, text } = await request.json();

  if (!number || !text) {
    return NextResponse.json(
      { success: false, error: "Number and text are required" },
      { status: 400 },
    );
  }

  const result = await sendWhatsAppMessage(number, text);

  if (!result.success) {
    // Status Evolution API diteruskan apa adanya; kegagalan jaringan → 500.
    return NextResponse.json(
      {
        success: false,
        error: result.status ? `API error: ${result.statusText}` : result.error,
      },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json({
    success: true,
    messageId: result.data.messageId,
  });
}
