ARG NODE_VERSION=26
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
ENV APP_NAME="stackspulse"
# No git in the image: keep the root `prepare` script (`vp config`) from installing hooks
ENV VP_GIT_HOOKS=0

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
COPY --link ./package.json ./
# Node 25+ no longer ships corepack; pnpm switches itself to the `packageManager` pin.
RUN npm install --global --allow-scripts=pnpm pnpm@12
RUN pnpm install turbo@^2 --global
RUN pnpm install @dotenvx/dotenvx@^2 --global

# --- Turbo stage ---

FROM base AS builder
WORKDIR /app
RUN apk update && \
    apk add --no-cache libc6-compat
COPY . .
RUN turbo prune $APP_NAME --docker

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

# Build application
RUN pnpm turbo run build --filter=$APP_NAME...

# --- Runner stage ---

FROM base AS runner
WORKDIR /app

# Copy built application
COPY --from=installer /app/apps/web/.next/standalone ./
COPY --from=installer /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer /app/apps/web/public ./apps/web/public
COPY ./apps/web/.env.production.local ./.env.production.local

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD dotenvx run -- node apps/web/server.js
