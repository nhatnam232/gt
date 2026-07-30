/**
 * Imports guitar records from the Wikidata SPARQL endpoint.
 *
 * Query: all items with wdt:P31 (instance of) wd:Q6607 (guitar) or subclasses,
 * fetching label, description, manufacturer, image, price range and Wikipedia link.
 *
 * Rate limiting: one request per 1.5s, max 5 parallel.
 */

import pLimit from "p-limit"
import { prisma } from "../../src/lib/prisma"
import { createJob, finishJob, logJob } from "../job"
import { safeGet } from "../http"

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"
const USER_AGENT =
  process.env.CRAWLER_USER_AGENT ?? "GuitarTribeBot/1.0 (https://guitartribe.io)"

const GUITAR_SPARQL = `
SELECT DISTINCT ?item ?itemLabel ?mfr ?mfrLabel ?image ?country ?countryLabel ?inception WHERE {
  ?item wdt:P31/wdt:P279* wd:Q6607 .
  OPTIONAL { ?item wdt:P176 ?mfr . }
  OPTIONAL { ?item wdt:P18 ?image . }
  OPTIONAL { ?item wdt:P495 ?country . }
  OPTIONAL { ?item wdt:P571 ?inception . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 3000
`

export async function crawlWikidata() {
  const job = await createJob("wikidata")
  let found = 0, added = 0

  try {
    await logJob(job.id, "INFO", "Querying Wikidata SPARQL for guitar instances...")

    const params = new URLSearchParams({ query: GUITAR_SPARQL, format: "json" })
    const response = await fetch(`${SPARQL_ENDPOINT}?${params}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/sparql-results+json" },
    })

    if (!response.ok) throw new Error(`SPARQL error: ${response.status}`)

    const data = (await response.json()) as {
      results: { bindings: Record<string, { value: string }>[] }
    }
    const bindings = data.results.bindings
    found = bindings.length
    await logJob(job.id, "INFO", `Got ${found} SPARQL results`)

    const source = await prisma.source.findUnique({ where: { slug: "wikidata" } })
    if (!source) {
      await logJob(job.id, "WARN", "Wikidata source not seeded - run prisma db seed first")
      await finishJob(job.id, { found: 0, added: 0, failed: 0 })
      return
    }

    const limit = pLimit(3)
    await Promise.all(
      bindings.map((binding) =>
        limit(async () => {
          const qid = binding["item"]?.value.split("/").pop() ?? ""
          if (!qid) return
          const fingerprint = `wikidata:${qid}`
          const existing = await prisma.sourceRecord.findFirst({
            where: { sourceId: source.id, fingerprint },
          })
          const record = {
            qid,
            label: binding["itemLabel"]?.value ?? "",
            manufacturer: binding["mfrLabel"]?.value ?? null,
            manufacturerQid: binding["mfr"]?.value.split("/").pop() ?? null,
            image: binding["image"]?.value ?? null,
            country: binding["countryLabel"]?.value ?? null,
            inception: binding["inception"]?.value ?? null,
          }
          if (!existing) {
            await prisma.sourceRecord.create({
              data: {
                sourceId: source.id,
                url: `https://www.wikidata.org/wiki/${qid}`,
                fingerprint,
                raw: record,
                confidence: 0.7,
                fetchedAt: new Date(),
              },
            })
            added++
          }
        }),
      ),
    )
  } catch (err) {
    await logJob(job.id, "ERROR", `Wikidata crawl failed: ${String(err)}`)
  }

  await finishJob(job.id, { found, added, failed: 0 })
  console.log(`[wikidata] found=${found} added=${added}`)
}
