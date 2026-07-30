import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const HOME_FAQ: { question: string; answer: string }[] = [
  {
    question: "Where do the specifications come from?",
    answer:
      "Every record is built by our importer from public manufacturer documentation and catalogues (official brand sites, Wikidata, Wikipedia and retailer product feeds). Each field keeps a reference to the source it was merged from, and sources are weighted by trust so official data always wins over aggregators.",
  },
  {
    question: "How often are prices updated?",
    answer:
      "Retailer offers are refreshed on a schedule (every six hours in the default configuration) and price history is stored so you can see how an instrument has moved over time. Prices are indicative - always confirm on the retailer page before buying.",
  },
  {
    question: "How are expert scores calculated?",
    answer:
      "Scores combine build and hardware quality, tonewood construction, electronics, playability out of the box and price-to-performance. The exact weighting per category is published on the How we score page, and a value score is derived from the score-to-street-price ratio.",
  },
  {
    question: "How many guitars can I compare at once?",
    answer:
      "Up to five. The comparison table highlights every difference, can hide rows where all instruments are identical, and can be shared as a link or exported to PDF.",
  },
  {
    question: "Do you sell instruments?",
    answer:
      "No. We are an independent database and comparison engine. We link out to retailers so you can check availability and price, and we are not affiliated with any manufacturer.",
  },
  {
    question: "Can I contribute a review?",
    answer:
      "Yes. Owner reviews can be submitted on any instrument page. Submissions are rate limited, sanitised and manually approved before they affect the owner rating.",
  },
]

export function HomeFaq() {
  return (
    <Accordion type="single" collapsible className="hairline rounded-2xl border bg-card px-5">
      {HOME_FAQ.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger className="text-left text-[15px]">{item.question}</AccordionTrigger>
          <AccordionContent className="text-[14.5px] leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
