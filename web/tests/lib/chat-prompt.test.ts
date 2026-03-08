import { afterEach, describe, expect, it, vi } from "vitest"
import { dispatchChatPromptRequest } from "@/lib/chat-prompt"
import {
  CHAT_PROMPT_REQUEST_EVENT,
  CHAT_WIDGET_READY_EVENT,
  type ChatPromptRequestDetail,
} from "@/lib/layer-events"

interface ResumeUiReadyWindow extends Window {
  __resumeUiReady?: {
    chatWidget?: boolean
  }
}

describe("dispatchChatPromptRequest", () => {
  afterEach(() => {
    vi.useRealTimers()
    delete (window as ResumeUiReadyWindow).__resumeUiReady
  })

  it("chat widget가 준비되지 않았으면 ready 이벤트 뒤에 요청을 발행한다", async () => {
    vi.useFakeTimers()
    const detail: ChatPromptRequestDetail = {
      prompt: "근거를 설명해줘.",
      source: "source_preview",
    }
    const eventHandler = vi.fn()

    window.addEventListener(CHAT_PROMPT_REQUEST_EVENT, eventHandler)
    dispatchChatPromptRequest(detail)

    expect(eventHandler).not.toHaveBeenCalled()

    window.dispatchEvent(new Event(CHAT_WIDGET_READY_EVENT))
    vi.runAllTimers()
    await Promise.resolve()

    expect(eventHandler).toHaveBeenCalledTimes(1)
    expect(eventHandler.mock.calls[0]?.[0]).toBeInstanceOf(CustomEvent)
    expect(
      (eventHandler.mock.calls[0]?.[0] as CustomEvent<ChatPromptRequestDetail>).detail
    ).toEqual(detail)

    window.removeEventListener(CHAT_PROMPT_REQUEST_EVENT, eventHandler)
  })

  it("chat widget가 이미 준비되었으면 즉시 다음 frame에 요청을 발행한다", async () => {
    vi.useFakeTimers()
    ;(window as ResumeUiReadyWindow).__resumeUiReady = { chatWidget: true }

    const detail: ChatPromptRequestDetail = {
      prompt: "최근 업데이트를 설명해줘.",
      source: "live_feed",
    }
    const eventHandler = vi.fn()
    window.addEventListener(CHAT_PROMPT_REQUEST_EVENT, eventHandler)

    dispatchChatPromptRequest(detail)
    vi.runAllTimers()
    await Promise.resolve()

    expect(eventHandler).toHaveBeenCalledTimes(1)

    window.removeEventListener(CHAT_PROMPT_REQUEST_EVENT, eventHandler)
  })
})
