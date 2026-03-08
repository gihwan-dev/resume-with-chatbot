import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"

test.describe("Summary markdown render", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test("홈에서 Experience/Projects summary의 inline code가 실제 code 요소로 렌더링된다", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" })
    await expect(page.locator("#experience")).toBeVisible({ timeout: 10_000 })
    await expect(page.locator("[data-experience-project-summary]").first()).toBeVisible({
      timeout: 10_000,
    })

    const experienceSummaryCodeCount = page.locator("[data-experience-project-summary] code")
    await expect
      .poll(async () => experienceSummaryCodeCount.count(), {
        message: "Expected inline code in experience summary",
      })
      .toBeGreaterThan(0)

    const projectSummaryCount = await page.locator("[data-project-summary]").count()
    if (projectSummaryCount > 0) {
      const projectSummaryCodeCount = page.locator("[data-project-summary] code")
      await expect
        .poll(async () => projectSummaryCodeCount.count(), {
          message: "Expected inline code in project summary",
        })
        .toBeGreaterThan(0)
    }
  })
})
