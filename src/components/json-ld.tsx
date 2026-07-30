export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function GuitarJsonLd({
  name,
  brand,
  image,
  description,
  price,
  url,
}: {
  name: string
  brand: string
  image?: string
  description?: string
  price?: number | null
  url: string
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        brand: { "@type": "Brand", name: brand },
        description,
        image,
        url,
        ...(price ? { offers: { "@type": "Offer", price, priceCurrency: "USD" } } : {}),
      }}
    />
  )
}

export function WebsiteJsonLd({ name, url, description }: { name: string; url: string; description: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        description,
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${url}/search?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  )
}
