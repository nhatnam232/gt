import { z } from "zod"

/**
 * Fail fast on misconfiguration. Optional integrations degrade gracefully:
 * no Redis -> in-memory cache, no Meilisearch -> Postgres search, no
 * Cloudinary -> remote source images.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().default("GuitarTribe"),

  UPSTASH_REDIS_REST_URL: z.string().optional().or(z.literal("")),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().or(z.literal("")),
  CACHE_PREFIX: z.string().default("gt:v1"),

  MEILISEARCH_HOST: z.string().optional().or(z.literal("")),
  MEILISEARCH_ADMIN_KEY: z.string().optional().or(z.literal("")),
  MEILISEARCH_MASTER_KEY: z.string().optional().or(z.literal("")),
  MEILISEARCH_INDEX: z.string().default("guitars"),

  CLOUDINARY_CLOUD_NAME: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_KEY: z.string().optional().or(z.literal("")),
  CLOUDINARY_API_SECRET: z.string().optional().or(z.literal("")),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default("guitartribe"),

  BETTER_AUTH_SECRET: z.string().min(16).default("dev-only-secret-change-me-now"),
  BETTER_AUTH_URL: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional().or(z.literal("")),
  GITHUB_CLIENT_SECRET: z.string().optional().or(z.literal("")),
  GOOGLE_CLIENT_ID: z.string().optional().or(z.literal("")),
  GOOGLE_CLIENT_SECRET: z.string().optional().or(z.literal("")),
  ADMIN_EMAILS: z.string().default(""),

  CRAWLER_USER_AGENT: z.string().default("GuitarTribeBot/1.0"),
  CRAWLER_CONCURRENCY: z.coerce.number().int().min(1).max(16).default(4),
  CRAWLER_DELAY_MS: z.coerce.number().int().min(0).default(1200),
  CRAWLER_RESPECT_ROBOTS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  CRON_SECRET: z.string().default("change-me"),

  RATE_LIMIT_WINDOW: z.string().default("60 s"),
  RATE_LIMIT_MAX: z.coerce.number().int().default(120),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n")
  throw new Error(`Invalid environment configuration:\n${issues}`)
}

export const env = parsed.data

export const features = {
  redis: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  meilisearch: Boolean(env.MEILISEARCH_HOST),
  cloudinary: Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY),
  oauthGithub: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
  oauthGoogle: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
} as const

export const adminEmails = env.ADMIN_EMAILS.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)
