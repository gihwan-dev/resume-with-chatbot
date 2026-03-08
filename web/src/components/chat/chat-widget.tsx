import { useEffect } from "react"
import { AssistantModal } from "@/components/assistant-ui/assistant-modal"
import { CHAT_WIDGET_READY_EVENT } from "@/lib/layer-events"
import { parseResumeVariant, type ResumeVariantId } from "@/lib/resume/variant"
import { ChatRuntimeProvider } from "./chat-runtime-provider"

interface ChatWidgetProps {
  resumeVariant?: ResumeVariantId
}

export function ChatWidget({ resumeVariant = "frontend" }: ChatWidgetProps) {
  const normalizedResumeVariant = parseResumeVariant(resumeVariant)

  useEffect(() => {
    const chatWindow = window as Window & {
      __resumeUiReady?: {
        chatWidget?: boolean
        navigation?: boolean
      }
    }

    chatWindow.__resumeUiReady = {
      ...(chatWindow.__resumeUiReady ?? {}),
      chatWidget: true,
    }
    window.dispatchEvent(new Event(CHAT_WIDGET_READY_EVENT))
  }, [])

  return (
    <ChatRuntimeProvider resumeVariant={normalizedResumeVariant}>
      <AssistantModal />
    </ChatRuntimeProvider>
  )
}
