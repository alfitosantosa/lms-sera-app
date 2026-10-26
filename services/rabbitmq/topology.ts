import type { Channel } from "amqplib";

/**
 * Topologi RabbitMQ untuk pengiriman WhatsApp massal.
 *
 * Nama exchange/queue dikumpulkan di sini supaya route (producer) dan worker
 * (consumer) tidak pernah berbeda pendapat soal nama.
 *
 * Semua queue memakai `x-queue-type: quorum` (durable, metadata tereplikasi).
 * Broker: RabbitMQ 3.13.7 — quorum + `x-overflow: reject-publish-dlx` didukung.
 */

/** Exchange tempat pesan kirim dipublikasikan. */
export const BULK_EXCHANGE = "botwa.bulk";
/** Exchange tujuan pesan yang gagal permanen. */
export const BULK_DLX = "botwa.bulk.dlx";

export const BULK_QUEUE = "botwa.bulk.send.q";
export const BULK_DLQ = "botwa.bulk.dlq";

export const BULK_ROUTING_SEND = "botwa.bulk.send";
export const BULK_ROUTING_DEAD = "botwa.bulk.dead";

/**
 * Retry bertingkat memakai TTL level-queue, bukan TTL per-message: itu pola
 * kanonik dan menghindari caveat head-of-line TTL per-message pada quorum queue.
 * Pesan yang TTL-nya habis di-DLX balik ke BULK_EXCHANGE / BULK_ROUTING_SEND,
 * jadi tidak perlu plugin delayed-message-exchange.
 */
export const RETRY_QUEUES = [
  { name: "botwa.bulk.retry.1s", ttl: 1_000 },
  { name: "botwa.bulk.retry.5s", ttl: 5_000 },
  { name: "botwa.bulk.retry.30s", ttl: 30_000 },
] as const;

/**
 * 24 jam. Notifikasi absen/pembayaran yang telat tiga hari lebih buruk daripada
 * tidak terkirim sama sekali, jadi pesan basi di-dead-letter, bukan dikirim.
 */
const WORK_QUEUE_TTL_MS = 24 * 60 * 60 * 1_000;

/**
 * Backpressure: kalau worker mati, queue berhenti tumbuh di batas ini dan
 * publish berikutnya di-dead-letter (terlihat sebagai `rejected` di response).
 */
const WORK_QUEUE_MAX_LENGTH = 50_000;

/**
 * Deklarasi idempoten seluruh exchange/queue/binding.
 * Aman (dan memang harus) dipanggil ulang setiap kali koneksi pulih.
 */
export async function assertTopology(channel: Channel): Promise<void> {
  await channel.assertExchange(BULK_EXCHANGE, "direct", { durable: true });
  await channel.assertExchange(BULK_DLX, "direct", { durable: true });

  await channel.assertQueue(BULK_QUEUE, {
    durable: true,
    arguments: {
      "x-queue-type": "quorum",
      "x-message-ttl": WORK_QUEUE_TTL_MS,
      "x-max-length": WORK_QUEUE_MAX_LENGTH,
      "x-overflow": "reject-publish-dlx",
      "x-dead-letter-exchange": BULK_DLX,
      "x-dead-letter-routing-key": BULK_ROUTING_DEAD,
    },
  });
  await channel.bindQueue(BULK_QUEUE, BULK_EXCHANGE, BULK_ROUTING_SEND);

  for (const retry of RETRY_QUEUES) {
    await channel.assertQueue(retry.name, {
      durable: true,
      arguments: {
        "x-queue-type": "quorum",
        "x-message-ttl": retry.ttl,
        "x-dead-letter-exchange": BULK_EXCHANGE,
        "x-dead-letter-routing-key": BULK_ROUTING_SEND,
      },
    });
    await channel.bindQueue(retry.name, BULK_EXCHANGE, retry.name);
  }

  await channel.assertQueue(BULK_DLQ, {
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  await channel.bindQueue(BULK_DLQ, BULK_DLX, BULK_ROUTING_DEAD);
}
