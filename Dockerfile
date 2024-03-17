# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine as base

LABEL fly_launch_runtime="Next.js"

# Next.js app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"
# Set the database URL to a file before the build
ENV DATABASE_PATH="/data/sqlite.db"

# Install pnpm
ARG PNPM_VERSION=8.15.2
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apk update && \
    apk add build-base gyp pkgconfig python3

# Install node modules
COPY --link package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY --link . .

# Create temporary directory and db for the build to pass
RUN mkdir -p /data
RUN pnpm db:migrate

# Build application
RUN --mount=type=secret,id=CHAINHOOKS_API_TOKEN \
    CHAINHOOKS_API_TOKEN="$(cat /run/secrets/CHAINHOOKS_API_TOKEN)" \
    pnpm run build

# Remove development dependencies
RUN pnpm prune --prod


# Final stage for app image
FROM base
WORKDIR /app

# Copy built application
# TODO optimise this to not include the node_modules folder
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/node_modules ./node_modules

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# Setup sqlite3 on a separate volume
RUN mkdir -p /data
VOLUME /data

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD pnpm db:migrate && node server.js
