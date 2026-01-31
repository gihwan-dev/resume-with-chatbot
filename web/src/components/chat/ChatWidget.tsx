import { AssistantModal } from "@/components/assistant-ui/assistant-modal"
import { AnswerToolUI } from "./AnswerToolUI"
import { ChatRuntimeProvider } from "./ChatRuntimeProvider"

export function ChatWidget() {
  return (
    <ChatRuntimeProvider>
      <AnswerToolUI />
      <AssistantModal />
    </ChatRuntimeProvider>
  )
}
