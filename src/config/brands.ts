export type PriceTier = "BUDGET" | "MID" | "PREMIUM" | "BOUTIQUE"

export type BrandSeed = {
  slug: string
  name: string
  websiteUrl: string
  countryCode: string
  foundedYear?: number
  priceTier: PriceTier
  featured?: boolean
  /** Wikidata QID - used by the ETL to enrich brand-level facts. */
  wikidataId?: string
}

/**
 * Verifiable manufacturer facts only (name, official site, country of origin,
 * founding year, Wikidata QID). No invented product data - instruments are only
 * ever created by the ETL pipeline from real sources.
 */
export const BRAND_SEED: BrandSeed[] = [
  { slug: "yamaha", name: "Yamaha", websiteUrl: "https://usa.yamaha.com", countryCode: "JP", foundedYear: 1887, priceTier: "MID", featured: true, wikidataId: "Q211001" },
  { slug: "fender", name: "Fender", websiteUrl: "https://www.fender.com", countryCode: "US", foundedYear: 1946, priceTier: "MID", featured: true, wikidataId: "Q212533" },
  { slug: "gibson", name: "Gibson", websiteUrl: "https://www.gibson.com", countryCode: "US", foundedYear: 1902, priceTier: "PREMIUM", featured: true, wikidataId: "Q727330" },
  { slug: "ibanez", name: "Ibanez", websiteUrl: "https://www.ibanez.com", countryCode: "JP", foundedYear: 1957, priceTier: "MID", featured: true, wikidataId: "Q604808" },
  { slug: "taylor", name: "Taylor Guitars", websiteUrl: "https://www.taylorguitars.com", countryCode: "US", foundedYear: 1974, priceTier: "PREMIUM", featured: true, wikidataId: "Q1362686" },
  { slug: "martin", name: "C.F. Martin & Co.", websiteUrl: "https://www.martinguitar.com", countryCode: "US", foundedYear: 1833, priceTier: "PREMIUM", featured: true, wikidataId: "Q1094760" },
  { slug: "prs", name: "PRS Guitars", websiteUrl: "https://prsguitars.com", countryCode: "US", foundedYear: 1985, priceTier: "PREMIUM", featured: true, wikidataId: "Q1799381" },
  { slug: "epiphone", name: "Epiphone", websiteUrl: "https://www.epiphone.com", countryCode: "US", foundedYear: 1873, priceTier: "BUDGET", featured: true, wikidataId: "Q1345524" },
  { slug: "squier", name: "Squier", websiteUrl: "https://www.fender.com/en-US/squier", countryCode: "US", foundedYear: 1982, priceTier: "BUDGET", featured: true, wikidataId: "Q1362735" },
  { slug: "cort", name: "Cort", websiteUrl: "https://www.cortguitars.com", countryCode: "KR", foundedYear: 1960, priceTier: "BUDGET", featured: true, wikidataId: "Q1136637" },
  { slug: "takamine", name: "Takamine", websiteUrl: "https://www.takamine.com", countryCode: "JP", foundedYear: 1959, priceTier: "MID", featured: true, wikidataId: "Q1755798" },
  { slug: "esp", name: "ESP Guitars", websiteUrl: "https://www.espguitars.com", countryCode: "JP", foundedYear: 1975, priceTier: "PREMIUM", featured: true, wikidataId: "Q1367396" },
  { slug: "jackson", name: "Jackson", websiteUrl: "https://www.jacksonguitars.com", countryCode: "US", foundedYear: 1980, priceTier: "MID", wikidataId: "Q1680781" },
  { slug: "schecter", name: "Schecter Guitar Research", websiteUrl: "https://schecterguitars.com", countryCode: "US", foundedYear: 1976, priceTier: "MID", wikidataId: "Q1799418" },
  { slug: "music-man", name: "Ernie Ball Music Man", websiteUrl: "https://www.music-man.com", countryCode: "US", foundedYear: 1974, priceTier: "PREMIUM", featured: true, wikidataId: "Q1954377" },
  { slug: "sterling", name: "Sterling by Music Man", websiteUrl: "https://sterlingbymusicman.com", countryCode: "US", foundedYear: 2009, priceTier: "BUDGET" },
  { slug: "gretsch", name: "Gretsch", websiteUrl: "https://www.gretschguitars.com", countryCode: "US", foundedYear: 1883, priceTier: "MID", featured: true, wikidataId: "Q1544773" },
  { slug: "charvel", name: "Charvel", websiteUrl: "https://www.charvel.com", countryCode: "US", foundedYear: 1974, priceTier: "MID", wikidataId: "Q1064613" },
  { slug: "harley-benton", name: "Harley Benton", websiteUrl: "https://www.thomann.de/intl/harley_benton.html", countryCode: "DE", foundedYear: 1997, priceTier: "BUDGET", featured: true },
  { slug: "cordoba", name: "Cordoba Guitars", websiteUrl: "https://cordobaguitars.com", countryCode: "US", foundedYear: 1997, priceTier: "MID", featured: true },
  { slug: "enya", name: "Enya Music", websiteUrl: "https://www.enyamusic.com", countryCode: "CN", foundedYear: 2016, priceTier: "BUDGET" },
  { slug: "donner", name: "Donner", websiteUrl: "https://www.donnerdeal.com", countryCode: "CN", foundedYear: 2012, priceTier: "BUDGET" },
  { slug: "sigma", name: "Sigma Guitars", websiteUrl: "https://www.sigma-guitars.com", countryCode: "DE", foundedYear: 1970, priceTier: "BUDGET", wikidataId: "Q2286845" },
  { slug: "faith", name: "Faith Guitars", websiteUrl: "https://faithguitars.com", countryCode: "GB", foundedYear: 2002, priceTier: "MID" },
  { slug: "lava", name: "LAVA MUSIC", websiteUrl: "https://www.lavamusic.com", countryCode: "CN", foundedYear: 2013, priceTier: "MID", featured: true },
  { slug: "journey", name: "Journey Instruments", websiteUrl: "https://journeyinstruments.com", countryCode: "US", foundedYear: 2011, priceTier: "MID" },
  { slug: "kepma", name: "Kepma", websiteUrl: "https://www.kepmaguitars.com", countryCode: "CN", foundedYear: 2004, priceTier: "BUDGET" },
  { slug: "eastman", name: "Eastman Guitars", websiteUrl: "https://www.eastmanguitars.com", countryCode: "US", foundedYear: 1992, priceTier: "PREMIUM" },
  { slug: "guild", name: "Guild Guitars", websiteUrl: "https://guildguitars.com", countryCode: "US", foundedYear: 1952, priceTier: "MID", wikidataId: "Q1552543" },
  { slug: "breedlove", name: "Breedlove", websiteUrl: "https://breedlovemusic.com", countryCode: "US", foundedYear: 1990, priceTier: "MID" },
  { slug: "maton", name: "Maton", websiteUrl: "https://maton.com.au", countryCode: "AU", foundedYear: 1946, priceTier: "PREMIUM", wikidataId: "Q6791350" },
  { slug: "lowden", name: "Lowden", websiteUrl: "https://lowdenguitars.com", countryCode: "GB", foundedYear: 1974, priceTier: "BOUTIQUE", wikidataId: "Q6693735" },
  { slug: "suhr", name: "Suhr", websiteUrl: "https://suhr.com", countryCode: "US", foundedYear: 1997, priceTier: "BOUTIQUE" },
  { slug: "solar", name: "Solar Guitars", websiteUrl: "https://solar-guitars.com", countryCode: "SE", foundedYear: 2017, priceTier: "MID" },
  { slug: "rickenbacker", name: "Rickenbacker", websiteUrl: "https://www.rickenbacker.com", countryCode: "US", foundedYear: 1931, priceTier: "PREMIUM", wikidataId: "Q680775" },
  { slug: "gl", name: "G&L Musical Instruments", websiteUrl: "https://glguitars.com", countryCode: "US", foundedYear: 1980, priceTier: "PREMIUM", wikidataId: "Q1489125" },
  { slug: "jackson-audio", name: "Jackson Audio", websiteUrl: "https://jacksonaudio.net", countryCode: "US", foundedYear: 2015, priceTier: "PREMIUM" },
  { slug: "washburn", name: "Washburn", websiteUrl: "https://washburn.com", countryCode: "US", foundedYear: 1883, priceTier: "BUDGET", wikidataId: "Q1913246" },
  { slug: "dean", name: "Dean Guitars", websiteUrl: "https://www.deanguitars.com", countryCode: "US", foundedYear: 1977, priceTier: "BUDGET", wikidataId: "Q1181772" },
  { slug: "bc-rich", name: "B.C. Rich", websiteUrl: "https://bcrich.com", countryCode: "US", foundedYear: 1969, priceTier: "BUDGET", wikidataId: "Q795099" },
  { slug: "ovation", name: "Ovation", websiteUrl: "https://ovationguitars.com", countryCode: "US", foundedYear: 1966, priceTier: "MID", wikidataId: "Q1786694" },
  { slug: "seagull", name: "Seagull Guitars", websiteUrl: "https://seagullguitars.com", countryCode: "CA", foundedYear: 1982, priceTier: "MID" },
  { slug: "godin", name: "Godin Guitars", websiteUrl: "https://www.godinguitars.com", countryCode: "CA", foundedYear: 1972, priceTier: "MID" },
  { slug: "art-lutherie", name: "Art & Lutherie", websiteUrl: "https://artetlutherie.com", countryCode: "CA", foundedYear: 1982, priceTier: "BUDGET" },
  { slug: "norman", name: "Norman Guitars", websiteUrl: "https://normanguitars.com", countryCode: "CA", foundedYear: 1968, priceTier: "MID" },
  { slug: "simon-patrick", name: "Simon & Patrick", websiteUrl: "https://simonandpatrick.com", countryCode: "CA", foundedYear: 1985, priceTier: "MID" },
  { slug: "alvarez", name: "Alvarez Guitars", websiteUrl: "https://alvarezguitars.com", countryCode: "US", foundedYear: 1965, priceTier: "MID" },
  { slug: "yairi", name: "Alvarez Yairi", websiteUrl: "https://alvarezguitars.com", countryCode: "JP", foundedYear: 1966, priceTier: "PREMIUM" },
  { slug: "collings", name: "Collings Guitars", websiteUrl: "https://collingsguitars.com", countryCode: "US", foundedYear: 1973, priceTier: "BOUTIQUE" },
  { slug: "santa-cruz", name: "Santa Cruz Guitar Company", websiteUrl: "https://www.santacruzguitar.com", countryCode: "US", foundedYear: 1976, priceTier: "BOUTIQUE" },
  { slug: "bourgeois", name: "Bourgeois Guitars", websiteUrl: "https://bourgeoisguitars.com", countryCode: "US", foundedYear: 1993, priceTier: "BOUTIQUE" },
  { slug: "huss-dalton", name: "Huss & Dalton", websiteUrl: "https://hussanddalton.com", countryCode: "US", foundedYear: 1995, priceTier: "BOUTIQUE" },
  { slug: "furch", name: "Furch Guitars", websiteUrl: "https://www.furchguitars.com", countryCode: "CZ", foundedYear: 1981, priceTier: "PREMIUM" },
  { slug: "alhambra", name: "Alhambra Guitars", websiteUrl: "https://www.alhambraguitarras.com", countryCode: "ES", foundedYear: 1965, priceTier: "MID" },
  { slug: "ramirez", name: "Jose Ramirez", websiteUrl: "https://www.guitarrasramirez.com", countryCode: "ES", foundedYear: 1882, priceTier: "BOUTIQUE" },
  { slug: "admira", name: "Admira Guitars", websiteUrl: "https://www.admira.com", countryCode: "ES", foundedYear: 1946, priceTier: "BUDGET" },
  { slug: "la-patrie", name: "La Patrie", websiteUrl: "https://lapatrieguitars.com", countryCode: "CA", foundedYear: 1982, priceTier: "MID" },
  { slug: "kala", name: "Kala Brand Music", websiteUrl: "https://kalabrand.com", countryCode: "US", foundedYear: 2005, priceTier: "BUDGET" },
  { slug: "kanilea", name: "Kanilea Ukulele", websiteUrl: "https://kanileaukulele.com", countryCode: "US", foundedYear: 1998, priceTier: "BOUTIQUE" },
  { slug: "kamaka", name: "Kamaka Ukulele", websiteUrl: "https://kamakahawaii.com", countryCode: "US", foundedYear: 1916, priceTier: "PREMIUM" },
  { slug: "marshall", name: "Marshall Amplification", websiteUrl: "https://marshall.com", countryCode: "GB", foundedYear: 1962, priceTier: "MID", wikidataId: "Q1129445" },
  { slug: "orange", name: "Orange Amplification", websiteUrl: "https://orangeamps.com", countryCode: "GB", foundedYear: 1968, priceTier: "MID", wikidataId: "Q1400441" },
  { slug: "vox", name: "VOX Amplification", websiteUrl: "https://voxamps.com", countryCode: "GB", foundedYear: 1957, priceTier: "MID", wikidataId: "Q261354" },
  { slug: "mesa-boogie", name: "Mesa/Boogie", websiteUrl: "https://mesaboogie.com", countryCode: "US", foundedYear: 1969, priceTier: "PREMIUM", wikidataId: "Q1921094" },
  { slug: "boss", name: "BOSS", websiteUrl: "https://www.boss.info", countryCode: "JP", foundedYear: 1973, priceTier: "MID", wikidataId: "Q892598" },
  { slug: "strymon", name: "Strymon", websiteUrl: "https://www.strymon.net", countryCode: "US", foundedYear: 2004, priceTier: "PREMIUM" },
  { slug: "electro-harmonix", name: "Electro-Harmonix", websiteUrl: "https://www.ehx.com", countryCode: "US", foundedYear: 1968, priceTier: "MID", wikidataId: "Q1326661" },
  { slug: "mxr", name: "MXR", websiteUrl: "https://www.jimdunlop.com", countryCode: "US", foundedYear: 1972, priceTier: "BUDGET", wikidataId: "Q1954065" },
  { slug: "line6", name: "Line 6", websiteUrl: "https://line6.com", countryCode: "US", foundedYear: 1996, priceTier: "MID", wikidataId: "Q1823502" },
  { slug: "positive-grid", name: "Positive Grid", websiteUrl: "https://www.positivegrid.com", countryCode: "US", foundedYear: 2011, priceTier: "MID" },
  { slug: "neural-dsp", name: "Neural DSP", websiteUrl: "https://neuraldsp.com", countryCode: "FI", foundedYear: 2017, priceTier: "PREMIUM" },
  { slug: "daddario", name: "D'Addario", websiteUrl: "https://www.daddario.com", countryCode: "US", foundedYear: 1974, priceTier: "BUDGET", wikidataId: "Q1156431" },
  { slug: "elixir", name: "Elixir Strings", websiteUrl: "https://www.elixirstrings.com", countryCode: "US", foundedYear: 1997, priceTier: "MID" },
  { slug: "ernie-ball", name: "Ernie Ball", websiteUrl: "https://www.ernieball.com", countryCode: "US", foundedYear: 1962, priceTier: "BUDGET", wikidataId: "Q1358545" },
]

export const featuredBrandSlugs = BRAND_SEED.filter((b) => b.featured).map((b) => b.slug)
