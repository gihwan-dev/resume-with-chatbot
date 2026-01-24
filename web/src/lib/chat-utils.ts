import type { SuggestedQuestion } from "@/components/chat/types"

// Suggested questions for the welcome screen
export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    id: "tech-stack",
    text: "기술 스택이 뭔가요?",
    icon: "code",
  },
  {
    id: "team-experience",
    text: "팀 협업 경험은?",
    icon: "users",
  },
  {
    id: "recent-project",
    text: "최근 프로젝트는?",
    icon: "folder",
  },
  {
    id: "problem-solving",
    text: "문제 해결 경험은?",
    icon: "lightbulb",
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
