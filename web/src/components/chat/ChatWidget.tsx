import { useChat } from "@ai-sdk/react"
import { MessageCircle, X } from "lucide-react"
import { useCallback, useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useFollowUp } from "@/hooks/use-follow-up"
import { cn } from "@/lib/utils"
import { ChatHeader } from "./ChatHeader"
import { ChatInput } from "./ChatInput"
import { ChatMessages } from "./ChatMessages"
import type { Source } from "./types"

interface SourceDataPart {
  type: "data-sources"
  id: string
  data: Source[]
}

function isSourceDataPart(data: unknown): data is SourceDataPart {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    data.type === "data-sources" &&
    "data" in data &&
    Array.isArray(data.data)
  )
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isRendered, setIsRendered] = useState(false)
  const [input, setInput] = useState("")
  const [sources, setSources] = useState<Map<string, Source[]>>(new Map())
  const pendingSourcesRef = useRef<Source[]>([])

  // Handle animation mounting/unmounting
  useEffect(() => {
    if (isOpen) setIsRendered(true)
    else {
      const timer = setTimeout(() => setIsRendered(false), 300) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const { messages, status, sendMessage } = useChat({
    onFinish: ({ message }) => {
      // Associate pending sources with the finished message
      if (message.role === "assistant" && pendingSourcesRef.current.length > 0) {
        setSources((prev) => {
          const newMap = new Map(prev)
          newMap.set(message.id, pendingSourcesRef.current)
          return newMap
        })
        pendingSourcesRef.current = []
      }

      // Generate follow-up questions when assistant message is complete
      if (message.role === "assistant") {
        const textContent = message.parts
          .filter((part): part is { type: "text"; text: string } => part.type === "text")
          .map((part) => part.text)
          .join("")
        generateFollowUp(textContent)
      }
    },
    onData: (data) => {
      // Process data stream parts for sources
      if (Array.isArray(data)) {
        for (const item of data) {
          if (isSourceDataPart(item)) {
            pendingSourcesRef.current = item.data
          }
        }
      }
    },
  })

  const { questions: followUpQuestions, generateFollowUp, clearQuestions } = useFollowUp()

  const isLoading = status === "submitted" || status === "streaming"
  const isStreaming = status === "streaming"

  // Handle message submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return

      // Clear follow-up questions and pending sources when sending a new message
      clearQuestions()
      pendingSourcesRef.current = []

      await sendMessage({ text: input })
      setInput("")
    },
    [input, isLoading, sendMessage, clearQuestions, setInput]
  )

  // Handle suggested question click (from welcome screen)
  const handleSuggestedQuestionClick = useCallback(
    async (question: string) => {
      if (isLoading) return
      clearQuestions()
      pendingSourcesRef.current = []
      await sendMessage({ text: question })
    },
    [isLoading, sendMessage, clearQuestions]
  )

  // Handle follow-up question click
  const handleFollowUpClick = useCallback(
    async (question: string) => {
      if (isLoading) return
      clearQuestions()
      pendingSourcesRef.current = []
      await sendMessage({ text: question })
    },
    [isLoading, sendMessage, clearQuestions]
  )

  return (
    <div className="fixed bottom-6 right-6 z-200 flex flex-col items-end gap-4">
      {/* Chat Window */}
      {(isOpen || isRendered) && (
        <Card
          className={cn(
            "w-[380px] sm:w-[420px] h-[600px] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ease-in-out origin-bottom-right border-0 ring-1 ring-black/5",
            isOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-10"
          )}
        >
          <ChatHeader onClose={() => setIsOpen(false)} />

          <ChatMessages
            messages={messages}
            sources={sources}
            followUpQuestions={followUpQuestions}
            isLoading={isLoading}
            isStreaming={isStreaming}
            onSuggestedQuestionClick={handleSuggestedQuestionClick}
            onFollowUpClick={handleFollowUpClick}
          />

          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Card>
      )}

      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen ? "bg-destructive hover:bg-destructive/90 rotate-90" : "bg-primary hover:bg-primary/90"
        )}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-7 w-7 text-white" />
        )}
      </Button>
    </div>
  )
}
