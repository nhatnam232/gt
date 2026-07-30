/**
 * Crawls official manufacturer product pages listed in src/config/brands.ts.
 *
 * Strategy:
 *  1. Load the brand's sitemap.xml (or /guitars, /products, /electric-guitars etc.)
 *  2. Follow product links and extract JSON-LD Product schema or OpenGraph tags.
 *  3. Upsert a SourceRecord for each product found.
 *
 * Robots.txt is always checked and honoured.
 */

import * as cheerio from "cheerio"
import pLimit from "p-limit"
import { prisma } from "../../src/lib/prisma"
import { SOURCE_SEED } from "../../src/config/sources"
import { createJob, finishJob, logJob } from "../job"
import { fetchRobots, isAllowed } from "../robots"
import { safeGet } from "../http"

const CONCURRENCY = Number(process.env.CRAWLER_CONCURRENCY ?? 2)
const DELAY_MS = Number(process.env.CRAWLER_DELAY_MS ?? 1500)

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function crawlBrands() {
  const job = await createJob("official-brands")
  let found = 0, added = 0, failed = 0

  // SourceKind enum value is OFFICIAL_BRAND (see prisma/schema.prisma)
  const officialSources = SOURCE_SEED.filter((s) => s.kind === "OFFICIAL_BRAND")
  const limit = pLimit(CONCURRENCY)

  await Promise.all(
    officialSources.map((source) =>
      limit(async () => {
        try {
          await logJob(job.id, "INFO", `Crawling ${source.name} (${source.baseUrl})`)
          const robots = await fetchRobots(source.baseUrl)
          const productUrls = await discoverProductUrls(source.baseUrl, robots)

          for (const url of productUrls.slice(0, 500)) {
            try {
              await sleep(DELAY_MS)
              if (!isAllowed(robots, url)) continue
              const html = await safeGet(url)
              if (!html) continue

              const data = extractProduct(html, url, source.name)
              if (!data) continue

              found++
              const fingerprint = `${source.slug}:${url}`

              const sourceRow = await prisma.source.findUnique({ where: { slug: source.slug } })
              if (!sourceRow) continue

              const existing = await prisma.sourceRecord.findFirst({
                where: { sourceId: sourceRow.id, fingerprint },
              })

              if (!existing) {
                await prisma.sourceRecord.create({
                  data: {
                    sourceId: sourceRow.id,
                    url,
                    fingerprint,
                    raw: data,
                    normalized: null,
                    confidence: source.trustWeight / 100,
                    fetchedAt: new Date(),
                  },
                })
                added++
              } else {
                await prisma.sourceRecord.update({
                  where: { id: existing.id },
                  data: { raw: data, fetchedAt: new Date() },
                })
              }
            } catch (err) {
              failed++
              await logJob(job.id, "WARN", `Failed to fetch ${url}: ${String(err)}`)
            }
          }
        } catch (err) {
          await logJob(job.id, "ERROR", `Source ${source.name} failed: ${String(err)}`)
        }
      }),
    ),
  )

  await finishJob(job.id, { found, added, failed })
  console.log(`[brands] found=${found} added=${added} failed=${failed}`)
}

async function discoverProductUrls(
  baseUrl: string,
  _robots: string,
): Promise<string[]> {
  const urls: string[] = []

  // Try sitemap.xml first
  const sitemapUrl = `${baseUrl}/sitemap.xml`
  const sitemapXml = await safeGet(sitemapUrl)
  if (sitemapXml) {
    const $ = cheerio.load(sitemapXml, { xmlMode: true })
    $('loc').each((_, el) => {
      const loc = $(el).text().trim()
      if (/\/(guitars?|products?|electric|acoustic|bass|classical|ukulele)\//i.test(loc)) {
        urls.push(loc)
      }
    })
  }

  // Fallback: scrape homepage for category links
  if (urls.length === 0) {
    const html = await safeGet(baseUrl)
    if (html) {
      const $ = cheerio.load(html)
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') ?? ''
        const abs = href.startsWith('http') ? href : `${baseUrl}${href}`
        if (/\/(guitars?|products?|electric|acoustic|bass)\//i.test(abs) && abs.startsWith(baseUrl)) {
          urls.push(abs)
        }
      })
    }
  }

  return [...new Set(urls)]
}

function extractProduct(
  html: string,
  url: string,
  sourceName: string,
): Record<string, unknown> | null {
  const $ = cheerio.load(html)

  // Try JSON-LD Product schema first
  const jsonLdScripts = $('script[type="application/ld+json"]').toArray()
  for (const el of jsonLdScripts) {
    try {
      const raw = JSON.parse($(el).html() ?? '')
      const items = Array.isArray(raw) ? raw : [raw]
      const product = items.find(
        (item) => item['@type'] === 'Product' || item['@type'] === 'MusicInstrument',
      )
      if (product) {
        return {
          _source: sourceName,
          _url: url,
          _type: 'jsonld',
          ...product,
        }
      }
    } catch { /* non-JSON */ }
  }

  // Fallback: OpenGraph + meta tags
  const og: Record<string, unknown> = { _source: sourceName, _url: url, _type: 'opengraph' }
  $('meta[property^="og:"]').each((_, el) => {
    const property = $(el).attr('property')?.replace('og:', '') ?? ''
    og[property] = $(el).attr('content')
  })
  $('meta[name="description"]').each((_, el) => {
    og['description'] = $(el).attr('content')
  })
  const title = $('h1').first().text().trim() || $('title').text().trim()
  if (title) og['title'] = title

  // Only return if we have at least a title
  if (!og['title'] && !og['og:title']) return null

  return og
}
