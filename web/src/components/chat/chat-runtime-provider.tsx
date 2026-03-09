import { AssistantRuntimeProvider, useAui } from "@assistant-ui/react"
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk"
import { type ReactNode, useEffect, useMemo } from "react"
import { CHAT_PROMPT_REQUEST_EVENT, type ChatPromptRequestDetail } from "@/lib/layer-events"
import { parseResumeVariant, type ResumeVariantId } from "@/lib/resume/variant"

interface ChatRuntimeProviderProps {
  children: ReactNode
  resumeVariant?: ResumeVariantId
}

function ChatPromptBridge() {
  const aui = useAui()

  useEffect(() => {
    const handlePromptRequest = (event: Event) => {
      const detail = (event as CustomEvent<ChatPromptRequestDetail>).detail
      const prompt = detail?.prompt?.trim()
      if (!prompt) return

      const appendPrompt = () => {
        aui.thread().append({ role: "user", content: [{ type: "text", text: prompt }] })
      }

      aui.thread().cancelRun()
      if (detail.resetThread) {
        aui.threads().switchToNewThread()
        requestAnimationFrame(appendPrompt)
        return
      }
      appendPrompt()
    }

    window.addEventListener(CHAT_PROMPT_REQUEST_EVENT, handlePromptRequest)
    return () => {
      window.removeEventListener(CHAT_PROMPT_REQUEST_EVENT, handlePromptRequest)
    }
  }, [aui])

  return null
}

export function ChatRuntimeProvider({
  children,
  resumeVariant = "frontend",
}: ChatRuntimeProviderProps) {
  const normalizedResumeVariant = parseResumeVariant(resumeVariant)
  const transport = useMemo(
    () => new AssistantChatTransport({ api: `/api/chat?variant=${normalizedResumeVariant}` }),
    [normalizedResumeVariant]
  )
  const runtime = useChatRuntime({
    transport,
  })
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ChatPromptBridge />
      {children}
    </AssistantRuntimeProvider>
  )
}
