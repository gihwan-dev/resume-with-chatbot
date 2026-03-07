import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

function isPortfolioCasePath(href: string): boolean {
  return /^\/portfolio\/[a-z0-9-]+$/.test(href)
}

function getCaseIdFromHref(href: string): string | null {
  const match = href.match(/^\/portfolio\/([a-z0-9-]+)$/)
  return match ? match[1] : null
}

const CASE_SECTION_MAP: Record<string, readonly string[]> = {
  "exem-customer-dashboard": [
    "tldr",
    "problem-definition",
    "key-decisions",
    "implementation-highlights",
    "validation-impact",
    "learned",
  ],
  "exem-data-grid": [
    "tldr",
    "problem-definition",
    "key-decisions",
    "implementation-highlights",
    "validation-impact",
    "learned",
  ],
  "exem-dx-improvement": [
    "tldr",
    "problem-definition",
    "key-decisions",
    "implementation-highlights",
    "validation-impact",
    "learned",
  ],
  "exem-new-generation": [
    "tldr",
    "shared-tension",
    "complexity-axes",
    "chart-extensibility",
    "state-lifecycle",
    "sql-analysis-ux",
    "overall-change",
    "verification",
    "learned",
  ],
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

    for (const href of targetCaseHrefs) {
      await page.goto(href)
      await waitForUiReady(page)

      const caseId = getCaseIdFromHref(href)
      expect(caseId).toBeTruthy()
      const sectionIds = CASE_SECTION_MAP[caseId ?? ""]
      expect(sectionIds).toBeTruthy()

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
