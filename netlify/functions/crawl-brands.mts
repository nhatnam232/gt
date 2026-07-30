import type { Config } from "@netlify/functions"

/**
 * Scheduled: daily 02:00 UTC.
 * Calls the app's own cron route so all ETL logic stays in one place.
 */
export default async () => {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL
  const res = await fetch(`${base}/api/cron/crawl?target=brands`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  })
  const body = await res.text()
  console.log("[netlify/crawl-brands]", res.status, body)
  return new Response(body, { status: res.status })
}

export const config: Config = {
  schedule: "0 2 * * *",
}
