# stackspulse

Real-Time Gateway to Stacks DeFi.

This project aims to provide a real-time view of Stacks DeFi ecosystem by aggregating public blockchain data and making it accessible through a easy to use interface.

## Development

First, install the dependencies:

```bash
pnpm install
```

Create and migrate the database:

```bash
pnpm db:generate
pnpm db:migrate
```

Then, run the development server:

```bash
pnpm dev
```

Once the server is running you can run the predicates of your choice using chainhooks:

```bash
chainhook predicates scan /<path-to-stackspulse>/chainhooks/arkadiko/arkadiko-swap-v2-1.swap-x-for-y.json --mainnet
```

## Deploy to production

Create a `.env.production.local` file with the following content:

```bash
CHAINHOOKS_API_TOKEN=your-prod-token
```

Generate the chainhoooks predicates with the correct settings for the production environment.

```bash
pnpm chainhooks:generate
```

Then, deploy the production server to fly (or any other provider of your choice):

```bash
fly deploy --remote-only
```

Finally upload the chainhooks predicates file `chainhooks.production.json` to the [Hiro platform](https://platform.hiro.so/) for your project.

### Add new production environment variables

To add a new encrypted production environment variable (replace `MY_NAME` and `my-value` with your values) run the following command:

```bash
pnpm dotenvx set MY_NAME "my-value" -f .env.production.local
```

If you need to read the value of an encrypted environment variable run the following command:

```bash
pnpm dotenvx get MY_NAME -f .env.production.local
```

### Download the production database locally

```bash
flyctl ssh issue --agent
flyctl proxy 10022:22
scp -r -P 10022 root@localhost:/data  /your/local/path/where/to/copy/data
```
