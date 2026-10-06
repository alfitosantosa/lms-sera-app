# RabbitMQ-backed WhatsApp bulk send — Design

Date: 2026-10-06
Status: awaiting review

## 1. Problem

`POST /api/botwa/bulk/send` sends WhatsApp messages **synchronously inside the HTTP
request** (`for` loop + `delay(1000)`). The two teacher flows do worse: they call the
endpoint **once per student** from the browser, with a client-side `setTimeout(800)`
between calls, and derive `successCount` / `failCount` from each HTTP response.

Consequences today:

- 40 students = 40 sequential browser requests; the tab must stay open.
- No retry: a transient Evolution API failure loses the notification permanently.
- No durability: a deploy or crash mid-loop drops the remaining messages.
- Rate limiting is per-browser-session, not global — concurrent teachers multiply load.

RabbitMQ is already partly wired in the tree but **nothing publishes and nothing
consumes**:

- `lib/rabbitMQ/rabbitMQ.ts` — untracked, exports `getChannel()` / `closeConnection()`.
- `app/(backend)/api/botwa/bulk/send/route.ts` — imports `getChannel`, never calls it.
- `app/(backend)/api/botwa/bulk/consumer/route.ts` — untracked, **byte-identical copy**
  of the send route (`diff` reports IDENTICAL). It is not a consumer.
- `bullmq` is a declared dependency, unused, and requires Redis, which exists nowhere
  in this repository.

## 2. Goals

1. One HTTP request enqueues a whole batch, regardless of recipient count.
2. A long-lived worker performs the sends, survives process restart, and retries
   transient failures with increasing delays.
3. Per-recipient outcomes stay visible to the teacher (exact "Berhasil mengirim N"
   and "Gagal mengirim N" toasts) and are inspectable after the fact.
4. Global rate limiting, independent of how many browsers are sending.

## 3. Non-goals

- Auth on the botwa routes. Both are unauthenticated today; this work neither fixes
  nor worsens that. It is listed in §11 as a separate task.
- Moving WhatsApp message templates server-side.
- A job history / admin UI, job cancellation, or scheduled sends.
- Replacing the existing `GET /api/botwa/bulk/send` connection check.

## 4. Decisions already taken

| Decision | Value | Rationale |
|---|---|---|
| Scope | Finish queue-backed bulk send | User |
| Broker | External only (`.env` `RABBITMQ_URL`) | User; no compose service, no `docker-compose.yml` change for the broker |
| Async contract | Persisted job + polling status endpoint | User; keeps per-recipient counts, which the teacher toasts depend on |
| Broker version | RabbitMQ 3.13.7, Erlang 26.2.5.16, cluster `rabbit@rabbitmq-node` | Verified via management API on port 15672 |
| Queue type | Quorum | Version supports it; durable, replicated metadata |

## 5. Topology

Two durable direct exchanges:

- `botwa.bulk` — routing key `botwa.bulk.send`
- `botwa.bulk.dlx` — routing key `botwa.bulk.dead`

All queues are durable **quorum** (`x-queue-type: quorum`).

| Queue | Binding | Arguments | Purpose |
|---|---|---|---|
| `botwa.bulk.send.q` | `botwa.bulk` ← `botwa.bulk.send` | `x-dead-letter-exchange: botwa.bulk.dlx`, `x-dead-letter-routing-key: botwa.bulk.dead` | Work queue, consumed by the worker |
| `botwa.bulk.retry.1s` | `botwa.bulk` ← `botwa.bulk.retry.1s` | `x-message-ttl: 1000`, DLX → `botwa.bulk` / `botwa.bulk.send` | Retry stage 1 |
| `botwa.bulk.retry.5s` | `botwa.bulk` ← `botwa.bulk.retry.5s` | `x-message-ttl: 5000`, DLX → `botwa.bulk` / `botwa.bulk.send` | Retry stage 2 |
| `botwa.bulk.retry.30s` | `botwa.bulk` ← `botwa.bulk.retry.30s` | `x-message-ttl: 30000`, DLX → `botwa.bulk` / `botwa.bulk.send` | Retry stage 3 |
| `botwa.bulk.dlq` | `botwa.bulk.dlx` ← `botwa.bulk.dead` | — | Terminal, no consumer |

Retry uses **queue-level TTL**, not per-message expiration: it is the canonical
pattern and sidesteps quorum-queue head-of-line caveats around per-message TTL. A
retry is a republish from the worker to `botwa.bulk` with routing key
`botwa.bulk.retry.{1s,5s,30s}`; the TTL expires and the queue's DLX routes it back to
`botwa.bulk.send.q`. No plugin (delayed-message-exchange) is required.

### Message contract

Body: `{ "jobId": string, "itemId": string }` — deliberately minimal. The worker reads
the body text and recipient from PostgreSQL, so a message never carries stale content
and no large payloads sit in the broker.

Properties: `persistent: true`, `contentType: application/json`, `messageId: itemId`,
and for retries header `x-attempt: <number>`.

### Retry decision

`nextRetryQueue(attempt: number): string | null`, where `attempt` is the number of
failures recorded after incrementing:

| attempt | result |
|---|---|
| 1 | `botwa.bulk.retry.1s` |
| 2 | `botwa.bulk.retry.5s` |
| 3 | `botwa.bulk.retry.30s` |
| ≥ 4 | `null` → publish to `botwa.bulk.dlx` and mark the item failed |

Total delivery attempts per item: 1 initial + 3 retries = 4.

## 6. Data model

Added to `prisma/schema.prisma`, following the existing convention: domain statuses are
`String @default(...)` (the schema only uses `enum` for Exam/Assessment/Report types),
models are `PascalCase`, tables map to `snake_case`.

```prisma
model BulkJob {
  id         String        @id @default(cuid())
  message    String
  delayMs    Int           @default(1000)
  status     String        @default("queued") // queued|processing|completed|partial|failed
  total      Int
  sent       Int           @default(0)
  failed     Int           @default(0)
  createdBy  String?
  createdAt  DateTime      @default(now())
  finishedAt DateTime?
  items      BulkJobItem[]

  @@index([status, createdAt])
  @@map("bulk_job")
}

model BulkJobItem {
  id        String    @id @default(cuid())
  jobId     String
  job       BulkJob   @relation(fields: [jobId], references: [id], onDelete: Cascade)
  number    String
  name      String?
  message   String?
  status    String    @default("pending") // pending|sent|failed
  attempt   Int       @default(0)
  messageId String?
  error     String?
  sentAt    DateTime?
  createdAt DateTime  @default(now())

  @@index([jobId, status])
  @@map("bulk_job_item")
}
```

`BulkJobItem.message` is required by the design: the attendance and tahfidz flows pick a
**random template per student** and substitute `{status}` and `{notes}` from that
student's attendance record. Those values exist only in the browser, so a single
job-level `message` cannot express the batch. Item-level `message` holds the fully
rendered text; when it is `null` the worker falls back to
`job.message.replace(/\{name\}/gi, item.name ?? "")`, which preserves the current
behaviour for the single-recipient payment caller.

Migration: `npx prisma migrate dev --name add_bulk_job`, then `npx prisma generate`.

## 7. Producer

### `POST /api/botwa/bulk/send` (rewrite)

Request body, extended with an optional per-recipient `message`:

```ts
interface BulkSendRequest {
  recipients: { number: string; name?: string; message?: string }[];
  message: string;
  delayMs?: number;
}
```

Flow:

1. Validate as today: non-empty `recipients`, non-empty `message`, ≤ 100 recipients.
2. In one `prisma.$transaction`, create `BulkJob` + one `BulkJobItem` per recipient
   (`status: "pending"`).
3. Publish one persistent message per item on a **confirm channel** with
   `mandatory: true`.
4. Collect publisher results. Any `nack` or `basic.return` marks that item `failed`
   and sets the job status `partial` (some confirmed) or `failed` (none).
5. Respond **`200 { jobId, accepted, rejected }` whenever the job row was persisted**,
   including when `rejected > 0` — per-recipient truth comes from polling
   `GET /api/botwa/bulk/jobs/[id]`. Returning a non-2xx here would be actively harmful:
   the existing hook throws on `!response.ok`, so the client would discard the `jobId`
   and lose the ability to report the outcome.
6. Respond **`503`** only when nothing was queued and there is no job to poll — broker
   unreachable, or the DB transaction failed. Message
   `"Layanan antrian sedang tidak tersedia"`.

The publish must not happen before the rows are committed; the DB is the source of
truth and a message referencing a missing item is treated as poison (§8).

### `GET /api/botwa/bulk/jobs/[id]` (new)

Next.js 16 async `params` unwrap, `handlePrismaError`, returns:

```ts
{
  success: true,
  data: {
    id, status, total, sent, failed, createdAt, finishedAt,
    items: { id, number, name, status, attempt, messageId, error, sentAt }[]
  }
}
```

404 when the job does not exist.

### `GET /api/botwa/bulk/send` (unchanged)

The Evolution API connection check consumed by `useGetConnectionBotWa` with a 30 s
refetch interval. Behaviour is preserved exactly.

### Deleted

`app/(backend)/api/botwa/bulk/consumer/` — an identical duplicate of the send route,
not a consumer. Removing it is part of this cutover, not a separate cleanup.

## 8. Worker

New `worker/index.ts`, a long-lived Bun process with its own connection (module
singletons are per-process, so the API and worker never share state).

### Startup

1. `assertTopology()` — idempotently declare both exchanges and all five queues.
2. `prefetch(1)`. Deliberate: the Evolution API imposes per-instance rate limits, so
   serial sending is the correct default; throughput scales by running more worker
   replicas, which share deliveries from the same queue.
3. `consume("botwa.bulk.send.q", { noAck: false })`.

### Per-message handling

1. Parse `{ jobId, itemId }`. Malformed body → publish to `botwa.bulk.dlx`, ack.
2. Load the item. Missing item or missing job → publish to `botwa.bulk.dlx`, ack
   (poison message; must not loop).
3. **Idempotency guard**: `item.status === "sent"` → ack and return without sending.
4. Resolve the body: `item.message ?? job.message.replace(/\{name\}/gi, item.name ?? "")`.
5. `sendWhatsAppMessage(item.number, body)`.
6. Success → update item (`status: "sent"`, `messageId`, `sentAt`, `attempt`) and
   increment `job.sent`.
7. Failure → increment `item.attempt` and `job.failed`; look up `nextRetryQueue(attempt)`;
   republish a persistent copy with the incremented `x-attempt` to the retry queue, or
   publish to `botwa.bulk.dlx` and set `item.status = "failed"` with `error`.
8. **Ack the original in every path** — success, retry, and dead-letter. Never
   `nack(requeue: true)`; requeue loops are the known self-inflicted DoS.
9. When no `pending` items remain for the job, set the job terminal status:
   `completed` (0 failed), `partial` (some failed), `failed` (all failed), plus
   `finishedAt`. Set `processing` on the first handled item.
10. Sleep `job.delayMs` after each handled message to respect the Evolution rate limit.

Steps 6–7 and 9 run in a transaction so `job.sent` / `job.failed` cannot drift from
the item rows.

### Shutdown

`SIGTERM` / `SIGINT` → cancel the consumer, wait for the in-flight handler, close the
channel and connection, exit. Unacked messages return to the queue automatically.

### Reconnection

The worker retries the connection with exponential backoff indefinitely — it must
survive a broker restart. The API does the opposite: fail fast with `503`, because an
HTTP request cannot wait for a broker to come back.

### Known ceiling

`ponytail:` at-least-once delivery. A crash after Evolution accepts the message but
before the DB write means redelivery re-sends it. The `status === "sent"` guard closes
the common case (crash after commit, before ack). Closing the residual window needs an
idempotency key on Evolution's side, which does not exist.

## 9. Frontend

`app/(hooks)/hooks/BotWA/useBotWA.ts`:

- `Recipient` gains optional `message`.
- `useBulkSendWhatsApp` now resolves to `{ jobId, accepted, rejected }` (`202`).
- New `useBulkJobStatus(jobId)` — `enabled: !!jobId`, `refetchInterval: 1500`,
  polling stops when `status` is terminal (`completed | partial | failed`).
- `useSendToParents` keeps its signature and now sends all recipients in one call.

Call sites:

- `dashboard/teacher/attendance/[id]/page.tsx` and
  `dashboard/teacher/attendance/tahfidz/[id]/page.tsx` — build the recipient array in
  one pass, keeping the existing random-template selection and `{name}`/`{status}`/
  `{notes}` substitution, and put the rendered text into `recipient.message`. Then a
  **single** `mutateAsync`. Success and failure counts come from the polled job items,
  so the existing toasts are preserved verbatim. The `setTimeout(800)` loop and the
  `delayMs: 500` per-request value are removed; rate limiting is now worker-side.
- `dashboard/student/payment/page.tsx` — single recipient, immediately followed by
  `toast.success("Pembayaran berhasil!")`. Its message needs no per-recipient
  rendering, so it sends `message` with `{name}` and polls only to surface a delivery
  failure.

## 10. Deployment

The production runner stage copies only `.next/standalone`, `.next/static`, `public`,
and `package.json` — **no `node_modules`**. `worker/index.ts` is unreachable from every
Next entrypoint, so `output: "standalone"` tracing can never include it. The worker
therefore needs its own stage, built from `builder` (which has `node_modules`, the
generated Prisma client, and the full source):

```dockerfile
FROM builder AS worker
CMD ["bun", "worker/index.ts"]
```

`docker-compose.yml` gains a second service, mirroring the existing `cleanup` sidecar
pattern already in the file:

- `build: { context: ., dockerfile: Dockerfile, target: worker }`
- `env_file: .env.production`
- `restart: unless-stopped`
- no published ports, not in front of the healthcheck
- same `logging`, `tmpfs`, and `security_opt` blocks as `app`

Also:

- `package.json`: add `"worker": "bun worker/index.ts"` for local dev.
- `.env.production`: add `RABBITMQ_URL`. Local `.env` already has it.
- Remove the `bullmq` dependency (unused; its Redis is absent from the repo).

## 11. Flagged, out of scope

- `POST /api/botwa/bulk/send` and `GET /api/botwa/bulk/send` perform no session or role
  check. Any unauthenticated caller can send WhatsApp from the school's number. The
  queue makes this worse to abuse (the API now accepts and persists work without the
  sender's identity being established), so a guard is recommended as an immediate
  follow-up task. `createdBy` exists on `BulkJob` to receive it.
- `AGENTS.md` references `.env.example`, which does not exist. `.env` holds broker
  credentials for a public IP.
- Plaintext credentials in `.env`; no TLS (`5671` is closed, only `5672` is open).

## 12. Verification

1. `npx prisma generate` and `bunx tsc --noEmit`.
2. `npx prisma migrate dev --name add_bulk_job`.
3. Smoke against the real broker (72.61.140.54:5672, reachable — verified):
   start the worker, `POST` a 2-recipient job, assert the job reaches `completed` with
   two `sent` items carrying Evolution `messageId`s. This sends real WhatsApp messages,
   so the two test numbers must be supplied before the run.
4. Failure path: include one invalid number, assert the item retries through
   `1s → 5s → 30s`, lands in `botwa.bulk.dlq`, and the job ends `partial`.
5. Idempotency: stop the worker mid-batch, restart, assert already-`sent` items are not
   re-sent.
6. One `bun test` file (Bun's built-in runner — no new dependency, no framework
   config) covering the two pure functions that carry real logic: `nextRetryQueue` and
   the `{name}` fallback body resolution. The repository has no test convention, so
   this is intentionally a single file rather than a suite.

## 13. File manifest

| Path | Action |
|---|---|
| `prisma/schema.prisma` | modify — add `BulkJob`, `BulkJobItem` |
| `prisma/migrations/**` | new — `add_bulk_job` |
| `lib/rabbitMQ/rabbitMQ.ts` | rework — no credential fallback, reconnect, confirm channel, drop unused `getChannel` |
| `lib/rabbitMQ/topology.ts` | new — queue/exchange names, arguments, `assertTopology()` |
| `lib/rabbitMQ/retry.ts` | new — `nextRetryQueue()`, body resolution |
| `lib/rabbitMQ/retry.test.ts` | new — one `bun test` file |
| `worker/index.ts` | new — consumer |
| `app/(backend)/api/botwa/bulk/send/route.ts` | rewrite `POST`, keep `GET` |
| `app/(backend)/api/botwa/bulk/jobs/[id]/route.ts` | new — status endpoint |
| `app/(backend)/api/botwa/bulk/consumer/` | delete |
| `app/(hooks)/hooks/BotWA/useBotWA.ts` | modify — contract + polling hook |
| `app/(frontend)/(dashboard)/dashboard/teacher/attendance/[id]/page.tsx` | modify — single batched send |
| `app/(frontend)/(dashboard)/dashboard/teacher/attendance/tahfidz/[id]/page.tsx` | modify — single batched send |
| `app/(frontend)/(dashboard)/dashboard/student/payment/page.tsx` | modify — poll for delivery failure |
| `worker/` + `Dockerfile` | new stage `worker` |
| `docker-compose.yml` | modify — add `worker` service |
| `package.json` | modify — `worker` script, drop `bullmq` |
| `.env.production` | modify (ops) — add `RABBITMQ_URL` |
