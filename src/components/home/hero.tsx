"use client"

import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, GitCompareArrows, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchTrigger } from "@/components/search/search-trigger"
import { formatNumber } from "@/lib/utils"

export type HeroStats = {
  guitars: number
  brands: number
  offers: number
  specs: number
}

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.06 * i, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

/** Editorial hero with a light parallax layer and the primary search entry point. */
export function Hero({ stats }: { stats: HeroStats }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90])
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, reduce ? 1 : 0.35])

  const items = [
    { label: "Instruments tracked", value: stats.guitars },
    { label: "Brands", value: stats.brands },
    { label: "Retailer prices", value: stats.offers },
    { label: "Spec fields per guitar", value: stats.specs },
  ]

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="mesh pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="grid-lines pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden />

      <motion.div style={{ y, opacity }} className="container-page relative py-20 sm:py-28">
        <motion.div
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p variants={fade} custom={0}>
            <Link
              href="/rankings"
              className="glass inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Sparkles className="size-3.5 text-primary" />
              Independent rankings, rebuilt every hour
              <ArrowRight className="size-3.5" />
            </Link>
          </motion.p>

          <motion.h1
            variants={fade}
            custom={1}
            className="text-balance mt-6 text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-6xl"
          >
            Every guitar. Every spec.
            <br />
            <span className="gradient-text">Compared properly.</span>
          </motion.h1>

          <motion.p
            variants={fade}
            custom={2}
            className="text-balance mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-lg"
          >
            A structured database of acoustic, electric, bass and classical instruments - woods,
            electronics, scale lengths, weights, prices from multiple retailers, and side-by-side
            comparison of up to five guitars at once.
          </motion.p>

          <motion.div variants={fade} custom={3} className="mx-auto mt-9 max-w-2xl">
            <SearchTrigger variant="full" />
          </motion.div>

          <motion.div variants={fade} custom={4} className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/guitars">
                Browse the catalogue <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/compare">
                <GitCompareArrows className="size-4" /> Start a comparison
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.dl
          initial="hidden"
          animate="show"
          className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-4"
        >
          {items.map((item, i) => (
            <motion.div key={item.label} variants={fade} custom={5 + i} className="bg-card/80 p-5 text-center backdrop-blur">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{formatNumber(item.value)}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  )
}
