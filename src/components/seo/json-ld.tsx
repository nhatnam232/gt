/**
 * Renders a schema.org @graph document. Kept as a tiny server component so any
 * page can attach structured data without duplicating script boilerplate.
 */
export function JsonLd({ data }: { data: string }) {
  return (
    <script
      type="application/ld+json"
      // Content is produced by our own serialiser from typed inputs, never from
      // raw user HTML.
      dangerouslySetInnerHTML={{ __html: data }}
    />
  )
}
