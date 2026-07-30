import { guitarRepository } from "@/server/repositories/guitar.repository"
import { normalizeGuitarQuery, type GuitarQueryInput } from "@/domain/guitar/types"

export const guitarService = {
  /**
   * Accepts a partial query so simple callers can pass just `{ category }`.
   * Missing pagination and facet arrays are filled in by `normalizeGuitarQuery`.
   */
  list: (query: GuitarQueryInput) => guitarRepository.list(normalizeGuitarQuery(query)),
  findBySlug: (slug: string) => guitarRepository.findBySlug(slug),
  detail: (slug: string) => guitarRepository.detail(slug),
  topBy: (key: string, take?: number) => guitarRepository.topBy(key, take),
  findRelated: (guitar: Parameters<typeof guitarRepository.findRelated>[0], limit?: number) =>
    guitarRepository.findRelated(guitar, limit),
  findBySlugMany: (slugs: string[]) => guitarRepository.findBySlugMany(slugs),
}
