import {
  type ClaudeHistoryEntry,
  ClaudeHistoryEntrySchema,
  type UnifiedMessage,
} from "../types/index.js"
import { normalizeTimestamp } from "../transformers/timestamp-normalizer.js"
import { maskPII } from "../transformers/pii-masker.js"
import { generateMessageHash } from "../transformers/deduplicator.js"
import { readJsonlFile, getHomeDir, extractProjectName } from "../utils/file.js"
import * as path from "node:path"

/**
 * Get the default history file path
 */
export function getHistoryFilePath(): string {
  return path.join(getHomeDir(), ".claude", "history.jsonl")
}

/**
 * Parse a single history entry into a unified message
 */
export function parseHistoryEntry(
  entry: ClaudeHistoryEntry,
  sessionCounter: { count: number }
): UnifiedMessage {
  const normalized = normalizeTimestamp(entry.timestamp)
  const content = maskPII(entry.display)
  const projectPath = entry.project || "unknown"
  const sessionId = `history-${sessionCounter.count++}`

  const message: UnifiedMessage = {
    id: generateMessageHash({
      content,
      timestamp: normalized.iso,
      role: "user",
      sessionId,
    }),
    source: "claude-history",
    timestamp: normalized.iso,
    timestampMs: normalized.ms,
    role: "user", // History entries are user prompts
    content,
    sessionId,
    parentId: null,
    project: {
      path: projectPath,
      name: extractProjectName(projectPath),
    },
    metadata: {},
  }

  return message
}

/**
 * Parse the Claude Code history.jsonl file
 */
export async function parseClaudeHistory(
  historyPath?: string,
  options?: {
    projectFilter?: string
    sinceDate?: string
    verbose?: boolean
  }
): Promise<UnifiedMessage[]> {
  const filePath = historyPath || getHistoryFilePath()
  const messages: UnifiedMessage[] = []
  const sessionCounter = { count: 0 }

  let lineCount = 0
  let errorCount = 0

  for await (const result of readJsonlFile(filePath, ClaudeHistoryEntrySchema)) {
    lineCount++

    if ("error" in result) {
      errorCount++
      if (options?.verbose) {
        console.error(`Line ${result.lineNumber}: Parse error - ${result.error.message}`)
      }
      continue
    }

    const entry = result.data

    // Apply project filter
    if (options?.projectFilter) {
      const projectName = extractProjectName(entry.project || "")
      if (!projectName.toLowerCase().includes(options.projectFilter.toLowerCase())) {
        continue
      }
    }

    // Apply date filter
    if (options?.sinceDate) {
      const normalized = normalizeTimestamp(entry.timestamp)
      const sinceNormalized = normalizeTimestamp(options.sinceDate)
      if (normalized.ms < sinceNormalized.ms) {
        continue
      }
    }

    const message = parseHistoryEntry(entry, sessionCounter)
    messages.push(message)
  }

  if (options?.verbose) {
    console.log(`Parsed ${messages.length} entries from history.jsonl (${errorCount} errors)`)
  }

  return messages
}
