/**
 * Wikidata SPARQL crawler — fetches guitar models linked to known brands.
 * Results are stored as raw Guitar rows (isPublished: false) for editorial review.
 */

import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"
const USER_AGENT = process.env.CRAWLER_USER_AGENT ?? "GuitarTribeBot/1.0"

const QUERY = `
SELECT DISTINCT ?item ?itemLabel ?brandLabel ?inceptionYear ?countryLabel WHERE {
  ?item wdt:P31 wd:Q6607;
         wdt:P176 ?brand.
  OPTIONAL { ?item wdt:P571 ?inception. BIND(YEAR(?inception) AS ?inceptionYear) }
  OPTIONAL { ?item wdt:P495 ?country. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 500
`

type WikidataRow = {
  item: { value: string }
  itemLabel: { value: string }
  brandLabel?: { value: string }
  inceptionYear?: { value: string }
  countryLabel?: { value: string }
}

export async function crawlWikidata() {
  console.log("[wikidata] Starting Wikidata SPARQL crawl...")

  const params = new URLSearchParams({ query: QUERY, format: "json" })
  const res = await fetch(`${SPARQL_ENDPOINT}?${params}`, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": USER_AGENT,
    },
  })

  if (!res.ok) {
    console.error(`[wikidata] SPARQL request failed: ${res.status}`)
    return
  }

  const json = (await res.json()) as { results: { bindings: WikidataRow[] } }
  const rows = json.results.bindings
  console.log(`[wikidata] Got ${rows.length} results from Wikidata`)

  const brands = await prisma.brand.findMany({ select: { id: true, slug: true, name: true } })
  const brandIndex = new Map(brands.map((b) => [b.name.toLowerCase(), b]))

  let created = 0
  let skipped = 0

  for (const row of rows) {
    const name = row.itemLabel?.value
    if (!name || name.startsWith("Q")) { skipped++; continue }

    const brandName = row.brandLabel?.value ?? ""
    const brand = brandIndex.get(brandName.toLowerCase())
    if (!brand) { skipped++; continue }

    const qid = row.item.value.replace("http://www.wikidata.org/entity/", "")
    const slug = slugify(`${brand.slug}-${name}`)
    const year = row.inceptionYear?.value ? parseInt(row.inceptionYear.value) : null
    const madeIn = row.countryLabel?.value ?? null

    try {
      const existing = await prisma.externalId.findFirst({ where: { source: "wikidata", extId: qid } })
      if (existing) { skipped++; continue }

      const guitar = await prisma.guitar.upsert({
        where: { slug },
        create: {
          slug,
          name,
          brandId: brand.id,
          category: "ACOUSTIC", // default; normalizer will fix
          year,
          madeIn,
          isPublished: false,
        },
        update: { year, madeIn },
      })

      await prisma.externalId.upsert({
        where: { guitarId_source: { guitarId: guitar.id, source: "wikidata" } },
        create: {
          guitarId: guitar.id,
          source: "wikidata",
          extId: qid,
          url: `https://www.wikidata.org/wiki/${qid}`,
        },
        update: { url: `https://www.wikidata.org/wiki/${qid}` },
      })

      created++
    } catch (err) {
      console.warn(`[wikidata] Error for ${name}:`, err)
      skipped++
    }
  }

  console.log(`[wikidata] Done. Created: ${created}, Skipped: ${skipped}`)
}
