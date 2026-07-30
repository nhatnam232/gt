import { unstable_cache } from "next/cache"
import { cache, cacheKey } from "@/lib/cache"
import { REVALIDATE } from "@/config/site"
import type { GuitarQuery } from "@/domain/guitar/types"
import { guitarRepository } from "@/server/repositories/guitar.repository"
import { facetRepository } from "@/server/repositories/facet.repository"

/**
 * Application service: composes repositories and owns caching policy. Route
 * handlers and pages depend on this, never on Prisma directly.
 */
export const guitarService = {
  async list(query: GuitarQuery) {
    const key = cacheKey("guitars:list", { ...query })
    return cache.remember(key, REVALIDATE.listing, () => guitarRepository.list(query))
  },

  async facets(query: GuitarQuery) {
    // Facets ignore pagination and sort, so drop them from the key to raise the
    // hit rate substantially.
    const { page: _page, perPage: _perPage, sort: _sort, ...rest } = query
    const key = cacheKey("guitars:facets", rest as Record<string, unknown>)
    return cache.remember(key, REVALIDATE.listing, () => facetRepository.forQuery(query))
  },

  detail: unstable_cache(
    async (slug: string) => guitarRepository.detail(slug),
    ["guitar-detail"],
    { revalidate: REVALIDATE.detail, tags: ["guitars"] },
  ),

  async bySlugs(slugs: string[]) {
    return guitarRepository.bySlugs(slugs)
  },

  async related(slug: string) {
    const detail = await guitarRepository.detail(slug)
    if (!detail) return []
    return guitarRepository.related(detail)
  },

  async trending(take = 8) {
    return cache.remember(cacheKey("guitars:trending", { take }), REVALIDATE.home, () =>
      guitarRepository.topBy("popularity", take),
    )
  },

  async topRated(take = 8) {
    return cache.remember(cacheKey("guitars:top-rated", { take }), REVALIDATE.home, () =>
      guitarRepository.topBy("expertScore", take),
    )
  },

  async bestValue(take = 8) {
    return cache.remember(cacheKey("guitars:best-value", { take }), REVALIDATE.home, () =>
      guitarRepository.topBy("valueScore", take),
    )
  },

  async recordView(slug: string) {
    await guitarRepository.incrementPopularity(slug)
  },
}
