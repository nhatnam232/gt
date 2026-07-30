import type { SourceKind } from "@prisma/client"

export type SourceSeed = {
  slug: string
  name: string
  kind: SourceKind
  baseUrl: string
  robotsUrl?: string
  /** 0-100. Highest trust wins when two sources disagree on a field. */
  trustWeight: number
  rateLimitMs?: number
  enabled?: boolean
}

/**
 * Registry of data sources. Official manufacturer sites carry the highest trust
 * weight, then structured open data, then retailers (authoritative for price,
 * weaker for specs). The merge engine resolves field conflicts by trustWeight.
 */
export const SOURCE_SEED: SourceSeed[] = [
  // structured open data
  { slug: "wikidata", name: "Wikidata SPARQL", kind: "WIKIDATA", baseUrl: "https://query.wikidata.org", trustWeight: 78, rateLimitMs: 1500 },
  { slug: "wikipedia", name: "Wikipedia REST API", kind: "WIKIPEDIA", baseUrl: "https://en.wikipedia.org", trustWeight: 62, rateLimitMs: 800 },

  // official manufacturer catalogs
  { slug: "yamaha", name: "Yamaha", kind: "OFFICIAL", baseUrl: "https://usa.yamaha.com", robotsUrl: "https://usa.yamaha.com/robots.txt", trustWeight: 100 },
  { slug: "fender", name: "Fender", kind: "OFFICIAL", baseUrl: "https://www.fender.com", robotsUrl: "https://www.fender.com/robots.txt", trustWeight: 100 },
  { slug: "squier", name: "Squier", kind: "OFFICIAL", baseUrl: "https://www.fender.com/en-US/squier", trustWeight: 98 },
  { slug: "ibanez", name: "Ibanez", kind: "OFFICIAL", baseUrl: "https://www.ibanez.com", robotsUrl: "https://www.ibanez.com/robots.txt", trustWeight: 100 },
  { slug: "taylor", name: "Taylor Guitars", kind: "OFFICIAL", baseUrl: "https://www.taylorguitars.com", trustWeight: 100 },
  { slug: "martin", name: "C.F. Martin & Co.", kind: "OFFICIAL", baseUrl: "https://www.martinguitar.com", trustWeight: 100 },
  { slug: "prs", name: "PRS Guitars", kind: "OFFICIAL", baseUrl: "https://prsguitars.com", trustWeight: 100 },
  { slug: "gibson", name: "Gibson", kind: "OFFICIAL", baseUrl: "https://www.gibson.com", trustWeight: 100 },
  { slug: "epiphone", name: "Epiphone", kind: "OFFICIAL", baseUrl: "https://www.epiphone.com", trustWeight: 98 },
  { slug: "cort", name: "Cort", kind: "OFFICIAL", baseUrl: "https://www.cortguitars.com", trustWeight: 96 },
  { slug: "takamine", name: "Takamine", kind: "OFFICIAL", baseUrl: "https://www.takamine.com", trustWeight: 98 },
  { slug: "esp", name: "ESP Guitars", kind: "OFFICIAL", baseUrl: "https://www.espguitars.com", trustWeight: 98 },
  { slug: "jackson", name: "Jackson", kind: "OFFICIAL", baseUrl: "https://www.jacksonguitars.com", trustWeight: 98 },
  { slug: "schecter", name: "Schecter", kind: "OFFICIAL", baseUrl: "https://schecterguitars.com", trustWeight: 96 },
  { slug: "music-man", name: "Ernie Ball Music Man", kind: "OFFICIAL", baseUrl: "https://www.music-man.com", trustWeight: 100 },
  { slug: "sterling", name: "Sterling by Music Man", kind: "OFFICIAL", baseUrl: "https://sterlingbymusicman.com", trustWeight: 96 },
  { slug: "gretsch", name: "Gretsch", kind: "OFFICIAL", baseUrl: "https://www.gretschguitars.com", trustWeight: 98 },
  { slug: "charvel", name: "Charvel", kind: "OFFICIAL", baseUrl: "https://www.charvel.com", trustWeight: 96 },
  { slug: "cordoba", name: "Cordoba Guitars", kind: "OFFICIAL", baseUrl: "https://cordobaguitars.com", trustWeight: 96 },
  { slug: "sigma", name: "Sigma Guitars", kind: "OFFICIAL", baseUrl: "https://www.sigma-guitars.com", trustWeight: 92 },
  { slug: "faith", name: "Faith Guitars", kind: "OFFICIAL", baseUrl: "https://faithguitars.com", trustWeight: 92 },
  { slug: "lava", name: "LAVA MUSIC", kind: "OFFICIAL", baseUrl: "https://www.lavamusic.com", trustWeight: 92 },
  { slug: "journey", name: "Journey Instruments", kind: "OFFICIAL", baseUrl: "https://journeyinstruments.com", trustWeight: 90 },
  { slug: "kepma", name: "Kepma", kind: "OFFICIAL", baseUrl: "https://www.kepmaguitars.com", trustWeight: 88 },
  { slug: "eastman", name: "Eastman Guitars", kind: "OFFICIAL", baseUrl: "https://www.eastmanguitars.com", trustWeight: 96 },
  { slug: "guild", name: "Guild Guitars", kind: "OFFICIAL", baseUrl: "https://guildguitars.com", trustWeight: 96 },
  { slug: "breedlove", name: "Breedlove", kind: "OFFICIAL", baseUrl: "https://breedlovemusic.com", trustWeight: 94 },
  { slug: "maton", name: "Maton", kind: "OFFICIAL", baseUrl: "https://maton.com.au", trustWeight: 96 },
  { slug: "lowden", name: "Lowden", kind: "OFFICIAL", baseUrl: "https://lowdenguitars.com", trustWeight: 98 },
  { slug: "suhr", name: "Suhr", kind: "OFFICIAL", baseUrl: "https://suhr.com", trustWeight: 98 },
  { slug: "solar", name: "Solar Guitars", kind: "OFFICIAL", baseUrl: "https://solar-guitars.com", trustWeight: 92 },
  { slug: "enya", name: "Enya Music", kind: "OFFICIAL", baseUrl: "https://www.enyamusic.com", trustWeight: 86 },
  { slug: "donner", name: "Donner", kind: "OFFICIAL", baseUrl: "https://www.donnerdeal.com", trustWeight: 82 },
  { slug: "harley-benton", name: "Harley Benton", kind: "RETAILER", baseUrl: "https://www.thomann.de/intl/harley_benton.html", trustWeight: 88 },

  // retailers: price + availability first, specs second
  { slug: "src-sweetwater", name: "Sweetwater catalog", kind: "RETAILER", baseUrl: "https://www.sweetwater.com", robotsUrl: "https://www.sweetwater.com/robots.txt", trustWeight: 70 },
  { slug: "src-thomann", name: "Thomann catalog", kind: "RETAILER", baseUrl: "https://www.thomann.de", robotsUrl: "https://www.thomann.de/robots.txt", trustWeight: 70 },
  { slug: "src-andertons", name: "Andertons catalog", kind: "RETAILER", baseUrl: "https://www.andertons.co.uk", trustWeight: 66 },
  { slug: "src-musicians-friend", name: "Musician's Friend catalog", kind: "RETAILER", baseUrl: "https://www.musiciansfriend.com", trustWeight: 66 },
  { slug: "src-reverb", name: "Reverb marketplace", kind: "RETAILER", baseUrl: "https://reverb.com", trustWeight: 58 },

  // editorial feeds -> Article records only, never product specs
  { slug: "feed-premierguitar", name: "Premier Guitar RSS", kind: "RSS", baseUrl: "https://www.premierguitar.com/feeds/all.rss", trustWeight: 40 },
  { slug: "feed-guitarworld", name: "Guitar World RSS", kind: "RSS", baseUrl: "https://www.guitarworld.com/feeds/all", trustWeight: 40 },
]

export const sourceBySlug = (slug: string) => SOURCE_SEED.find((s) => s.slug === slug)
