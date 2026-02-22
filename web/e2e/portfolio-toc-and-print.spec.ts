import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

const MOBILE_VIEWPORT = { width: 390, height: 844 }
const DESKTOP_VIEWPORT = { width: 1280, height: 900 }

const hasAvoidRule = (value: string | null | undefined): boolean => {
  if (!value) return false
  return value.includes("avoid")
}

async function gotoPortfolioDetail(page: import("@playwright/test").Page, url: string) {
  await page.goto(url)
  await waitForUiReady(page)
}

test.describe("Portfolio TOC behavior", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test("목차 링크 대상 섹션 id가 모두 존재한다", async ({ page }) => {
    await gotoPortfolioDetail(page, "/portfolio/exem-data-grid#hook")

    const links = page.locator(".toc-link")
    await expect(links).toHaveCount(4)

    const sectionIds = await links.evaluateAll((elements) =>
      elements
        .map((element) => element.getAttribute("data-section-id"))
        .filter((value): value is string => Boolean(value))
    )

    for (const sectionId of sectionIds) {
      await expect(page.locator(`#${sectionId}`)).toHaveCount(1)
    }
  })

  test("레거시 딥링크 진입과 목차 클릭 시 active/hash가 동기화된다", async ({ page }) => {
    await gotoPortfolioDetail(page, "/portfolio/exem-data-grid#problem")

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#threads")
    await expect
      .poll(async () =>
        page.locator('.toc-link[aria-current="location"]').getAttribute("data-section-id")
      )
      .toBe("threads")

    const retrospectiveLink = page.locator('.toc-link[data-section-id="retrospective"]')
    await retrospectiveLink.click()

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#retrospective")
    await expect(retrospectiveLink).toHaveAttribute("aria-current", "location")
  })

  test("포트폴리오 목차를 키보드로 이동해도 active/hash가 동기화된다", async ({ page }) => {
    await gotoPortfolioDetail(page, "/portfolio/exem-data-grid#hook")

    const contextLink = page.locator('.toc-link[data-section-id="context"]')
    await contextLink.focus()
    await contextLink.press("Enter")

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#context")
    await expect(contextLink).toHaveAttribute("aria-current", "location")
  })

  test("모바일 메뉴에서도 포트폴리오 목차가 노출되고 선택 후 메뉴가 닫힌다", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)
    await gotoPortfolioDetail(page, "/portfolio/exem-data-grid#hook")

    const menuButton = page.getByRole("button", { name: /open menu/i })
    await expect(menuButton).toBeVisible()
    await expect(async () => {
      await menuButton.click({ force: true })
      await expect(page.locator('[data-slot="sheet-content"]')).toBeVisible({ timeout: 1000 })
    }).toPass({ timeout: 10_000 })

    const sheet = page.locator('[data-slot="sheet-content"]')
    const threadsLink = sheet.locator('.toc-link[data-section-id="threads"]')

    await expect(threadsLink).toBeVisible()
    await threadsLink.click()

    await expect(sheet).toHaveCount(0)
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#threads")
  })

  test("모바일에서 수평 오버플로 없이 섹션 순서가 유지된다", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT)
    await gotoPortfolioDetail(page, "/portfolio/exem-data-grid#hook")

    const metrics = await page.evaluate(() => {
      const sections = ["hook", "context", "threads", "retrospective"]
        .map((sectionId) => document.getElementById(sectionId))
        .filter((section): section is HTMLElement => section instanceof HTMLElement)

      const tops = sections.map((section) => section.getBoundingClientRect().top)
      const ordered = tops.every((top, index) => index === 0 || top > tops[index - 1])

      return {
        hasHorizontalOverflow:
          document.documentElement.scrollWidth > window.innerWidth + 1 ||
          document.body.scrollWidth > window.innerWidth + 1,
        sectionCount: sections.length,
        ordered,
      }
    })

    expect(metrics.sectionCount).toBe(4)
    expect(metrics.hasHorizontalOverflow).toBe(false)
    expect(metrics.ordered).toBe(true)
  })

  test("데스크톱에서 첫 스레드 라인과 마커 정렬이 유지된다", async ({ page }) => {
    await page.setViewportSize(DESKTOP_VIEWPORT)
    await gotoPortfolioDetail(page, "/portfolio/exem-data-grid#threads")

    const alignment = await page.evaluate(() => {
      const threadItem = document.querySelector<HTMLElement>("[data-thread-item]")
      const line = threadItem?.querySelector<HTMLElement>("[data-thread-line]")
      const marker = threadItem?.querySelector<HTMLElement>("[data-thread-marker]")

      if (!threadItem || !line || !marker) {
        return null
      }

      const lineRect = line.getBoundingClientRect()
      const markerRect = marker.getBoundingClientRect()

      const lineCenterX = lineRect.left + lineRect.width / 2
      const markerCenterX = markerRect.left + markerRect.width / 2
      const markerCenterY = markerRect.top + markerRect.height / 2

      return {
        xDiff: Math.abs(lineCenterX - markerCenterX),
        yConnected: lineRect.top <= markerCenterY && lineRect.bottom >= markerCenterY,
      }
    })

    expect(alignment).not.toBeNull()
    expect(alignment?.xDiff ?? 999).toBeLessThan(2.5)
    expect(alignment?.yConnected ?? false).toBe(true)
  })

  test("인쇄 미디어에서는 웹 전용 UI가 숨김 처리된다", async ({ page }) => {
    await gotoPortfolioDetail(page, "/portfolio/exem-customer-dashboard#hook")

    const desktopNavRoot = page.locator('[data-slot="desktop-nav-root"]')
    await expect(desktopNavRoot).toBeVisible()

    await page.emulateMedia({ media: "print" })
    await expect(desktopNavRoot).not.toBeVisible()
  })

  test("인쇄 미디어에서 라이트 출력 규칙과 보조 UI 숨김이 적용된다", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("theme", "dark")
    })
    await gotoPortfolioDetail(page, "/portfolio/exem-data-grid#hook")

    const desktopNavRoot = page.locator('[data-slot="desktop-nav-root"]')
    const chatAnchor = page.locator(".aui-modal-anchor")

    await expect(desktopNavRoot).toBeVisible()
    await expect(chatAnchor).toHaveCount(1, { timeout: 10_000 })
    await expect(chatAnchor).toBeVisible()

    await page.emulateMedia({ media: "print" })
    await expect(desktopNavRoot).not.toBeVisible()
    await expect(chatAnchor).not.toBeVisible()

    const printStyles = await page.evaluate(() => {
      const rootStyle = window.getComputedStyle(document.documentElement)
      const bodyStyle = window.getComputedStyle(document.body)
      return {
        resumeBg: rootStyle.getPropertyValue("--resume-bg").trim(),
        resumeTextMain: rootStyle.getPropertyValue("--resume-text-main").trim(),
        printColorAdjust:
          bodyStyle.getPropertyValue("print-color-adjust").trim() ||
          bodyStyle.getPropertyValue("-webkit-print-color-adjust").trim(),
      }
    })

    expect(["#fff", "var(--color-white)"]).toContain(printStyles.resumeBg)
    expect(["#0f172a", "var(--color-slate-900)", "oklch(20.8% 0.042 265.755)"]).toContain(
      printStyles.resumeTextMain
    )
    expect(printStyles.printColorAdjust).toBe("exact")
  })

  test("인쇄 미디어에서도 핵심 섹션 타이틀이 유지된다", async ({ page }) => {
    await gotoPortfolioDetail(page, "/portfolio/exem-data-grid#hook")
    await page.emulateMedia({ media: "print" })

    await expect(page.locator("#hook h1")).toBeVisible()
    await expect(page.locator("#context h2")).toContainText("Context")
    await expect(page.locator("#threads h2")).toContainText("Story Threads")
    await expect(page.locator("#retrospective h2")).toContainText("What I Learned")
  })

  test("인쇄 미디어에서는 주요 스레드 블록이 페이지 분할 방지 규칙을 따른다", async ({ page }) => {
    await gotoPortfolioDetail(page, "/portfolio/exem-data-grid#hook")
    await page.emulateMedia({ media: "print" })

    const styleMap = await page.evaluate<Record<
      string,
      { breakInside: string; pageBreakInside: string }
    > | null>(() => {
      const targets = {
        hook: document.getElementById("hook"),
        context: document.getElementById("context"),
        threads: document.getElementById("threads"),
        retrospective: document.getElementById("retrospective"),
        firstThreadItem: document.querySelector("#threads ol > li"),
      }

      const resultEntries = Object.entries(targets).map(([key, element]) => {
        if (!element) return [key, { breakInside: "", pageBreakInside: "" }] as const
        const style = window.getComputedStyle(element)
        return [
          key,
          {
            breakInside: style.breakInside,
            pageBreakInside: style.getPropertyValue("page-break-inside"),
          },
        ] as const
      })

      return Object.fromEntries(resultEntries)
    })

    expect(styleMap).not.toBeNull()

    for (const selector of [
      "hook",
      "context",
      "threads",
      "retrospective",
      "firstThreadItem",
    ] as const) {
      const styleEntry = styleMap?.[selector]
      expect(styleEntry, `${selector} selector style is required`).toBeTruthy()
      expect(
        hasAvoidRule(styleEntry?.breakInside) || hasAvoidRule(styleEntry?.pageBreakInside),
        `${selector} should avoid page break in print`
      ).toBe(true)
    }
  })
})
