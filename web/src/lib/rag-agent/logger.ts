/**
 * RAG Agent Logger
 *
 * Structured logging for debugging RAG agent tool calls and workflow.
 */

export interface ToolCallLog {
  step: number
  toolName: string
  input: unknown
  output: unknown
  timestamp: number
  duration?: number
}

export interface AgentSessionLog {
  sessionId: string
  query: string
  startTime: number
  endTime?: number
  toolCalls: ToolCallLog[]
  finalResponse?: string
  error?: string
}

class RAGAgentLogger {
  private sessions: Map<string, AgentSessionLog> = new Map()
  private enabled: boolean

  constructor(enabled = true) {
    this.enabled = enabled
  }

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Start a new agent session
   */
  startSession(sessionId: string, query: string): void {
    if (!this.enabled) return

    this.sessions.set(sessionId, {
      sessionId,
      query,
      startTime: Date.now(),
      toolCalls: [],
    })

    console.log(`\n${"=".repeat(60)}`)
    console.log(`[RAG Agent] Session Started: ${sessionId}`)
    console.log(`[RAG Agent] Query: "${query}"`)
    console.log(`${"=".repeat(60)}\n`)
  }

  /**
   * Log a tool call
   */
  logToolCall(
    sessionId: string,
    toolName: string,
    input: unknown,
    output: unknown,
    duration?: number
  ): void {
    if (!this.enabled) return

    const session = this.sessions.get(sessionId)
    if (!session) {
      console.warn(`[RAG Agent] Session not found: ${sessionId}`)
      return
    }

    const step = session.toolCalls.length + 1
    const log: ToolCallLog = {
      step,
      toolName,
      input,
      output,
      timestamp: Date.now(),
      duration,
    }

    session.toolCalls.push(log)

    console.log(`\n[Step ${step}] ${toolName}`)
    console.log(`  Input: ${JSON.stringify(input, null, 2).slice(0, 500)}`)
    console.log(
      `  Output: ${JSON.stringify(output, null, 2).slice(0, 500)}${
        JSON.stringify(output).length > 500 ? "..." : ""
      }`
    )
    if (duration) {
      console.log(`  Duration: ${duration}ms`)
    }
  }

  /**
   * End an agent session
   */
  endSession(sessionId: string, finalResponse?: string, error?: string): void {
    if (!this.enabled) return

    const session = this.sessions.get(sessionId)
    if (!session) return

    session.endTime = Date.now()
    session.finalResponse = finalResponse
    session.error = error

    console.log(`\n${"=".repeat(60)}`)
    console.log(`[RAG Agent] Session Ended: ${sessionId}`)
    console.log(`[RAG Agent] Total Steps: ${session.toolCalls.length}`)
    console.log(`[RAG Agent] Duration: ${session.endTime - session.startTime}ms`)
    if (error) {
      console.log(`[RAG Agent] Error: ${error}`)
    }
    console.log(`${"=".repeat(60)}\n`)
  }

  /**
   * Get session summary
   */
  getSummary(sessionId: string): string {
    const session = this.sessions.get(sessionId)
    if (!session) return "Session not found"

    const lines: string[] = [
      `Session: ${sessionId}`,
      `Query: "${session.query}"`,
      `Tool Calls: ${session.toolCalls.length}`,
      "",
      "Workflow:",
    ]

    for (const call of session.toolCalls) {
      const inputSummary = summarizeInput(call.toolName, call.input)
      const outputSummary = summarizeOutput(call.toolName, call.output)
      lines.push(`  ${call.step}. ${call.toolName}: ${inputSummary} -> ${outputSummary}`)
    }

    if (session.finalResponse) {
      lines.push("")
      lines.push(`Final Response: ${session.finalResponse.slice(0, 200)}...`)
    }

    return lines.join("\n")
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    this.sessions.clear()
  }

  /**
   * Get raw session data
   */
  getSession(sessionId: string): AgentSessionLog | undefined {
    return this.sessions.get(sessionId)
  }
}

/**
 * Summarize tool input for compact logging
 */
function summarizeInput(toolName: string, input: unknown): string {
  if (!input || typeof input !== "object") return String(input)

  const obj = input as Record<string, unknown>

  switch (toolName) {
    case "analyzeQuery":
      return `query="${obj.query}"`
    case "searchKnowledge":
      return `query="${obj.searchQuery}"${obj.skillFilters ? `, skills=[${obj.skillFilters}]` : ""}${obj.techFilters ? `, tech=[${obj.techFilters}]` : ""}`
    case "evaluateResults":
      return `${(obj.searchResults as unknown[])?.length || 0} results`
    case "rewriteQuery":
      return `strategy=${obj.rewriteStrategy}`
    default:
      return JSON.stringify(input).slice(0, 100)
  }
}

/**
 * Summarize tool output for compact logging
 */
function summarizeOutput(toolName: string, output: unknown): string {
  if (!output) return "null"

  if (Array.isArray(output)) {
    return `[${output.length} items]`
  }

  if (typeof output !== "object") return String(output)

  const obj = output as Record<string, unknown>

  switch (toolName) {
    case "analyzeQuery":
      return `intent=${obj.intent}`
    case "evaluateResults":
      return `action=${obj.suggestedAction}, relevance=${obj.relevanceScore}`
    case "rewriteQuery":
      return `"${obj.rewrittenQuery}"`
    default:
      return JSON.stringify(output).slice(0, 100)
  }
}

// Default logger instance
export const ragLogger = new RAGAgentLogger(
  process.env.NODE_ENV !== "production"
)

export default RAGAgentLogger
