# stackspulse

## 0.7.0

## 0.6.6

### Patch Changes

- ba45486: Downgrade @libsql/client to 0.3.3 for docker.

## 0.6.5

### Patch Changes

- 797962e: Fix docker build.

## 0.6.4

### Patch Changes

- 32b1a60: Fix docker dotenvx command.

## 0.6.3

### Patch Changes

- b32c337: Fix docker dotenvx command.

## 0.6.2

### Patch Changes

- 20c932a: Fix docker build.

## 0.6.1

### Patch Changes

- 002e3c1: Fix docker build.

## 0.6.0

### Minor Changes

- 5d1e41f: Move stackspulse to a monorepo.

## 0.5.2

### Patch Changes

- e391e45: Create new dapps table to improve the queries.
- f2070cd: Add SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-path2 to velar.

## 0.5.1

### Patch Changes

- 98795c3: Remove sqlite db migration in docker.

## 0.5.0

### Minor Changes

- 2e50688: Migrate the Top protocol query to use the stacks-blockchain-api database. It is now required to have a stacks node and API running for Stackspulse.

### Patch Changes

- 2e50688: Make weekly users cron job route use the new protocol users API.

## 0.4.0

### Minor Changes

- a1716c8: Use react-query to send requests to the API.
- ec37e9e: Create ansible config for the stacks-node server.

### Patch Changes

- a1716c8: Create new `/api/transactions` route that returns the list of transactions for a given protocol.
- b62e648: Create new `/api/protocols/users` route that returns the unique users by protocols.
- b62e648: Filter top protocols by last 7 days, 30 days or all.
- 2beddd7: Add info tooltips to give more context on numbers.

## 0.3.0

### Minor Changes

- 9149f93: Track new alex contracts.

## 0.2.6

### Patch Changes

- 638b832: Install package manager in docker for faster cold start.

## 0.2.5

### Patch Changes

- a5e48bc: Upgrade deps and change the way secrets are handled.

## 0.2.4

### Patch Changes

- 51c2436: Fix issue when processing chainhook without any events to apply.

## 0.2.3

### Patch Changes

- 986a819: Refactor action types.
- 6d746a6: Fix issue when processing chainhook without any apply event.

## 0.2.2

### Patch Changes

- 8ebcffa: Add author to footer.

## 0.2.1

### Patch Changes

- 77902cd: Fix await when running libsql migration.

## 0.2.0

### Minor Changes

- c251613: Migrate to libsql.

## 0.1.12

### Patch Changes

- c04f801: Redirect from stackspulse.com to www.stackspulse.com.

## 0.1.11

### Patch Changes

- da21fbc: Fix publish tag.

## 0.1.10

### Patch Changes

- 9171897: Fix publish tag.

## 0.1.9

### Patch Changes

- 88d7cc8: Fix publish tag.

## 0.1.8

### Patch Changes

- be0fd03: Fix publish tag.

## 0.1.7

### Patch Changes

- 423ffb5: Fix publish tag.

## 0.1.6

### Patch Changes

- 4450155: Fix publish tag.

## 0.1.5

### Patch Changes

- 4a6d71b: Fix publish tag.

## 0.1.4

### Patch Changes

- 1e28758: Fix publish tag.

## 0.1.3

### Patch Changes

- 132a3bc: Fix publish tag.

## 0.1.2

### Patch Changes

- 0e49bd1: Setup sentry monitoring.

## 0.1.1

### Patch Changes

- 9179789: Fix publish github tag.

## 0.1.0

### Minor Changes

- ed4af3b: This is the first tagged release of stackspulse 🎊.
