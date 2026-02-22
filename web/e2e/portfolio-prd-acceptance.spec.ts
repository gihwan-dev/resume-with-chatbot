import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

function isPortfolioCasePath(href: string): boolean {
  return /^\/portfolio\/[a-z0-9-]+$/.test(href)
}

test.describe("Portfolio PRD acceptance", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test("모든 포트폴리오 케이스가 PRD 핵심 구조를 충족한다", async ({ page }) => {
    await page.goto("/portfolio")
    await waitForUiReady(page)

    const caseHrefs = await page.locator('main a[href^="/portfolio/"]').evaluateAll((links) => {
      const hrefSet = new Set<string>()

      for (const link of links) {
        const href = link.getAttribute("href")
        if (!href) continue
        hrefSet.add(href)
      }

      return Array.from(hrefSet)
    })

    const targetCaseHrefs = caseHrefs.filter((href) => isPortfolioCasePath(href))
    expect(targetCaseHrefs.length).toBeGreaterThan(0)

    for (const href of targetCaseHrefs) {
      await page.goto(href)
      await waitForUiReady(page)

      const hookSection = page.locator('[data-portfolio-section="hook"]')
      await expect(hookSection).toBeVisible()
      await expect(hookSection.locator("[data-hook-title]")).toBeVisible()
      await expect(hookSection.locator("[data-hook-summary]")).toBeVisible()

      const impactCount = await page.locator("[data-impact-item]").count()
      expect(impactCount).toBeGreaterThanOrEqual(2)
      expect(impactCount).toBeLessThanOrEqual(3)

      const contextText = page.locator("[data-context-text]")
      await expect(contextText).toBeVisible()
      await expect(contextText).not.toHaveText(/^\s*$/)

      const threadCount = await page.locator("[data-thread-item]").count()
      expect(threadCount).toBeGreaterThanOrEqual(2)
      expect(threadCount).toBeLessThanOrEqual(3)

      expect(await page.locator("[data-thread-problem-list]").count()).toBe(threadCount)
      expect(await page.locator("[data-thread-thought-process]").count()).toBe(threadCount)
      expect(await page.locator("[data-thread-action-list]").count()).toBe(threadCount)
      expect(await page.locator("[data-thread-result-text]").count()).toBe(threadCount)

      const comparisonCount = await page.locator("[data-compare-toggle]").count()
      expect(comparisonCount).toBeGreaterThanOrEqual(1)

      const retrospectiveText = page.locator("[data-retrospective-text]")
      await expect(retrospectiveText).toBeVisible()
      await expect(retrospectiveText).not.toHaveText(/^\s*$/)
    }
  })
})
