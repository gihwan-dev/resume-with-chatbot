import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"

test.describe("Portfolio TOC behavior", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test("목차 링크 대상 섹션 id가 모두 존재한다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#overview")

    const links = page.locator(".toc-link")
    await expect(links).toHaveCount(5)

    const sectionIds = await links.evaluateAll((elements) =>
      elements
        .map((element) => element.getAttribute("data-section-id"))
        .filter((value): value is string => Boolean(value))
    )

    for (const sectionId of sectionIds) {
      await expect(page.locator(`#${sectionId}`)).toHaveCount(1)
    }
  })

  test("딥링크 진입과 목차 클릭 시 active/hash가 동기화된다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#problem")

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#problem")
    await expect
      .poll(async () =>
        page.locator('.toc-link[aria-current="location"]').getAttribute("data-section-id")
      )
      .toBe("problem")

    const resultLink = page.locator('.toc-link[data-section-id="result"]')
    await resultLink.click()

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#result")
    await expect(resultLink).toHaveAttribute("aria-current", "location")
  })

  test("인쇄 미디어에서는 웹 전용 UI가 숨김 처리된다", async ({ page }) => {
    await page.goto("/portfolio/exem-customer-dashboard#overview")

    const tocNav = page.locator("nav").filter({ has: page.locator(".toc-list") })

    await expect(tocNav).toBeVisible()

    await page.emulateMedia({ media: "print" })

    await expect(tocNav).not.toBeVisible()
  })
})
