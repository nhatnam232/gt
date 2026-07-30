import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "prisma/generated/**",
      "coverage/**",
      "etl/**",
      "tests/**",
      "scripts/**",
      "netlify/**",
    ],
  },
  // NOTE: "prettier" (eslint-config-prettier) is intentionally NOT extended here.
  // It is not installed as a dependency, and extending it breaks `next build`.
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "off",
      "react/jsx-no-target-blank": "error",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
    },
  },
]
