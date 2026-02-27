import { expect, test } from "@playwright/test"
import { mockApiRoutes } from "./fixtures/mock-api"
import { waitForUiReady } from "./fixtures/ui-ready"

type TrackedEvent = {
  eventName: string
  params?: Record<string, string | number | boolean | undefined>
}

const CHAT_ONBOARDING_STORAGE_KEY = "chat_onboarding_v1"
const CHAT_ONBOARDING_VARIANT_STORAGE_KEY = "chat_onboarding_variant_v1"
const CHAT_FIRST_VISIT_SEEN_AT_KEY = "chat_first_visit_seen_at"

async function prepareTrackedPage(
  page: import("@playwright/test").Page,
  storage: Record<string, string> = {}
) {
  await page.addInitScript((initialStorage) => {
    for (const [key, value] of Object.entries(initialStorage)) {
      localStorage.setItem(key, value)
    }

    const trackedEvents: TrackedEvent[] = []
    const trackedWindow = window as Window & {
      __trackedGtagEvents?: TrackedEvent[]
      gtag?: (
        command: string,
        eventName: string,
        params?: Record<string, string | number | boolean | undefined>
      ) => void
      dataLayer?: unknown[]
    }

    trackedWindow.__trackedGtagEvents = trackedEvents
    trackedWindow.dataLayer = []
    trackedWindow.gtag = (
      command: string,
      eventName: string,
      params?: Record<string, string | number | boolean | undefined>
    ) => {
      if (command !== "event") return
      trackedEvents.push({ eventName, params })
    }
  }, storage)

  await mockApiRoutes(page)
  await page.goto("/")
  await waitForUiReady(page)
}

async function getTrackedEvents(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const trackedWindow = window as Window & {
      __trackedGtagEvents?: TrackedEvent[]
    }

    return trackedWindow.__trackedGtagEvents ?? []
  })
}

test.describe("Chat onboarding", () => {
  test("first visit 카드 노출 + CTA open/focus + 첫 메시지 전송 시 completed 이벤트", async ({
    page,
  }) => {
    await prepareTrackedPage(page)

    const onboardingCard = page.getByTestId("chat-onboarding-card")
    await expect(onboardingCard).toBeVisible()

    await expect
      .poll(async () => {
        const trackedEvents = await getTrackedEvents(page)
        return trackedEvents.filter((event) => event.eventName === "chat_onboarding_shown").length
      })
      .toBe(1)

    await page.getByTestId("chat-onboarding-cta").click()
    await expect(page.locator(".aui-modal-content")).toHaveAttribute("data-state", "open")
    await expect(page.locator(".aui-composer-input")).toBeFocused()

    const trackedAfterCta = await getTrackedEvents(page)
    const ctaEvent = trackedAfterCta.find(
      (event) => event.eventName === "chat_onboarding_cta_clicked"
    )
    expect(ctaEvent).toBeTruthy()
    expect(ctaEvent?.params?.source).toBe("first_visit")
    expect(["A", "B"]).toContain(String(ctaEvent?.params?.variant))
    expect(["mobile", "desktop"]).toContain(String(ctaEvent?.params?.device))

    await page.locator(".aui-composer-input").fill("안녕하세요")
    await page.locator(".aui-composer-send").click()
    await expect(page.getByText("최기환의 포트폴리오입니다.")).toBeVisible({ timeout: 10_000 })

    await expect
      .poll(
        async () => {
          const trackedEvents = await getTrackedEvents(page)
          return trackedEvents.filter((event) => event.eventName === "chat_onboarding_completed")
        },
        { timeout: 10_000 }
      )
      .toHaveLength(1)

    await expect(page.getByTestId("chat-onboarding-card")).toHaveCount(0)

    const stateAfterFirstMessage = await page.evaluate(() => {
      const raw = localStorage.getItem("chat_onboarding_v1")
      return raw ? JSON.parse(raw) : null
    })

    expect(stateAfterFirstMessage?.status).toBe("completed")
  })

  for (const status of ["completed", "dismissed"] as const) {
    test(`${status} 저장 상태에서는 온보딩 카드가 노출되지 않는다`, async ({ page }) => {
      const savedState = JSON.stringify({
        status,
        source: "first_visit",
        variant: "A",
        completedAt: status === "completed" ? Date.now() : undefined,
        dismissedAt: status === "dismissed" ? Date.now() : undefined,
      })

      await prepareTrackedPage(page, {
        [CHAT_ONBOARDING_STORAGE_KEY]: savedState,
        [CHAT_ONBOARDING_VARIANT_STORAGE_KEY]: "A",
        [CHAT_FIRST_VISIT_SEEN_AT_KEY]: String(Date.now()),
      })

      await expect(page.getByTestId("chat-onboarding-card")).toHaveCount(0)

      const trackedEvents = await getTrackedEvents(page)
      expect(
        trackedEvents.filter((event) => event.eventName === "chat_onboarding_shown")
      ).toHaveLength(0)
    })
  }

  test("dismiss 클릭 시 카드가 숨겨지고 dismissed 이벤트는 1회만 기록된다", async ({ page }) => {
    await prepareTrackedPage(page)

    const onboardingCard = page.getByTestId("chat-onboarding-card")
    await expect(onboardingCard).toBeVisible()

    await page.getByTestId("chat-onboarding-dismiss").click()
    await expect(onboardingCard).toHaveCount(0)

    await expect
      .poll(async () => {
        const trackedEvents = await getTrackedEvents(page)
        return trackedEvents.filter((event) => event.eventName === "chat_onboarding_dismissed")
      })
      .toHaveLength(1)

    const stateAfterDismiss = await page.evaluate(() => {
      const raw = localStorage.getItem("chat_onboarding_v1")
      return raw ? JSON.parse(raw) : null
    })

    expect(stateAfterDismiss?.status).toBe("dismissed")
  })
})
