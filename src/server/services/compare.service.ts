import { MAX_COMPARE } from "@/config/site"
import { SPEC_FIELDS, SPEC_GROUPS, type SpecField, type SpecGroupKey } from "@/config/spec-schema"
import type { GuitarDetailDto } from "@/domain/guitar/types"
import { formatPrice } from "@/lib/utils"
import { guitarRepository } from "@/server/repositories/guitar.repository"

export type CompareCell = { raw: string | number | boolean | null; display: string }

export type CompareRow = {
  key: string
  label: string
  unit?: string
  cells: CompareCell[]
  /** True when at least two instruments differ on this field. */
  differs: boolean
  /** Index of the best cell when the field has a natural direction. */
  bestIndex: number | null
}

export type CompareGroup = { key: SpecGroupKey; label: string; rows: CompareRow[] }

export type CompareResult = {
  guitars: GuitarDetailDto[]
  groups: CompareGroup[]
  differingCount: number
  identicalCount: number
}

/** Fields where a higher value is better, and fields where lower is better. */
const HIGHER_IS_BETTER = new Set(["expertScore", "userScore", "valueScore", "frets"])
const LOWER_IS_BETTER = new Set(["currentBest", "msrp", "weightKg"])

/** Prisma Decimal | number | null -> number | null. */
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Cheapest tracked offer, falling back to MSRP. */
function bestPrice(guitar: GuitarDetailDto): number | null {
  const offers = guitar.prices ?? []
  const prices = offers.map((offer) => toNumber(offer.price)).filter((n): n is number => n !== null)
  if (prices.length > 0) return Math.min(...prices)
  return toNumber(guitar.msrp)
}

function currencyOf(guitar: GuitarDetailDto): string {
  return guitar.prices?.[0]?.currency ?? "USD"
}

function readValue(guitar: GuitarDetailDto, field: SpecField): string | number | boolean | null {
  // The schema has no free-form JSON spec column, so JSON-backed fields are
  // simply not available yet.
  if (field.json) return null

  switch (field.key) {
    case "brand":
      return guitar.brand.name
    case "currentBest":
      return bestPrice(guitar)
    case "category":
      return guitar.category
    default: {
      const value = (guitar as unknown as Record<string, unknown>)[field.key]
      if (value === undefined || value === null) return null
      if (typeof value === "object") {
        // Prisma Decimal columns are objects but are meaningfully numeric.
        const n = toNumber(value)
        return n
      }
      return value as string | number | boolean
    }
  }
}

function display(value: string | number | boolean | null, field: SpecField, currency: string): string {
  if (value === null || value === "") return "-"
  if (field.kind === "boolean") return value ? "Yes" : "No"
  if (field.kind === "currency") return formatPrice(Number(value), currency)
  if (field.kind === "number") return field.unit ? `${value} ${field.unit}` : String(value)
  if (field.kind === "text" && typeof value === "string") {
    return value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
  }
  return String(value)
}

function bestIndexFor(field: SpecField, cells: CompareCell[]): number | null {
  const higher = HIGHER_IS_BETTER.has(field.key)
  const lower = LOWER_IS_BETTER.has(field.key)
  if (!higher && !lower) return null
  let best: number | null = null
  let bestValue = higher ? -Infinity : Infinity
  cells.forEach((cell, i) => {
    const n = Number(cell.raw)
    if (!Number.isFinite(n)) return
    if (higher ? n > bestValue : n < bestValue) {
      bestValue = n
      best = i
    }
  })
  return best
}

export const compareService = {
  /** Resolve up to MAX_COMPARE slugs into a diffable comparison matrix. */
  async build(slugs: string[]): Promise<CompareResult> {
    const wanted = Array.from(new Set(slugs)).slice(0, MAX_COMPARE)
    const guitars = (
      await Promise.all(wanted.map((slug) => guitarRepository.detail(slug)))
    ).filter((g): g is GuitarDetailDto => Boolean(g))

    if (guitars.length === 0) {
      return { guitars: [], groups: [], differingCount: 0, identicalCount: 0 }
    }

    const categories = new Set(guitars.map((g) => g.category))
    const currency = currencyOf(guitars[0]!)

    let differingCount = 0
    let identicalCount = 0

    const groups: CompareGroup[] = SPEC_GROUPS.map((group) => {
      const rows = SPEC_FIELDS.filter((field) => {
        if (field.group !== group.key) return false
        if (!field.categories) return true
        return field.categories.some((c) => categories.has(c))
      })
        .map<CompareRow>((field) => {
          const cells = guitars.map((guitar) => {
            const raw = readValue(guitar, field)
            return { raw, display: display(raw, field, currencyOf(guitar) || currency) }
          })
          const first = cells[0]!.display
          const differs = cells.some((cell) => cell.display !== first)
          const allEmpty = cells.every((cell) => cell.display === "-")
          if (!allEmpty) {
            if (differs) {
              differingCount++
            } else {
              identicalCount++
            }
          }
          return {
            key: field.key,
            label: field.label,
            unit: field.unit,
            cells,
            differs,
            bestIndex: bestIndexFor(field, cells),
          }
        })
        .filter((row) => !row.cells.every((cell) => cell.display === "-"))

      return { key: group.key, label: group.label, rows }
    }).filter((group) => group.rows.length > 0)

    return { guitars, groups, differingCount, identicalCount }
  },

  /** Suggest a sensible comparison partner set for the quick-compare widget. */
  async suggestions(take = 8) {
    return guitarRepository.topBy("popularity", take)
  },
}
