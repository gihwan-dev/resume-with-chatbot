import type { UIMessage } from "ai"
import { useEffect, useRef } from "react"
import { CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AssistantMessage } from "./AssistantMessage"
import { LoadingState } from "./LoadingState"
import type { Source } from "./types"
import { UserMessage } from "./UserMessage"
import { WelcomeScreen } from "./WelcomeScreen"

interface ChatMessagesProps {
  messages: UIMessage[]
  sources: Map<string, Source[]>
  followUpQuestions: string[]
  isLoading: boolean
  isStreaming: boolean
  onSuggestedQuestionClick: (question: string) => void
  onFollowUpClick: (question: string) => void
}

export function ChatMessages({
  messages,
  sources,
  followUpQuestions,
  isLoading,
  isStreaming,
  onSuggestedQuestionClick,
  onFollowUpClick,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - scroll on message count change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length])

  // Show welcome screen if no messages
  if (messages.length === 0 && !isLoading) {
    return (
      <CardContent className="flex-1 p-0 overflow-hidden">
        <WelcomeScreen onQuestionClick={onSuggestedQuestionClick} />
      </CardContent>
    )
  }

  return (
    <div className="flex-1 overflow-hidden relative">
      <ScrollArea className="h-full px-4 py-4">
        <div className="flex flex-col gap-5 pb-4">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1

            // Get text content from message parts (text parts + answer tool result)
            const textContent = message.parts
              .map((part) => {
                if (part.type === "text") {
                  return part.text
                }
                // answer tool result에서 답변 텍스트 추출
                if (
                  part.type === "tool-answer" &&
                  part.state === "output-available" &&
                  part.output
                ) {
                  return (part.output as { answer?: string })?.answer || ""
                }
                return ""
              })
              .filter(Boolean)
              .join("")

            if (message.role === "user") {
              return <UserMessage key={message.id} content={textContent} />
            }

            return (
              <AssistantMessage
                key={message.id}
                content={textContent}
                sources={sources.get(message.id) || []}
                followUpQuestions={isLastMessage && !isStreaming ? followUpQuestions : []}
                onFollowUpClick={onFollowUpClick}
                isLatest={isLastMessage}
              />
            )
          })}

          {/* Loading state */}
          {isLoading && <LoadingState status={isStreaming ? "generating" : "searching"} />}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </div>
  )
}
