# GuitarTribe 🎸

> Independent guitar comparison engine — compare every acoustic, electric, bass, classical guitar and more, spec by spec.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4)](https://tailwindcss.com)

## Features

- 🔍 **Full-text search** powered by Meilisearch
- ⚖️ **Side-by-side compare** up to 5 instruments
- 🏆 **Expert & user score** aggregation
- 💰 **Live prices** from Sweetwater, Thomann, Amazon & more
- 🥇 **Ranked lists** for every budget and category
- 👤 **Auth** via GitHub / Google (Better Auth)
- 👷 **Admin panel** with crawl jobs, review moderation, user management
- 🤖 **ETL pipeline** — Wikidata SPARQL, retailer crawlers, normalizer, merger
- 🚀 **CI/CD** via GitHub Actions → Vercel

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + shadcn/ui + Framer Motion |
| Styling | Tailwind CSS 3 |
| Database | PostgreSQL + Prisma 6 |
| Cache | Redis (Upstash REST) |
| Search | Meilisearch |
| Auth | Better Auth |
| Images | Cloudinary |
| Deploy | Vercel + Docker |
| Tests | Vitest + Playwright |

## Local setup

```bash
# 1. Clone
git clone https://github.com/nhatnam232/gt
cd gt

# 2. Install deps
npm install

# 3. Start local services (Postgres, Redis, Meilisearch)
docker compose up -d

# 4. Configure env
cp .env.example .env.local
# Edit .env.local (Docker defaults work out of the box)

# 5. Database setup
npm run db:migrate
npm run db:seed

# 6. Import real guitar data from Wikidata & retailers
npm run etl:all

# 7. Start dev server
npm run dev
# → http://localhost:3000
```

> After `etl:all`, go to **`/admin/guitars`** and click **Approve** on instruments you want to publish. Raw crawl data defaults to `isPublished: false` for editorial review.

## Admin panel

Go to `/admin` after signing in with an email listed in `ADMIN_EMAILS`.

| Route | Purpose |
|---|---|
| `/admin` | Dashboard + quick actions |
| `/admin/guitars` | Browse, publish, edit instruments |
| `/admin/crawler` | Enqueue & monitor ETL jobs |
| `/admin/rankings` | Trigger search re-index |
| `/admin/reviews` | Moderate user reviews |
| `/admin/users` | Ban / role management |

## ETL commands

```bash
npm run etl:all          # Full pipeline
npm run etl:brands       # Sync brand metadata
npm run etl:wikidata     # Import from Wikidata SPARQL
npm run etl:prices       # Refresh retailer prices
npm run etl:normalize    # Infer categories & specs
npm run etl:index        # Re-index Meilisearch
npm run etl:rankings     # Rebuild ranking lists
```

## Tests

```bash
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright end-to-end
```

## Deploy to Vercel

```bash
vercel deploy
```

Set these env vars in Vercel Dashboard:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon / Vercel Postgres (pooled) |
| `DIRECT_URL` | Direct Postgres URL (for migrations) |
| `UPSTASH_REDIS_REST_URL` + `_TOKEN` | Upstash Redis |
| `MEILISEARCH_HOST` + `_MASTER_KEY` | Meilisearch Cloud |
| `CLOUDINARY_CLOUD_NAME` + `API_KEY` + `API_SECRET` | Image uploads |
| `BETTER_AUTH_SECRET` | ≥32 random chars |
| `BETTER_AUTH_URL` | Your production URL |
| `GITHUB_CLIENT_ID` + `_SECRET` | GitHub OAuth |
| `GOOGLE_CLIENT_ID` + `_SECRET` | Google OAuth |
| `ADMIN_EMAILS` | Comma-separated admin emails |
| `CRON_SECRET` | Shared cron auth token |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |

## Architecture

```
src/
├── app/           # Next.js App Router pages & API routes
├── components/    # React UI components
├── config/        # Site, nav, brands, specs config
├── domain/        # Domain types (GuitarQuery, SortOptions)
├── lib/           # prisma, redis, auth, search, utils
├── server/
│   ├── actions/     # Next.js Server Actions
│   └── repositories/ # DB access layer
etl/
├── cli.ts         # CLI entry point
├── crawlers/      # Brand, Wikidata, Retailer, Price crawlers
├── transformers/  # Normalizer, Merger
├── services/      # Index service, Ranking service
└── scheduler.ts   # Cron job dispatcher
tests/
├── unit/          # Vitest unit tests
└── e2e/           # Playwright e2e tests
```

## License

MIT
