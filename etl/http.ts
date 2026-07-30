const USER_AGENT =
  process.env.CRAWLER_USER_AGENT ?? "GuitarTribeBot/1.0 (https://guitartribe.io; bot@guitartribe.io)"

export async function safeGet(url: string, timeoutMs = 15_000): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,application/xml,*/*" },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!response.ok) return null
    return await response.text()
  } catch {
    return null
  }
}
