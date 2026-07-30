/**
 * Meilisearch REST client implemented with plain `fetch`.
 *
 * We deliberately avoid the official `meilisearch` npm SDK: it pins tightly to
 * server versions and adds an unnecessary dependency for the handful of
 * endpoints we use. Everything here is the documented Meilisearch HTTP API.
 *
 * If MEILISEARCH_HOST is not configured, every function degrades gracefully so
 * the app keeps working with the Postgres fallback search.
 */

const HOST = (process.env.MEILISEARCH_HOST ?? "").replace(/\/$/, "")
const KEY = process.env.MEILISEARCH_ADMIN_KEY ?? process.env.MEILISEARCH_MASTER_KEY ?? ""

export const GUITAR_INDEX = process.env.MEILISEARCH_INDEX ?? "guitars"

/** True when Meilisearch is configured and should be used. */
export const searchEnabled = HOST.length > 0

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

export type SearchHit = GuitarDocument & {
  _formatted?: Partial<Record<keyof GuitarDocument, string>>
}

export type SearchResponse = {
  hits: SearchHit[]
  query: string
  limit: number
  offset: number
  estimatedTotalHits: number
  processingTimeMs: number
}

const EMPTY: SearchResponse = {
  hits: [],
  query: "",
  limit: 0,
  offset: 0,
  estimatedTotalHits: 0,
  processingTimeMs: 0,
}

async function meili<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  if (!searchEnabled) throw new Error("Meilisearch is not configured")

  const res = await fetch(`${HOST}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`Meilisearch ${res.status} on ${path}: ${detail}`)
  }

  return (await res.json()) as T
}

/** Create the guitars index and apply its settings if it does not exist yet. */
export async function ensureIndex(): Promise<void> {
  if (!searchEnabled) return

  try {
    await meili(`/indexes/${GUITAR_INDEX}`)
  } catch {
    await meili("/indexes", {
      method: "POST",
      body: { uid: GUITAR_INDEX, primaryKey: "id" },
    })
  }

  await meili(`/indexes/${GUITAR_INDEX}/settings`, {
    method: "PATCH",
    body: {
      searchableAttributes: ["name", "brand", "model", "series", "bodyShape", "topWood", "summary"],
      filterableAttributes: [
        "category", "brandSlug", "madeIn", "year", "frets", "strings",
        "price", "expertScore", "userScore", "availability", "handedness",
        "cutaway", "electroAcoustic", "pickupConfig", "topWood", "bodyShape",
      ],
      sortableAttributes: ["price", "expertScore", "userScore", "valueScore", "year", "popularity"],
      pagination: { maxTotalHits: 5000 },
    },
  })
}

/** Upsert documents into the guitars index. Returns how many were sent. */
export async function indexDocuments(docs: GuitarDocument[]): Promise<number> {
  if (!searchEnabled || docs.length === 0) return 0

  // Meilisearch handles large payloads fine, but batching keeps memory flat
  // and gives clearer progress when the ETL indexes thousands of rows.
  const BATCH = 500
  let sent = 0

  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH)
    await meili(`/indexes/${GUITAR_INDEX}/documents`, {
      method: "POST",
      body: batch,
    })
    sent += batch.length
  }

  return sent
}

/** Remove every document from the index without deleting its settings. */
export async function clearIndex(): Promise<void> {
  if (!searchEnabled) return
  await meili(`/indexes/${GUITAR_INDEX}/documents`, { method: "DELETE" })
}

/**
 * Run a search. Never throws: on any failure it returns an empty result set so
 * callers can fall back to Postgres search instead of erroring the page.
 */
export async function searchGuitars(
  query: string,
  filter?: string,
  sort?: string[],
  limit = 24,
  offset = 0,
): Promise<SearchResponse> {
  if (!searchEnabled) return { ...EMPTY, query, limit, offset }

  try {
    return await meili<SearchResponse>(`/indexes/${GUITAR_INDEX}/search`, {
      method: "POST",
      body: {
        q: query,
        ...(filter ? { filter } : {}),
        ...(sort && sort.length > 0 ? { sort } : {}),
        limit,
        offset,
        attributesToHighlight: ["name", "brand"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
      },
    })
  } catch (err) {
    console.error("[search] Meilisearch query failed:", err)
    return { ...EMPTY, query, limit, offset }
  }
}

/** Health probe used by /api/health. */
export async function searchHealthy(): Promise<boolean> {
  if (!searchEnabled) return false
  try {
    await meili("/health")
    return true
  } catch {
    return false
  }
}
