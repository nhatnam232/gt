#!/usr/bin/env bash
# One-shot production deploy: verify, migrate, ship to Vercel, reindex.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
[ -f .env ] && set -a && . ./.env && set +a

echo "==> install"
npm ci

echo "==> verify"
npm run lint
npm run typecheck
npm test

echo "==> migrate"
npx prisma migrate deploy

echo "==> deploy"
npx vercel@latest deploy --prod ${VERCEL_TOKEN:+--token "$VERCEL_TOKEN"}

echo "==> reindex search"
npm run search:index

echo "==> deployed"
