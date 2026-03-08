import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

const MODAL_CONTENT_SELECTOR = ".aui-modal-content"

test.describe("Live feed", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await page.goto("/")
    await waitForUiReady(page)
  })

  test("Live Resume Feed Ask AI 클릭 시 모달 열림 + 질문 자동 전송", async ({ page }) => {
    const liveFeed = page.getByTestId("live-resume-feed")
    await expect(liveFeed).toBeVisible()

    const chatRequestPromise = page.waitForRequest("**/api/chat**")
    await page.getByTestId("live-resume-feed-ask-ai").click()
    await expect(page.locator(MODAL_CONTENT_SELECTOR)).toHaveAttribute("data-state", "open", {
      timeout: 10_000,
    })
    await chatRequestPromise
  })
})
