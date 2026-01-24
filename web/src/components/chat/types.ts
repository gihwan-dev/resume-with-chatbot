// Chat component types

export interface Source {
  id: string
  title: string
  content: string
  category: string
  relevanceScore?: number
}

export interface FollowUpQuestion {
  id: string
  question: string
}

export interface ChatMessageData {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  timestamp?: Date
}

export interface SuggestedQuestion {
  id: string
  text: string
  icon?: string
}

export type ChatStatus = "ready" | "submitted" | "streaming" | "error"
