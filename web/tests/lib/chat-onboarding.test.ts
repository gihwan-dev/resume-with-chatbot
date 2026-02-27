import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  CHAT_FIRST_VISIT_SEEN_AT_KEY,
  CHAT_ONBOARDING_STORAGE_KEY,
  CHAT_ONBOARDING_VARIANT_STORAGE_KEY,
  getOrAssignChatOnboardingVariant,
  markFirstVisitSeen,
  markOnboardingCompleted,
  markOnboardingDismissed,
  markOnboardingShown,
  readChatOnboardingState,
  shouldShowOnboarding,
} from "@/lib/chat-onboarding"

describe("chat onboarding storage utils", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("first visit 여부를 1회만 true로 판정한다", () => {
    expect(markFirstVisitSeen()).toBe(true)
    expect(markFirstVisitSeen()).toBe(false)
    expect(localStorage.getItem(CHAT_FIRST_VISIT_SEEN_AT_KEY)).toBeTruthy()
  })

  it("variant를 최초 1회 고정한다", () => {
    const randomSpy = vi.spyOn(Math, "random")
    randomSpy.mockReturnValueOnce(0.1).mockReturnValueOnce(0.9)

    const firstVariant = getOrAssignChatOnboardingVariant()
    const secondVariant = getOrAssignChatOnboardingVariant()

    expect(firstVariant).toBe("A")
    expect(secondVariant).toBe("A")
    expect(localStorage.getItem(CHAT_ONBOARDING_VARIANT_STORAGE_KEY)).toBe("A")
  })

  it("온보딩 노출 조건을 판정한다", () => {
    expect(shouldShowOnboarding({ isFirstVisit: true, state: null })).toBe(true)
    expect(shouldShowOnboarding({ isFirstVisit: false, state: null })).toBe(false)
  })

  it("dismissed/completed 상태는 재노출하지 않는다", () => {
    const shownState = markOnboardingShown({ source: "first_visit", variant: "B" })
    const dismissedState = markOnboardingDismissed(shownState)
    const completedState = markOnboardingCompleted(shownState)

    expect(shouldShowOnboarding({ isFirstVisit: true, state: dismissedState })).toBe(false)
    expect(shouldShowOnboarding({ isFirstVisit: true, state: completedState })).toBe(false)
  })

  it("state parse 실패 시 null로 복구하고 저장값을 정리한다", () => {
    localStorage.setItem(CHAT_ONBOARDING_STORAGE_KEY, "{invalid-json")

    expect(readChatOnboardingState()).toBeNull()
    expect(localStorage.getItem(CHAT_ONBOARDING_STORAGE_KEY)).toBeNull()
  })
})
