import { expect, test } from "@playwright/test"
import {
  CHAT_RESPONSE_HEADERS,
  mockChatStreamSSE,
  mockChatStreamWithToolCall,
  mockFollowupStream,
} from "./fixtures/mock-streams"

/**
 * /api/chat, /api/followup을 Playwright route로 인터셉트하여 모의 응답을 반환한다.
 */
async function mockApiRoutes(
  page: import("@playwright/test").Page,
  chatStream: () => string = mockChatStreamSSE
) {
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

const FAB_SELECTOR = ".aui-modal-button"
const MODAL_CONTENT_SELECTOR = ".aui-modal-content"

/** FAB 클릭으로 모달 열기 (재시도 포함) */
async function openModal(page: import("@playwright/test").Page) {
  // 하이드레이션 + 런타임 초기화 완료 대기를 위해 클릭 후 상태 변경을 재시도
  await expect(async () => {
    await page.locator(FAB_SELECTOR).click({ force: true })
    await expect(page.locator(MODAL_CONTENT_SELECTOR)).toHaveAttribute("data-state", "open", {
      timeout: 1000,
    })
  }).toPass({ timeout: 10_000 })
}

test.describe("Chat FAB visibility", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiRoutes(page)
    await page.goto("/")
    await page.waitForSelector(FAB_SELECTOR)
  })

  test("페이지 로드 시 FAB가 표시된다", async ({ page }) => {
    await expect(page.locator(FAB_SELECTOR)).toBeVisible()
  })

  test("FAB 클릭 → 다이얼로그 열기/닫기 → FAB 유지", async ({ page }) => {
    const fab = page.locator(FAB_SELECTOR)
    await expect(fab).toBeVisible()

    // 다이얼로그 열기
    await openModal(page)

    // 다이얼로그 닫기 (FAB 다시 클릭)
    await fab.click({ force: true })
    await expect(page.locator(MODAL_CONTENT_SELECTOR)).toHaveAttribute("data-state", "closed", {
      timeout: 5000,
    })

    // FAB가 여전히 표시되는지 확인
    await expect(fab).toBeVisible()
  })

  test("메시지 전송 → 응답 완료 → FAB 유지", async ({ page }) => {
    const fab = page.locator(FAB_SELECTOR)

    // 다이얼로그 열기
    await openModal(page)

    // 메시지 입력 및 전송
    const input = page.locator(".aui-composer-input")
    await input.fill("안녕하세요")
    await page.locator(".aui-composer-send").click()

    // 응답이 렌더링될 때까지 대기
    await expect(page.getByText("최기환의 포트폴리오입니다.")).toBeVisible({
      timeout: 10_000,
    })

    // 응답 완료 후 후처리(generateTitle 등) 네트워크 요청 완료 대기
    await page.waitForLoadState("networkidle")

    // FAB가 여전히 존재하는지 확인 (핵심 검증)
    await expect(fab).toBeVisible()
  })

  test("도구 호출 포함 응답 → FAB 유지", async ({ page }) => {
    const fab = page.locator(FAB_SELECTOR)

    // 첫 번째 메시지는 beforeEach의 기본 mock으로 전송 후,
    // 두 번째 메시지에 tool call mock 적용
    await openModal(page)

    const input = page.locator(".aui-composer-input")
    await input.fill("안녕하세요")
    await page.locator(".aui-composer-send").click()

    await expect(page.getByText("최기환의 포트폴리오입니다.")).toBeVisible({
      timeout: 10_000,
    })

    // 이제 tool call 포함 mock으로 교체
    await page.unrouteAll()
    await mockApiRoutes(page, mockChatStreamWithToolCall)

    await input.fill("기술 스택이 뭐예요?")
    await page.locator(".aui-composer-send").click()

    // tool call 응답 후 네트워크 완료 대기
    await page.waitForLoadState("networkidle")

    // FAB가 여전히 존재하는지 확인 (핵심 검증)
    await expect(fab).toBeVisible()
  })
})
