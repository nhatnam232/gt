import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get("title") ?? "GuitarTribe"
  const subtitle = searchParams.get("subtitle") ?? "Independent guitar comparison engine"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a14",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
          color: "white",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ fontSize: 20, color: "#6b7280", marginBottom: 16 }}>GuitarTribe</div>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1, color: "#f9fafb" }}>{title}</div>
        <div style={{ fontSize: 24, color: "#9ca3af", marginTop: 20 }}>{subtitle}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
