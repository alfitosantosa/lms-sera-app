# RabbitMQ-backed WhatsApp bulk send — Design

Date: 2026-10-06
Status: awaiting review
Revision 2 — async contract changed to fire-and-forget per user direction. The
persisted-job + polling design in revision 1 is superseded; this revision removes the
`BulkJob` / `BulkJobItem` models, the migration, the job status endpoint, and the
polling hook.

## 1. Problem

`POST /api/botwa/bulk/send` sends WhatsApp messages **synchronously inside the HTTP
request** (`for` loop + `delay(1000)`). The two teacher flows do worse: they call the
endpoint **once per student** from the browser with a client-side `setTimeout(800)`
between calls.

Consequences today:

- 40 students = 40 sequential browser requests; the tab must stay open.
- No retry: a transient Evolution API failure loses the notification permanently.
- No durability: a deploy or crash mid-loop drops the remaining messages.
- Rate limiting is per-browser-session, not global — concurrent teachers multiply load.

RabbitMQ is half-wired in the tree and **carries no traffic at all**:

- `lib/rabbitMQ/rabbitMQ.ts` — untracked, exports `getChannel()` / `closeConnection()`.
- `app/(backend)/api/botwa/bulk/send/route.ts` — imports `getChannel`, never calls it.
- `app/(backend)/api/botwa/bulk/consumer/route.ts` — untracked, **byte-identical copy**
  of the send route (`diff` reports IDENTICAL). It is not a consumer.
- `bullmq` is a declared dependency, unused, and requires Redis, which exists nowhere
  in this repository.

Nothing publishes and nothing consumes.

## 2. Goals

1. One HTTP request enqueues a whole batch and returns immediately, regardless of
   recipient count.
2. The UI reports success as soon as the batch is queued — it does not wait for
   delivery.
3. A long-lived worker performs the sends, survives process restart, and retries
   transient failures with increasing delays.
4. Global rate limiting, independent of how many browsers are sending.
5. Failed and stale messages remain inspectable without any application code.

## 3. Non-goals

- Per-recipient delivery status in the UI. Accepted consequence of goal 2: the toast
  reports "queued", not "delivered". Audit is via `botwa.bulk.dlq` and the RabbitMQ
  management UI.
- Auth on the botwa routes. Both are unauthenticated today; this work neither fixes
  nor worsens that. Listed in §10 as a separate task.
- Moving WhatsApp message templates server-side.
- Job history, cancellation, or scheduled sends.

## 4. Decisions already taken

| Decision | Value | Rationale |
|---|---|---|
| Scope | Finish queue-backed bulk send | User |
| Broker | External only (`.env` `RABBITMQ_URL`) | User; no compose service for the broker |
| Async contract | **Fire-and-forget** — UI succeeds immediately, backend queues | User, revision 2 |
| Broker version | RabbitMQ 3.13.7, Erlang 26.2.5.16, cluster `rabbit@rabbitmq-node` | Verified via management API on port 15672 |
| Queue type | Quorum | Version supports it; durable, replicated metadata |

## 5. Topology

Two durable direct exchanges:

- `botwa.bulk` — routing key `botwa.bulk.send`
- `botwa.bulk.dlx` — routing key `botwa.bulk.dead`

All queues are durable **quorum** (`x-queue-type: quorum`).

| Queue | Binding | Arguments | Purpose |
|---|---|---|---|
| `botwa.bulk.send.q` | `botwa.bulk` ← `botwa.bulk.send` | `x-message-ttl: 86400000`, `x-max-length: 50000`, `x-overflow: reject-publish-dlx`, DLX → `botwa.bulk.dlx` / `botwa.bulk.dead` | Work queue, consumed by the worker |
| `botwa.bulk.retry.1s` | `botwa.bulk` ← `botwa.bulk.retry.1s` | `x-message-ttl: 1000`, DLX → `botwa.bulk` / `botwa.bulk.send` | Retry stage 1 |
| `botwa.bulk.retry.5s` | `botwa.bulk` ← `botwa.bulk.retry.5s` | `x-message-ttl: 5000`, DLX → `botwa.bulk` / `botwa.bulk.send` | Retry stage 2 |
| `botwa.bulk.retry.30s` | `botwa.bulk` ← `botwa.bulk.retry.30s` | `x-message-ttl: 30000`, DLX → `botwa.bulk` / `botwa.bulk.send` | Retry stage 3 |
| `botwa.bulk.dlq` | `botwa.bulk.dlx` ← `botwa.bulk.dead` | — | Terminal, no consumer |

Three queue arguments carry reliability weight:

- `x-message-ttl: 86400000` (24 h) on the work queue — an attendance notice delivered
  three days late is worse than not delivered. Anything the worker did not reach within
  24 h dead-letters instead of firing stale.
- `x-max-length: 50000` + `x-overflow: reject-publish-dlx` — if the worker is down,
  publishes stop growing the queue at a bound and dead-letter instead. This is the
  backpressure mechanism: overload becomes a `rejected` count in the API response and
  visible messages in the DLQ, not unbounded RAM.
- Retries use **queue-level TTL**, not per-message expiration: canonical pattern, and it
  sidesteps quorum-queue head-of-line caveats around per-message TTL. No
  delayed-message-exchange plugin required.

A retry is a republish by the worker to `botwa.bulk` with routing key
`botwa.bulk.retry.{1s,5s,30s}`; the TTL expires and the queue's DLX routes it back to
`botwa.bulk.send.q`.

### Message contract

Body — self-contained, because there is no database in this design:

```json
{
  "batchId": "string",
  "number": "string",
  "name": "string | null",
  "message": "string",
  "delayMs": 1000
}
```

`batchId` is a `cuid()` generated by the API; it exists solely so every message from
one request is correlatable in the worker logs. `message` is the **final rendered
text** — see §7 for why the rendering cannot happen in the worker.

Properties: `persistent: true`, `contentType: application/json`, `messageId: batchId`,
and for retries header `x-attempt: <number>`.

### Retry decision

`nextRetryQueue(attempt: number): string | null`, where `attempt` is the failure count
after incrementing:

| attempt | result |
|---|---|
| 1 | `botwa.bulk.retry.1s` |
| 2 | `botwa.bulk.retry.5s` |
| 3 | `botwa.bulk.retry.30s` |
| ≥ 4 | `null` → publish to `botwa.bulk.dlx` |

Total delivery attempts per message: 1 initial + 3 retries = 4.

## 6. Data model

None. This design adds no Prisma model and no migration.

The worker needs nothing from the database: the recipient and the final body travel in
the message. This is the direct consequence of choosing fire-and-forget — with no UI
reading delivery status, the job tables would be written by nobody and read by nobody.

Delivery evidence without a schema:

- `botwa.bulk.dlq` holds every message that exhausted its retries, still carrying
  `batchId`, `number`, and `x-attempt`. Inspectable in the management UI at
  `http://72.61.140.54:15672` (queue `botwa.bulk.dlq` → Get messages).
- Successful sends are logged by the worker with `batchId` and the Evolution
  `messageId`.

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
2. Generate `batchId`.
3. For each recipient, publish one persistent message on a **confirm channel** with
   `mandatory: true`, where the body's `message` is
   `recipient.message ?? body.message.replace(/\{name\}/gi, recipient.name ?? "")`.
4. Await the confirms. A `nack`, a `basic.return` (unroutable), or a
   `reject-publish-dlx` overflow counts as rejected.
5. Respond **`200 { batchId, accepted, rejected }`** — as soon as the batch is queued.
   The UI does not wait for delivery.
6. Respond **`503`** only when the broker is unreachable and nothing was queued.
   Message `"Layanan antrian sedang tidak tersedia"`.

Note on §7.3: the `{name}` fallback keeps the single-recipient payment caller working
unchanged, and lets the payment page keep sending one shared template. The attendance
and tahfidz pages must supply a rendered `recipient.message` instead — they pick a
**random template per student** and substitute `{status}` and `{notes}` from that
student's attendance record, values that exist only in the browser and therefore cannot
be reproduced by the worker.

Ordering: `{name}` substitution happens client-visible-side (API) at publish time, so a
retry re-sends byte-identical text. Nothing in the worker depends on mutable state.

### `GET /api/botwa/bulk/send` (unchanged)

The Evolution API connection check consumed by `useGetConnectionBotWa` with a 30 s
refetch interval. Behaviour is preserved exactly.

### Deleted

`app/(backend)/api/botwa/bulk/consumer/` — a byte-identical duplicate of the send route,
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

1. Parse the body. Missing `number` or `message` → publish to `botwa.bulk.dlx`, ack.
2. `sendWhatsAppMessage(number, message)`.
3. Success → log `batchId` + Evolution `messageId`, ack.
4. Failure → increment `x-attempt`; look up `nextRetryQueue(attempt)`; republish a
   persistent copy with the incremented header to the retry queue, or publish to
   `botwa.bulk.dlx` when it returns `null`. Log the error either way.
5. **Ack the original in every path** — success, retry, and dead-letter. Never
   `nack(requeue: true)`; requeue loops are the known self-inflicted DoS.
6. Sleep `delayMs` from the message after handling it, to respect the Evolution rate
   limit.

### Shutdown

`SIGTERM` / `SIGINT` → cancel the consumer, wait for the in-flight handler, close the
channel and connection, exit. Unacked messages return to the queue automatically and are
redelivered on restart.

### Reconnection

The worker retries the connection with exponential backoff indefinitely — it must
survive a broker restart. The API does the opposite: fail fast with `503`, because an
HTTP request cannot wait for a broker to come back.

### Known ceiling

`ponytail:` at-least-once delivery, and with no database there is no idempotency guard
left to write. A crash after Evolution accepts a message but before the ack means that
message is redelivered and re-sent, so a parent can receive a duplicate. Bounded by the
fact that the window is a single ack; closing it needs either a dedup store (the removed
job tables) or an idempotency key on Evolution's side, which does not exist. Accepted
deliberately in exchange for the immediate-UI-success behaviour.

## 9. Frontend

`app/(hooks)/hooks/BotWA/useBotWA.ts`:

- `Recipient` gains optional `message`.
- `useBulkSendWhatsApp` resolves to `{ batchId, accepted, rejected }`.
- `useSendToParents` keeps its signature and sends all recipients in one call.

Call sites:

- `dashboard/teacher/attendance/[id]/page.tsx` and
  `dashboard/teacher/attendance/tahfidz/[id]/page.tsx` — build the recipient array in
  one pass, keeping the existing random-template selection and `{name}`/`{status}`/
  `{notes}` substitution, and put the rendered text into `recipient.message`. Then a
  **single** `mutateAsync`, and on success toast
  `"N notifikasi WhatsApp sedang dikirim."`. The `setTimeout(800)` loop and the per-request
  `delayMs: 500` are removed; rate limiting is now worker-side and global. The old
  `successCount` / `failCount` toasts are replaced, since the response no longer carries
  per-recipient outcomes.
- `dashboard/student/payment/page.tsx` — single recipient, `message` with `{name}`, no
  change to its immediate `toast.success("Pembayaran berhasil!")`.

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

`docker-compose.yml` gains a second service, mirroring the `cleanup` sidecar pattern
already in the file:

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
  queue makes this worse to abuse — the API now accepts a batch and returns success
  without the sender's identity being established — so a guard is recommended as an
  immediate follow-up task.
- `AGENTS.md` references `.env.example`, which does not exist.
- Broker credentials sit in plaintext in `.env` for a public IP; no TLS (`5671` is
  closed, only `5672` is open).
- No delivery audit in the app. Revisit only if "did the parents actually get it?"
  becomes a recurring question — that is the trigger to reintroduce the job tables.

## 12. Verification

1. `bunx tsc --noEmit`.
2. Smoke against the real broker (72.61.140.54:5672, reachable — verified): start the
   worker, `POST` a 2-recipient batch, assert HTTP `200` returns before any message is
   delivered, and that the worker logs two successes with Evolution `messageId`s. This
   sends real WhatsApp messages, so the two test numbers must be supplied before the run.
3. Failure path: include one invalid number, assert the message retries through
   `1s → 5s → 30s` and lands in `botwa.bulk.dlq` with `attempt: 4`. Verify from the
   management UI, not from application code.
4. Durability: stop the worker, `POST` a batch, assert `accepted` equals the recipient
   count and the work queue depth grows; start the worker, assert the queue drains.
5. One `bun test` file (Bun's built-in runner — no new dependency, no framework config)
   covering the two pure functions that carry real logic: `nextRetryQueue` and the body
   resolution (`recipient.message` override plus `{name}` fallback). The repository has
   no test convention, so this is intentionally a single file rather than a suite.

## 13. File manifest

| Path | Action |
|---|---|
| `lib/rabbitMQ/rabbitMQ.ts` | rework — no credential fallback, reconnect, confirm channel, drop unused `getChannel` |
| `lib/rabbitMQ/topology.ts` | new — queue/exchange names, arguments, `assertTopology()` |
| `lib/rabbitMQ/retry.ts` | new — `nextRetryQueue()`, body resolution |
| `lib/rabbitMQ/retry.test.ts` | new — one `bun test` file |
| `worker/index.ts` | new — consumer |
| `app/(backend)/api/botwa/bulk/send/route.ts` | rewrite `POST`, keep `GET` |
| `app/(backend)/api/botwa/bulk/consumer/` | delete |
| `app/(hooks)/hooks/BotWA/useBotWA.ts` | modify — `{ batchId, accepted, rejected }` |
| `app/(frontend)/(dashboard)/dashboard/teacher/attendance/[id]/page.tsx` | modify — single batched send |
| `app/(frontend)/(dashboard)/dashboard/teacher/attendance/tahfidz/[id]/page.tsx` | modify — single batched send |
| `app/(frontend)/(dashboard)/dashboard/student/payment/page.tsx` | modify — pass `{name}` template |
| `Dockerfile` | new stage `worker` |
| `docker-compose.yml` | modify — add `worker` service |
| `package.json` | modify — `worker` script, drop `bullmq` |
| `.env.production` | modify (ops) — add `RABBITMQ_URL` |
