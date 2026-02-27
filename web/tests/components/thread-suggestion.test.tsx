import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ThreadWelcome } from "@/components/assistant-ui/thread"
import { SUGGESTED_QUESTIONS } from "@/lib/chat-utils"

const { appendSpy, trackEventSpy, onUserMessageSubmittedSpy } = vi.hoisted(() => ({
  appendSpy: vi.fn(),
  trackEventSpy: vi.fn(),
  onUserMessageSubmittedSpy: vi.fn(),
}))

vi.mock("@assistant-ui/react", async () => {
  const actual = await vi.importActual<typeof import("@assistant-ui/react")>("@assistant-ui/react")

  return {
    ...actual,
    useAui: () =>
      ({
        thread: () => ({
          append: appendSpy,
        }),
      }) as unknown as ReturnType<typeof actual.useAui>,
  }
})

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventSpy,
}))

describe("ThreadWelcome 추천 질문", () => {
  beforeEach(() => {
    appendSpy.mockClear()
    trackEventSpy.mockClear()
    onUserMessageSubmittedSpy.mockClear()
  })

  it("추천 질문 4개를 렌더링한다", () => {
    render(<ThreadWelcome />)

    expect(screen.getAllByRole("button")).toHaveLength(4)
    for (const question of SUGGESTED_QUESTIONS) {
      expect(screen.getByRole("button", { name: question.text })).toBeTruthy()
    }
  })

  it("추천 질문 클릭 시 analytics와 사용자 메시지 append를 호출한다", async () => {
    render(<ThreadWelcome onUserMessageSubmitted={onUserMessageSubmittedSpy} />)
    const user = userEvent.setup()
    const firstQuestion = SUGGESTED_QUESTIONS[0]

    await user.click(screen.getByRole("button", { name: firstQuestion.text }))

    expect(trackEventSpy).toHaveBeenCalledWith("chat_message", { method: "suggestion" })
    expect(onUserMessageSubmittedSpy).toHaveBeenCalledWith("suggestion")
    expect(appendSpy).toHaveBeenCalledWith({
      role: "user",
      content: [{ type: "text", text: firstQuestion.text }],
    })
  })
})
