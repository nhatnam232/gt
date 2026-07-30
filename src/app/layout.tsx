import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { siteConfig } from "@/config/site"
import { graph, organizationSchema, websiteSchema } from "@/lib/seo/jsonld"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import "./globals.css"

const sans = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" })
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" })

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: { card: "summary_large_image", site: siteConfig.twitter },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcfa" },
    { media: "(prefers-color-scheme: dark)", color: "#111010" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />
        <script
          type="application/ld+json"
          // Site-wide Organization + WebSite graph (SearchAction enabled).
          dangerouslySetInnerHTML={{ __html: graph(organizationSchema(), websiteSchema()) }}
        />
      </head>
      <body className={`${sans.className} min-h-dvh bg-background`}>
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
            >
              Skip to content
            </a>
            <div className="flex min-h-dvh flex-col">
              <SiteHeader />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter />
            </div>
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
