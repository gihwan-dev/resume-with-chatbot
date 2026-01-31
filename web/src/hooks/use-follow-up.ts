import { useCompletion } from "@ai-sdk/react"
import { useCallback, useEffect, useState } from "react"
import { parseFollowUpQuestions } from "@/lib/chat-utils"

interface UseFollowUpOptions {
  enabled?: boolean
}

export function useFollowUp(options: UseFollowUpOptions = {}) {
  const { enabled = true } = options
  const [questions, setQuestions] = useState<string[]>([])

  const { complete, completion, isLoading, error } = useCompletion({
    api: "/api/followup",
    streamProtocol: "text",
  })

  // Parse questions when completion changes
  useEffect(() => {
    if (completion) {
      const parsed = parseFollowUpQuestions(completion)
      setQuestions(parsed)
    }
  }, [completion])

  // Generate follow-up questions based on the last assistant message
  const generateFollowUp = useCallback(
    async (lastMessage: string) => {
      if (!enabled || !lastMessage.trim()) return

      // Reset questions before generating new ones
      setQuestions([])

      try {
        await complete(lastMessage)
      } catch (e) {
        console.error("Failed to generate follow-up questions:", e)
      }
    },
    [enabled, complete]
  )

  // Clear questions
  const clearQuestions = useCallback(() => {
    setQuestions([])
  }, [])

  return {
    questions,
    isLoading,
    error,
    generateFollowUp,
    clearQuestions,
  }
}
