#!/usr/bin/env tsx
/**
 * GuitarTribe ETL CLI
 * Usage: npm run etl [command]
 * Commands: all | brands | wikidata | retailers | prices | normalize | merge | index | rankings
 */

import { crawlBrands } from "./crawlers/brand-official"
import { crawlWikidata } from "./crawlers/wikidata"
import { crawlRetailers } from "./crawlers/retailers"
import { crawlPrices } from "./crawlers/prices"
import { normalizeGuitars } from "./transformers/normalizer"
import { mergeGuitars } from "./transformers/merger"
import { indexAllGuitars } from "./services/index.service"
import { buildRankings } from "./services/ranking.service"

const command = process.argv[2] ?? "all"

async function run(cmd: string) {
  console.log(`\n[ETL] Running: ${cmd}`)
  const t = Date.now()
  switch (cmd) {
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
      await crawlPrices()
      break
    case "normalize":
      await normalizeGuitars()
      break
    case "merge":
      await mergeGuitars()
      break
    case "index":
      await indexAllGuitars()
      break
    case "rankings":
      await buildRankings()
      break
    case "all":
      await crawlBrands()
      await crawlWikidata()
      await crawlRetailers()
      await crawlPrices()
      await normalizeGuitars()
      await mergeGuitars()
      await indexAllGuitars()
      await buildRankings()
      break
    default:
      console.error(`Unknown command: ${cmd}`)
      console.error("Available: all | brands | wikidata | retailers | prices | normalize | merge | index | rankings")
      process.exit(1)
  }
  console.log(`[ETL] ${cmd} completed in ${((Date.now() - t) / 1000).toFixed(1)}s`)
}

run(command).catch((err) => {
  console.error("[ETL] Fatal error:", err)
  process.exit(1)
})
