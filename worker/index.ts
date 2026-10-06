/**
 * Consumer pengiriman WhatsApp massal — proses terpisah dari Next.js.
 *
 * Route API only publish ke RabbitMQ lalu langsung membalas 200 (fire and
 * forget). Proses inilah yang benar-benar memanggil Evolution API, termasuk
 * retry bertingkat (1s → 5s → 30s) dan DLQ.
 *
 * Jalankan lokal: `bun run worker`
 */
import type { ConfirmChannel, ConsumeMessage } from "amqplib";
import { sendWhatsAppMessage } from "@/lib/WhatsappGateway/botwa";
import {
  BULK_DLX,
  BULK_EXCHANGE,
  BULK_QUEUE,
  BULK_ROUTING_DEAD,
} from "@/lib/rabbitMQ/topology";
import { nextRetryQueue, parseBulkMessage } from "@/lib/rabbitMQ/retry";
import { closeRabbit, openRabbit } from "@/lib/rabbitMQ/rabbitMQ";

let activeChannel: ConfirmChannel | null = null;
let shuttingDown = false;

/** Publish persistent sambil menunggu publisher confirm. */
function publishConfirmed(
  channel: ConfirmChannel,
  exchange: string,
  routingKey: string,
  content: Buffer,
  headers: Record<string, unknown>,
): Promise<boolean> {
  const { promise, resolve } = Promise.withResolvers<boolean>();
  channel.publish(
    exchange,
    routingKey,
    content,
    { persistent: true, contentType: "application/json", headers },
    (error) => resolve(!error),
  );
  return promise;
}

async function handleMessage(
  channel: ConfirmChannel,
  msg: ConsumeMessage,
): Promise<void> {
  const attempt = Number(msg.properties.headers?.["x-attempt"] ?? 0);
  const body = parseBulkMessage(msg.content.toString());

  // Pesan rusak: kirim ke DLQ supaya bisa diperiksa, jangan sampai loop.
  if (!body) {
    console.error(
      "[worker] payload tidak valid -> DLQ:",
      msg.content.toString().slice(0, 200),
    );
    await publishConfirmed(channel, BULK_DLX, BULK_ROUTING_DEAD, msg.content, {
      "x-attempt": attempt + 1,
      "x-error": "payload tidak valid",
    });
    channel.ack(msg);
    return;
  }

  const result = await sendWhatsAppMessage(body.number, body.message);
  const nextAttempt = attempt + 1;

  if (result.success) {
    const messageId =
      result.data.key?.id ?? result.data.id ?? result.data.messageId ?? "-";
    console.log(
      `[worker] terkirim batch=${body.batchId} ke=${body.number} messageId=${messageId}`,
    );
    channel.ack(msg);
    return;
  }

  const retryQueue = nextRetryQueue(nextAttempt);
  if (retryQueue) {
    const published = await publishConfirmed(
      channel,
      BULK_EXCHANGE,
      retryQueue,
      msg.content,
      { ...msg.properties.headers, "x-attempt": nextAttempt },
    );
    console.warn(
      `[worker] gagal batch=${body.batchId} ke=${body.number} attempt=${nextAttempt} -> ${
        published ? retryQueue : "PUBLISH RETRY GAGAL"
      }: ${result.error}`,
    );
  } else {
    await publishConfirmed(channel, BULK_DLX, BULK_ROUTING_DEAD, msg.content, {
      ...msg.properties.headers,
      "x-attempt": nextAttempt,
      "x-error": String(result.error).slice(0, 500),
    });
    console.error(
      `[worker] retry habis batch=${body.batchId} ke=${body.number} -> DLQ: ${result.error}`,
    );
  }

  // Selalu ack, termasuk saat gagal: requeue ke queue yang sama berarti retry
  // tanpa jeda sama sekali (self-inflicted DoS).
  channel.ack(msg);

  // Jeda antar kirim: Evolution API punya batas laju per instance.
  if (body.delayMs > 0) {
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, body.delayMs);
    await promise;
  }
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[worker] ${signal} diterima, menutup...`);
  await activeChannel?.close().catch(() => undefined);
  await closeRabbit();
  process.exit(0);
}

async function main(): Promise<void> {
  await openRabbit({
    onConnected: async (model) => {
      const channel = await model.createConfirmChannel();
      channel.on("error", (error: Error) => {
        console.error("[worker] channel error:", error);
      });

      // prefetch 1: kirim serial adalah default yang benar untuk batas laju
      // Evolution API. Throughput dinaikkan dengan menambah replika worker,
      // yang berbagi delivery dari queue yang sama.
      await channel.prefetch(1);

      await channel.consume(BULK_QUEUE, (msg) => {
        if (!msg) return;
        void handleMessage(channel, msg).catch((error: unknown) => {
          console.error("[worker] handler error:", error);
          // Jangan diamkan pesan ini: nack tanpa requeue -> DLQ lewat DLX queue.
          try {
            channel.nack(msg, false, false);
          } catch {
            // channel sudah tertutup; broker akan mengembalikan pesan sendiri.
          }
        });
      });

      activeChannel = channel;
      console.log(`[worker] menunggu pesan di ${BULK_QUEUE}`);
    },
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

void main().catch((error: unknown) => {
  console.error("[worker] gagal start:", error);
  process.exit(1);
});
