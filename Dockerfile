ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY --link ./package.json ./
RUN corepack enable && corepack install

# Optimize the node_modules production folder
FROM base AS prod-deps
COPY --link . .
RUN node scripts/docker-runtime-deps.mjs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apk update && \
    apk add build-base gyp pkgconfig python3

# Install node modules
COPY --link package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY --link . .

# Add fake environment file for build to succeed
COPY --link .env.production.build .env.production.local
RUN pnpm db:push

# Build application
RUN pnpm run build

# Final stage for app image
FROM base
WORKDIR /app

# Copy built application
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/drizzle ./drizzle
COPY --from=prod-deps /app/.env.production.local ./.env.production.local

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Setup sqlite on a separate volume
RUN mkdir -p /data
VOLUME /data
ENV DATABASE_PATH="file:/data/sqlite.db"

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD pnpm dotenvx run -- node server.js
