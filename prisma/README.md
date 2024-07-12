## Create a new migration

```bash
pnpm dotenvx run --env-file=.env.production.local --env-file=.env.production -- pnpm prisma migrate dev --create-only
```

## Apply the migration

```bash
pnpm dotenvx run --env-file=.env.production.local --env-file=.env.production -- pnpm prisma migrate deploy
```
