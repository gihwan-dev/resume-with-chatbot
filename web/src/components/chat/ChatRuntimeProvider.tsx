import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { useChatRuntime } from "@assistant-ui/react-ai-sdk"
import type { ReactNode } from "react"

export function ChatRuntimeProvider({ children }: { children: ReactNode }) {
  const runtime = useChatRuntime({ api: "/api/chat" })
  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
}
