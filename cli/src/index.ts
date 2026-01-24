#!/usr/bin/env node

import { Command } from "commander"
import * as path from "node:path"
import { parseClaudeHistory } from "./parsers/claude-history.js"
import { parseClaudeProjects } from "./parsers/claude-projects.js"
import { deduplicateMessages, deduplicateByContent } from "./transformers/deduplicator.js"
import { filterNoiseMessages } from "./transformers/noise-filter.js"
import { writeJsonFile } from "./utils/file.js"
import type {
  CollectionOutput,
  CollectionStats,
  ConversationTurn,
  MessageSource,
  PortfolioOutput,
  UnifiedMessage,
  UnifiedSession,
} from "./types/index.js"

const VERSION = "2.0.0"

/**
 * Group messages into sessions
 */
function groupIntoSessions(messages: UnifiedMessage[]): UnifiedSession[] {
  const sessionMap = new Map<string, UnifiedMessage[]>()

  for (const message of messages) {
    const existing = sessionMap.get(message.sessionId) || []
    existing.push(message)
    sessionMap.set(message.sessionId, existing)
  }

  const sessions: UnifiedSession[] = []

  for (const [sessionId, sessionMessages] of sessionMap) {
    // Sort messages by timestamp
    sessionMessages.sort((a, b) => a.timestampMs - b.timestampMs)

    const firstMessage = sessionMessages[0]
    const lastMessage = sessionMessages[sessionMessages.length - 1]

    sessions.push({
      sessionId,
      startTime: firstMessage.timestamp,
      endTime: lastMessage.timestamp,
      project: firstMessage.project,
      messages: sessionMessages,
    })
  }

  // Sort sessions by start time
  sessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  return sessions
}

/**
 * Group messages into conversation turns (user + assistant pairs)
 */
function groupIntoConversations(messages: UnifiedMessage[]): ConversationTurn[] {
  const conversations: ConversationTurn[] = []

  // Sort messages by timestamp
  const sorted = [...messages].sort((a, b) => a.timestampMs - b.timestampMs)

  let currentUserMessage: UnifiedMessage | null = null

  for (const message of sorted) {
    if (message.role === "user") {
      // If we had a pending user message without response, save it
      if (currentUserMessage) {
        conversations.push({
          timestamp: currentUserMessage.timestamp,
          user: currentUserMessage.content,
        })
      }
      currentUserMessage = message
    } else if (message.role === "assistant" && currentUserMessage) {
      // Pair assistant response with user message
      // Include assistant response if it has content or thinking
      const hasContent = message.content.trim().length > 0
      const hasThinking = message.thinking && message.thinking.trim().length > 0

      if (hasContent || hasThinking) {
        conversations.push({
          timestamp: currentUserMessage.timestamp,
          user: currentUserMessage.content,
          assistant: hasContent ? message.content : undefined,
          thinking: hasThinking ? message.thinking : undefined,
        })
      } else {
        // Assistant has no meaningful content, save user message alone
        conversations.push({
          timestamp: currentUserMessage.timestamp,
          user: currentUserMessage.content,
        })
      }
      currentUserMessage = null
    }
  }

  // Don't forget the last pending user message
  if (currentUserMessage) {
    conversations.push({
      timestamp: currentUserMessage.timestamp,
      user: currentUserMessage.content,
    })
  }

  return conversations
}

/**
 * Calculate collection statistics
 */
function calculateStats(
  messages: UnifiedMessage[],
  sessions: UnifiedSession[],
  duplicatesRemoved: number
): CollectionStats {
  const bySource: Record<MessageSource, number> = {
    "claude-history": 0,
    "claude-project": 0,
  }

  const byProject: Record<string, number> = {}

  for (const message of messages) {
    bySource[message.source]++

    const projectName = message.project.name
    byProject[projectName] = (byProject[projectName] || 0) + 1
  }

  return {
    totalSessions: sessions.length,
    totalMessages: messages.length,
    duplicatesRemoved,
    bySource,
    byProject,
  }
}

/**
 * Main collect command
 */
async function collectCommand(options: {
  project?: string
  since?: string
  output?: string
  verbose?: boolean
  portfolio?: boolean
}): Promise<void> {
  const startTime = Date.now()

  console.log("Collecting Claude Code history...")

  if (options.verbose) {
    console.log("Options:", {
      project: options.project || "(all)",
      since: options.since || "(all time)",
      output: options.output || "(default)",
      portfolio: options.portfolio || false,
    })
  }

  // Parse both sources
  const [historyMessages, projectMessages] = await Promise.all([
    parseClaudeHistory(undefined, {
      projectFilter: options.project,
      sinceDate: options.since,
      verbose: options.verbose,
    }),
    parseClaudeProjects(undefined, {
      projectFilter: options.project,
      sinceDate: options.since,
      verbose: options.verbose,
    }),
  ])

  console.log(`Found ${historyMessages.length} history entries`)
  console.log(`Found ${projectMessages.length} project messages`)

  // Combine all messages
  const allMessages = [...historyMessages, ...projectMessages]

  // Step 1: Filter noise messages
  const { filtered: noiseFiltered, noiseRemoved } = filterNoiseMessages(allMessages)
  console.log(`Removed ${noiseRemoved} noise messages`)

  // Step 2: Deduplicate by hash
  const { unique: hashDeduped, duplicatesRemoved: hashDuplicates } = deduplicateMessages(noiseFiltered)
  console.log(`Removed ${hashDuplicates} hash duplicates`)

  // Step 3: Deduplicate by content (normalized)
  const { unique, duplicatesRemoved: contentDuplicates } = deduplicateByContent(hashDeduped)
  console.log(`Removed ${contentDuplicates} content duplicates`)

  const totalDuplicatesRemoved = hashDuplicates + contentDuplicates

  // Determine output path
  const outputDir = options.output || path.resolve(process.cwd(), "..", "collected-histories")
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)

  if (options.portfolio) {
    // Portfolio mode: conversation turns format
    const conversations = groupIntoConversations(unique)

    const portfolioOutput: PortfolioOutput = {
      version: VERSION,
      collectedAt: new Date().toISOString(),
      project: options.project || "all",
      stats: {
        totalConversations: conversations.length,
        noiseRemoved,
        duplicatesRemoved: totalDuplicatesRemoved,
      },
      conversations,
    }

    const outputFileName = options.project
      ? `${options.project}-portfolio-${timestamp}.json`
      : `all-portfolio-${timestamp}.json`
    const outputPath = path.join(outputDir, outputFileName)

    await writeJsonFile(outputPath, portfolioOutput)

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log("\n--- Portfolio Collection Complete ---")
    console.log(`Total conversations: ${portfolioOutput.stats.totalConversations}`)
    console.log(`Noise removed: ${portfolioOutput.stats.noiseRemoved}`)
    console.log(`Duplicates removed: ${portfolioOutput.stats.duplicatesRemoved}`)
    console.log(`Output: ${outputPath}`)
    console.log(`Duration: ${duration}s`)
  } else {
    // Default mode: sessions format
    const sessions = groupIntoSessions(unique)
    const stats = calculateStats(unique, sessions, totalDuplicatesRemoved)

    const output: CollectionOutput = {
      version: VERSION,
      collectedAt: new Date().toISOString(),
      stats,
      sessions,
    }

    const outputFileName = options.project
      ? `${options.project}-${timestamp}.json`
      : `all-history-${timestamp}.json`
    const outputPath = path.join(outputDir, outputFileName)

    await writeJsonFile(outputPath, output)

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log("\n--- Collection Complete ---")
    console.log(`Total sessions: ${stats.totalSessions}`)
    console.log(`Total messages: ${stats.totalMessages}`)
    console.log(`Noise removed: ${noiseRemoved}`)
    console.log(`Duplicates removed: ${stats.duplicatesRemoved}`)
    console.log(`Output: ${outputPath}`)
    console.log(`Duration: ${duration}s`)

    if (options.verbose) {
      console.log("\nBy source:")
      for (const [source, count] of Object.entries(stats.bySource)) {
        console.log(`  ${source}: ${count}`)
      }

      console.log("\nBy project:")
      const sortedProjects = Object.entries(stats.byProject).sort((a, b) => b[1] - a[1])
      for (const [project, count] of sortedProjects.slice(0, 10)) {
        console.log(`  ${project}: ${count}`)
      }
      if (sortedProjects.length > 10) {
        console.log(`  ... and ${sortedProjects.length - 10} more projects`)
      }
    }
  }
}

// CLI setup
const program = new Command()

program
  .name("collect-history")
  .description("Collect Claude Code history into unified JSON format")
  .version(VERSION)

program
  .command("collect")
  .description("Collect history from Claude Code")
  .option("-p, --project <name>", "Filter by project name")
  .option("-s, --since <date>", "Only include messages after this date (ISO 8601)")
  .option("-o, --output <dir>", "Output directory (default: ../collected-histories)")
  .option("-v, --verbose", "Enable verbose output")
  .option("--portfolio", "Output in portfolio format (conversation turns)")
  .action(collectCommand)

// Default command (run collect if no command specified)
program.action(() => {
  collectCommand({})
})

program.parse()
