import type { Page } from "@playwright/test"
import { CHAT_RESPONSE_HEADERS, mockChatStreamSSE, mockFollowupStream } from "./mock-streams"

/**
 * /api/chat, /api/followup을 Playwright route로 인터셉트하여 모의 응답을 반환한다.
 */
export async function mockApiRoutes(page: Page, chatStream: () => string = mockChatStreamSSE) {
  await page.route("**/api/chat", async (route) => {
    await route.fulfill({
      status: 200,
      headers: CHAT_RESPONSE_HEADERS,
      body: chatStream(),
    })
  })

  await page.route("**/api/followup", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/plain; charset=utf-8",
      body: mockFollowupStream(),
    })
  })
}
