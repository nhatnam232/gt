#!/usr/bin/env bash
# Logical backup of Postgres + a Meilisearch dump, written to ./backups.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
[ -f .env ] && set -a && . ./.env && set +a

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="backups/$STAMP"
mkdir -p "$OUT"

echo "==> pg_dump -> $OUT/postgres.dump"
pg_dump --dbname "${DIRECT_URL:-$DATABASE_URL}" --format=custom --no-owner \
  --file "$OUT/postgres.dump"

if [ -n "${MEILISEARCH_HOST:-}" ]; then
  echo "==> meilisearch dump"
  curl -fsS -X POST "$MEILISEARCH_HOST/dumps" \
    -H "Authorization: Bearer ${MEILISEARCH_MASTER_KEY:-}" \
    -o "$OUT/meili-dump.json" || echo "    (skipped: meilisearch unreachable)"
fi

tar -czf "backups/$STAMP.tar.gz" -C backups "$STAMP"
rm -rf "$OUT"

# retain 14 most recent archives
ls -1t backups/*.tar.gz 2>/dev/null | tail -n +15 | xargs -r rm --
echo "==> done: backups/$STAMP.tar.gz"
