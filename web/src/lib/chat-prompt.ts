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

function dispatchPromptRequest(detail: ChatPromptRequestDetail): void {
  requestAnimationFrame(() => {
    window.dispatchEvent(
      new CustomEvent<ChatPromptRequestDetail>(CHAT_PROMPT_REQUEST_EVENT, { detail })
    )
  })
}

export function dispatchChatPromptRequest(detail: ChatPromptRequestDetail): void {
  if (typeof window === "undefined") return

  const resumeWindow = window as ResumeUiReadyWindow
  if (resumeWindow.__resumeUiReady?.chatWidget) {
    dispatchPromptRequest(detail)
    return
  }

  const handleChatWidgetReady = () => {
    dispatchPromptRequest(detail)
  }

  window.addEventListener(CHAT_WIDGET_READY_EVENT, handleChatWidgetReady, { once: true })
}
