import { NextRequest, NextResponse } from 'next/server';

function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, "");

  // If starts with 0, replace with 62 (Indonesia)
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  }

  // If doesn't start with country code, add 62
  if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
}

export async function POST(request: NextRequest) {
  const EVO_URL = process.env.NEXT_PUBLIC_EVO_URL;
  const EVO_APIKEY = process.env.NEXT_PUBLIC_EVO_APIKEY;
  const EVO_INSTANCE = process.env.NEXT_PUBLIC_EVO_INSTANCE || "fajarsentosa";
  if (!EVO_URL || !EVO_APIKEY || !EVO_INSTANCE) {
    return NextResponse.json({ success: false, error: "Evolution API configuration missing" }, { status: 500 });
  }

  const { number, text } = await request.json();

  if (!number || !text) {
    return NextResponse.json({ success: false, error: "Number and text are required" }, { status: 400 });
  }

  try {
    const response = await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVO_APIKEY,
      },
      body: JSON.stringify({
        number: formatPhoneNumber(number),
        text: text,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `API error: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, messageId: data.messageId });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
