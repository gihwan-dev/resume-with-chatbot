import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"

test.describe("Resume -> Portfolio -> Print flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await page.goto("/")
    await expect(page.getByRole("link", { name: "상세 케이스 스터디 보기" }).first()).toBeVisible()
  })

  test("이력서 CTA 이동부터 포트폴리오 인쇄 저장까지 단절 없이 진행된다", async ({ page }) => {
    const firstCta = page.getByRole("link", { name: "상세 케이스 스터디 보기" }).first()

    await expect(firstCta).toHaveAttribute("href", "/portfolio/exem-customer-dashboard#overview")

    await Promise.all([
      page.waitForURL("**/portfolio/exem-customer-dashboard#overview"),
      firstCta.click(),
    ])

    await expect
      .poll(async () => page.evaluate(() => window.location.pathname))
      .toBe("/portfolio/exem-customer-dashboard")
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#overview")

    const resultLink = page.locator('.toc-link[data-section-id="result"]')
    await expect(resultLink).toBeVisible()
    await resultLink.click()

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#result")
    await expect(resultLink).toHaveAttribute("aria-current", "location")

    const desktopNavRoot = page.locator('[data-slot="desktop-nav-root"]')
    await expect(desktopNavRoot).toBeVisible()

    await page.emulateMedia({ media: "print" })
    await expect(desktopNavRoot).not.toBeVisible()

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    })
    expect(pdfBuffer.byteLength).toBeGreaterThan(1024)
  })
})
