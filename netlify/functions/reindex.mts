import type { Config } from "@netlify/functions"

/** Scheduled: daily 03:30 UTC — rebuild Meilisearch index + rankings. */
export default async () => {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL
  const res = await fetch(`${base}/api/cron/reindex`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  })
  const body = await res.text()
  console.log("[netlify/reindex]", res.status, body)
  return new Response(body, { status: res.status })
}

export const config: Config = {
  schedule: "30 3 * * *",
}
