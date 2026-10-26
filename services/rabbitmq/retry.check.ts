/**
 * Self-check untuk logika murni di `retry.ts`.
 *
 * Jalankan: `bun run lib/rabbitMQ/retry.check.ts`
 *
 * Sengaja tanpa framework: repo ini belum punya test runner, dan `bun:test`
 * butuh @types/bun (belum terpasang) yang membuat `tsc --noEmit` gagal.
 */
import assert from "node:assert/strict";
import {
  MAX_ATTEMPTS,
  nextRetryQueue,
  parseBulkMessage,
  resolveBody,
} from "./retry";

// 1 kirim awal + 3 retry
assert.equal(MAX_ATTEMPTS, 4);

// Tahapan retry: 1s -> 5s -> 30s -> DLQ
assert.equal(nextRetryQueue(1), "botwa.bulk.retry.1s");
assert.equal(nextRetryQueue(2), "botwa.bulk.retry.5s");
assert.equal(nextRetryQueue(3), "botwa.bulk.retry.30s");
assert.equal(nextRetryQueue(4), null);
assert.equal(nextRetryQueue(0), null);
assert.equal(nextRetryQueue(-1), null);
assert.equal(nextRetryQueue(2.5), null);
assert.equal(nextRetryQueue(Number.NaN), null);

// Teks yang sudah dirender di browser menang
assert.equal(resolveBody("Halo {name}", "Budi", "Teks khusus"), "Teks khusus");
// Override kosong dianggap tidak ada
assert.equal(resolveBody("Halo {name}", "Budi", ""), "Halo Budi");
// Fallback {name}, case-insensitive seperti route lama
assert.equal(resolveBody("Halo {name}", "Budi"), "Halo Budi");
assert.equal(resolveBody("Hai {NAME}", "Budi"), "Hai Budi");
assert.equal(resolveBody("Halo {name}", null), "Halo ");
assert.equal(resolveBody("Halo {name}", undefined), "Halo ");

// Payload valid
assert.deepEqual(
  parseBulkMessage(
    JSON.stringify({
      batchId: "b1",
      number: "628123",
      name: "Budi",
      message: "Halo",
      delayMs: 1000,
    }),
  ),
  {
    batchId: "b1",
    number: "628123",
    name: "Budi",
    message: "Halo",
    delayMs: 1000,
  },
);

// Tanpa nama -> null, delayMs tidak masuk akal -> 0
const tanpaNama = parseBulkMessage(
  JSON.stringify({ batchId: "b2", number: "6281", message: "Halo" }),
);
assert.equal(tanpaNama?.name, null);
assert.equal(tanpaNama?.delayMs, 0);
assert.equal(
  parseBulkMessage(
    JSON.stringify({
      batchId: "b3",
      number: "6281",
      message: "Halo",
      delayMs: -5,
    }),
  )?.delayMs,
  0,
);

// Poison -> null (worker mengirimnya ke DLQ, bukan melempar)
assert.equal(parseBulkMessage("bukan json"), null);
assert.equal(parseBulkMessage("null"), null);
assert.equal(parseBulkMessage("[]"), null);
assert.equal(
  parseBulkMessage(JSON.stringify({ number: "6281", message: "Halo" })),
  null,
);
assert.equal(
  parseBulkMessage(JSON.stringify({ batchId: "b", number: "", message: "x" })),
  null,
);
assert.equal(
  parseBulkMessage(JSON.stringify({ batchId: "b", number: "6281", message: "" })),
  null,
);

console.log("retry.check.ts: semua assert lolos");
