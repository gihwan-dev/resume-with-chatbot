/**
 * RAG Agent
 *
 * Creates and exports the Agentic RAG system with tool calling capabilities.
 */

import type { createVertex } from "@ai-sdk/google-vertex"
import { embed } from "ai"
import { createRAGTools } from "./tools"
import type { RAGAgentConfig, SearchResult, Source } from "./types"
import { DEFAULT_AGENT_CONFIG } from "./types"

export { AGENT_SYSTEM_PROMPT } from "./prompts"
export type { RAGAgentConfig, SearchResult, Source } from "./types"

/**
 * Create a RAG Agent with tools for intelligent document retrieval
 *
 * @param vertex - Vertex AI instance from @ai-sdk/google-vertex
 * @param config - Optional configuration for the agent
 * @returns Agent object with tools and helper methods
 */
export function createRAGAgent(
  vertex: ReturnType<typeof createVertex>,
  config: RAGAgentConfig = DEFAULT_AGENT_CONFIG
) {
  const ragTools = createRAGTools(vertex, embed, config)

  return {
    /**
     * Tools for use with streamText/generateText
     */
    tools: ragTools.tools,

    /**
     * Get sources collected from searchKnowledge calls
     * Call this after tool execution to get the sources for UI display
     */
    getCollectedSources: ragTools.getCollectedSources,

    /**
     * Clear collected sources (call at start of new conversation turn)
     */
    clearSources: ragTools.clearSources,

    /**
     * Convert SearchResult[] to Source[] for client compatibility
     */
    toClientSources: (searchResults: SearchResult[]): Source[] => {
      return searchResults.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content.slice(0, 200), // Truncate for UI
        category: r.category,
        relevanceScore: r.relevanceScore,
      }))
    },

    /**
     * Configuration used by this agent
     */
    config: { ...DEFAULT_AGENT_CONFIG, ...config },
  }
}
