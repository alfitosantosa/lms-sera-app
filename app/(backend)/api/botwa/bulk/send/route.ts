import { randomUUID } from "node:crypto";
import type { ConfirmChannel, Message } from "amqplib";
import { type NextRequest, NextResponse } from "next/server";
import { getPublishChannel } from "@/lib/rabbitMQ/rabbitMQ";
import { resolveBody } from "@/lib/rabbitMQ/retry";
import { BULK_EXCHANGE, BULK_ROUTING_SEND } from "@/lib/rabbitMQ/topology";

// Type definitions
interface BulkRecipient {
  number: string;
  name?: string;
  /**
   * Teks final yang sudah dirender di browser (menang atas `message`).
   * Halaman absen/tahfidz memilih template acak per siswa dan mengisi
   * `{status}`/`{notes}` dari data yang hanya ada di browser.
   */
  message?: string;
}

interface BulkSendRequest {
  recipients: BulkRecipient[];
  /** Teks bersama; `{name}` diganti per penerima. */
  message?: string;
  /** Jeda antar kirim di worker, default 1000 ms. */
  delayMs?: number;
}

// GET - Check connection status
export async function GET() {
  const EVO_URL = process.env.NEXT_PUBLIC_EVO_URL;
  const EVO_APIKEY = process.env.NEXT_PUBLIC_EVO_APIKEY;
  const EVO_INSTANCE = process.env.NEXT_PUBLIC_EVO_INSTANCE || "fajarsentosa";

  if (!EVO_URL || !EVO_APIKEY) {
    return NextResponse.json(
      { connection: "error", message: "Evolution API configuration missing" },
      { status: 500 },
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
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { connection: "error", message: "Failed to check connection" },
        { status: response.status },
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
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST - Masukkan pesan WhatsApp ke antrian.
 *
 * Fire and forget: begitu batch masuk queue, response sukses langsung dikirim.
 * Pengiriman sebenarnya dilakukan proses worker terpisah (`bun run worker`),
 * termasuk retry dan DLQ.
 */
export async function POST(request: NextRequest) {
  let body: BulkSendRequest;
  try {
    body = (await request.json()) as BulkSendRequest;
  } catch {
    return NextResponse.json(
      { error: "Body bukan JSON yang valid" },
      { status: 400 },
    );
  }

  // Validate request
  if (!Array.isArray(body?.recipients) || body.recipients.length === 0) {
    return NextResponse.json(
      { error: "Recipients array is required and must not be empty" },
      { status: 400 },
    );
  }

  const sharedMessage = typeof body.message === "string" ? body.message : "";

  // Setiap penerima harus punya teks: `message` sendiri, atau `message` batch.
  const lackingText = body.recipients.some(
    (recipient) =>
      (typeof recipient.message !== "string" ||
        recipient.message.trim() === "") &&
      sharedMessage.trim() === "",
  );
  if (lackingText) {
    return NextResponse.json(
      { error: "Message is required and must not be empty" },
      { status: 400 },
    );
  }

  // Limit recipients to prevent abuse (max 100 per request)
  if (body.recipients.length > 100) {
    return NextResponse.json(
      { error: "Maximum 100 recipients per request" },
      { status: 400 },
    );
  }

  const delayMs = body.delayMs && body.delayMs > 0 ? body.delayMs : 1000;
  const batchId = randomUUID();

  let channel: ConfirmChannel;
  try {
    channel = await getPublishChannel();
  } catch (error) {
    console.error("RabbitMQ tidak terjangkau:", error);
    return NextResponse.json(
      { error: "Layanan antrian sedang tidak tersedia" },
      { status: 503 },
    );
  }

  // `basic.return` = pesan tidak ter-routing, walau publisher confirm-nya ack.
  const returned = new Set<string>();
  const onReturn = (returnedMessage: Message) => {
    const returnedId = returnedMessage.properties.messageId;
    if (returnedId) returned.add(returnedId);
  };
  channel.on("return", onReturn);

  try {
    const results = await Promise.all(
      body.recipients.map((recipient, index) => {
        // Nomor kosong tidak bisa dikirim: hitung sebagai rejected.
        if (!recipient.number) return Promise.resolve(false);

        const messageId = `${batchId}:${index}`;
        const payload = {
          batchId,
          number: recipient.number,
          name: recipient.name ?? null,
          message: resolveBody(
            sharedMessage,
            recipient.name,
            recipient.message,
          ),
          delayMs,
        };

        const { promise, resolve } = Promise.withResolvers<boolean>();
        channel.publish(
          BULK_EXCHANGE,
          BULK_ROUTING_SEND,
          Buffer.from(JSON.stringify(payload)),
          {
            persistent: true,
            contentType: "application/json",
            messageId,
            mandatory: true,
          },
          // Return selalu datang sebelum confirm, jadi `returned` sudah terisi.
          (error) => resolve(!error && !returned.has(messageId)),
        );
        return promise;
      }),
    );

    const accepted = results.filter(Boolean).length;
    const rejected = results.length - accepted;
    console.log(
      `[botwa/bulk] batch=${batchId} accepted=${accepted} rejected=${rejected}`,
    );

    return NextResponse.json({ batchId, accepted, rejected });
  } catch (error) {
    console.error("Bulk send error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Gagal memasukkan ke antrian",
      },
      { status: 503 },
    );
  } finally {
    channel.off("return", onReturn);
  }
}
