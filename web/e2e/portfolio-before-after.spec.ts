import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"

test.describe("Portfolio Key Decisions block", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test("핵심 의사결정 섹션 진입 시 결정 카드가 렌더링된다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#key-decisions")

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#key-decisions")

    const decisionList = page.locator("[data-decision-list]")
    const decisionItems = decisionList.locator("[data-decision-item]")

    await expect(decisionList).toBeVisible()
    await expect(decisionItems).toHaveCount(3)
  })

  test("결정 카드마다 why/비교/tradeoff 블록이 모두 노출된다", async ({ page }) => {
    await page.goto("/portfolio/exem-customer-dashboard#key-decisions")

    const decisionItems = page.locator("[data-decision-item]")
    const decisionCount = await decisionItems.count()
    expect(decisionCount).toBeGreaterThanOrEqual(2)

    await expect(page.locator("[data-decision-primary-item]")).toHaveCount(1)
    await expect(page.locator("[data-decision-secondary-item]")).toHaveCount(decisionCount - 1)
    await expect(page.locator("[data-decision-why]")).toHaveCount(decisionCount)
    await expect(page.locator("[data-decision-tradeoff]")).toHaveCount(decisionCount)
    await expect(page.locator("[data-decision-choice-summary]")).toHaveCount(decisionCount - 1)

    const beforeCount = await page.locator("[data-decision-before]").count()
    const afterCount = await page.locator("[data-decision-after]").count()
    const fallbackCount = await page.locator("[data-decision-alternative-fallback]").count()

    expect(beforeCount).toBe(afterCount)
    expect(beforeCount + fallbackCount).toBe(1)
  })

  test("길이가 다른 결정 문단에서도 가로 오버플로 없이 레이아웃이 유지된다", async ({ page }) => {
    await page.goto("/portfolio/exem-dx-improvement#key-decisions")

    const overflow = await page.evaluate(() => {
      const decisionSection = document.getElementById("key-decisions")
      if (!decisionSection) return null

      const firstDecision = decisionSection.querySelector<HTMLElement>("[data-decision-item]")
      if (!firstDecision) return null

      const style = window.getComputedStyle(firstDecision)
      return {
        overflowX: style.overflowX,
        scrollDiff: firstDecision.scrollWidth - firstDecision.clientWidth,
      }
    })

    expect(overflow).not.toBeNull()
    expect((overflow?.scrollDiff ?? 999) <= 2).toBe(true)
    expect(["visible", "clip", "hidden"]).toContain(overflow?.overflowX ?? "")
  })
})
