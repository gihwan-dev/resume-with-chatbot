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

    for (const href of targetCaseHrefs) {
      await page.goto(href)
      await waitForUiReady(page)

      const tldrSection = page.locator('[data-portfolio-section="tldr"]')
      await expect(tldrSection).toBeVisible()
      await expect(tldrSection.locator("[data-tldr-title]")).toBeVisible()
      await expect(tldrSection.locator("[data-tldr-summary]")).toBeVisible()
      await expect(tldrSection.locator("[data-core-approach]")).toBeVisible()
      const techItemCount = await tldrSection.locator("[data-tldr-tech-item]").count()
      expect(techItemCount).toBeGreaterThan(0)
      await expect(tldrSection.locator("[data-impact-item]")).toHaveCount(3)

      const tldrBounds = await tldrSection.boundingBox()
      const viewport = page.viewportSize()
      expect(tldrBounds).not.toBeNull()
      expect(viewport).not.toBeNull()
      if (tldrBounds && viewport) {
        expect(tldrBounds.y + tldrBounds.height).toBeLessThanOrEqual(viewport.height + 120)
      }

      const problemDefinitionSection = page.locator('[data-portfolio-section="problem-definition"]')
      await expect(problemDefinitionSection).toBeVisible()
      const problemPointCount = await problemDefinitionSection
        .locator("[data-problem-point-item]")
        .count()
      expect(problemPointCount).toBeGreaterThanOrEqual(3)
      expect(problemPointCount).toBeLessThanOrEqual(4)

      const decisionsSection = page.locator('[data-portfolio-section="key-decisions"]')
      await expect(decisionsSection).toBeVisible()
      const decisionCount = await decisionsSection.locator("[data-decision-item]").count()
      expect(decisionCount).toBeGreaterThanOrEqual(2)
      expect(decisionCount).toBeLessThanOrEqual(3)

      await expect(decisionsSection.locator("[data-decision-primary-item]")).toHaveCount(1)
      await expect(decisionsSection.locator("[data-decision-secondary-item]")).toHaveCount(
        decisionCount - 1
      )
      expect(await decisionsSection.locator("[data-decision-why]").count()).toBe(decisionCount)
      expect(await decisionsSection.locator("[data-decision-tradeoff]").count()).toBe(decisionCount)

      const beforeCount = await decisionsSection.locator("[data-decision-before]").count()
      const afterCount = await decisionsSection.locator("[data-decision-after]").count()
      const fallbackCount = await decisionsSection
        .locator("[data-decision-alternative-fallback]")
        .count()
      expect(beforeCount).toBe(afterCount)
      expect(beforeCount + fallbackCount).toBe(1)
      await expect(decisionsSection.locator("[data-decision-choice-summary]")).toHaveCount(
        decisionCount - 1
      )

      const implementationSection = page.locator(
        '[data-portfolio-section="implementation-highlights"]'
      )
      await expect(implementationSection).toBeVisible()
      const implementationCount = await implementationSection
        .locator("[data-implementation-highlight-item]")
        .count()
      expect(implementationCount).toBeGreaterThanOrEqual(3)
      expect(implementationCount).toBeLessThanOrEqual(4)

      const validationSection = page.locator('[data-portfolio-section="validation-impact"]')
      await expect(validationSection).toBeVisible()
      const measurementSection = validationSection.locator("[data-measurement-method-section]")
      await expect(measurementSection).toBeVisible()
      const measurementToggle = measurementSection.locator("[data-measurement-toggle]")
      await expect(measurementToggle).toBeVisible()
      await measurementToggle.click()
      const measurementMethod = validationSection.locator("[data-measurement-method]")
      await expect(measurementMethod).toBeVisible()
      await expect(measurementMethod).not.toHaveText(/^\s*$/)

      const validationMetricCount = await validationSection
        .locator("[data-validation-metric-item]")
        .count()
      expect(validationMetricCount).toBeGreaterThanOrEqual(2)
      expect(validationMetricCount).toBeLessThanOrEqual(3)
      await expect(validationSection.locator("[data-operational-impact]")).toBeVisible()

      const learnedSection = page.locator('[data-portfolio-section="learned"]')
      await expect(learnedSection).toBeVisible()
      const learnedText = learnedSection.locator("[data-learned-text]")
      await expect(learnedText).toBeVisible()
      await expect(learnedText).not.toHaveText(/^\s*$/)
      await expect(learnedSection.locator("[data-learned-title]")).toContainText("What I Learned")
    }
  })
})
