import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { RANKING_DEFINITIONS, type RankingDefinition } from "@/config/rankings"
import { cache } from "@/lib/cache"
import { REVALIDATE } from "@/config/site"
import { decimalToNumber, clamp } from "@/lib/utils"
import { rankingRepository } from "@/server/repositories/ranking.repository"

type Candidate = {
  id: string
  name: string
  expertScore: number | null
  userScore: number | null
  userScoreCount: number
  valueScore: number | null
  /** Normalised 0..1 popularity, derived from popularityRank (lower rank = more popular). */
  popularity: number
  price: number | null
}

/**
 * Bayesian-adjusted owner rating: pulls low-sample averages toward the global
 * mean so a single 5-star review cannot beat a 4.6 average over 300 reviews.
 */
function bayesianUserScore(candidate: Candidate, priorMean: number, priorWeight = 12): number {
  if (!candidate.userScore || candidate.userScoreCount === 0) return priorMean
  const n = candidate.userScoreCount
  return (priorWeight * priorMean + n * candidate.userScore) / (priorWeight + n)
}

function normalise(value: number | null, min: number, max: number): number {
  if (value === null || !Number.isFinite(value) || max <= min) return 0
  return clamp((value - min) / (max - min), 0, 1)
}

export const rankingService = {
  get definitions() {
    return RANKING_DEFINITIONS
  },

  async bySlug(slug: string) {
    return cache.remember(`ranking:${slug}`, REVALIDATE.ranking, () =>
      rankingRepository.bySlug(slug),
    )
  },

  async index() {
    return cache.remember("ranking:index", REVALIDATE.ranking, () => rankingRepository.index())
  },

  /**
   * Recompute one ranking from live data. Called by the reindex cron and by the
   * admin "rebuild rankings" action - never at request time.
   */
  async rebuild(definition: RankingDefinition): Promise<number> {
    const constraints = definition.constraints

    const where: Prisma.GuitarWhereInput = {
      isPublished: true,
      ...(definition.category ? { category: definition.category } : {}),
      ...(constraints?.minExpertScore
        ? { expertScore: { gte: constraints.minExpertScore } }
        : {}),
      ...(constraints?.minPrice || constraints?.maxPrice
        ? {
            msrp: {
              ...(constraints.minPrice ? { gte: constraints.minPrice } : {}),
              ...(constraints.maxPrice ? { lte: constraints.maxPrice } : {}),
            },
          }
        : {}),
    }

    const rows = await prisma.guitar.findMany({
      where,
      select: {
        id: true,
        name: true,
        expertScore: true,
        userScore: true,
        valueScore: true,
        popularityRank: true,
        msrp: true,
        // There is no denormalised review counter on Guitar, so count the
        // approved reviews directly.
        _count: { select: { reviews: true } },
      },
      take: 2000,
    })

    const candidates: Candidate[] = rows
      .map((row) => ({
        id: row.id,
        name: row.name,
        expertScore: decimalToNumber(row.expertScore),
        userScore: decimalToNumber(row.userScore),
        userScoreCount: row._count.reviews,
        valueScore: decimalToNumber(row.valueScore),
        // popularityRank is 1 = most popular, so invert it into a 0..1 score.
        popularity: row.popularityRank && row.popularityRank > 0 ? 1 / row.popularityRank : 0,
        price: decimalToNumber(row.msrp),
      }))
      // Review-count constraint is applied here because Prisma cannot filter on
      // a relation count inside `where`.
      .filter((c) => !constraints?.minUserReviews || c.userScoreCount >= constraints.minUserReviews)

    if (candidates.length === 0) return 0

    const rated = candidates.filter((c) => c.userScore !== null && c.userScoreCount > 0)
    const priorMean =
      rated.length > 0
        ? rated.reduce((sum, c) => sum + (c.userScore ?? 0), 0) / rated.length
        : 4

    const maxPopularity = Math.max(...candidates.map((c) => c.popularity), 1)
    const values = candidates.map((c) => c.valueScore ?? 0)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    const weights = definition.weights
    const weightSum = weights.expert + weights.user + weights.value + weights.popularity || 1

    const scored = candidates
      .map((candidate) => {
        const expert = normalise(candidate.expertScore, 0, 10)
        const user = normalise(bayesianUserScore(candidate, priorMean), 1, 5)
        const value = normalise(candidate.valueScore, minValue, maxValue)
        const popularity = normalise(candidate.popularity, 0, maxPopularity)
        const score =
          ((weights.expert * expert +
            weights.user * user +
            weights.value * value +
            weights.popularity * popularity) /
            weightSum) *
          100
        return { candidate, score }
      })
      // Never rank an instrument with no quality signal at all.
      .filter((entry) => entry.candidate.expertScore !== null || entry.candidate.userScoreCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)

    // The Ranking model stores slug + name + category only; the richer copy
    // (subtitle, description) lives in RANKING_DEFINITIONS.
    const ranking = await prisma.ranking.upsert({
      where: { slug: definition.slug },
      create: {
        slug: definition.slug,
        name: definition.title,
        category: definition.category ?? null,
      },
      update: {
        name: definition.title,
        category: definition.category ?? null,
      },
    })

    await prisma.$transaction([
      prisma.rankingEntry.deleteMany({ where: { rankingId: ranking.id } }),
      prisma.rankingEntry.createMany({
        data: scored.map((entry, i) => ({
          rankingId: ranking.id,
          guitarId: entry.candidate.id,
          position: i + 1,
          score: Number(entry.score.toFixed(2)),
        })),
      }),
    ])

    await cache.invalidate(`ranking:${definition.slug}`)
    await cache.invalidate("ranking:index")

    return scored.length
  },

  async rebuildAll(): Promise<Record<string, number>> {
    const result: Record<string, number> = {}
    for (const definition of RANKING_DEFINITIONS) {
      result[definition.slug] = await rankingService.rebuild(definition)
    }
    return result
  },
}
