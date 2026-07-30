/**
 * Ranking service — builds ranking lists from DB guitar scores.
 */

import { prisma } from "@/lib/prisma"
import { RANKING_SEED } from "@/config/rankings"
import type { Category } from "@prisma/client"

export async function buildRankings() {
  console.log("[rankings] Building rankings...")

  for (const def of RANKING_SEED) {
    const ranking = await prisma.ranking.upsert({
      where: { slug: def.slug },
      create: { slug: def.slug, name: def.name, category: def.category ?? null },
      update: { name: def.name },
    })

    const where = {
      isPublished: true,
      expertScore: { not: null },
      ...(def.category ? { category: def.category as Category } : {}),
    }

    const guitars = await prisma.guitar.findMany({
      where,
      orderBy: { expertScore: "desc" },
      take: 25,
      select: { id: true, expertScore: true },
    })

    // Delete old entries and recreate
    await prisma.rankingEntry.deleteMany({ where: { rankingId: ranking.id } })
    await prisma.rankingEntry.createMany({
      data: guitars.map((g, i) => ({
        rankingId: ranking.id,
        guitarId: g.id,
        position: i + 1,
        score: g.expertScore ?? 0,
      })),
    })

    console.log(`[rankings] Built "${def.name}" with ${guitars.length} entries.`)
  }

  console.log("[rankings] Done.")
}
