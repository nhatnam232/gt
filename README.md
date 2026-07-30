# GuitarTribe

> Independent guitar database and comparison engine. Compare every acoustic, electric, bass, classical guitar and more - spec by spec.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://postgresql.org)
[![Meilisearch](https://img.shields.io/badge/Meilisearch-latest-red)](https://meilisearch.com)

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Next.js Server Actions, Route Handlers |
| Database | PostgreSQL 16 + Prisma ORM |
| Caching | Redis (Upstash in production) |
| Search | Meilisearch (falls back to Postgres full-text) |
| Storage | Cloudinary |
| Auth | Better Auth (email + GitHub + Google OAuth) |
| Analytics | Vercel Analytics + Speed Insights |
| Deployment | Vercel |
| ETL | Custom crawler (cheerio, p-limit, Wikidata SPARQL) |

---

## Quick start (local)

### Prerequisites

- Node.js 20+
- Docker (for Postgres, Redis, Meilisearch)

### 1. Clone and install

```bash
git clone https://github.com/nhatnam232/gt.git
cd gt
npm install
```

### 2. Start services

```bash
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- Meilisearch on `localhost:7700`

### 3. Configure environment

```bash
cp .env.example .env.local
```

The defaults in `.env.example` match the Docker Compose services, so local dev works without changing anything. For production, fill in Cloudinary, Better Auth, Vercel Redis, etc.

### 4. Run database migrations and seed

```bash
npx prisma migrate dev
npm run db:seed
```

The seed populates brands, sources, retailers and ranking definitions. No guitar products are seeded - real data comes from the ETL.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Importing real guitar data

The website shows "0 instruments" until you run the importer. The ETL system crawls official manufacturer sites, Wikidata SPARQL, and retailer RSS/OpenGraph feeds.

```bash
# Full pipeline (crawl -> normalize -> merge -> index -> rankings)
npm run etl:all

# Or run individual steps:
npm run etl:brands      # Crawl official manufacturer sites
npm run etl:wikidata    # Import from Wikidata SPARQL
npm run etl:retailers   # Import from retailer RSS feeds
npm run etl:prices      # Refresh price offers
npm run etl:normalize   # Normalize raw records
npm run etl:index       # Rebuild search index
npm run etl:rankings    # Recompute ranking tables
```

> **Note:** Crawled instruments are imported with `isPublished: false` and require editorial review in the admin panel before they appear on the site.

---

## Project structure

```
gt/
├── src/
│   ├── app/                   # Next.js App Router pages and API routes
│   │   ├── admin/             # Admin panel (dashboard, CRUD, crawler, users)
│   │   ├── api/               # Route handlers (search, compare, auth, cron, health)
│   │   ├── brands/            # Brand index and detail pages
│   │   ├── c/[category]/      # Category listing pages
│   │   ├── compare/           # Comparison table (up to 5 instruments)
│   │   ├── guitars/           # Catalogue + [slug] detail pages
│   │   ├── guides/            # Buying guides
│   │   ├── news/              # News articles
│   │   ├── rankings/          # Ranking index and detail pages
│   │   ├── reviews/           # Editorial reviews
│   │   ├── deals/             # Deals and price drops
│   │   ├── search/            # Search results page
│   │   ├── sign-in/           # Authentication page
│   │   └── page.tsx           # Homepage
│   ├── components/
│   │   ├── article/           # ArticleCard
│   │   ├── brand/             # BrandCard
│   │   ├── compare/           # useCompare hook
│   │   ├── guitar/            # GuitarCard, ImageGallery, SpecTable, ReviewForm ...
│   │   ├── home/              # Hero, QuickCompare, YoutubeCard, HomeFaq
│   │   ├── layout/            # SiteHeader, SiteFooter, SectionHeader, ThemeToggle
│   │   ├── search/            # SearchTrigger, CommandPalette
│   │   ├── seo/               # JsonLd
│   │   └── ui/                # shadcn/ui primitives
│   ├── config/                # Site config, navigation, brands, sources, rankings, specs
│   ├── domain/guitar/         # Types, query parser, serializer
│   ├── lib/                   # prisma, redis, auth, cloudinary, utils, seo ...
│   ├── middleware.ts           # Admin auth guard + cron secret check
│   └── server/
│       ├── actions/           # compare, review, admin, ops server actions
│       ├── repositories/      # guitar, brand, article, ranking, facet repositories
│       └── services/          # guitar, compare, ranking, search, index services
├── etl/                       # Crawler, normalizer, merger, job tracker
│   ├── cli.ts                 # Entry point (npm run etl:*)
│   ├── adapters/              # brand-official, wikidata, retailers, prices
│   ├── normalizer.ts          # Raw -> NormalizedGuitar
│   ├── merger.ts              # NormalizedGuitar -> Guitar table
│   ├── job.ts                 # CrawlJob helpers
│   ├── robots.ts              # robots.txt parser
│   └── http.ts                # safeGet with timeout + User-Agent
├── prisma/
│   ├── schema.prisma          # Full database schema
│   └── seed.ts                # Brands, retailers, sources, ranking definitions
├── tests/
│   ├── unit/                  # Vitest unit tests
│   └── e2e/                   # Playwright end-to-end tests
├── scripts/                   # db-ensure, backup, restore, deploy
├── .github/workflows/ci.yml   # GitHub Actions: lint, type-check, test, build, deploy
├── docker-compose.yml         # Postgres, Redis, Meilisearch, Redis-HTTP facade
├── Dockerfile                 # Multi-stage production image
├── vercel.json                # Cron jobs (crawl, reindex)
└── .env.example               # All required environment variables with defaults
```

---

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Postgres connection string (pooled) | `postgresql://guitar:guitar@localhost:5432/guitartribe` |
| `DIRECT_URL` | Postgres direct connection (migrations) | Same without pooler |
| `UPSTASH_REDIS_REST_URL` | Redis REST URL | `http://localhost:8079` |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST token | `local_token` |
| `MEILISEARCH_HOST` | Meilisearch host | `http://localhost:7700` |
| `MEILISEARCH_MASTER_KEY` | Meilisearch master key | `masterKeyChangeMe` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |
| `BETTER_AUTH_SECRET` | Better Auth secret (32+ chars) | - |
| `BETTER_AUTH_URL` | Full site URL | `http://localhost:3000` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - |
| `ADMIN_EMAILS` | Comma-separated admin email addresses | - |
| `CRON_SECRET` | Shared secret for Vercel cron routes | - |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | `http://localhost:3000` |

See `.env.example` for the full list.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel deploy
```

Set the environment variables in the Vercel dashboard (Settings -> Environment Variables). The Postgres, Redis and Meilisearch services need to be provisioned separately (Vercel Postgres / Neon, Upstash, Meilisearch Cloud).

Vercel cron jobs are configured in `vercel.json`:
- `/api/cron/crawl?target=brands` - daily at 02:00 UTC
- `/api/cron/crawl?target=prices` - every 6 hours
- `/api/cron/reindex` - daily at 03:30 UTC

---

## Admin panel

Access at `/admin` (requires EDITOR or ADMIN role).

- **Dashboard** - live counters for guitars, brands, pending reviews, active crawl jobs, users
- **Guitars** - list, search, create and edit guitar records
- **Crawler** - enqueue and monitor ETL jobs
- **Rankings** - trigger ranking rebuilds and search reindex
- **Reviews** - approve or reject submitted owner reviews
- **Users** - manage roles and ban/unban accounts

First admin: sign in with the email listed in `ADMIN_EMAILS` via GitHub or Google OAuth.

---

## Testing

```bash
# Unit tests (Vitest)
npm run test

# Unit tests with coverage
npm run test:coverage

# E2E tests (Playwright) - requires the dev server to be running
npm run test:e2e
```

---

## CI/CD

GitHub Actions runs on every push and pull request:

1. `npm run lint` - ESLint
2. `npm run type-check` - TypeScript
3. `npm run test` - Vitest unit tests
4. `npm run build` - Next.js build
5. Auto-deploy to Vercel (main branch only)

---

## Data pipeline overview

```
Official sites   Wikidata SPARQL   Retailer RSS/OG
      |                |                 |
      v                v                 v
  SourceRecord (raw JSON, fingerprinted for deduplication)
      |
      v
  Normalizer (raw -> NormalizedGuitar canonical shape)
      |
      v
  Merger (NormalizedGuitar -> Guitar table, source-weighted)
      |
      v
  Editorial review (admin panel, isPublished = false until approved)
      |
      v
  Published Guitar -> Search index (Meilisearch) + Rankings
```

---

## License

MIT
