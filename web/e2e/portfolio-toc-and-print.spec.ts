import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"

const hasAvoidRule = (value: string | null | undefined): boolean => {
  if (!value) return false
  return value.includes("avoid")
}

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

  test("인쇄 미디어에서는 외부 링크 URL이 본문에 노출된다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#overview")
    await page.emulateMedia({ media: "print" })

    const externalLink = page.locator('.portfolio-prose a[href^="http"]').first()
    await expect(externalLink).toBeVisible()

    const href = await externalLink.getAttribute("href")
    expect(href).toBeTruthy()

    const afterContent = await externalLink.evaluate(
      (element) => window.getComputedStyle(element, "::after").content
    )

    expect(afterContent).toContain(href ?? "")
  })

  test("인쇄 미디어에서는 주요 본문 블록이 페이지 분할 방지 규칙을 따른다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#overview")
    await page.emulateMedia({ media: "print" })

    const styleMap = await page.evaluate<Record<
      string,
      { breakInside: string; pageBreakInside: string }
    > | null>(() => {
      const prose = document.querySelector(".portfolio-prose")
      if (!(prose instanceof HTMLElement)) return null

      const fixture = document.createElement("div")
      fixture.setAttribute("data-test-print-fixture", "true")
      fixture.innerHTML = `
        <p>print paragraph</p>
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="pixel" />
        <figure><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="pixel2" /></figure>
        <pre>print code block</pre>
        <blockquote>print quote</blockquote>
        <table><tbody><tr><td>print cell</td></tr></tbody></table>
      `
      prose.appendChild(fixture)

      const selectors = ["p", "img", "figure", "pre", "blockquote", "table"]
      const results: Record<string, { breakInside: string; pageBreakInside: string }> = {}

      for (const selector of selectors) {
        const element = fixture.querySelector(selector)
        if (!element) continue

        const style = window.getComputedStyle(element)
        results[selector] = {
          breakInside: style.breakInside,
          pageBreakInside: style.getPropertyValue("page-break-inside"),
        }
      }

      fixture.remove()
      return results
    })

    expect(styleMap).not.toBeNull()

    for (const selector of ["p", "img", "figure", "pre", "blockquote", "table"] as const) {
      const styleEntry = styleMap?.[selector]
      expect(styleEntry, `${selector} selector style is required`).toBeTruthy()
      expect(
        hasAvoidRule(styleEntry?.breakInside) || hasAvoidRule(styleEntry?.pageBreakInside),
        `${selector} should avoid page break in print`
      ).toBe(true)
    }
  })
})
