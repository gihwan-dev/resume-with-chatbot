import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"

test.describe("Portfolio Before/After toggle", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
  })

  test("초기 상태에서 after 탭이 선택되고 hash는 유지된다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#threads")

    const compare = page.locator("#threads compare-toggle").first()
    const beforeTab = compare.locator('[data-toggle="before"]')
    const afterTab = compare.locator('[data-toggle="after"]')
    const beforePanel = compare.locator('[data-content="before"]')
    const afterPanel = compare.locator('[data-content="after"]')

    await expect(compare).toBeVisible()
    await expect(beforeTab).toHaveAttribute("role", "tab")
    await expect(afterTab).toHaveAttribute("role", "tab")
    await expect(beforeTab).toHaveAttribute("aria-selected", "false")
    await expect(afterTab).toHaveAttribute("aria-selected", "true")
    await expect(beforePanel).toBeHidden()
    await expect(afterPanel).toBeVisible()
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#threads")
  })

  test("탭 클릭 시 상태만 전환되고 URL hash는 변경되지 않는다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#threads")

    const compare = page.locator("#threads compare-toggle").first()
    const beforeTab = compare.locator('[data-toggle="before"]')
    const afterTab = compare.locator('[data-toggle="after"]')
    const beforePanel = compare.locator('[data-content="before"]')
    const afterPanel = compare.locator('[data-content="after"]')

    await beforeTab.click()

    await expect(beforeTab).toHaveAttribute("aria-selected", "true")
    await expect(afterTab).toHaveAttribute("aria-selected", "false")
    await expect(beforePanel).toBeVisible()
    await expect(afterPanel).toBeHidden()
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#threads")

    await afterTab.click()

    await expect(beforeTab).toHaveAttribute("aria-selected", "false")
    await expect(afterTab).toHaveAttribute("aria-selected", "true")
    await expect(beforePanel).toBeHidden()
    await expect(afterPanel).toBeVisible()
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#threads")
  })

  test("키보드 조작으로 탭 전환이 가능하다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#threads")

    const compare = page.locator("#threads compare-toggle").first()
    const beforeTab = compare.locator('[data-toggle="before"]')
    const afterTab = compare.locator('[data-toggle="after"]')

    await afterTab.focus()
    await afterTab.press("ArrowLeft")
    await expect(beforeTab).toHaveAttribute("aria-selected", "true")

    await beforeTab.press("End")
    await expect(afterTab).toHaveAttribute("aria-selected", "true")

    await afterTab.press("Home")
    await expect(beforeTab).toHaveAttribute("aria-selected", "true")

    await beforeTab.press("Enter")
    await expect(beforeTab).toHaveAttribute("aria-selected", "true")

    await afterTab.focus()
    await afterTab.press("Space")
    await expect(afterTab).toHaveAttribute("aria-selected", "true")

    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe("#threads")
  })

  test("ARIA 탭 관계(role/aria-controls/aria-labelledby)가 올바르게 연결된다", async ({ page }) => {
    await page.goto("/portfolio/exem-data-grid#threads")

    const compare = page.locator("#threads compare-toggle").first()
    const tabList = compare.getByRole("tablist")
    const tabs = compare.getByRole("tab")

    await expect(tabList).toHaveCount(1)
    await expect(tabs).toHaveCount(2)

    const ariaContract = await compare.evaluate((element) => {
      const tabElements = Array.from(element.querySelectorAll<HTMLElement>('[role="tab"]'))

      return tabElements.map((tab) => {
        const panelId = tab.getAttribute("aria-controls")
        const panel = panelId ? document.getElementById(panelId) : null

        return {
          tabId: tab.id,
          panelId,
          selected: tab.getAttribute("aria-selected"),
          panelRole: panel?.getAttribute("role") ?? null,
          panelLabelledBy: panel?.getAttribute("aria-labelledby") ?? null,
        }
      })
    })

    expect(ariaContract).toHaveLength(2)
    expect(ariaContract.filter((entry) => entry.selected === "true")).toHaveLength(1)

    for (const entry of ariaContract) {
      expect(entry.tabId).toBeTruthy()
      expect(entry.panelId).toBeTruthy()
      expect(entry.panelRole).toBe("tabpanel")
      expect(entry.panelLabelledBy).toBe(entry.tabId)
    }
  })

  test("길이가 다른 비교 콘텐츠도 Action 문맥에서 레이아웃이 안정적으로 유지된다", async ({
    page,
  }) => {
    await page.goto("/portfolio/exem-dx-improvement#threads")

    const compare = page.locator("#threads compare-toggle").first()
    await expect(compare).toBeVisible()

    const layoutState = await compare.evaluate((element) => {
      const actionSection = element.closest("section")
      const actionHeading = actionSection?.querySelector("h4")?.textContent?.trim() ?? null
      const afterPanel = element.querySelector<HTMLElement>('[data-content="after"]')
      const beforePanel = element.querySelector<HTMLElement>('[data-content="before"]')

      if (!afterPanel || !beforePanel) {
        return null
      }

      return {
        actionHeading,
        rootOverflowX: window.getComputedStyle(element).overflowX,
        rootOverflowY: window.getComputedStyle(element).overflowY,
        afterPanelClientWidth: afterPanel.clientWidth,
        afterPanelScrollWidth: afterPanel.scrollWidth,
        beforePanelClientWidth: beforePanel.clientWidth,
        beforePanelScrollWidth: beforePanel.scrollWidth,
      }
    })

    expect(layoutState).not.toBeNull()
    expect(layoutState?.actionHeading).toBe("Implementation Strategy")
    expect(layoutState?.rootOverflowX).toBe("hidden")
    expect(layoutState?.rootOverflowY).toBe("hidden")
    expect(layoutState?.afterPanelClientWidth ?? 0).toBeGreaterThan(0)
    expect(
      (layoutState?.afterPanelScrollWidth ?? 0) - (layoutState?.afterPanelClientWidth ?? 0)
    ).toBeLessThanOrEqual(2)
    expect(
      (layoutState?.beforePanelScrollWidth ?? 0) - (layoutState?.beforePanelClientWidth ?? 0)
    ).toBeLessThanOrEqual(2)
  })
})
