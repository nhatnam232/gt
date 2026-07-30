/**
 * Normalizes raw SourceRecord.raw JSON into SourceRecord.normalized.
 *
 * The normalizer maps heterogeneous raw shapes (JSON-LD Product, OpenGraph,
 * Wikidata SPARQL, RSS item) to a canonical NormalizedGuitar shape that the
 * merger can consume.
 */

import { prisma } from "../src/lib/prisma"

export type NormalizedGuitar = {
  name: string
  brand: string | null
  model: string | null
  category: string | null
  bodyShape: string | null
  topWood: string | null
  backWood: string | null
  scaleLengthIn: number | null
  frets: number | null
  strings: number | null
  madeIn: string | null
  year: number | null
  msrp: number | null
  currency: string
  image: string | null
  description: string | null
  url: string
}

function coercePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(String(value).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

function guessCategory(text: string | null | undefined): string | null {
  if (!text) return null
  const lower = text.toLowerCase()
  if (lower.includes('acoustic')) return 'ACOUSTIC'
  if (lower.includes('electric') && !lower.includes('electro')) return 'ELECTRIC'
  if (lower.includes('electro') || lower.includes('electro-acoustic')) return 'ACOUSTIC'
  if (lower.includes('bass')) return 'BASS'
  if (lower.includes('classical') || lower.includes('nylon')) return 'CLASSICAL'
  if (lower.includes('ukulele')) return 'UKULELE'
  if (lower.includes('amplifier') || lower.includes('amp')) return 'AMPLIFIER'
  if (lower.includes('pedal') || lower.includes('effect')) return 'PEDAL'
  return null
}

function normalizeRaw(raw: Record<string, unknown>, url: string): NormalizedGuitar | null {
  const type = String(raw['_type'] ?? '')

  if (type === 'jsonld') {
    const name = String(raw['name'] ?? '').trim()
    if (!name) return null
    const brandRaw = raw['brand'] as Record<string, unknown> | string | null
    const brand = typeof brandRaw === 'object' ? String(brandRaw?.['name'] ?? '') : String(brandRaw ?? '')
    const desc = String(raw['description'] ?? '')
    const offers = Array.isArray(raw['offers']) ? raw['offers'][0] : raw['offers']
    const price = coercePrice((offers as Record<string, unknown> | null)?.['price'])
    const imageRaw = raw['image']
    const image = typeof imageRaw === 'string' ? imageRaw : (imageRaw as Record<string, unknown>)?.['url'] as string ?? null
    return {
      name,
      brand: brand || null,
      model: null,
      category: guessCategory(desc) ?? guessCategory(name),
      bodyShape: null,
      topWood: null,
      backWood: null,
      scaleLengthIn: null,
      frets: null,
      strings: null,
      madeIn: null,
      year: null,
      msrp: price,
      currency: String((offers as Record<string, unknown> | null)?.['priceCurrency'] ?? 'USD'),
      image: typeof image === 'string' ? image : null,
      description: desc || null,
      url,
    }
  }

  if (type === 'opengraph') {
    const name = String(raw['title'] ?? raw['og:title'] ?? '').trim()
    if (!name) return null
    return {
      name,
      brand: null,
      model: null,
      category: guessCategory(name) ?? guessCategory(String(raw['description'] ?? '')),
      bodyShape: null,
      topWood: null,
      backWood: null,
      scaleLengthIn: null,
      frets: null,
      strings: null,
      madeIn: null,
      year: null,
      msrp: coercePrice(raw['price']),
      currency: 'USD',
      image: String(raw['image'] ?? '').startsWith('http') ? String(raw['image']) : null,
      description: String(raw['description'] ?? '') || null,
      url,
    }
  }

  if (type === 'wikidata') {
    const name = String(raw['label'] ?? '').trim()
    if (!name) return null
    return {
      name,
      brand: String(raw['manufacturer'] ?? '') || null,
      model: null,
      category: guessCategory(name),
      bodyShape: null,
      topWood: null,
      backWood: null,
      scaleLengthIn: null,
      frets: null,
      strings: null,
      madeIn: String(raw['country'] ?? '') || null,
      year: raw['inception'] ? new Date(String(raw['inception'])).getFullYear() : null,
      msrp: null,
      currency: 'USD',
      image: String(raw['image'] ?? '') || null,
      description: null,
      url,
    }
  }

  return null
}

export async function normalizeAll() {
  const pending = await prisma.sourceRecord.findMany({
    where: { normalized: { equals: null } },
    take: 5000,
  })
  console.log(`[normalizer] Processing ${pending.length} raw records...`)

  let done = 0
  for (const record of pending) {
    const normalized = normalizeRaw(record.raw as Record<string, unknown>, record.url)
    await prisma.sourceRecord.update({
      where: { id: record.id },
      data: { normalized: normalized ?? undefined },
    })
    done++
  }
  console.log(`[normalizer] Normalized ${done} records`)
}
