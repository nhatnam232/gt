export type RetailerSeed = {
  slug: string
  name: string
  websiteUrl: string
  countryCode: string
}

/**
 * Retailers we resolve price offers against. Offers are only created by the ETL
 * price pipeline from a real product URL on one of these domains.
 */
export const RETAILER_SEED: RetailerSeed[] = [
  { slug: "sweetwater", name: "Sweetwater", websiteUrl: "https://www.sweetwater.com", countryCode: "US" },
  { slug: "thomann", name: "Thomann", websiteUrl: "https://www.thomann.de", countryCode: "DE" },
  { slug: "musicians-friend", name: "Musician's Friend", websiteUrl: "https://www.musiciansfriend.com", countryCode: "US" },
  { slug: "andertons", name: "Andertons", websiteUrl: "https://www.andertons.co.uk", countryCode: "GB" },
  { slug: "reverb", name: "Reverb", websiteUrl: "https://reverb.com", countryCode: "US" },
  { slug: "guitar-center", name: "Guitar Center", websiteUrl: "https://www.guitarcenter.com", countryCode: "US" },
  { slug: "gear4music", name: "Gear4music", websiteUrl: "https://www.gear4music.com", countryCode: "GB" },
  { slug: "amazon", name: "Amazon", websiteUrl: "https://www.amazon.com", countryCode: "US" },
]
