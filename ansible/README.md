# Server Configuration

Ansible playbook to configure the server.

## Getting Started

Copy the inventory example file:

```bash
$ cp hosts.ini.example hosts.ini
```

Update the `<host1>` with your server's IP address:

```bash
$ vim hosts.ini
```

Copy the vars example file:

```bash
$ cp vars.yml.example vars.yml
```

Update the values to your needs:

```bash
$ vim vars.yml
```

Run the playbook:

```bash
$ ansible-playbook -i hosts.ini -e @vars.yml playbook.yml
```

## Stacks node setup

Git clone the stacks-blockchain-docker repository and copy the sample.env file:

```bash
git clone https://github.com/stacks-network/stacks-blockchain-docker && cd stacks-blockchain-docker
cp sample.env .env
```

Now edit the .env file and set the values to your needs.

To run the long running seed script run:

```bash
tmux new -s seed-chainstate

./scripts/seed-chainstate.sh
```

To exit the tmux session while the script is running, press `CTRL + b` then `d`.

To attach to the tmux session run:

```bash
tmux attach -t seed-chainstate
```

## Database management

To sync the prisma migrations with the db run:

```bash
pnpm dotenvx run --env-file=.env.production.local --env-file=.env.production -- pnpm prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
```

To mark the first migration as applied (will not be executed) run:

```bash
pnpm dotenvx run --env-file=.env.production.local --env-file=.env.production -- prisma migrate resolve --applied 0_init
```

## Credits

Config adapted from https://github.com/guillaumebriday/kamal-ansible-manager.
