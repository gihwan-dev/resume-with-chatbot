import { AssistantModal } from "@/components/assistant-ui/assistant-modal"
import { AnswerToolUI } from "./answer-tool-ui"
import { ChatErrorBoundary } from "./chat-error-boundary"
import { ChatRuntimeProvider } from "./chat-runtime-provider"

export function ChatWidget() {
  return (
    <ChatErrorBoundary>
      <ChatRuntimeProvider>
        <AnswerToolUI />
        <AssistantModal />
      </ChatRuntimeProvider>
    </ChatErrorBoundary>
  )
}
