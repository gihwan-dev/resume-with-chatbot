import type { Page } from "@playwright/test"
import {
  CHAT_RESPONSE_HEADERS,
  mockChatStreamSSE,
  mockFollowupStream,
  mockSourcePreviewResponse,
} from "./mock-streams"

/**
 * /api/chat, /api/followup을 Playwright route로 인터셉트하여 모의 응답을 반환한다.
 */
export async function mockApiRoutes(page: Page, chatStream: () => string = mockChatStreamSSE) {
  await page.route("**/api/chat**", async (route) => {
    await route.fulfill({
      status: 200,
      headers: CHAT_RESPONSE_HEADERS,
      body: chatStream(),
    })
  })

  await page.route("**/api/followup**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: mockFollowupStream(),
    })
  })

  await page.route("**/api/source-preview**", async (route) => {
    const requestUrl = new URL(route.request().url())
    const sourceId = requestUrl.searchParams.get("id")

    if (!sourceId) {
      await route.fulfill({
        status: 400,
        contentType: "application/json; charset=utf-8",
        body: JSON.stringify({ error: "Missing source id" }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json; charset=utf-8",
      body: JSON.stringify(mockSourcePreviewResponse()),
    })
  })
}
