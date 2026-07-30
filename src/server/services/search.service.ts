import { features } from "@/lib/env"
import { guitarIndex, type GuitarDocument } from "@/lib/search"
import { prisma } from "@/lib/prisma"
import { categoryMeta } from "@/config/navigation"
import { decimalToNumber } from "@/lib/utils"

export type SearchHit = {
  slug: string
  name: string
  brand: string
  category: string
  categorySlug: string
  price: number | null
  currency: string
  expertScore: number | null
  image: string | null
  /** Title containing <mark> highlights (already HTML-escaped). */
  highlighted: string
}

export type SearchResponse = {
  hits: SearchHit[]
  total: number
  tookMs: number
  engine: "meilisearch" | "postgres"
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Highlight query terms in a title for the Postgres fallback path. */
function highlight(text: string, query: string): string {
  const safe = escapeHtml(text)
  const terms = query
    .split(/\s+/)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter((t) => t.length > 1)
  if (terms.length === 0) return safe
  return safe.replace(new RegExp(`(${terms.join("|")})`, "gi"), "<mark>$1</mark>")
}

export const searchService = {
  /**
   * Instant search. Uses Meilisearch (typo tolerance, prefix matching,
   * highlighting) when configured, and falls back to a Postgres ILIKE query so
   * search still works on a bare `npm run dev`.
   */
  async query(q: string, options?: { limit?: number; category?: string }): Promise<SearchResponse> {
    const term = q.trim().slice(0, 120)
    const limit = Math.min(options?.limit ?? 8, 30)
    const started = Date.now()
    const engine = features.meilisearch ? "meilisearch" : "postgres"

    if (!term) return { hits: [], total: 0, tookMs: 0, engine }

    const index = guitarIndex()
    if (index) {
      const result = await index.search(term, {
        limit,
        attributesToHighlight: ["name", "brand"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
        filter: options?.category
          ? [`categorySlug = "${options.category.replace(/[^a-z0-9-]/gi, "")}"`]
          : undefined,
      })
      return {
        hits: result.hits.map((hit) => {
          const doc = hit as GuitarDocument & { _formatted?: Partial<GuitarDocument> }
          return {
            slug: doc.slug,
            name: doc.name,
            brand: doc.brand,
            category: doc.category,
            categorySlug: doc.categorySlug,
            price: doc.price,
            currency: doc.currency ?? "USD",
            expertScore: doc.expertScore,
            image: doc.image,
            highlighted: doc._formatted?.name ?? escapeHtml(doc.name),
          }
        }),
        total: result.estimatedTotalHits ?? result.hits.length,
        tookMs: result.processingTimeMs ?? Date.now() - started,
        engine: "meilisearch",
      }
    }

    const rows = await prisma.guitar.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { model: { contains: term, mode: "insensitive" } },
          { brand: { name: { contains: term, mode: "insensitive" } } },
        ],
      },
      orderBy: [{ popularity: "desc" }, { expertScore: "desc" }],
      take: limit,
      select: {
        slug: true,
        name: true,
        category: true,
        currentBest: true,
        currency: true,
        expertScore: true,
        brand: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    })

    return {
      hits: rows.map((row) => ({
        slug: row.slug,
        name: row.name,
        brand: row.brand.name,
        category: row.category,
        categorySlug: categoryMeta(row.category).slug,
        price: decimalToNumber(row.currentBest),
        currency: row.currency,
        expertScore: decimalToNumber(row.expertScore),
        image: row.images[0]?.url ?? null,
        highlighted: highlight(row.name, term),
      })),
      total: rows.length,
      tookMs: Date.now() - started,
      engine: "postgres",
    }
  },
}
