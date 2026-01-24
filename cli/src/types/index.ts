import { z } from "zod"

// Source types
export type MessageSource = "claude-history" | "claude-project"
export type MessageRole = "user" | "assistant"

// Raw input schemas from different sources
export const ClaudeHistoryEntrySchema = z.object({
  display: z.string(),
  timestamp: z.number(),
  project: z.string().optional(),
  pastedContents: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional(),
})

export type ClaudeHistoryEntry = z.infer<typeof ClaudeHistoryEntrySchema>

export const ClaudeProjectMessageSchema = z.object({
  message: z.object({
    role: z.enum(["user", "assistant"]),
    content: z.union([
      z.string(),
      z.array(
        z.object({
          type: z.string(),
          text: z.string().optional(),
          thinking: z.string().optional(),
        })
      ),
    ]),
  }),
  sessionId: z.string(),
  timestamp: z.union([z.string(), z.number()]),
  cwd: z.string().optional(),
  uuid: z.string().optional(),
  parentUuid: z.string().nullable().optional(),
})

export type ClaudeProjectMessage = z.infer<typeof ClaudeProjectMessageSchema>

// Unified output schema
export interface UnifiedMessage {
  id: string // SHA256 hash
  source: MessageSource
  timestamp: string // ISO 8601
  timestampMs: number
  role: MessageRole
  content: string // PII masked
  thinking?: string // AI reasoning process (from thinking blocks)
  sessionId: string
  parentId: string | null
  project: {
    path: string
    name: string
  }
  metadata: {
    gitBranch?: string
    cwd?: string
  }
}

// Conversation turn (user message + assistant response pair)
export interface ConversationTurn {
  timestamp: string
  user: string
  assistant?: string
  thinking?: string
}

export interface UnifiedSession {
  sessionId: string
  startTime: string
  endTime: string
  project: {
    path: string
    name: string
  }
  messages: UnifiedMessage[]
}

export interface CollectionStats {
  totalSessions: number
  totalMessages: number
  duplicatesRemoved: number
  bySource: Record<MessageSource, number>
  byProject: Record<string, number>
}

export interface CollectionOutput {
  version: string
  collectedAt: string
  stats: CollectionStats
  sessions: UnifiedSession[]
}

// New simplified output for portfolio use
export interface PortfolioOutput {
  version: string
  collectedAt: string
  project: string
  stats: {
    totalConversations: number
    noiseRemoved: number
    duplicatesRemoved: number
  }
  conversations: ConversationTurn[]
}

// CLI options
export interface CollectOptions {
  project?: string
  since?: string
  output?: string
  verbose?: boolean
}
