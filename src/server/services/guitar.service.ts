import { guitarRepository } from "@/server/repositories/guitar.repository"
import type { GuitarQuery } from "@/domain/guitar/types"

export const guitarService = {
  list: (query: GuitarQuery) => guitarRepository.list(query),
  findBySlug: (slug: string) => guitarRepository.findBySlug(slug),
  findRelated: (guitar: Parameters<typeof guitarRepository.findRelated>[0], limit?: number) =>
    guitarRepository.findRelated(guitar, limit),
  findBySlugMany: (slugs: string[]) => guitarRepository.findBySlugMany(slugs),
}
