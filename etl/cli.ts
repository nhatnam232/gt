#!/usr/bin/env tsx
/**
 * ETL entry point.
 *
 * Usage:
 *   npm run etl:all          - full pipeline
 *   npm run etl:brands       - crawl official manufacturer sites
 *   npm run etl:wikidata     - import from Wikidata SPARQL
 *   npm run etl:retailers    - import from retailer OpenGraph / feeds
 *   npm run etl:prices       - refresh price offers only
 *   npm run etl:normalize    - re-normalize already-fetched raw records
 *   npm run etl:index        - rebuild search index from DB
 *   npm run etl:rankings     - recompute ranking tables
 */

import { prisma } from "../src/lib/prisma"
import { crawlBrands } from "./adapters/brand-official"
import { crawlWikidata } from "./adapters/wikidata"
import { crawlRetailers } from "./adapters/retailers"
import { refreshPrices } from "./adapters/prices"
import { normalizeAll } from "./normalizer"
import { mergeAll } from "./merger"
import { reindexSearch } from "../src/server/services/index.service"
import { rankingService } from "../src/server/services/ranking.service"

const command = process.argv[2] ?? "all"

async function run() {
  console.log(`[ETL] Starting: ${command}`)
  const started = Date.now()

  switch (command) {
    case "brands":
      await crawlBrands()
      break
    case "wikidata":
      await crawlWikidata()
      break
    case "retailers":
      await crawlRetailers()
      break
    case "prices":
      await refreshPrices()
      break
    case "normalize":
      await normalizeAll()
      break
    case "index":
      await reindexSearch()
      break
    case "rankings":
      await rankingService.rebuildAll()
      break
    case "all":
      await crawlBrands()
      await crawlWikidata()
      await crawlRetailers()
      await normalizeAll()
      await mergeAll()
      await refreshPrices()
      await reindexSearch()
      await rankingService.rebuildAll()
      break
    default:
      console.error(`Unknown command: ${command}`)
      process.exit(1)
  }

  const elapsed = ((Date.now() - started) / 1000).toFixed(1)
  console.log(`[ETL] Done in ${elapsed}s`)
  await prisma.$disconnect()
}

run().catch(async (error) => {
  console.error("[ETL] Fatal error:", error)
  await prisma.$disconnect()
  process.exit(1)
})
