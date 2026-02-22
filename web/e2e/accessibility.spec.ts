import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

const FAB_SELECTOR = ".aui-modal-button"
const MODAL_CONTENT_SELECTOR = ".aui-modal-content"
const SHEET_CONTENT_SELECTOR = '[data-slot="sheet-content"]'
const MOBILE_VIEWPORT = { width: 390, height: 844 }

async function preparePage(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.addInitScript((value) => {
    localStorage.setItem("theme", value)
  }, theme)
  await mockApiRoutes(page)
  await page.goto("/")
  await waitForUiReady(page)
}

async function openModal(page: import("@playwright/test").Page) {
  await expect(async () => {
    await page.locator(FAB_SELECTOR).click()
    await expect(page.locator(MODAL_CONTENT_SELECTOR)).toHaveAttribute("data-state", "open", {
      timeout: 1000,
    })
  }).toPass({ timeout: 10_000 })
}

async function openMobileSheet(page: import("@playwright/test").Page) {
  const menuButton = page.getByRole("button", { name: /open menu/i })
  await expect(menuButton).toBeVisible()
  await expect(async () => {
    await menuButton.click({ force: true })
    await expect(page.locator(SHEET_CONTENT_SELECTOR)).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 10_000 })
}

async function expectNoCriticalOrSeriousViolations(
  page: import("@playwright/test").Page,
  context: string
) {
  const results = await new AxeBuilder({ page }).analyze()
  const importantViolations = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious"
  )

  expect(
    importantViolations,
    `${context}\n${importantViolations
      .map((violation) => `${violation.id} (${violation.impact ?? "unknown"})`)
      .join("\n")}`
  ).toEqual([])
}

test.describe("Accessibility keyboard flows", () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page, "light")
  })

  test("skip link로 main으로 이동한다", async ({ page }) => {
    await page.mouse.click(1, 1)
    await page.keyboard.press("Tab")

    const skipLink = page.getByRole("link", { name: "본문으로 건너뛰기" })
    await expect(skipLink).toBeFocused()

    await skipLink.press("Enter")
    await expect(page.locator("#main-content")).toBeFocused()
  })

  test("데스크톱 섹션 내비게이션을 키보드로 이동할 수 있다", async ({ page }) => {
    const projectsLink = page.getByRole("link", { name: "Projects" }).first()
    await projectsLink.focus()
    await projectsLink.press("Enter")

    await expect
      .poll(async () => page.evaluate(() => window.location.hash), {
        message: "URL hash should update after section navigation",
      })
      .toBe("#projects")
  })

  test("포트폴리오 상세 목차 내비게이션을 키보드로 이동할 수 있다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#hook")
    await waitForUiReady(page)

    const contextLink = page.locator('.toc-link[data-section-id="context"]').first()
    await contextLink.focus()
    await contextLink.press("Enter")

    await expect
      .poll(async () => page.evaluate(() => window.location.hash), {
        message: "URL hash should update after portfolio TOC keyboard navigation",
      })
      .toBe("#context")
    await expect(contextLink).toHaveAttribute("aria-current", "location")
  })

  test("챗봇 모달은 키보드 열기/닫기 및 포커스 복귀를 지원한다", async ({ page }) => {
    const fab = page.locator(FAB_SELECTOR)
    await expect(async () => {
      await fab.focus()
      await fab.press("Enter")
      await expect(page.locator(MODAL_CONTENT_SELECTOR)).toHaveAttribute("data-state", "open", {
        timeout: 1000,
      })
    }).toPass({ timeout: 10_000 })

    const modal = page.locator(MODAL_CONTENT_SELECTOR)
    await expect(modal).toHaveAttribute("aria-labelledby", "assistant-chat-modal-title")
    await expect(modal).toHaveAttribute("aria-describedby", "assistant-chat-modal-description")
    await expect(page.locator("#assistant-chat-modal-title")).toHaveText("AI 어시스턴트 채팅")

    const input = page.locator(".aui-composer-input")
    await expect(input).toBeFocused()

    await page.keyboard.press("Tab")
    const focusIsWithinModal = await page.evaluate(() => {
      const modal = document.querySelector<HTMLElement>(".aui-modal-content[data-state='open']")
      return !!modal && !!document.activeElement && modal.contains(document.activeElement)
    })
    expect(focusIsWithinModal).toBe(true)

    await page.keyboard.press("Escape")
    await expect(page.locator(MODAL_CONTENT_SELECTOR)).toHaveAttribute("data-state", "closed", {
      timeout: 5000,
    })
    await expect(fab).toBeFocused()
  })
})

for (const theme of ["light", "dark"] as const) {
  test(`axe: ${theme} 홈 화면은 critical/serious 위반이 없다`, async ({ page }) => {
    await preparePage(page, theme)
    await expectNoCriticalOrSeriousViolations(page, `home:${theme}`)
  })

  test(`axe: ${theme} 챗봇 오픈 상태는 critical/serious 위반이 없다`, async ({ page }) => {
    await preparePage(page, theme)
    await openModal(page)
    await expectNoCriticalOrSeriousViolations(page, `chat-open:${theme}`)
  })
}

test.describe("Mobile accessibility", () => {
  test.use({ viewport: MOBILE_VIEWPORT })

  test("모바일 메뉴는 키보드 탐색 후 Escape로 닫을 수 있다", async ({ page }) => {
    await preparePage(page, "light")
    await openMobileSheet(page)

    await page.keyboard.press("Tab")
    const focusIsWithinSheet = await page.evaluate(() => {
      const sheet = document.querySelector<HTMLElement>('[data-slot="sheet-content"]')
      return !!sheet && !!document.activeElement && sheet.contains(document.activeElement)
    })
    expect(focusIsWithinSheet).toBe(true)

    await page.keyboard.press("Escape")
    await expect(page.locator(SHEET_CONTENT_SELECTOR)).toHaveCount(0)
  })

  test("모바일 메뉴 오픈 상태에서 axe critical/serious 위반이 없다", async ({ page }) => {
    await preparePage(page, "light")
    await openMobileSheet(page)
    await expectNoCriticalOrSeriousViolations(page, "mobile-sheet-open:light")
  })

  test("모바일 메뉴에서 섹션 링크를 키보드로 선택하면 메뉴가 닫힌다", async ({ page }) => {
    await preparePage(page, "light")
    await openMobileSheet(page)

    const projectsLink = page.getByRole("link", { name: "Projects" }).first()
    await projectsLink.focus()
    await projectsLink.press("Enter")

    await expect(page.locator(SHEET_CONTENT_SELECTOR)).toHaveCount(0)
    await expect
      .poll(async () => page.evaluate(() => window.location.hash), {
        message: "URL hash should update after mobile section navigation",
      })
      .toBe("#projects")
  })

  test("포트폴리오 상세 모바일 메뉴에서 목차 링크 선택 후 메뉴가 닫힌다", async ({ page }) => {
    await preparePage(page, "light")
    await page.goto("/portfolio/exem-data-grid#hook")
    await waitForUiReady(page)
    await openMobileSheet(page)

    const threadsLink = page
      .locator(SHEET_CONTENT_SELECTOR)
      .locator('.toc-link[data-section-id="threads"]')
    await threadsLink.focus()
    await threadsLink.press("Enter")

    await expect(page.locator(SHEET_CONTENT_SELECTOR)).toHaveCount(0)
    await expect
      .poll(async () => page.evaluate(() => window.location.hash), {
        message: "URL hash should update after mobile portfolio TOC navigation",
      })
      .toBe("#threads")
  })
})
