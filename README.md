# stackspulse

Real-Time Gateway to Stacks DeFi.

## Getting Started

First, run the development server:

```bash
pnpm dev
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
