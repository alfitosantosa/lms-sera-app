import { NextRequest, NextResponse } from 'next/server';

// Type definitions
interface BulkSendRequest {
  recipients: {
    number: string;
    name?: string;
  }[];
  message: string;
  // Optional: delay between messages in milliseconds (default: 1000ms to avoid rate limiting)
  delayMs?: number;
}

interface SendResult {
  number: string;
  name?: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

interface BulkSendResponse {
  totalSent: number;
  totalFailed: number;
  results: SendResult[];
}

// Helper function to format phone number for WhatsApp
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

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Send single message to Evolution API
async function sendWhatsAppMessage(
  number: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const EVO_URL = process.env.NEXT_PUBLIC_EVO_URL;
  const EVO_APIKEY = process.env.NEXT_PUBLIC_EVO_APIKEY;
  const EVO_INSTANCE = process.env.NEXT_PUBLIC_EVO_INSTANCE || "fajarsentosa";

  if (!EVO_URL || !EVO_APIKEY) {
    return { success: false, error: "Evolution API configuration missing" };
  }

  try {
    const response = await fetch(
      `${EVO_URL}/message/sendText/${EVO_INSTANCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVO_APIKEY,
        },
        body: JSON.stringify({
          number: formatPhoneNumber(number),
          text: text,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `API Error: ${response.status} - ${errorData}` };
    }

    const data = await response.json();
    return { 
      success: true, 
      messageId: data?.key?.id || data?.id || "sent" 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

// GET - Check connection status
export async function GET() {
  const EVO_URL = process.env.NEXT_PUBLIC_EVO_URL;
  const EVO_APIKEY = process.env.NEXT_PUBLIC_EVO_APIKEY;
  const EVO_INSTANCE = process.env.NEXT_PUBLIC_EVO_INSTANCE || "fajarsentosa";

  if (!EVO_URL || !EVO_APIKEY) {
    return NextResponse.json(
      { connection: "error", message: "Evolution API configuration missing" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${EVO_URL}/instance/connectionState/${EVO_INSTANCE}`,
      {
        method: "GET",
        headers: {
          apikey: EVO_APIKEY,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { connection: "error", message: "Failed to check connection" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      connection: "success",
      state: data?.instance?.state || data?.state || "unknown",
      instance: EVO_INSTANCE,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        connection: "error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// POST - Bulk send WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body: BulkSendRequest = await request.json();

    // Validate request
    if (!body.recipients || !Array.isArray(body.recipients) || body.recipients.length === 0) {
      return NextResponse.json(
        { error: "Recipients array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (!body.message || typeof body.message !== "string" || body.message.trim() === "") {
      return NextResponse.json(
        { error: "Message is required and must not be empty" },
        { status: 400 }
      );
    }

    // Limit recipients to prevent abuse (max 100 per request)
    if (body.recipients.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 recipients per request" },
        { status: 400 }
      );
    }

    const delayMs = body.delayMs || 1000; // Default 1 second delay between messages
    const results: SendResult[] = [];
    let totalSent = 0;
    let totalFailed = 0;

    // Process each recipient
    for (const recipient of body.recipients) {
      if (!recipient.number) {
        results.push({
          number: recipient.number || "unknown",
          name: recipient.name,
          success: false,
          error: "Phone number is required",
        });
        totalFailed++;
        continue;
      }

      // Personalize message if name is provided
      let personalizedMessage = body.message;
      if (recipient.name) {
        personalizedMessage = personalizedMessage.replace(/\{name\}/gi, recipient.name);
      }

      // Send message
      const result = await sendWhatsAppMessage(recipient.number, personalizedMessage);

      results.push({
        number: recipient.number,
        name: recipient.name,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      });

      if (result.success) {
        totalSent++;
      } else {
        totalFailed++;
      }

      // Add delay between messages to avoid rate limiting
      if (body.recipients.indexOf(recipient) < body.recipients.length - 1) {
        await delay(delayMs);
      }
    }

    const response: BulkSendResponse = {
      totalSent,
      totalFailed,
      results,
    };

    return NextResponse.json(response, { 
      status: totalFailed === body.recipients.length ? 500 : 200 
    });
  } catch (error) {
    console.error("Bulk send error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process bulk send" },
      { status: 500 }
    );
  }
}
