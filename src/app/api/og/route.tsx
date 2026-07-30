import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { siteConfig } from "@/config/site"

export const runtime = "edge"

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") ?? siteConfig.name
  const description = searchParams.get("description") ?? siteConfig.description

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column",
        alignItems: "flex-start", justifyContent: "flex-end", padding: "60px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", top: 48, left: 60, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 20 }}>🎸</span>
          </div>
          <span style={{ color: "white", fontSize: 22, fontWeight: 700 }}>{siteConfig.name}</span>
        </div>
        <p style={{ color: "#94a3b8", fontSize: 22, margin: "0 0 16px 0", maxWidth: 800 }}>{description}</p>
        <h1 style={{ color: "white", fontSize: 56, fontWeight: 800, margin: 0, lineHeight: 1.1, maxWidth: 900 }}>{title}</h1>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
