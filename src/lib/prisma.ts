import { PrismaClient } from "@prisma/client"
import { env } from "./env"

const createClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined
}

/**
 * Singleton client. Prisma parameterises every query, which is what protects the
 * app from SQL injection - raw SQL is only used through tagged templates with
 * bound parameters (see facet.repository.ts).
 */
export const prisma = globalForPrisma.prisma ?? createClient()

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
