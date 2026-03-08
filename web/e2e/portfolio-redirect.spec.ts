import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

test.describe("Portfolio redirects", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test("/portfolio와 /portfolio/*는 홈으로 리다이렉트된다", async ({ page }) => {
    const expectHomePathname = async () => {
      await expect(page).toHaveURL(/^http:\/\/localhost:4322\/(?:#.*)?$/)
      await expect.poll(() => new URL(page.url()).pathname).toBe("/")
    }

    await page.goto("/portfolio")
    await expectHomePathname()
    await waitForUiReady(page)
    await expect(page.locator("#main-content")).toBeVisible()

    await page.goto("/portfolio/exem-data-grid#tldr")
    await expectHomePathname()
    await waitForUiReady(page)
    await expect(page.locator("#main-content")).toBeVisible()
  })
})
