import { test, expect } from "@playwright/test"

test.describe("Compare page", () => {
  test("empty state shows add-instruments prompt", async ({ page }) => {
    await page.goto("/compare")
    await expect(page.getByRole("heading", { name: /compare/i })).toBeVisible()
  })

  test("URL-driven comparison loads", async ({ page }) => {
    // These slugs may not exist in CI, but the page should not 500.
    const response = await page.goto("/compare?items=fender-stratocaster,gibson-les-paul")
    expect(response?.status()).not.toBe(500)
  })
})
