import { MeiliSearch, type Index } from "meilisearch"
import { env, features } from "./env"

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

export const SEARCHABLE_ATTRIBUTES = [
  "name",
  "brand",
  "model",
  "series",
  "subtype",
  "bodyShape",
  "topWood",
  "pickupConfig",
  "color",
  "summary",
]

export const FILTERABLE_ATTRIBUTES = [
  "brandSlug",
  "categorySlug",
  "category",
  "series",
  "bodyShape",
  "topWood",
  "backWood",
  "neckWood",
  "fingerboard",
  "pickupConfig",
  "finish",
  "color",
  "madeIn",
  "year",
  "frets",
  "strings",
  "scaleLengthIn",
  "weightKg",
  "price",
  "expertScore",
  "userScore",
  "availability",
  "handedness",
  "cutaway",
  "electroAcoustic",
]

export const SORTABLE_ATTRIBUTES = [
  "price",
  "msrp",
  "expertScore",
  "userScore",
  "valueScore",
  "popularity",
  "year",
]

let client: MeiliSearch | null = null

export function searchClient(): MeiliSearch | null {
  if (!features.meilisearch) return null
  client ??= new MeiliSearch({
    host: env.MEILISEARCH_HOST!,
    apiKey: env.MEILISEARCH_ADMIN_KEY || env.MEILISEARCH_MASTER_KEY || undefined,
  })
  return client
}

export function guitarIndex(): Index<GuitarDocument> | null {
  const c = searchClient()
  return c ? c.index<GuitarDocument>(env.MEILISEARCH_INDEX) : null
}

/** Idempotent index configuration. Safe to call on every reindex run. */
export async function ensureIndex(): Promise<void> {
  const c = searchClient()
  if (!c) return
  const uid = env.MEILISEARCH_INDEX
  try {
    await c.getIndex(uid)
  } catch {
    const task = await c.createIndex(uid, { primaryKey: "id" })
    await c.waitForTask(task.taskUid)
  }
  const index = c.index<GuitarDocument>(uid)
  await index.updateSettings({
    searchableAttributes: SEARCHABLE_ATTRIBUTES,
    filterableAttributes: FILTERABLE_ATTRIBUTES,
    sortableAttributes: SORTABLE_ATTRIBUTES,
    displayedAttributes: ["*"],
    rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness", "popularity:desc"],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
    },
    faceting: { maxValuesPerFacet: 300 },
    pagination: { maxTotalHits: 5000 },
  })
}

export async function indexDocuments(docs: GuitarDocument[]): Promise<number> {
  const index = guitarIndex()
  if (!index || docs.length === 0) return 0
  const task = await index.addDocuments(docs, { primaryKey: "id" })
  await searchClient()!.waitForTask(task.taskUid, { timeOutMs: 120_000 })
  return docs.length
}

export async function removeDocuments(ids: string[]): Promise<void> {
  const index = guitarIndex()
  if (!index || ids.length === 0) return
  await index.deleteDocuments(ids)
}
