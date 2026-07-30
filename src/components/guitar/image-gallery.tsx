"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

type GalleryImage = {
  url: string
  alt: string
  width: number | null
  height: number | null
  blurData: string | null
  is360: boolean
}

export function ImageGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const current = images[index]

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  if (!current) return null

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border bg-muted">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="relative aspect-square"
          >
            <Image
              src={current.url}
              alt={current.alt || name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              placeholder={current.blurData ? "blur" : "empty"}
              blurDataURL={current.blurData ?? undefined}
              className="object-contain p-6"
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-background/80 shadow backdrop-blur transition hover:bg-background"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid size-9 place-items-center rounded-full bg-background/80 shadow backdrop-blur transition hover:bg-background"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => setZoom(true)}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/80 shadow backdrop-blur transition hover:bg-background"
          aria-label="Zoom image"
        >
          <ZoomIn className="size-4" />
        </button>

        {current.is360 ? (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">
            360°
          </span>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted transition",
                i === index ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="64px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      ) : null}

      {/* Lightbox */}
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-4xl bg-black/95 p-2">
          <DialogTitle className="sr-only">Image zoom - {current.alt || name}</DialogTitle>
          <div className="relative aspect-square">
            <Image
              src={current.url}
              alt={current.alt || name}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
