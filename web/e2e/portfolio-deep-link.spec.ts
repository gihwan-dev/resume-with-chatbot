import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"

test.describe("Portfolio deep link routing", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test("이력서 CTA 클릭 시 /portfolio/[slug]#overview로 이동한다", async ({ page }) => {
    await page.goto("/")

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
  })

  test("포트폴리오 진입 후 새로고침해도 hash가 유지된다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#overview")

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#overview")

    await page.reload()

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#overview")
  })

  test("유효하지 않은 hash 접근 시 #overview로 폴백한다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#invalid")

    await expect
      .poll(async () => page.evaluate(() => window.location.hash), {
        message: "Invalid hash should be normalized to #overview",
      })
      .toBe("#overview")
    await expect
      .poll(async () => page.evaluate(() => window.location.pathname))
      .toBe("/portfolio/exem-data-grid")
  })
})
