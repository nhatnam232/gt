/**
 * Normalizer — infers category, specs from guitar names and descriptions.
 */

import { prisma } from "@/lib/prisma"
import type { Category } from "@prisma/client"

const CATEGORY_PATTERNS: Array<[Category, RegExp]> = [
  ["BASS", /\bbass\b/i],
  ["CLASSICAL", /\b(classical|nylon|flamenco)\b/i],
  ["UKULELE", /\bukulele\b/i],
  ["ELECTRIC", /\b(electric|solid.?body|semi.?hollow|tele|strat|les paul|sg|es.?\d)\b/i],
  ["ACOUSTIC", /\b(acoustic|dreadnought|orchestra|concert|parlour|parlor|jumbo)\b/i],
]

function inferCategory(name: string): Category {
  for (const [cat, re] of CATEGORY_PATTERNS) {
    if (re.test(name)) return cat
  }
  return "ACOUSTIC" // fallback
}

export async function normalizeGuitars() {
  console.log("[normalizer] Starting normalization...")

  const guitars = await prisma.guitar.findMany({
    where: { isPublished: false },
    select: { id: true, name: true, category: true },
  })

  console.log(`[normalizer] Processing ${guitars.length} unpublished guitars...`)
  let updated = 0

  for (const g of guitars) {
    const inferredCategory = inferCategory(g.name)
    if (inferredCategory !== g.category) {
      await prisma.guitar.update({ where: { id: g.id }, data: { category: inferredCategory } })
      updated++
    }
  }

  console.log(`[normalizer] Done. Updated ${updated} categories.`)
}
