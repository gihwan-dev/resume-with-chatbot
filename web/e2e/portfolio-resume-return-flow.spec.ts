import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

const SCROLL_TOLERANCE_PX = 120

test.describe("Resume -> Portfolio -> Resume return flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await page.goto("/")
    await waitForUiReady(page)
  })

  test("상세 진입 후 이력서로 돌아가면 스크롤 위치가 복원된다", async ({ page }) => {
    await page.evaluate(() => {
      const experienceSection = document.getElementById("experience")
      if (!experienceSection) return

      const offsetTop = experienceSection.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, Math.max(0, offsetTop - 120))
    })

    await expect
      .poll(async () => Math.round(await page.evaluate(() => window.scrollY)))
      .toBeGreaterThan(100)

    const expectedScrollY = Math.round(await page.evaluate(() => window.scrollY))

    const firstCta = page.getByRole("link", { name: "상세 케이스 스터디 보기" }).first()
    await expect(firstCta).toHaveAttribute("href", /\/portfolio\/[a-z0-9-]+#tldr$/)

    await Promise.all([page.waitForURL("**/portfolio/*#tldr"), firstCta.click()])
    await waitForUiReady(page)

    const backToResumeLink = page.locator("#back-to-resume-link")
    await expect(backToResumeLink).toBeVisible()

    await Promise.all([page.waitForURL((url) => url.pathname === "/"), backToResumeLink.click()])
    await waitForUiReady(page)

    await expect.poll(async () => page.evaluate(() => window.location.pathname)).toBe("/")

    await expect
      .poll(async () => Math.round(await page.evaluate(() => window.scrollY)), {
        timeout: 5_000,
      })
      .toBeGreaterThan(100)

    const finalScrollY = Math.round(await page.evaluate(() => window.scrollY))
    expect(Math.abs(finalScrollY - expectedScrollY)).toBeLessThanOrEqual(SCROLL_TOLERANCE_PX)
  })
})
