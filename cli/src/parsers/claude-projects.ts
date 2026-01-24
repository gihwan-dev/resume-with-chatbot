import * as path from "node:path"
import {
  type ClaudeProjectMessage,
  ClaudeProjectMessageSchema,
  type UnifiedMessage,
} from "../types/index.js"
import { normalizeTimestamp } from "../transformers/timestamp-normalizer.js"
import { maskPII } from "../transformers/pii-masker.js"
import { generateMessageHash } from "../transformers/deduplicator.js"
import { readJsonlFile, getHomeDir, getJsonlFiles, extractProjectName } from "../utils/file.js"

/**
 * Get the projects directory path
 */
export function getProjectsDir(): string {
  return path.join(getHomeDir(), ".claude", "projects")
}

/**
 * Extract content and thinking from message content (handles both string and array formats)
 */
function extractContentAndThinking(content: ClaudeProjectMessage["message"]["content"]): {
  text: string
  thinking: string | undefined
} {
  if (typeof content === "string") {
    return { text: content, thinking: undefined }
  }

  if (Array.isArray(content)) {
    const textParts: string[] = []
    const thinkingParts: string[] = []

    for (const block of content) {
      if (block.type === "text" && block.text) {
        textParts.push(block.text)
      } else if (block.type === "thinking" && block.thinking) {
        thinkingParts.push(block.thinking)
      }
    }

    return {
      text: textParts.join("\n"),
      thinking: thinkingParts.length > 0 ? thinkingParts.join("\n") : undefined,
    }
  }

  return { text: "", thinking: undefined }
}

/**
 * Extract encoded project directory name from file path
 * Example: ~/.claude/projects/-Users-choegihwan-Projects-my-app/session.jsonl
 *       -> -Users-choegihwan-Projects-my-app
 */
function extractEncodedProjectDir(filePath: string): string {
  const projectsDir = getProjectsDir()
  const relativePath = path.relative(projectsDir, filePath)
  return relativePath.split(path.sep)[0] || "unknown"
}

/**
 * Extract project path from file path
 * Example: ~/.claude/projects/-Users-choegihwan-Projects-my-app/session.jsonl
 *       -> /Users/choegihwan/Projects/my-app
 */
function extractProjectPath(filePath: string): string {
  const encodedDir = extractEncodedProjectDir(filePath)

  if (encodedDir === "unknown") {
    return "unknown"
  }

  // The encoding replaces "/" with "-", but we need to be careful
  // because folder names can contain "-" (e.g., "resume-with-ai")
  // Pattern: the path starts with - and each path segment starts with -
  // We decode by splitting on the pattern "-<Capital letter or number>"
  // but keeping the separator as part of the next segment

  // Simple approach: replace first dash with "/" and subsequent "-" that are
  // followed by common path patterns (Users, home, Documents, etc.)
  let decoded = encodedDir

  // Remove leading dash and replace with /
  if (decoded.startsWith("-")) {
    decoded = "/" + decoded.slice(1)
  }

  // Common path segments that indicate a path separator before them
  const pathSegments = [
    "Users",
    "home",
    "Documents",
    "Projects",
    "Desktop",
    "Downloads",
    "var",
    "tmp",
    "opt",
    "etc",
    "usr",
  ]

  for (const segment of pathSegments) {
    decoded = decoded.replace(new RegExp(`-${segment}(?=[-/]|$)`, "g"), `/${segment}`)
  }

  return decoded
}

/**
 * Parse a single project message into a unified message
 */
export function parseProjectMessage(
  entry: ClaudeProjectMessage,
  projectPath: string
): UnifiedMessage {
  const normalized = normalizeTimestamp(entry.timestamp)
  const { text: rawContent, thinking: rawThinking } = extractContentAndThinking(entry.message.content)
  const content = maskPII(rawContent)
  const thinking = rawThinking ? maskPII(rawThinking) : undefined

  const message: UnifiedMessage = {
    id: generateMessageHash({
      content,
      timestamp: normalized.iso,
      role: entry.message.role,
      sessionId: entry.sessionId,
    }),
    source: "claude-project",
    timestamp: normalized.iso,
    timestampMs: normalized.ms,
    role: entry.message.role,
    content,
    thinking,
    sessionId: entry.sessionId,
    parentId: entry.parentUuid || null,
    project: {
      path: projectPath,
      name: extractProjectName(projectPath),
    },
    metadata: {
      cwd: entry.cwd,
    },
  }

  return message
}

/**
 * Parse a single project JSONL file
 */
export async function parseProjectFile(
  filePath: string,
  options?: {
    sinceDate?: string
    verbose?: boolean
  }
): Promise<UnifiedMessage[]> {
  const messages: UnifiedMessage[] = []
  const projectPath = extractProjectPath(filePath)

  let lineCount = 0
  let errorCount = 0

  for await (const result of readJsonlFile(filePath, ClaudeProjectMessageSchema)) {
    lineCount++

    if ("error" in result) {
      errorCount++
      if (options?.verbose) {
        console.error(`${filePath}:${result.lineNumber}: Parse error - ${result.error.message}`)
      }
      continue
    }

    const entry = result.data

    // Apply date filter
    if (options?.sinceDate) {
      const normalized = normalizeTimestamp(entry.timestamp)
      const sinceNormalized = normalizeTimestamp(options.sinceDate)
      if (normalized.ms < sinceNormalized.ms) {
        continue
      }
    }

    const message = parseProjectMessage(entry, projectPath)
    messages.push(message)
  }

  if (options?.verbose && errorCount > 0) {
    console.log(`Parsed ${messages.length} messages from ${filePath} (${errorCount} errors)`)
  }

  return messages
}

/**
 * Parse all project JSONL files
 */
export async function parseClaudeProjects(
  projectsDir?: string,
  options?: {
    projectFilter?: string
    sinceDate?: string
    verbose?: boolean
  }
): Promise<UnifiedMessage[]> {
  const dirPath = projectsDir || getProjectsDir()
  const files = await getJsonlFiles(dirPath)
  const allMessages: UnifiedMessage[] = []

  if (options?.verbose) {
    console.log(`Found ${files.length} JSONL files in projects directory`)
  }

  for (const file of files) {
    // Apply project filter to file path
    if (options?.projectFilter) {
      const encodedDir = extractEncodedProjectDir(file)
      const projectPath = extractProjectPath(file)
      const projectName = extractProjectName(projectPath)
      const filter = options.projectFilter.toLowerCase()

      // Check both the encoded directory name and the decoded project name
      const matchesEncodedDir = encodedDir.toLowerCase().includes(filter)
      const matchesProjectName = projectName.toLowerCase().includes(filter)

      if (!matchesEncodedDir && !matchesProjectName) {
        continue
      }
    }

    const messages = await parseProjectFile(file, options)
    allMessages.push(...messages)
  }

  if (options?.verbose) {
    console.log(`Parsed ${allMessages.length} total messages from projects`)
  }

  return allMessages
}
