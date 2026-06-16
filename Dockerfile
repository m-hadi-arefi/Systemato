FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ── deps: فقط وابستگی‌های production ──────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# ── builder: build کردن Next.js ────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# تولید Prisma client قبل از build
RUN npx prisma generate

# متغیرهای placeholder برای build-time (مقادیر واقعی موقع runtime می‌آیند)
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=build-secret-replace-at-runtime
ENV DATABASE_URL=postgresql://postgres:postgres@db:5432/systemato
ENV MINIO_ENDPOINT=minio
ENV MINIO_PORT=9000
ENV MINIO_ACCESS_KEY=minioadmin
ENV MINIO_SECRET_KEY=minioadmin
ENV MINIO_BUCKET=systemato-media
ENV MINIO_PUBLIC_URL=http://localhost:9000

RUN npm run build

# ── runner: image نهایی production ────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# کپی فایل‌های build شده
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# کپی prisma schema برای migrate در runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
