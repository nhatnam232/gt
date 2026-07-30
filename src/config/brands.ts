export type BrandSeed = {
  slug: string
  name: string
  countryCode?: string
  foundedYear?: number
  priceTier?: "BUDGET" | "MID" | "PRO" | "BOUTIQUE"
  websiteUrl?: string
  isFeatured?: boolean
  logoUrl?: string
}

export const BRAND_SEED: BrandSeed[] = [
  // American icons
  { slug: "fender", name: "Fender", countryCode: "US", foundedYear: 1946, priceTier: "PRO", websiteUrl: "https://www.fender.com", isFeatured: true },
  { slug: "gibson", name: "Gibson", countryCode: "US", foundedYear: 1902, priceTier: "PRO", websiteUrl: "https://www.gibson.com", isFeatured: true },
  { slug: "martin", name: "Martin", countryCode: "US", foundedYear: 1833, priceTier: "PRO", websiteUrl: "https://www.martinguitar.com", isFeatured: true },
  { slug: "taylor", name: "Taylor", countryCode: "US", foundedYear: 1974, priceTier: "PRO", websiteUrl: "https://www.taylorguitars.com", isFeatured: true },
  { slug: "prs", name: "PRS", countryCode: "US", foundedYear: 1985, priceTier: "PRO", websiteUrl: "https://prsguitars.com", isFeatured: true },
  { slug: "music-man", name: "Ernie Ball Music Man", countryCode: "US", foundedYear: 1974, priceTier: "PRO", websiteUrl: "https://www.music-man.com", isFeatured: true },
  { slug: "guild", name: "Guild", countryCode: "US", foundedYear: 1952, priceTier: "PRO", websiteUrl: "https://guildguitars.com" },
  { slug: "breedlove", name: "Breedlove", countryCode: "US", foundedYear: 1990, priceTier: "PRO", websiteUrl: "https://breedlovemusic.com" },
  { slug: "suhr", name: "Suhr", countryCode: "US", foundedYear: 1997, priceTier: "BOUTIQUE", websiteUrl: "https://suhr.com" },

  // Japanese
  { slug: "yamaha", name: "Yamaha", countryCode: "JP", foundedYear: 1887, priceTier: "MID", websiteUrl: "https://usa.yamaha.com", isFeatured: true },
  { slug: "ibanez", name: "Ibanez", countryCode: "JP", foundedYear: 1957, priceTier: "MID", websiteUrl: "https://www.ibanez.com", isFeatured: true },
  { slug: "takamine", name: "Takamine", countryCode: "JP", foundedYear: 1962, priceTier: "PRO", websiteUrl: "https://www.takamine.com" },
  { slug: "esp", name: "ESP", countryCode: "JP", foundedYear: 1975, priceTier: "PRO", websiteUrl: "https://www.espguitars.com" },

  // Korean / Chinese budget-pro
  { slug: "cort", name: "Cort", countryCode: "KR", foundedYear: 1960, priceTier: "MID", websiteUrl: "https://www.cortguitars.com", isFeatured: true },
  { slug: "schecter", name: "Schecter", countryCode: "US", foundedYear: 1976, priceTier: "MID", websiteUrl: "https://schecterguitars.com" },
  { slug: "eastman", name: "Eastman", countryCode: "CN", foundedYear: 1992, priceTier: "PRO", websiteUrl: "https://www.eastmanguitars.com" },

  // European
  { slug: "gretsch", name: "Gretsch", countryCode: "US", foundedYear: 1883, priceTier: "PRO", websiteUrl: "https://www.gretschguitars.com" },
  { slug: "lowden", name: "Lowden", countryCode: "GB", foundedYear: 1974, priceTier: "BOUTIQUE", websiteUrl: "https://lowdenguitars.com" },
  { slug: "faith", name: "Faith", countryCode: "GB", foundedYear: 2004, priceTier: "MID", websiteUrl: "https://faithguitars.com" },
  { slug: "sigma", name: "Sigma", countryCode: "DE", foundedYear: 1970, priceTier: "MID", websiteUrl: "https://www.sigma-guitars.com" },

  // Australian
  { slug: "maton", name: "Maton", countryCode: "AU", foundedYear: 1946, priceTier: "PRO", websiteUrl: "https://maton.com.au" },

  // Latin classical
  { slug: "cordoba", name: "Cordoba", countryCode: "US", foundedYear: 1997, priceTier: "MID", websiteUrl: "https://cordobaguitars.com", isFeatured: true },

  // Sub-brands / budget
  { slug: "squier", name: "Squier", countryCode: "US", foundedYear: 1982, priceTier: "BUDGET", websiteUrl: "https://www.fender.com/en-US/squier" },
  { slug: "epiphone", name: "Epiphone", countryCode: "US", foundedYear: 1873, priceTier: "BUDGET", websiteUrl: "https://www.epiphone.com", isFeatured: true },
  { slug: "jackson", name: "Jackson", countryCode: "US", foundedYear: 1980, priceTier: "MID", websiteUrl: "https://www.jacksonguitars.com" },
  { slug: "charvel", name: "Charvel", countryCode: "US", foundedYear: 1978, priceTier: "MID", websiteUrl: "https://www.charvel.com" },
  { slug: "sterling", name: "Sterling by Music Man", countryCode: "US", foundedYear: 1994, priceTier: "MID", websiteUrl: "https://sterlingbymusicman.com" },
  { slug: "solar", name: "Solar Guitars", countryCode: "SE", foundedYear: 2017, priceTier: "MID", websiteUrl: "https://solar-guitars.com" },

  // Ultra-budget / online-direct
  { slug: "lava", name: "LAVA MUSIC", countryCode: "CN", foundedYear: 2013, priceTier: "MID", websiteUrl: "https://www.lavamusic.com" },
  { slug: "enya", name: "Enya Music", countryCode: "CN", foundedYear: 2017, priceTier: "BUDGET", websiteUrl: "https://www.enyamusic.com" },
  { slug: "donner", name: "Donner", countryCode: "CN", foundedYear: 2012, priceTier: "BUDGET", websiteUrl: "https://www.donnerdeal.com" },
  { slug: "kepma", name: "Kepma", countryCode: "CN", foundedYear: 2012, priceTier: "BUDGET", websiteUrl: "https://www.kepmaguitars.com" },
  { slug: "journey", name: "Journey Instruments", countryCode: "US", foundedYear: 2013, priceTier: "MID", websiteUrl: "https://journeyinstruments.com" },
  { slug: "harley-benton", name: "Harley Benton", countryCode: "DE", foundedYear: 1997, priceTier: "BUDGET", websiteUrl: "https://www.thomann.de" },
]
