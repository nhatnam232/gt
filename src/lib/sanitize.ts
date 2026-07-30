import DOMPurify from "isomorphic-dompurify"

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "blockquote", "code", "pre",
  "ul", "ol", "li", "h2", "h3", "h4", "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td", "hr", "span",
]

/**
 * Sanitise any HTML that originated outside the codebase (editorial bodies,
 * crawled descriptions, user reviews) before it reaches the DOM.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href", "title", "target", "rel", "src", "alt", "width", "height"],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/)/i,
    FORBID_ATTR: ["style", "onerror", "onload"],
  })
}

/** Strip all markup - used for meta descriptions and search documents. */
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    .replace(/\s+/g, " ")
    .trim()
}
