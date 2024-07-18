ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV APP_NAME="@stackspulse/server"

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY --link ./package.json ./
RUN corepack enable && corepack install
RUN pnpm install turbo@^2 --global
RUN pnpm install @dotenvx/dotenvx@^1 --global

# --- Turbo stage ---

FROM base AS builder
WORKDIR /app
COPY . .
RUN turbo prune $APP_NAME --docker

# --- Build stage ---

FROM base as installer
WORKDIR /app

RUN apk update && \
    apk add --no-cache libc6-compat python3 g++ make

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false

COPY --from=builder /app/out/full/ .

WORKDIR /app/apps/web

# Build application
RUN pnpm turbo run build --filter=$APP_NAME...

# --- Runner stage ---

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nitro

# Copy built application
COPY --from=installer --chown=nitro:nodejs /app/apps/server/.output ./.output
COPY --from=installer --chown=nitro:nodejs /app/apps/server/package.json ./package.json
COPY --from=builder --chown=nitro:nodejs /app/apps/server/.env.production.local ./.env.production.local

USER nitro

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD dotenvx run -- node .output/server/index.mjs
