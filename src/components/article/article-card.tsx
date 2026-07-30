import Image from "next/image"
import Link from "next/link"
import type { ArticleCard as ArticleCardDto } from "@/server/repositories/article.repository"
import { cn, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export const ARTICLE_PATH: Record<string, string> = {
  REVIEW: "reviews",
  GUIDE: "guides",
  NEWS: "news",
  DEAL: "deals",
}

export function ArticleCard({
  article,
  className,
  compact = false,
}: {
  article: ArticleCardDto
  className?: string
  compact?: boolean
}) {
  const href = `/${ARTICLE_PATH[article.type] ?? "reviews"}/${article.slug}`

  return (
    <article className={cn("card-hover hairline group overflow-hidden rounded-2xl border bg-card", className)}>
      <Link href={href} className="block">
        {!compact ? (
          <span className="relative block aspect-[16/9] overflow-hidden bg-muted">
            {article.coverUrl ? (
              <Image
                src={article.coverUrl}
                alt={article.coverAlt ?? ""}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : null}
          </span>
        ) : null}
        <span className="block p-5">
          <span className="flex items-center gap-2">
            <Badge variant="secondary">{article.type.toLowerCase()}</Badge>
            {article.publishedAt ? (
              <span className="text-xs text-muted-foreground">{formatDate(article.publishedAt)}</span>
            ) : null}
            {article.readMinutes ? (
              <span className="text-xs text-muted-foreground">{article.readMinutes} min read</span>
            ) : null}
          </span>
          <span className="mt-3 block text-base font-semibold leading-snug transition-colors group-hover:text-primary">
            {article.title}
          </span>
          {article.excerpt ? (
            <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">
              {article.excerpt}
            </span>
          ) : null}
          <span className="mt-3 block text-xs text-muted-foreground">By {article.authorName}</span>
        </span>
      </Link>
    </article>
  )
}
