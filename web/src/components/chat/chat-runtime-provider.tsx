import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { AssistantChatTransport, useChatRuntime } from "@assistant-ui/react-ai-sdk"
import { useMemo, type ReactNode } from "react"
import { parseResumeVariant, type ResumeVariantId } from "@/lib/resume/variant"

interface ChatRuntimeProviderProps {
  children: ReactNode
  resumeVariant?: ResumeVariantId
}

export function ChatRuntimeProvider({ children, resumeVariant = "frontend" }: ChatRuntimeProviderProps) {
  const normalizedResumeVariant = parseResumeVariant(resumeVariant)
  const transport = useMemo(
    () => new AssistantChatTransport({ api: `/api/chat?variant=${normalizedResumeVariant}` }),
    [normalizedResumeVariant]
  )
  const runtime = useChatRuntime({
    transport,
  })
  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
}
