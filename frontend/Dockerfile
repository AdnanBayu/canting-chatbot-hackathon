# Base image
FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Pass build arguments for NEXT_PUBLIC variables
# These must be set at build time to be embedded in the client-side bundle
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_AUTH_PHONE_NUMBER
ARG NEXT_PUBLIC_AUTH_USERNAME
ARG NEXT_PUBLIC_AUTH_PASSWORD
ARG NEXT_PUBLIC_AUTH_NAME

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_AUTH_PHONE_NUMBER=$NEXT_PUBLIC_AUTH_PHONE_NUMBER
ENV NEXT_PUBLIC_AUTH_USERNAME=$NEXT_PUBLIC_AUTH_USERNAME
ENV NEXT_PUBLIC_AUTH_PASSWORD=$NEXT_PUBLIC_AUTH_PASSWORD
ENV NEXT_PUBLIC_AUTH_NAME=$NEXT_PUBLIC_AUTH_NAME

RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Disable telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
