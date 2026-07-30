/**
 * Checks that Postgres is reachable before starting the dev server.
 * Used by the "dev" npm script.
 */
import { execSync } from "child_process"

try {
  execSync("pg_isready -h localhost -p 5432 -U guitar -d guitartribe", { stdio: "pipe" })
  console.log("[db:ensure] Postgres is ready.")
} catch {
  console.warn(
    "[db:ensure] WARNING: Postgres is not reachable at localhost:5432.\n" +
    "  Run 'docker compose up -d' to start local services, or ensure DATABASE_URL is set.\n" +
    "  Continuing anyway..."
  )
}
