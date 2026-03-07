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

  test("모든 포트폴리오 케이스가 V3 템플릿 핵심 구조를 충족한다", async ({ page }) => {
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

    const sectionIds = [
      "tldr",
      "problem-definition",
      "key-decisions",
      "implementation-highlights",
      "validation-impact",
      "learned",
    ]

    for (const href of targetCaseHrefs) {
      await page.goto(href)
      await waitForUiReady(page)

      const tldrSection = page.locator('[data-portfolio-section="tldr"]')
      await expect(tldrSection).toBeVisible()
      await expect(tldrSection.locator("[data-tldr-title]")).toBeVisible()
      await expect(tldrSection.locator("[data-tldr-summary]")).toBeVisible()
      await expect(tldrSection).not.toHaveText(/^\s*$/)
      const techItemCount = await tldrSection.locator("[data-tldr-tech-item]").count()
      expect(techItemCount).toBeGreaterThan(0)

      const tldrBounds = await tldrSection.boundingBox()
      const viewport = page.viewportSize()
      expect(tldrBounds).not.toBeNull()
      expect(viewport).not.toBeNull()
      if (tldrBounds && viewport) {
        expect(tldrBounds.y + tldrBounds.height).toBeLessThanOrEqual(viewport.height + 120)
      }

      for (const sectionId of sectionIds.slice(1)) {
        const section = page.locator(`[data-portfolio-section="${sectionId}"]`)
        await expect(section).toBeVisible()
        await expect(section).not.toHaveText(/^\s*$/)
      }
    }
  })
})
