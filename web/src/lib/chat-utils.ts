import type { SuggestedQuestion } from "@/components/chat/types"

// Suggested questions for the welcome screen
export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: "architecture-philosophy",
    text: "이 개발자의 아키텍처 설계 철학은 무엇인가요?",
    icon: "layers",
  },
  {
    id: "performance-bottleneck-order",
    text: "대규모 데이터 성능 병목을 어떤 순서로 해결했나요?",
    icon: "server",
  },
  {
    id: "tradeoff-rationale",
    text: "가장 어려웠던 트레이드오프와 선택 근거는 무엇인가요?",
    icon: "bot",
  },
  {
    id: "regression-test-strategy",
    text: "회귀를 막기 위한 테스트 전략은 어떻게 설계했나요?",
    icon: "shield-check",
  },
]

// Parse follow-up questions from completion response
export function parseFollowUpQuestions(completion: string): string[] {
  const lines = completion.split("\n").filter((line) => line.trim())
  const questions: string[] = []

  for (const line of lines) {
    // Remove common prefixes like "1.", "- ", "• "
    const cleaned = line.replace(/^[\d]+\.\s*|^[-•]\s*/, "").trim()
    if (cleaned?.endsWith("?")) {
      questions.push(cleaned)
    }
  }

  return questions.slice(0, 3)
}

// Generate a unique message ID
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}
