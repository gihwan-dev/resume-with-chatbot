import * as crypto from "node:crypto"
import type { UnifiedMessage } from "../types/index.js"

/**
 * Generate a SHA256 hash for deduplication
 */
export function generateMessageHash(message: {
  content: string
  timestamp: string | number
  role: string
  sessionId?: string
}): string {
  const hashInput = [
    message.content,
    String(message.timestamp),
    message.role,
    message.sessionId || "",
  ].join("|")

  return crypto.createHash("sha256").update(hashInput).digest("hex")
}

/**
 * Generate a content-only hash for similarity detection
 */
export function generateContentHash(content: string): string {
  // Normalize whitespace for comparison
  const normalized = content.trim().replace(/\s+/g, " ").toLowerCase()
  return crypto.createHash("sha256").update(normalized).digest("hex")
}

/**
 * Deduplicate messages based on their hash
 */
export function deduplicateMessages(messages: UnifiedMessage[]): {
  unique: UnifiedMessage[]
  duplicatesRemoved: number
} {
  const seen = new Set<string>()
  const unique: UnifiedMessage[] = []
  let duplicatesRemoved = 0

  for (const message of messages) {
    if (!seen.has(message.id)) {
      seen.add(message.id)
      unique.push(message)
    } else {
      duplicatesRemoved++
    }
  }

  return { unique, duplicatesRemoved }
}

/**
 * Deduplicate based on content similarity (ignoring timestamps)
 */
export function deduplicateByContent(messages: UnifiedMessage[]): {
  unique: UnifiedMessage[]
  duplicatesRemoved: number
} {
  const contentHashes = new Map<string, UnifiedMessage>()
  let duplicatesRemoved = 0

  for (const message of messages) {
    const contentHash = generateContentHash(message.content)

    if (!contentHashes.has(contentHash)) {
      contentHashes.set(contentHash, message)
    } else {
      // Keep the one with the earlier timestamp
      const existing = contentHashes.get(contentHash)!
      if (message.timestampMs < existing.timestampMs) {
        contentHashes.set(contentHash, message)
      }
      duplicatesRemoved++
    }
  }

  return {
    unique: Array.from(contentHashes.values()),
    duplicatesRemoved,
  }
}

/**
 * Find potential duplicate messages (for reporting)
 */
export function findDuplicates(messages: UnifiedMessage[]): Map<string, UnifiedMessage[]> {
  const contentGroups = new Map<string, UnifiedMessage[]>()

  for (const message of messages) {
    const contentHash = generateContentHash(message.content)
    const group = contentGroups.get(contentHash) || []
    group.push(message)
    contentGroups.set(contentHash, group)
  }

  // Filter to only groups with duplicates
  const duplicates = new Map<string, UnifiedMessage[]>()
  for (const [hash, group] of contentGroups) {
    if (group.length > 1) {
      duplicates.set(hash, group)
    }
  }

  return duplicates
}
