# ==========================================
# PRODUCTION-READY DOCKERFILE
# NEXT.JS + BUN + PRISMA
# ==========================================

# ==========================================
# Stage 1: Dependencies
# ==========================================
FROM oven/bun:latest AS deps

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile


# ==========================================
# Stage 2: Builder
# ==========================================
FROM oven/bun:latest AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    SKIP_ENV_VALIDATION=1

RUN bunx prisma generate && \
    bun run build:turbopack && \
    rm -rf /tmp/* .next/cache node_modules/.cache


# ==========================================
# Stage 3: Worker (consumer RabbitMQ)
# ==========================================
# Worker TIDAK bisa ikut image runner: runner hanya menyalin .next/standalone
# (tanpa node_modules) dan `worker/index.ts` tidak terjangkau dari entrypoint
# Next mana pun, jadi tracing standalone tidak akan pernah memasukkannya.
# Stage ini dibangun dari builder yang sudah punya node_modules + Prisma client.
#
# Sengaja diletakkan SEBELUM stage runner supaya runner tetap jadi stage
# terakhir (= target default `docker build`).
FROM builder AS worker

CMD ["bun", "worker/index.ts"]


# ==========================================
# Stage 4: Production Runner
# ==========================================
FROM oven/bun:latest AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=$PORT \
    HOSTNAME=0.0.0.0

# curl untuk healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid 1001 nextjs

# Public assets
COPY --from=builder /app/public ./public

# Package
COPY --from=builder /app/package.json ./package.json

# Next.js standalone
COPY --from=builder --chown=nextjs:nodejs \
    /app/.next/standalone ./

# Static assets
COPY --from=builder --chown=nextjs:nodejs \
    /app/.next/static ./.next/static

USER nextjs

EXPOSE $PORT

HEALTHCHECK \
    --interval=30s \
    --timeout=10s \
    --start-period=40s \
    --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

CMD ["bun", "server.js"]