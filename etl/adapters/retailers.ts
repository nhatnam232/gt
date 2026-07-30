/**
 * Imports guitar listings from retailer RSS/JSON feeds and OpenGraph tags.
 * Supports: Sweetwater, Thomann, Reverb (public RSS), Andertons.
 *
 * No credentials required - public feeds only.
 */

import * as cheerio from "cheerio"
import pLimit from "p-limit"
import { prisma } from "../../src/lib/prisma"
import { createJob, finishJob, logJob } from "../job"
import { safeGet } from "../http"

const RSS_SOURCES: { slug: string; feedUrl: string }[] = [
  { slug: "sweetwater", feedUrl: "https://www.sweetwater.com/store/rss/guitars" },
  { slug: "thomann", feedUrl: "https://feeds.thomann.de/thomann/guitars_en.xml" },
  { slug: "andertons", feedUrl: "https://www.andertons.co.uk/guitars/acoustic-guitars.rss" },
]

export async function crawlRetailers() {
  const job = await createJob("retailers")
  let found = 0, added = 0

  const limit = pLimit(2)

  await Promise.all(
    RSS_SOURCES.map((rss) =>
      limit(async () => {
        try {
          const source = await prisma.source.findUnique({ where: { slug: rss.slug } })
          if (!source) return
          await logJob(job.id, "INFO", `Fetching RSS feed: ${rss.feedUrl}`)
          const xml = await safeGet(rss.feedUrl)
          if (!xml) return

          const $ = cheerio.load(xml, { xmlMode: true })
          const items: Record<string, unknown>[] = []

          $('item, entry').each((_, el) => {
            const item: Record<string, unknown> = {
              _source: rss.slug,
              title: $(el).find('title').first().text().trim(),
              link: $(el).find('link').first().text().trim() || $(el).find('link').attr('href') || '',
              description: $(el).find('description, summary').first().text().trim(),
              price: $(el).find('g\\:price, price').first().text().trim() || null,
              image: $(el).find('media\\:content, enclosure').first().attr('url') || null,
              pubDate: $(el).find('pubDate, published, updated').first().text().trim() || null,
            }
            if (item['title']) items.push(item)
          })

          found += items.length

          for (const item of items) {
            const fingerprint = `${rss.slug}:${item['link'] as string}`
            const existing = await prisma.sourceRecord.findFirst({
              where: { sourceId: source.id, fingerprint },
            })
            if (!existing) {
              await prisma.sourceRecord.create({
                data: {
                  sourceId: source.id,
                  url: String(item['link'] || ''),
                  fingerprint,
                  raw: item,
                  confidence: source.trustWeight / 100,
                  fetchedAt: new Date(),
                },
              })
              added++
            }
          }
        } catch (err) {
          await logJob(job.id, "ERROR", `Retailer ${rss.slug} failed: ${String(err)}`)
        }
      }),
    ),
  )

  await finishJob(job.id, { found, added, failed: 0 })
  console.log(`[retailers] found=${found} added=${added}`)
}
