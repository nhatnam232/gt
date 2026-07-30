import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"
import { RANKING_DEFINITIONS } from "@/config/rankings"

export const metadata: Metadata = buildMetadata({
  title: "How we score",
  description: "Methodology behind GuitarTribe expert scores and ranking weights.",
  path: "/how-we-score",
})

export default function HowWeScorePage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-semibold">How we score</h1>

      <div className="prose-editorial mt-8 space-y-6 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">Expert score (0-10)</h2>
          <p className="mt-3">
            Each instrument is assessed across build quality and hardware, tonewoods and acoustic
            performance (or electronics for electric instruments), playability out of the box and
            ergonomics, price-to-performance ratio and brand support and warranty. Scores are set
            editorially and updated when new firmware or significant price changes occur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Owner rating (1-5 stars)</h2>
          <p className="mt-3">
            Submitted by verified buyers. A Bayesian adjustment is applied to pull low-sample
            averages toward the global mean, so a single five-star review cannot outrank a
            4.6 average across 300 reviews. Reviews are moderated before they count.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Value score</h2>
          <p className="mt-3">
            Expert score divided by street price (normalised per category), so a budget
            instrument with great value can appear high in the Best Value ranking even if its
            absolute score is modest.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Ranking weights</h2>
          <p className="mt-3">
            Each named ranking uses a different weighting across four components: expert score,
            owner rating, value score and popularity. The exact weights are:
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border bg-card">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium">Ranking</th>
                  <th className="px-4 py-3 text-right font-medium">Expert</th>
                  <th className="px-4 py-3 text-right font-medium">Owner</th>
                  <th className="px-4 py-3 text-right font-medium">Value</th>
                  <th className="px-4 py-3 text-right font-medium">Popularity</th>
                </tr>
              </thead>
              <tbody>
                {RANKING_DEFINITIONS.map((def) => (
                  <tr key={def.key} className="border-b last:border-0">
                    <td className="px-4 py-3">{def.title}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{def.weights.expert}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{def.weights.user}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{def.weights.value}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{def.weights.popularity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
