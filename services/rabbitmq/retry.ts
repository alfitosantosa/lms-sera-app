import { RETRY_QUEUES } from "./topology";

/**
 * Logika murni pengiriman massal: keputusan retry dan penentuan isi pesan.
 * Dipisah dari RabbitMQ supaya bisa diuji tanpa broker — lihat
 * `bun run lib/rabbitMQ/retry.check.ts`.
 */

/** 1 kirim awal + 3 retry. */
export const MAX_ATTEMPTS = RETRY_QUEUES.length + 1;

/**
 * Queue retry berikutnya untuk `attempt` (jumlah kegagalan setelah di-increment),
 * atau `null` bila jatah retry habis — pemanggil mengirim pesan ke DLQ.
 */
export function nextRetryQueue(attempt: number): string | null {
  if (!Number.isInteger(attempt)) return null;
  const index = attempt - 1;
  if (index < 0 || index >= RETRY_QUEUES.length) return null;
  return RETRY_QUEUES[index].name;
}

/**
 * Isi pesan final.
 *
 * `override` (sudah dirender di browser) selalu menang — halaman absen/tahfidz
 * memilih template acak per siswa dan mengisi `{status}`/`{notes}` dari data
 * yang hanya ada di browser, jadi worker tidak mungkin mereproduksinya.
 * Kalau tidak ada override (pemanggil satu-pesan, mis. pembayaran), `{name}`
 * diganti di sini supaya retry mengirim teks yang identik.
 */
export function resolveBody(
  sharedMessage: string,
  name: string | null | undefined,
  override?: string | null,
): string {
  if (typeof override === "string" && override.length > 0) return override;
  return sharedMessage.replace(/\{name\}/gi, name ?? "");
}

export type BulkMessage = {
  batchId: string;
  number: string;
  name: string | null;
  message: string;
  delayMs: number;
};

/**
 * Validasi payload yang datang dari broker. Mengembalikan `null` untuk pesan
 * rusak (poison) supaya worker mengirimnya ke DLQ, bukan melempar tengah jalan.
 */
export function parseBulkMessage(raw: string): BulkMessage | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const value = parsed as Record<string, unknown>;

  const { batchId, number, message, name, delayMs } = value;
  if (typeof batchId !== "string" || batchId.length === 0) return null;
  if (typeof number !== "string" || number.length === 0) return null;
  if (typeof message !== "string" || message.length === 0) return null;

  return {
    batchId,
    number,
    message,
    name: typeof name === "string" ? name : null,
    delayMs:
      typeof delayMs === "number" && Number.isFinite(delayMs) && delayMs > 0
        ? delayMs
        : 0,
  };
}
