import { safeGet } from "./http"

export async function fetchRobots(baseUrl: string): Promise<string> {
  const text = await safeGet(`${baseUrl}/robots.txt`)
  return text ?? ""
}

export function isAllowed(robotsTxt: string, url: string): boolean {
  if (!process.env.CRAWLER_RESPECT_ROBOTS || process.env.CRAWLER_RESPECT_ROBOTS === 'false') {
    return true
  }
  if (!robotsTxt) return true

  const lines = robotsTxt.split('\n').map((l) => l.trim())
  let inOurAgent = false
  const disallowed: string[] = []

  for (const line of lines) {
    if (line.toLowerCase().startsWith('user-agent:')) {
      const agent = line.split(':')[1]?.trim() ?? ''
      inOurAgent = agent === '*' || agent.toLowerCase().includes('guitartribe')
    }
    if (inOurAgent && line.toLowerCase().startsWith('disallow:')) {
      const path = line.split(':')[1]?.trim() ?? ''
      if (path) disallowed.push(path)
    }
  }

  try {
    const urlPath = new URL(url).pathname
    return !disallowed.some((d) => urlPath.startsWith(d))
  } catch {
    return true
  }
}
