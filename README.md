# jpdm.dev

JP's website (a full-stack community/CMS platform using Express.js backend, React SPA frontend, PostgreSQL database, etc)

## Quickstart

```bash
git clone https://git.jpdm.dev/jp/jpdm.dev.git
cd jpdm.dev
cp .env.example .env          # review and customize secrets
docker compose up -d
```

Open **http://localhost:8080**. Seeded credentials : admin/admin (default in .env)

> **Note:** For AI moderation features, see LITELLM_* vars in `.env.example` and `litellm.example.yml` then use below to run the app:

```bash
docker compose -f docker-compose.yml -f docker-compose.ai.yml up -d
```


## Development

Install dependencies:

```bash
npm ci                    # install dependencies
cp .env.example .env      # create .env from template
```
> **Important:** Change `POSTGRES_HOST=db` to `POSTGRES_HOST=localhost` in `.env` when running `npm run dev` outside Docker.

Then:

```bash
npm run dockerdev:up   # starts db + pgAdmin in Docker
npm run dev            # starts backend + frontend with hot-reload
```

| URL (default config) | Service |
|-----|---------|
| https://localhost:8080 | Frontend (Vite dev server) |
| http://localhost:3000 | Backend API |
| http://localhost:5050 | pgAdmin |




### Useful Commands

```bash
npm run migrate           # run migrations manually
npx kanel                 # generate model types after database/schema migration
npm run dockerdev:down    # stop dev Docker services
npm run lint              # lint all workspaces
```