#!/usr/bin/env node
/**
 * Pre-dev guard: make sure a DATABASE_URL exists, the Prisma client is
 * generated and the schema is applied. Keeps `npm run dev` a one-liner.
 */
import { execSync } from "node:child_process"
import { existsSync, copyFileSync } from "node:fs"

const run = (cmd) => execSync(cmd, { stdio: "inherit" })

if (!existsSync(".env") && existsSync(".env.example")) {
  copyFileSync(".env.example", ".env")
  console.log("[db-ensure] created .env from .env.example")
}

try {
  run("npx prisma generate")
} catch {
  console.warn("[db-ensure] prisma generate failed - continuing")
}

try {
  run("npx prisma migrate deploy")
} catch {
  console.warn(
    "[db-ensure] could not reach the database. Start it with `docker compose up -d postgres redis meilisearch`.",
  )
}
