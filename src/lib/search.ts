import { MeiliSearch } from "meilisearch"

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_MASTER_KEY ?? "masterKeyChangeMe",
})

export const GUITAR_INDEX = "guitars"

export type GuitarDocument = {
  id: string
  slug: string
  name: string
  brand: string
  brandSlug: string
  series: string | null
  model: string | null
  category: string
  categorySlug: string
  subtype: string | null
  bodyShape: string | null
  topWood: string | null
  backWood: string | null
  neckWood: string | null
  fingerboard: string | null
  pickupConfig: string | null
  finish: string | null
  color: string | null
  madeIn: string | null
  year: number | null
  frets: number | null
  strings: number | null
  scaleLengthIn: number | null
  weightKg: number | null
  price: number | null
  msrp: number | null
  expertScore: number | null
  userScore: number | null
  valueScore: number | null
  popularity: number
  availability: string
  handedness: string
  cutaway: boolean
  electroAcoustic: boolean
  image: string | null
  summary: string | null
}

export async function ensureIndex(): Promise<void> {
  try {
    await meilisearch.getIndex(GUITAR_INDEX)
  } catch {
    await meilisearch.createIndex(GUITAR_INDEX, { primaryKey: "id" })
    await meilisearch.index(GUITAR_INDEX).updateSettings({
      searchableAttributes: ["name", "brand", "model", "series", "bodyShape", "topWood", "summary"],
      filterableAttributes: [
        "category", "brandSlug", "madeIn", "year", "frets", "strings",
        "price", "expertScore", "userScore", "availability", "handedness",
        "cutaway", "electroAcoustic", "pickupConfig", "topWood", "bodyShape",
      ],
      sortableAttributes: ["price", "expertScore", "userScore", "valueScore", "year", "popularity"],
      pagination: { maxTotalHits: 5000 },
    })
  }
}

export async function indexDocuments(docs: GuitarDocument[]): Promise<number> {
  if (docs.length === 0) return 0
  await meilisearch.index(GUITAR_INDEX).addDocuments(docs)
  return docs.length
}

export async function searchGuitars(query: string, filter?: string, sort?: string[], limit = 24, offset = 0) {
  return meilisearch.index(GUITAR_INDEX).search(query, {
    filter,
    sort,
    limit,
    offset,
    attributesToHighlight: ["name", "brand"],
  })
}
