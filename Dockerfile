FROM node:20-slim AS base
WORKDIR /app

# OpenSSL برای Prisma + curl برای healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*


# ── deps ────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline


# ── builder ─────────────────────────────────────────────
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate

ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=build-secret-replace-at-runtime
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/systemato
ENV MINIO_ENDPOINT=minio
ENV MINIO_PORT=9000
ENV MINIO_ACCESS_KEY=minioadmin
ENV MINIO_SECRET_KEY=minioadmin
ENV MINIO_BUCKET=systemato-media
ENV MINIO_PUBLIC_URL=http://localhost:3000

RUN npm run build


# ── runner ──────────────────────────────────────────────
FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs


# Next standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# custom server
COPY --from=builder --chown=nextjs:nodejs /app/dist-server ./dist-server

# Prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma


# ✅ FIX اصلی: کامل کردن node_modules برای next-auth/jwt و runtime deps
COPY --from=builder /app/node_modules ./node_modules


# ws (optional safety)
COPY --from=builder /app/node_modules/ws ./node_modules/ws


USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "dist-server/server.js"]