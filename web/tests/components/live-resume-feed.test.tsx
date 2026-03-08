import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { act } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { LiveResumeFeed } from "@/components/resume/live-resume-feed"

const { dispatchChatPromptRequestSpy, trackEventSpy } = vi.hoisted(() => ({
  dispatchChatPromptRequestSpy: vi.fn(),
  trackEventSpy: vi.fn(),
}))

vi.mock("@/lib/chat-prompt", () => ({
  dispatchChatPromptRequest: dispatchChatPromptRequestSpy,
}))

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventSpy,
}))

describe("LiveResumeFeed", () => {
  beforeEach(() => {
    vi.useRealTimers()
    dispatchChatPromptRequestSpy.mockClear()
    trackEventSpy.mockClear()

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  })

  const items = [
    {
      id: "item-1",
      title: "업데이트 1",
      date: "2026-03-08",
      summary: "첫 번째 요약",
      tags: ["tag1"],
      promptText: '최근 업데이트 "업데이트 1"을 설명해줘.',
    },
    {
      id: "item-2",
      title: "업데이트 2",
      date: "2026-03-07",
      summary: "두 번째 요약",
      tags: ["tag2"],
      promptText: '최근 업데이트 "업데이트 2"를 설명해줘.',
    },
  ]

  it("Ask AI 클릭 시 chat prompt 이벤트를 전송한다", async () => {
    render(<LiveResumeFeed items={items} />)
    const user = userEvent.setup()

    await user.click(screen.getByTestId("live-resume-feed-ask-ai"))

    expect(dispatchChatPromptRequestSpy).toHaveBeenCalledWith({
      prompt: '최근 업데이트 "업데이트 1"을 설명해줘.',
      resetThread: true,
      source: "live_feed",
    })
  })

  it("5초 주기로 항목을 자동 회전한다", () => {
    vi.useFakeTimers()
    render(<LiveResumeFeed items={items} />)

    const ticker = screen.getByTestId("live-resume-feed-item")
    expect(ticker.textContent).toContain("업데이트 1")

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByTestId("live-resume-feed-item").textContent).toContain("업데이트 2")
    expect(trackEventSpy).toHaveBeenCalledWith("live_feed_rotate", {
      from_index: 0,
      to_index: 1,
    })
  })

  it("hover 중에는 자동 회전을 일시정지한다", () => {
    vi.useFakeTimers()
    render(<LiveResumeFeed items={items} />)

    const container = screen.getByTestId("live-resume-feed")
    fireEvent.mouseEnter(container)
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    const rotateCallsWhilePaused = trackEventSpy.mock.calls.filter(
      ([eventName]) => eventName === "live_feed_rotate"
    )
    expect(rotateCallsWhilePaused).toHaveLength(0)

    fireEvent.mouseLeave(container)
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    const rotateCallsAfterResume = trackEventSpy.mock.calls.filter(
      ([eventName]) => eventName === "live_feed_rotate"
    )
    expect(rotateCallsAfterResume).toHaveLength(1)
  })
})
