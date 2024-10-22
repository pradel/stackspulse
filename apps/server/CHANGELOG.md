# @stackspulse/server

## 0.16.2

## 0.16.1

### Patch Changes

- 485e42d: Fix token contract address when it's deployed to multiple chains.

## 0.16.0

### Minor Changes

- d21feef: Create new `/api/tokens/resolve` route.
- d21feef: Create new `/api/tokens/markets` route.

## 0.15.1

## 0.15.0

### Minor Changes

- e46cb5c: Create new `/tokens/holders` route.
- 51cf12d: Create new `/tokens/transaction-volume` route.

### Patch Changes

- 82a6e5d: Upgrade `@stacks/blockchain-api-client` to v8.

## 0.14.3

### Patch Changes

- e19d6e7: Upgrade deps.

## 0.14.2

### Patch Changes

- e1d39e4: Latest charisma contracts.

## 0.14.1

## 0.14.0

### Minor Changes

- ed604c9: Upgrade image to node v22.

### Patch Changes

- 8629586: Migrate protocols list to a separate package.

## 0.13.0

### Patch Changes

- f856fd5: Migrate `/api/protocols/stackingdao` route.

## 0.12.0

### Minor Changes

- f6899ee: Add /api/transactions route.

## 0.11.0

### Minor Changes

- 923e4ea: Add flag to API routes to bypass the cache.

## 0.10.4

### Patch Changes

- 9305fa0: Fix turso usage in local dev.

## 0.10.3

### Patch Changes

- 9fadf8a: Setup sentry error reporting.
- 524bb57: Fix turso usage in local dev.

## 0.10.2

### Patch Changes

- d71c5bb: Fix turso package not working in docker.

## 0.10.1

### Patch Changes

- ab867c8: Fix docker release script.

## 0.10.0

### Minor Changes

- e7b2dea: Add turso unstorage driver for faster boot time when going out of sleep.

### Patch Changes

- 2ff77fb: Migrate `/api/transactions/unique-senders` route.
- 6eb1cbb: Add fly server health check.

## 0.9.2

### Patch Changes

- 6e4b72c: Add /health route.

## 0.9.1

## 0.9.0

### Patch Changes

- d0f542a: Move /api/root/upsert-dapps to api server.

## 0.8.0

### Minor Changes

- cc29346: Create new `/transactions/stats` route.

### Patch Changes

- 20d47b2: Add Fly config.
- f0129c3: Add cors config.

## 0.7.2

### Patch Changes

- c077e5e: Fix docker build.

## 0.7.1

### Patch Changes

- 18b6017: Fix docker build.

## 0.7.0

### Minor Changes

- aa45916: Create separate API server with nitro.
