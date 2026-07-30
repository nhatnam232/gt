import type { Metadata } from "next"

export const metadata: Metadata = { title: "About GuitarTribe" }

export default function AboutPage() {
  return (
    <div className="container-page py-10 max-w-2xl">
      <h1 className="text-3xl font-bold">About GuitarTribe</h1>
      <div className="mt-6 prose-editorial">
        <p>GuitarTribe is an independent guitar comparison engine, built by musicians for musicians.</p>
        <p>Our mission: give every player — from beginner to pro — the data they need to make a confident buying decision, without ads, affiliate bias, or manufacturer spin.</p>
        <h2>How it works</h2>
        <ul>
          <li>We crawl official brand sites, Wikidata, and trusted retailers to build our guitar database.</li>
          <li>Expert scores are aggregated from Guitar World, Guitar Player, Sweetwater, and Thomann editorial teams.</li>
          <li>User ratings are collected from verified owners.</li>
          <li>Prices update every 6 hours from retailer APIs.</li>
        </ul>
        <h2>Editorial policy</h2>
        <p>Every guitar that enters our database goes through editorial review before it’s published. We may earn a small affiliate commission when you buy through our links, at no extra cost to you.</p>
      </div>
    </div>
  )
}
