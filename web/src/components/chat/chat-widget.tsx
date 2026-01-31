import { AssistantModal } from "@/components/assistant-ui/assistant-modal"
import { AnswerToolUI } from "./answer-tool-ui"
import { ChatRuntimeProvider } from "./chat-runtime-provider"

export function ChatWidget() {
  return (
    <ChatRuntimeProvider>
      <AnswerToolUI />
      <AssistantModal />
    </ChatRuntimeProvider>
  )
}
