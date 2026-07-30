"use client"

import Image from "next/image"
import { useState } from "react"
import { Play } from "lucide-react"

/**
 * Facade player: renders the YouTube thumbnail only and swaps in the iframe on
 * click, so no third-party JS or cookies load with the page.
 */
export function YoutubeCard({
  videoId,
  title,
  channel,
}: {
  videoId: string
  title: string
  channel: string | null
}) {
  const [active, setActive] = useState(false)

  return (
    <figure className="hairline overflow-hidden rounded-2xl border bg-card">
      <div className="relative aspect-video bg-muted">
        {active ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="group absolute inset-0"
            aria-label={`Play video: ${title}`}
          >
            <Image
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/25 transition-colors group-hover:bg-black/35">
              <span className="grid size-14 place-items-center rounded-full bg-white/95 text-black shadow-lg transition-transform group-hover:scale-110">
                <Play className="size-6 translate-x-[1px]" />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="p-4">
        <p className="line-clamp-2 text-sm font-medium">{title}</p>
        {channel ? <p className="mt-1 text-xs text-muted-foreground">{channel}</p> : null}
      </figcaption>
    </figure>
  )
}
