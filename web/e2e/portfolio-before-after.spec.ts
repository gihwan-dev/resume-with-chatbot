import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"

test.describe("Portfolio Key Decisions block", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test("핵심 의사결정 섹션 진입 시 markdown 콘텐츠가 렌더링된다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#key-decisions")

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#key-decisions")

    const section = page.locator("#key-decisions")
    await expect(section).toBeVisible()
    await expect(section.locator("h2")).toHaveText("핵심 의사결정")
    const contentCount = await section.locator("li, p").count()
    expect(contentCount).toBeGreaterThan(0)
  })

  test("핵심 의사결정 섹션은 비어 있지 않은 본문을 제공한다", async ({ page }) => {
    await page.goto("/portfolio/exem-customer-dashboard#key-decisions")

    const sectionText = await page.locator("#key-decisions").innerText()
    expect(sectionText.trim().length).toBeGreaterThan(20)
  })

  test("길이가 다른 본문에서도 가로 오버플로 없이 레이아웃이 유지된다", async ({ page }) => {
    await page.goto("/portfolio/exem-dx-improvement#key-decisions")

    const overflow = await page.evaluate(() => {
      const decisionSection = document.getElementById("key-decisions")
      if (!decisionSection) return null

      const style = window.getComputedStyle(decisionSection)
      return {
        overflowX: style.overflowX,
        scrollDiff: decisionSection.scrollWidth - decisionSection.clientWidth,
      }
    })

    expect(overflow).not.toBeNull()
    expect((overflow?.scrollDiff ?? 999) <= 2).toBe(true)
    expect(["visible", "clip", "hidden"]).toContain(overflow?.overflowX ?? "")
  })
})
