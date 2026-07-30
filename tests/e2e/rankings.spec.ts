import { test, expect } from "@playwright/test"

test.describe("Rankings", () => {
  test("rankings index page loads", async ({ page }) => {
    await page.goto("/rankings")
    await expect(page).toHaveTitle(/rankings|GuitarTribe/i)
  })
})
