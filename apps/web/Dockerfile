ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV APP_NAME="stackspulse"

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY --link ./package.json ./
RUN corepack enable && corepack install
RUN pnpm install turbo@^2 --global

# --- Turbo stage ---

FROM base AS builder
WORKDIR /app
RUN apk update && \
    apk add --no-cache libc6-compat
COPY . .
RUN turbo prune $APP_NAME --docker

# --- Prod deps stage ---

# Optimize the node_modules production folder
FROM base AS prod-deps
COPY --link . .
# RUN node scripts/docker-runtime-deps.mjs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# --- Build stage ---

FROM base as installer
WORKDIR /app

RUN apk update && \
    apk add --no-cache libc6-compat build-base gyp pkgconfig python3

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false

COPY --from=builder /app/out/full/ .

WORKDIR /app/apps/web

# Add fake environment file for build to succeed
COPY ./apps/web/.env.production.build .env.production.local
RUN pnpm db:push

# Build application
RUN pnpm turbo run build --filter=$APP_NAME...

# --- Runner stage ---

FROM base AS runner
WORKDIR /app

# Copy built application
COPY --from=prod-deps /app/apps/web/node_modules ./node_modules
COPY --from=installer /app/apps/web/package.json ./package.json
COPY --from=installer /app/apps/web/scripts ./scripts
COPY --from=installer /app/apps/web/drizzle.config.ts ./drizzle.config.ts
COPY --from=installer /app/apps/web/drizzle ./drizzle
COPY --from=prod-deps /app/apps/web/.env.production.local ./.env.production.local

COPY --from=installer /app/apps/web/.next/standalone ./
COPY --from=installer /app/apps/web/.next/static ./.next/static
COPY --from=installer /app/apps/web/public ./public

# Setup sqlite on a separate volume
RUN mkdir -p /data
VOLUME /data
ENV DATABASE_PATH="file:/data/sqlite.db"

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD pnpm dotenvx run -- node server.js
