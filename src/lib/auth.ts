import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { adminEmails, env, features } from "./env"
import { prisma } from "./prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_SITE_URL,
  emailAndPassword: { enabled: true, minPasswordLength: 10, autoSignIn: true },
  socialProviders: {
    ...(features.oauthGithub
      ? { github: { clientId: env.GITHUB_CLIENT_ID!, clientSecret: env.GITHUB_CLIENT_SECRET! } }
      : {}),
    ...(features.oauthGoogle
      ? { google: { clientId: env.GOOGLE_CLIENT_ID!, clientSecret: env.GOOGLE_CLIENT_SECRET! } }
      : {}),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "USER", input: false },
    },
  },
  advanced: {
    // Better Auth issues and verifies a CSRF token on every state-changing
    // request; combined with SameSite=Lax cookies this covers CSRF.
    useSecureCookies: env.NODE_ENV === "production",
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: adminEmails.includes(user.email.toLowerCase()) ? "ADMIN" : "USER",
          },
        }),
      },
    },
  },
  plugins: [nextCookies()],
})

export type Auth = typeof auth
