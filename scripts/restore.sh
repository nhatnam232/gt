#!/usr/bin/env bash
# Restore from an archive produced by scripts/backup.sh
#   ./scripts/restore.sh backups/20260730T020000Z.tar.gz
set -euo pipefail

ARCHIVE="${1:-}"
if [ -z "$ARCHIVE" ] || [ ! -f "$ARCHIVE" ]; then
  echo "usage: $0 <backups/STAMP.tar.gz>" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
[ -f .env ] && set -a && . ./.env && set +a

read -r -p "This overwrites the database at ${DATABASE_URL%%\?*}. Continue? [y/N] " ok
[ "$ok" = "y" ] || exit 1

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
tar -xzf "$ARCHIVE" -C "$TMP"
DUMP="$(find "$TMP" -name postgres.dump | head -n1)"

echo "==> pg_restore"
pg_restore --dbname "${DIRECT_URL:-$DATABASE_URL}" --clean --if-exists \
  --no-owner --single-transaction "$DUMP"

echo "==> reindexing search"
npm run search:index
echo "==> done"
