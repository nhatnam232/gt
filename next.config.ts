import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV === "development"

/**
 * Content-Security-Policy. `unsafe-eval` is only enabled in development for
 * React Refresh. Keep the allowlist narrow: image CDN, YouTube embeds, search.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://i.ytimg.com https://*.scdn.co https://images.unsplash.com",
  "font-src 'self' data:",
  "media-src 'self' https://res.cloudinary.com",
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
  "connect-src 'self' https://*.upstash.io https://*.meilisearch.io https://vitals.vercel-insights.com",
  "upgrade-insecure-requests",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "**.yamaha.com" },
      { protocol: "https", hostname: "**.fender.com" },
      { protocol: "https", hostname: "**.thomann.de" },
      { protocol: "https", hostname: "**.sweetwater.com" },
      { protocol: "https", hostname: "**.taylorguitars.com" },
      { protocol: "https", hostname: "**.martinguitar.com" },
      { protocol: "https", hostname: "**.ibanez.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
  async redirects() {
    return [{ source: "/guitar/:slug", destination: "/guitars/:slug", permanent: true }]
  },
}

export default nextConfig
