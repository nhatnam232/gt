import { ImageResponse } from "next/og"
import { siteConfig } from "@/config/site"

export const runtime = "edge"
export const alt = siteConfig.name
export const size = { width: 1200, height: 630 }

/** Dynamic OpenGraph card generator used as the fallback social image. */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get("title") ?? siteConfig.tagline).slice(0, 120)
  const subtitle = (searchParams.get("subtitle") ?? siteConfig.name).slice(0, 120)

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #120f0d 0%, #1d1613 55%, #2a1a0d 100%)",
          padding: 72,
          color: "#fbf7f2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, opacity: 0.85 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "#f0821f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              color: "#1a1108",
              fontWeight: 700,
            }}
          >
            G
          </div>
          <span style={{ fontWeight: 600 }}>{siteConfig.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.6 }}>
            {title}
          </div>
          <div style={{ fontSize: 30, opacity: 0.72 }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, opacity: 0.6 }}>
          <span>Specs</span>
          <span>-</span>
          <span>Scores</span>
          <span>-</span>
          <span>Prices</span>
          <span>-</span>
          <span>Side-by-side comparison</span>
        </div>
      </div>
    ),
    size,
  )
}
