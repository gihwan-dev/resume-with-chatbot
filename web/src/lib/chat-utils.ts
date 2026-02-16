import type { SuggestedQuestion } from "@/components/chat/types"

// Suggested questions for the welcome screen
export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: "accessibility-wcag",
    text: "접근성(WCAG) 작업 경험이 있나요?",
    icon: "accessibility",
  },
  {
    id: "typescript-quality",
    text: "TypeScript 안정성과 품질을 어떻게 개선했나요?",
    icon: "shield-check",
  },
  {
    id: "ai-tools",
    text: "실무에서 AI 도구를 어떻게 활용했나요?",
    icon: "bot",
  },
  {
    id: "design-system",
    text: "디자인 시스템과 컴포넌트 설계 경험을 알려주세요.",
    icon: "layers",
  },
  {
    id: "meta-framework",
    text: "메타 프레임워크/SSR/서버리스 경험이 있나요?",
    icon: "server",
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
