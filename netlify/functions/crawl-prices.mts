import type { Config } from "@netlify/functions"

/** Scheduled: every 6 hours. */
export default async () => {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL
  const res = await fetch(`${base}/api/cron/crawl?target=prices`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  })
  const body = await res.text()
  console.log("[netlify/crawl-prices]", res.status, body)
  return new Response(body, { status: res.status })
}

export const config: Config = {
  schedule: "0 */6 * * *",
}
